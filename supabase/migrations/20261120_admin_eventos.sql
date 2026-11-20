-- Diário de eventos do admin (Visão geral com análise).
--
-- Anota cada mudança relevante de tutores e empresas, para os gráficos de
-- entrada e conversão. Os gatilhos gravam ao vivo, e o fim do arquivo
-- reconstrói o passado (estimado = true).
--
-- Rodar à mão no SQL editor do Supabase. Pode rodar de novo sem duplicar.
-- Conferir depois com docs/superpowers/specs/2026-11-20-admin-analise-verificacao.sql.

BEGIN;

-- 0. As tabelas tutor e partners nasceram fora das migrações: confere as colunas usadas.
DO $$
DECLARE
  faltando text;
BEGIN
  SELECT string_agg(t.tabela || '.' || t.coluna, ', ')
    INTO faltando
    FROM (VALUES
      ('tutor', 'id'), ('tutor', 'created_at'), ('tutor', 'utm_source'),
      ('tutor', 'utm_medium'), ('tutor', 'utm_campaign'),
      ('partners', 'id'), ('partners', 'created_at'), ('partners', 'tipo'),
      ('partners', 'status'), ('partners', 'origem'), ('partners', 'sent_at'),
      ('partners', 'whatsapp_contatado_em'), ('partners', 'user_id'),
      ('subscriptions', 'user_id'), ('subscriptions', 'status'),
      ('subscriptions', 'plan_type'), ('subscriptions', 'plan_category'),
      ('subscriptions', 'created_at'), ('subscriptions', 'updated_at')
    ) AS t(tabela, coluna)
   WHERE NOT EXISTS (
     SELECT 1 FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = t.tabela
        AND c.column_name = t.coluna
   );
  IF faltando IS NOT NULL THEN
    RAISE EXCEPTION 'Faltam colunas: %. Rode as migrações anteriores antes desta.', faltando;
  END IF;
END $$;

-- 1. Tabela
CREATE TABLE IF NOT EXISTS public.admin_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrido_em timestamptz NOT NULL DEFAULT now(),
  publico text NOT NULL CHECK (publico IN ('tutor', 'empresa')),
  tipo text NOT NULL CHECK (tipo IN (
    'tutor_entrou', 'tutor_virou_pago', 'tutor_cancelou',
    'empresa_entrou_mapa', 'empresa_convidada', 'empresa_ativou_painel',
    'empresa_virou_paga', 'empresa_cancelou'
  )),
  entidade_id uuid NOT NULL,
  detalhe jsonb NOT NULL DEFAULT '{}'::jsonb,
  estimado boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS admin_eventos_publico_ocorrido_idx
  ON public.admin_eventos (publico, ocorrido_em);
CREATE INDEX IF NOT EXISTS admin_eventos_tipo_entidade_idx
  ON public.admin_eventos (tipo, entidade_id);
-- Eventos que só acontecem uma vez por entidade (o 2º convite não conta).
CREATE UNIQUE INDEX IF NOT EXISTS admin_eventos_uma_vez_idx
  ON public.admin_eventos (tipo, entidade_id)
  WHERE tipo IN ('tutor_entrou', 'empresa_entrou_mapa', 'empresa_convidada', 'empresa_ativou_painel');

-- Sem policy: só a service role (servidor) lê e escreve.
ALTER TABLE public.admin_eventos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_eventos FROM anon, authenticated;

