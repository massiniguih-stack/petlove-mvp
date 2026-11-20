-- Conferência da migração 20261120_admin_eventos.sql.
-- O SQL editor do Supabase mostra só o resultado do ÚLTIMO comando e não mostra
-- avisos (RAISE WARNING/NOTICE). Por isso cada teste abaixo é um bloco DO que
-- termina com RAISE EXCEPTION: o erro mostra o resultado na tela e desfaz tudo.
-- Rode cada bloco separado. A mensagem "RESULTADO (desfeito): ..." é o resultado, não um erro de verdade.

-- 1. Quantos eventos existem por tipo (estimado = reconstruído do passado)
SELECT publico, tipo, estimado, count(*) AS total
  FROM public.admin_eventos
 GROUP BY publico, tipo, estimado
 ORDER BY publico, tipo, estimado;

-- 2. Rodar de novo não duplica:
--    rode a migração inteira mais uma vez e repita o bloco 1. Os totais devem ser iguais.

-- 3. Empresa: convite por e-mail, 2º contato por WhatsApp (não conta), painel ativado,
--    pagamento que chegou antes do login ser ligado à empresa.
-- Esperado (4 itens):
--   RESULTADO (desfeito): empresa_ativou_painel {} | empresa_convidada {"canal": "email"} | empresa_entrou_mapa {"lote": ..., "origem": "importada", "tipo": "petshop"} | empresa_virou_paga {}
--   (o virou_paga não pode ter "sem_partner"; só um empresa_convidada)
DO $$
DECLARE
  v_id constant uuid := '00000000-0000-4000-8000-000000000001';
  v_user uuid;
  r text;
BEGIN
  SELECT u.id INTO v_user
    FROM auth.users u
   WHERE NOT EXISTS (SELECT 1 FROM public.partners p WHERE p.user_id = u.id)
   LIMIT 1;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Sem usuário livre para testar (todos os logins já estão ligados a uma empresa).';
  END IF;

  INSERT INTO public.partners (id, nome, tipo, cidade, status, premium, destaque)
  VALUES (v_id, 'Teste do gatilho', 'petshop', 'Maringá', 'pending', false, false);
  UPDATE public.partners SET status = 'sent', sent_at = now() WHERE id = v_id;
  UPDATE public.partners SET whatsapp_contatado_em = now() WHERE id = v_id;

  -- Simula o webhook chegando antes de o login ser ligado à empresa.
  PERFORM public.admin_eventos_registrar(
    'empresa', 'empresa_virou_paga', v_user, '{"sem_partner": true}'::jsonb, now(), false
  );
  UPDATE public.partners SET user_id = v_user WHERE id = v_id;

  SELECT string_agg(tipo || ' ' || detalhe::text, ' | ' ORDER BY tipo)
    INTO r
    FROM public.admin_eventos
   WHERE entidade_id = v_id;
  RAISE EXCEPTION 'RESULTADO (desfeito): %', r;
END $$;

-- 4. Tutor novo gera tutor_entrou.
-- Esperado: RESULTADO (desfeito): tutor_entrou {"utm_source": "teste"}
--   (se não houver usuário livre: "Sem usuário livre para testar tutor_entrou ...")
DO $$
DECLARE
  v_user uuid;
  r text;
BEGIN
  SELECT u.id INTO v_user
    FROM auth.users u
   WHERE NOT EXISTS (SELECT 1 FROM public.tutor t WHERE t.id = u.id)
   LIMIT 1;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Sem usuário livre para testar tutor_entrou (normal se todos já são tutores).';
  END IF;

  INSERT INTO public.tutor (id, nome, email, utm_source)
  VALUES (v_user, 'Teste gatilho', 'teste-gatilho@example.com', 'teste');

  SELECT string_agg(tipo || ' ' || detalhe::text, ' | ' ORDER BY tipo)
    INTO r
    FROM public.admin_eventos
   WHERE entidade_id = v_user AND tipo = 'tutor_entrou';
  RAISE EXCEPTION 'RESULTADO (desfeito): %', r;
END $$;

-- 5. Assinatura de tutor: sair do pago e voltar gera cancelou + virou_pago.
-- Esperado: RESULTADO (desfeito): [tutor_cancelou {...} | ]tutor_virou_pago {...}
--   (tutor_cancelou só aparece se a assinatura já estava ativa; a última é sempre tutor_virou_pago)
DO $$
DECLARE
  v_user uuid;
  r text;
BEGIN
  SELECT s.user_id INTO v_user
    FROM public.subscriptions s
   WHERE COALESCE(s.plan_category,
           CASE WHEN left(s.plan_type, 8) = 'partner_' THEN 'partner' ELSE 'tutor' END) = 'tutor'
   LIMIT 1;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Ainda não existe assinatura de tutor para testar.';
  END IF;

  UPDATE public.subscriptions s SET status = 'pending'
   WHERE s.user_id = v_user
     AND COALESCE(s.plan_category,
           CASE WHEN left(s.plan_type, 8) = 'partner_' THEN 'partner' ELSE 'tutor' END) = 'tutor';
  UPDATE public.subscriptions s SET status = 'active'
   WHERE s.user_id = v_user
     AND COALESCE(s.plan_category,
           CASE WHEN left(s.plan_type, 8) = 'partner_' THEN 'partner' ELSE 'tutor' END) = 'tutor';

  SELECT string_agg(tipo || ' ' || detalhe::text, ' | ' ORDER BY tipo)
    INTO r
    FROM public.admin_eventos
   WHERE entidade_id = v_user AND ocorrido_em = now();
  RAISE EXCEPTION 'RESULTADO (desfeito): %', r;
END $$;

-- 6. Um defeito no diário não bloqueia a operação principal.
-- ATENÇÃO: este bloco trava admin_eventos por instantes. Rode fora do horário de pico.
-- Esperado: RESULTADO (desfeito): empresas gravadas = 1, eventos gravados = 0
DO $$
DECLARE
  v_id constant uuid := '00000000-0000-4000-8000-000000000002';
  v_partners int;
  v_eventos int;
  r text;
BEGIN
  ALTER TABLE public.admin_eventos ADD CONSTRAINT teste_falha CHECK (false) NOT VALID;

  INSERT INTO public.partners (id, nome, tipo, cidade, status, premium, destaque)
  VALUES (v_id, 'Teste de falha', 'petshop', 'Maringá', 'pending', false, false);

  SELECT count(*) INTO v_partners FROM public.partners WHERE id = v_id;
  SELECT count(*) INTO v_eventos FROM public.admin_eventos WHERE entidade_id = v_id;
  r := 'empresas gravadas = ' || v_partners || ', eventos gravados = ' || v_eventos;
  RAISE EXCEPTION 'RESULTADO (desfeito): %', r;
END $$;