-- 2. Registro: nunca derruba quem chamou.
CREATE OR REPLACE FUNCTION public.admin_eventos_registrar(
  p_publico text,
  p_tipo text,
  p_entidade uuid,
  p_detalhe jsonb,
  p_quando timestamptz,
  p_estimado boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_eventos (ocorrido_em, publico, tipo, entidade_id, detalhe, estimado)
  VALUES (
    COALESCE(p_quando, now()), p_publico, p_tipo, p_entidade,
    COALESCE(p_detalhe, '{}'::jsonb), COALESCE(p_estimado, false)
  )
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'admin_eventos: não registrou % de %: %', p_tipo, p_entidade, SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_eventos_registrar(text, text, uuid, jsonb, timestamptz, boolean)
  FROM PUBLIC, anon, authenticated;

-- 3. Gatilho: tutor novo
CREATE OR REPLACE FUNCTION public.admin_eventos_tutor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    PERFORM public.admin_eventos_registrar(
      'tutor', 'tutor_entrou', NEW.id,
      jsonb_strip_nulls(jsonb_build_object(
        'utm_source', NEW.utm_source,
        'utm_medium', NEW.utm_medium,
        'utm_campaign', NEW.utm_campaign
      )),
      now(), false
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'admin_eventos (tutor): %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_eventos_tutor ON public.tutor;
CREATE TRIGGER admin_eventos_tutor
  AFTER INSERT ON public.tutor
  FOR EACH ROW EXECUTE FUNCTION public.admin_eventos_tutor();

-- 4. Gatilho: assinatura virou paga ou deixou de ser
CREATE OR REPLACE FUNCTION public.admin_eventos_subscriptions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_categoria text;
  v_novo boolean;
  v_antigo boolean;
  v_publico text;
  v_entidade uuid;
  v_extra jsonb := '{}'::jsonb;
BEGIN
  BEGIN
    v_categoria := COALESCE(
      NEW.plan_category,
      CASE WHEN left(NEW.plan_type, 8) = 'partner_' THEN 'partner' ELSE 'tutor' END
    );
    v_novo := COALESCE(NEW.status IN ('active', 'trialing'), false);
    v_antigo := TG_OP = 'UPDATE' AND COALESCE(OLD.status IN ('active', 'trialing'), false);

    IF v_novo <> v_antigo THEN
      IF v_categoria = 'partner' THEN
        v_publico := 'empresa';
        SELECT p.id INTO v_entidade FROM public.partners p WHERE p.user_id = NEW.user_id LIMIT 1;
        IF v_entidade IS NULL THEN
          v_entidade := NEW.user_id;
          v_extra := '{"sem_partner": true}'::jsonb;
        END IF;
      ELSE
        v_publico := 'tutor';
        v_entidade := NEW.user_id;
      END IF;

      PERFORM public.admin_eventos_registrar(
        v_publico,
        CASE
          WHEN v_novo AND v_publico = 'tutor' THEN 'tutor_virou_pago'
          WHEN v_novo THEN 'empresa_virou_paga'
          WHEN v_publico = 'tutor' THEN 'tutor_cancelou'
          ELSE 'empresa_cancelou'
        END,
        v_entidade,
        jsonb_build_object('plan_type', NEW.plan_type, 'status', NEW.status) || v_extra,
        now(), false
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'admin_eventos (subscriptions): %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_eventos_subscriptions ON public.subscriptions;
CREATE TRIGGER admin_eventos_subscriptions
  AFTER INSERT OR UPDATE OF status ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.admin_eventos_subscriptions();

-- 5. Gatilho: empresa entrou, foi convidada, ativou o painel
CREATE OR REPLACE FUNCTION public.admin_eventos_partners()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      PERFORM public.admin_eventos_registrar(
        'empresa', 'empresa_entrou_mapa', NEW.id,
        jsonb_strip_nulls(jsonb_build_object(
          'origem', CASE WHEN NEW.status IN ('new_signup', 'ativo') THEN 'cadastro_proprio' ELSE 'importada' END,
          'lote', NEW.origem,
          'tipo', NEW.tipo
        )),
        now(), false
      );
    ELSE
      IF (NEW.status = 'sent' AND OLD.status IS DISTINCT FROM 'sent')
         OR (NEW.sent_at IS NOT NULL AND OLD.sent_at IS NULL) THEN
        PERFORM public.admin_eventos_registrar(
          'empresa', 'empresa_convidada', NEW.id, '{"canal": "email"}'::jsonb, now(), false
        );
      END IF;
      IF NEW.whatsapp_contatado_em IS NOT NULL AND OLD.whatsapp_contatado_em IS NULL THEN
        PERFORM public.admin_eventos_registrar(
          'empresa', 'empresa_convidada', NEW.id, '{"canal": "whatsapp"}'::jsonb, now(), false
        );
      END IF;
      IF NEW.user_id IS NOT NULL AND OLD.user_id IS NULL THEN
        PERFORM public.admin_eventos_registrar(
          'empresa', 'empresa_ativou_painel', NEW.id, '{}'::jsonb, now(), false
        );
        -- O webhook grava a assinatura antes de ligar o login à empresa:
        -- aponta esses eventos pendentes para a empresa.
        UPDATE public.admin_eventos
           SET entidade_id = NEW.id,
               detalhe = detalhe - 'sem_partner'
         WHERE publico = 'empresa'
           AND entidade_id = NEW.user_id
           AND detalhe ? 'sem_partner';
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'admin_eventos (partners): %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_eventos_partners ON public.partners;
CREATE TRIGGER admin_eventos_partners
  AFTER INSERT OR UPDATE OF status, sent_at, whatsapp_contatado_em, user_id ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.admin_eventos_partners();

-- 6. Reconstrução do passado (estimado = true)

INSERT INTO public.admin_eventos (ocorrido_em, publico, tipo, entidade_id, detalhe, estimado)
SELECT t.created_at, 'tutor', 'tutor_entrou', t.id,
       jsonb_strip_nulls(jsonb_build_object(
         'utm_source', t.utm_source, 'utm_medium', t.utm_medium, 'utm_campaign', t.utm_campaign
       )),
       true
  FROM public.tutor t
 WHERE t.created_at IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_eventos (ocorrido_em, publico, tipo, entidade_id, detalhe, estimado)
SELECT p.created_at, 'empresa', 'empresa_entrou_mapa', p.id,
       jsonb_strip_nulls(jsonb_build_object(
         'origem', CASE WHEN p.status IN ('new_signup', 'ativo') THEN 'cadastro_proprio' ELSE 'importada' END,
         'lote', p.origem,
         'tipo', p.tipo
       )),
       true
  FROM public.partners p
 WHERE p.created_at IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_eventos (ocorrido_em, publico, tipo, entidade_id, detalhe, estimado)
SELECT LEAST(p.sent_at, p.whatsapp_contatado_em), 'empresa', 'empresa_convidada', p.id,
       jsonb_build_object('canal',
         CASE WHEN p.whatsapp_contatado_em IS NOT NULL
                   AND (p.sent_at IS NULL OR p.whatsapp_contatado_em < p.sent_at)
              THEN 'whatsapp' ELSE 'email' END),
       true
  FROM public.partners p
 WHERE p.sent_at IS NOT NULL OR p.whatsapp_contatado_em IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_eventos (ocorrido_em, publico, tipo, entidade_id, detalhe, estimado)
SELECT GREATEST(u.created_at, p.created_at), 'empresa', 'empresa_ativou_painel', p.id, '{}'::jsonb, true
  FROM public.partners p
  JOIN auth.users u ON u.id = p.user_id
ON CONFLICT DO NOTHING;

-- Eventos de pagamento gravados antes de a empresa ligar o login: aponta para a empresa.
UPDATE public.admin_eventos e
   SET entidade_id = p.id,
       detalhe = e.detalhe - 'sem_partner'
  FROM public.partners p
 WHERE e.publico = 'empresa'
   AND e.detalhe ? 'sem_partner'
   AND p.user_id = e.entidade_id;

-- Assinaturas: só se cancela o que já foi pago, então canceladas também ganham "virou pago".
CREATE TEMP TABLE admin_eventos_assinaturas ON COMMIT DROP AS
SELECT sub.user_id AS user_id,
       sub.created_at,
       sub.updated_at,
       sub.status,
       sub.plan_type,
       CASE WHEN cat.categoria = 'partner' THEN 'empresa' ELSE 'tutor' END AS publico,
       COALESCE(par.id, sub.user_id) AS entidade,
       (cat.categoria = 'partner' AND par.id IS NULL) AS sem_partner
  FROM public.subscriptions sub
  CROSS JOIN LATERAL (
    SELECT COALESCE(
      sub.plan_category,
      CASE WHEN left(sub.plan_type, 8) = 'partner_' THEN 'partner' ELSE 'tutor' END
    ) AS categoria
  ) cat
  LEFT JOIN LATERAL (
    SELECT p.id FROM public.partners p
     WHERE cat.categoria = 'partner' AND p.user_id = sub.user_id
     LIMIT 1
  ) par ON true
 WHERE sub.status IN ('active', 'trialing', 'canceled', 'expired');

INSERT INTO public.admin_eventos (ocorrido_em, publico, tipo, entidade_id, detalhe, estimado)
SELECT a.created_at, a.publico,
       CASE a.publico WHEN 'tutor' THEN 'tutor_virou_pago' ELSE 'empresa_virou_paga' END,
       a.entidade,
       jsonb_build_object('plan_type', a.plan_type, 'status', a.status)
         || CASE WHEN a.sem_partner THEN '{"sem_partner": true}'::jsonb ELSE '{}'::jsonb END,
       true
  FROM admin_eventos_assinaturas a
 WHERE a.created_at IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.admin_eventos e
      WHERE e.entidade_id IN (a.entidade, a.user_id)
        AND e.tipo = CASE a.publico WHEN 'tutor' THEN 'tutor_virou_pago' ELSE 'empresa_virou_paga' END
   );

INSERT INTO public.admin_eventos (ocorrido_em, publico, tipo, entidade_id, detalhe, estimado)
SELECT a.updated_at, a.publico,
       CASE a.publico WHEN 'tutor' THEN 'tutor_cancelou' ELSE 'empresa_cancelou' END,
       a.entidade,
       jsonb_build_object('plan_type', a.plan_type, 'status', a.status)
         || CASE WHEN a.sem_partner THEN '{"sem_partner": true}'::jsonb ELSE '{}'::jsonb END,
       true
  FROM admin_eventos_assinaturas a
 WHERE a.status IN ('canceled', 'expired')
   AND a.updated_at IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.admin_eventos e
      WHERE e.entidade_id IN (a.entidade, a.user_id)
        AND e.tipo = CASE a.publico WHEN 'tutor' THEN 'tutor_cancelou' ELSE 'empresa_cancelou' END
   );

COMMIT;
