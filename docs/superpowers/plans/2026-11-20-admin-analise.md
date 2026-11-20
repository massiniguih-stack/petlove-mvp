# Admin — Visão geral com análise: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a Visão geral do admin por uma página de análise com abas Tutores | Empresas, filtro de período, gráficos de entrada, crescimento e funis de conversão, alimentada por um diário de eventos (`admin_eventos`) gravado por gatilhos no banco.

**Architecture:** Uma migração SQL cria `admin_eventos`, os gatilhos em `tutor`, `subscriptions` e `partners`, e reconstrói o passado. No servidor, funções puras em `lib/admin/analytics/` fazem todas as contas. A rota `GET /api/admin/analytics?periodo=…` carrega os dados do Supabase e chama essas funções. A página `app/admin/page.tsx` só exibe o resultado com componentes de `components/admin/analytics/`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase (service role, Postgres/plpgsql), Recharts 2, Tailwind 3 (`darkMode: 'class'`), zod 4, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-11-20-admin-analise-design.md`

## Global Constraints

- Trabalhar na worktree `/Users/guilhermemassini/projects/PATINHA-admin-analise`, ramo `melhoria/admin-analise`. Não usar a pasta `/Users/guilhermemassini/projects/PATINHA`, que outra sessão está usando.
- Todo texto visível na tela fica em português do Brasil, com acentos.
- Fuso de agrupamento: Brasília, UTC−3 fixo (o Brasil não tem horário de verão desde 2019).
- Períodos: `7d`, `30d` (padrão), `90d`, `tudo`. Granularidade: 7d/30d → dia, 90d → semana (segunda a domingo), tudo → mês.
- Rotas de admin chamam `requireAdmin()` de `lib/authz.ts`.
- `lib/supabase/admin.ts` (service role) só pode ser importado no servidor.
- RLS em `admin_eventos` ativado **sem policy** (só a service role acessa).
- Um erro no diário nunca pode bloquear a operação principal (cadastro, webhook, convite).
- Limite de "poucos dados": total < 5 troca o gráfico pelo aviso "Poucos dados no período (N)."
- Cores: grátis/cadastros `#94a3b8` (slate-400), pago `#d97706` (amber-600), cadastro próprio `#0284c7` (sky-600).
- Testar a tela com `npm run build && npm run start`, nunca com `npm run dev` (a CSP bloqueia o HMR).
- Testes: `npx vitest run <arquivo>`. A suíte inteira roda com `npm test`.
- Commits terminam com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `supabase/migrations/20261120_admin_eventos.sql` | Tabela, gatilhos e reconstrução do passado |
| `docs/superpowers/specs/2026-11-20-admin-analise-verificacao.sql` | Roteiro para o usuário conferir a migração no Supabase |
| `lib/admin/analytics/tipos.ts` | Tipos compartilhados (servidor e tela) |
| `lib/admin/analytics/tempo.ts` | Datas no fuso de Brasília e leitura de timestamps do Supabase |
| `lib/admin/analytics/periodo.ts` | Período atual, anterior e granularidade |
| `lib/admin/analytics/agrupar.ts` | Intervalos (dia/semana/mês) e contagens por intervalo |
| `lib/admin/analytics/funil.ts` | Funil por turma |
| `lib/admin/analytics/variacao.ts` | Variação contra o período anterior |
| `lib/admin/analytics/catalogo.ts` | Preços mensais, rótulos de tipo de empresa e categoria do plano |
| `lib/admin/analytics/montar.ts` | Junta tudo em `Analise` a partir de dados brutos (sem banco) |
| `lib/admin/analytics/exemplo.ts` | Dados fictícios para conferir a tela localmente |
| `lib/admin/analytics/carregar.ts` | Leitura do Supabase em lotes e exclusão da equipe |
| `app/api/admin/analytics/route.ts` | Rota `GET` |
| `components/admin/analytics/*.tsx` | Peças da tela |
| `app/admin/page.tsx` | Página (reescrita) |
| `app/api/admin/dashboard-stats/route.ts` | **Removido** |

---

### Task 1: Migração `admin_eventos` e roteiro de verificação

**Files:**
- Create: `supabase/migrations/20261120_admin_eventos.sql`
- Create: `docs/superpowers/specs/2026-11-20-admin-analise-verificacao.sql`

**Interfaces:**
- Produces: tabela `public.admin_eventos (id uuid, ocorrido_em timestamptz, publico text, tipo text, entidade_id uuid, detalhe jsonb, estimado boolean)`. Tipos: `tutor_entrou`, `tutor_virou_pago`, `tutor_cancelou`, `empresa_entrou_mapa`, `empresa_convidada`, `empresa_ativou_painel`, `empresa_virou_paga`, `empresa_cancelou`. `detalhe` de `empresa_entrou_mapa` tem `origem: 'importada' | 'cadastro_proprio'`. `detalhe` de `tutor_entrou` tem `utm_source` (opcional).

Não há Supabase local. A migração é rodada pelo usuário no SQL editor depois do merge. Este task entrega os dois arquivos, revisados com cuidado.

- [ ] **Step 1: Escrever a migração**

Create `supabase/migrations/20261120_admin_eventos.sql`:

```sql
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
      IF NEW.status = 'sent' AND OLD.status IS DISTINCT FROM 'sent' THEN
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
  AFTER INSERT OR UPDATE OF status, whatsapp_contatado_em, user_id ON public.partners
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
SELECT u.created_at, 'empresa', 'empresa_ativou_painel', p.id, '{}'::jsonb, true
  FROM public.partners p
  JOIN auth.users u ON u.id = p.user_id
ON CONFLICT DO NOTHING;

-- Assinaturas: só se cancela o que já foi pago, então canceladas também ganham "virou pago".
CREATE TEMP TABLE admin_eventos_assinaturas ON COMMIT DROP AS
SELECT sub.created_at,
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
      WHERE e.entidade_id = a.entidade
        AND e.tipo IN ('tutor_virou_pago', 'empresa_virou_paga')
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
      WHERE e.entidade_id = a.entidade
        AND e.tipo IN ('tutor_cancelou', 'empresa_cancelou')
   );

COMMIT;
```

- [ ] **Step 2: Escrever o roteiro de verificação**

Create `docs/superpowers/specs/2026-11-20-admin-analise-verificacao.sql`:

```sql
-- Conferência da migração 20261120_admin_eventos.sql.
-- Rode cada bloco separado no SQL editor do Supabase.
-- Os blocos 3 a 5 terminam em ROLLBACK: não deixam nada gravado.

-- 1. Quantos eventos existem por tipo (estimado = reconstruído do passado)
SELECT publico, tipo, estimado, count(*) AS total
  FROM public.admin_eventos
 GROUP BY publico, tipo, estimado
 ORDER BY publico, tipo, estimado;

-- 2. Rodar de novo não duplica:
--    rode a migração inteira mais uma vez e repita o bloco 1. Os totais devem ser iguais.

-- 3. Empresa: entrada, convite por e-mail, 2º convite por WhatsApp (não conta), painel
BEGIN;
INSERT INTO public.partners (id, nome, tipo, cidade, status, premium, destaque)
VALUES ('00000000-0000-4000-8000-000000000001', 'Teste do gatilho', 'petshop', 'Maringá', 'pending', false, false);
UPDATE public.partners SET status = 'sent' WHERE id = '00000000-0000-4000-8000-000000000001';
UPDATE public.partners SET whatsapp_contatado_em = now() WHERE id = '00000000-0000-4000-8000-000000000001';
SELECT tipo, detalhe FROM public.admin_eventos
 WHERE entidade_id = '00000000-0000-4000-8000-000000000001'
 ORDER BY tipo;
-- Esperado: 2 linhas
--   empresa_convidada   {"canal": "email"}
--   empresa_entrou_mapa {"origem": "importada", "tipo": "petshop"}
ROLLBACK;

-- 4. Assinatura de tutor: sair do pago e voltar gera cancelou + virou_pago
BEGIN;
CREATE TEMP TABLE alvo ON COMMIT DROP AS
SELECT user_id FROM public.subscriptions
 WHERE COALESCE(plan_category, 'tutor') = 'tutor'
 LIMIT 1;
UPDATE public.subscriptions s SET status = 'pending'
  FROM alvo WHERE s.user_id = alvo.user_id AND COALESCE(s.plan_category, 'tutor') = 'tutor';
UPDATE public.subscriptions s SET status = 'active'
  FROM alvo WHERE s.user_id = alvo.user_id AND COALESCE(s.plan_category, 'tutor') = 'tutor';
SELECT e.tipo, e.detalhe FROM public.admin_eventos e
  JOIN alvo ON e.entidade_id = alvo.user_id
 WHERE e.ocorrido_em = now();
-- Esperado: a última linha é tutor_virou_pago (antes dela, tutor_cancelou se a
-- assinatura já estava ativa). Nenhuma linha = não existe assinatura de tutor ainda.
ROLLBACK;

-- 5. Um defeito no diário não bloqueia a operação principal
BEGIN;
ALTER TABLE public.admin_eventos ADD CONSTRAINT teste_falha CHECK (false) NOT VALID;
INSERT INTO public.partners (id, nome, tipo, cidade, status, premium, destaque)
VALUES ('00000000-0000-4000-8000-000000000002', 'Teste de falha', 'petshop', 'Maringá', 'pending', false, false);
SELECT count(*) AS empresa_gravada FROM public.partners WHERE id = '00000000-0000-4000-8000-000000000002';
-- Esperado: empresa_gravada = 1, e um aviso "admin_eventos: não registrou ..." nas mensagens.
ROLLBACK;
```

- [ ] **Step 3: Revisar a migração contra a spec**

Confira linha por linha:
- os 8 tipos do `CHECK` são os mesmos de `TIPOS_EVENTO` (Task 2);
- todo gatilho tem `EXCEPTION WHEN OTHERS` e `RETURN NEW`;
- `admin_eventos_registrar` tem `REVOKE … FROM PUBLIC, anon, authenticated`;
- as reconstruções usam `ON CONFLICT DO NOTHING` ou `NOT EXISTS`.

Run: `grep -c "EXCEPTION WHEN OTHERS" supabase/migrations/20261120_admin_eventos.sql`
Expected: `4`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261120_admin_eventos.sql docs/superpowers/specs/2026-11-20-admin-analise-verificacao.sql docs/superpowers/specs/2026-11-20-admin-analise-design.md
git commit -m "feat(admin): diário de eventos admin_eventos com gatilhos e reconstrução do passado

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tipos, fuso de Brasília e período

**Files:**
- Create: `lib/admin/analytics/tipos.ts`
- Create: `lib/admin/analytics/tempo.ts`
- Create: `lib/admin/analytics/periodo.ts`
- Test: `lib/admin/analytics/tempo.test.ts`
- Test: `lib/admin/analytics/periodo.test.ts`

**Interfaces:**
- Produces (`tipos.ts`): `TIPOS_EVENTO`, `TipoEvento`, `Publico`, `Evento`, `PERIODOS`, `PeriodoChave`, `Granularidade`, `Intervalo`, `Periodo`, `Variacao`, `NumeroChave`, `EtapaFunil`, `AnaliseTutores`, `AnaliseEmpresas`, `Analise` (código abaixo).
- Produces (`tempo.ts`): `inicioDoDia(d: Date): Date`, `inicioDaSemana(d: Date): Date`, `inicioDoMes(d: Date): Date`, `somarDias(d: Date, dias: number): Date`, `somarMeses(d: Date, meses: number): Date`, `rotuloDia(d: Date): string` (`"20/11"`), `rotuloMes(d: Date): string` (`"nov/26"`), `lerData(valor: string): Date`.
- Produces (`periodo.ts`): `PERIODO_PADRAO: PeriodoChave`, `ehPeriodo(v: unknown): v is PeriodoChave`, `montarPeriodo(chave: PeriodoChave, agora: Date, maisAntigo: Date | null): Periodo`.

- [ ] **Step 1: Criar `tipos.ts`** (só tipos e constantes, sem teste próprio)

```ts
import type { FilaItem } from '@/lib/admin/filaHoje';

export const TIPOS_EVENTO = [
  'tutor_entrou',
  'tutor_virou_pago',
  'tutor_cancelou',
  'empresa_entrou_mapa',
  'empresa_convidada',
  'empresa_ativou_painel',
  'empresa_virou_paga',
  'empresa_cancelou',
] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];
export type Publico = 'tutor' | 'empresa';

export interface Evento {
  ocorridoEm: Date;
  publico: Publico;
  tipo: TipoEvento;
  entidadeId: string;
  detalhe: Record<string, unknown>;
  estimado: boolean;
}

export const PERIODOS = ['7d', '30d', '90d', 'tudo'] as const;
export type PeriodoChave = (typeof PERIODOS)[number];
export type Granularidade = 'dia' | 'semana' | 'mes';

/** Intervalo de tempo: `inicio` incluído, `fim` excluído. */
export interface Intervalo {
  inicio: Date;
  fim: Date;
}

export interface Periodo {
  chave: PeriodoChave;
  atual: Intervalo;
  anterior: Intervalo | null;
  granularidade: Granularidade;
}

export type Variacao = { tipo: 'pct'; valor: number } | { tipo: 'novo' } | null;

export interface NumeroChave {
  valor: number;
  variacao: Variacao;
}

export interface EtapaFunil {
  nome: string;
  total: number;
  /** % em relação à etapa anterior; null na 1ª etapa ou quando a anterior é 0. */
  pctDoAnterior: number | null;
  porGrupo: Record<string, number>;
}

export interface AnaliseTutores {
  numeros: {
    novos: NumeroChave;
    pagos: NumeroChave;
    conversaoPct: number | null;
    receitaMensal: number;
    cancelamentos: number;
  };
  entradas: Array<{ rotulo: string; cadastros: number; pagos: number }>;
  crescimento: Array<{ rotulo: string; cadastros: number; pagos: number }>;
  funil: EtapaFunil[];
  origem: Array<{ origem: string; cadastros: number; pagos: number }>;
}

export interface AnaliseEmpresas {
  numeros: {
    entraram: NumeroChave;
    importadas: number;
    cadastroProprio: number;
    convidadas: NumeroChave;
    ativaram: NumeroChave;
    pagas: NumeroChave;
    receitaMensal: number;
    cancelamentos: number;
  };
  entradas: Array<{ rotulo: string; importadas: number; cadastroProprio: number }>;
  funil: EtapaFunil[];
  porTipo: Array<{ tipo: string; rotulo: string; total: number; pagas: number }>;
  usoMapa: Array<{ rotulo: string; visualizacoes: number; whatsapp: number }>;
}

export interface Analise {
  periodo: { chave: PeriodoChave; granularidade: Granularidade; inicio: string; fim: string };
  fila: FilaItem[];
  tutores: AnaliseTutores;
  empresas: AnaliseEmpresas;
  /** Há eventos reconstruídos (datas aproximadas) dentro do período. */
  temEstimado: boolean;
  /** Data (ISO) do evento reconstruído mais recente, para a nota "* inclui datas aproximadas de antes de …". */
  estimadoAte: string | null;
}
```

- [ ] **Step 2: Escrever o teste de `tempo.ts`**

Create `lib/admin/analytics/tempo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  inicioDaSemana,
  inicioDoDia,
  inicioDoMes,
  lerData,
  rotuloDia,
  rotuloMes,
  somarDias,
  somarMeses,
} from './tempo';

describe('tempo (fuso de Brasília)', () => {
  it('23h30 em Brasília ainda é o mesmo dia', () => {
    // 21/11 02:30 UTC = 20/11 23:30 em Brasília
    expect(inicioDoDia(new Date('2026-11-21T02:30:00Z')).toISOString()).toBe('2026-11-20T03:00:00.000Z');
  });

  it('semana começa na segunda', () => {
    // 20/11/2026 é sexta; 22/11 é domingo; 16/11 é segunda
    expect(inicioDaSemana(new Date('2026-11-20T15:00:00Z')).toISOString()).toBe('2026-11-16T03:00:00.000Z');
    expect(inicioDaSemana(new Date('2026-11-22T12:00:00Z')).toISOString()).toBe('2026-11-16T03:00:00.000Z');
    expect(inicioDaSemana(new Date('2026-11-16T03:00:00Z')).toISOString()).toBe('2026-11-16T03:00:00.000Z');
  });

  it('mês respeita o fuso', () => {
    // 01/12 02:00 UTC = 30/11 23:00 em Brasília
    expect(inicioDoMes(new Date('2026-12-01T02:00:00Z')).toISOString()).toBe('2026-11-01T03:00:00.000Z');
  });

  it('soma dias e meses, inclusive virando o ano', () => {
    expect(somarDias(new Date('2026-11-20T03:00:00Z'), -6).toISOString()).toBe('2026-11-14T03:00:00.000Z');
    expect(somarMeses(new Date('2026-11-01T03:00:00Z'), 1).toISOString()).toBe('2026-12-01T03:00:00.000Z');
    expect(somarMeses(new Date('2026-12-01T03:00:00Z'), 1).toISOString()).toBe('2027-01-01T03:00:00.000Z');
  });

  it('rótulos curtos', () => {
    expect(rotuloDia(new Date('2026-11-20T03:00:00Z'))).toBe('20/11');
    expect(rotuloMes(new Date('2026-11-01T03:00:00Z'))).toBe('nov/26');
  });

  it('lê timestamps do Supabase com e sem fuso', () => {
    expect(lerData('2026-11-20T10:00:00').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(lerData('2026-11-20 10:00:00').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(lerData('2026-11-20T10:00:00+00:00').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(lerData('2026-11-20T07:00:00.123456-03:00').toISOString()).toBe('2026-11-20T10:00:00.123Z');
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run lib/admin/analytics/tempo.test.ts`
Expected: FAIL, "Failed to resolve import './tempo'"

- [ ] **Step 4: Implementar `tempo.ts`**

```ts
// O Brasil não tem horário de verão desde 2019: Brasília é sempre UTC−3.
// Se o horário de verão voltar, troque este deslocamento fixo por Intl.
const DESLOCAMENTO_MS = 3 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** O relógio de Brasília escrito como se fosse UTC, para usar getUTC*. */
function relogio(d: Date): Date {
  return new Date(d.getTime() - DESLOCAMENTO_MS);
}

function doRelogio(d: Date): Date {
  return new Date(d.getTime() + DESLOCAMENTO_MS);
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function inicioDoDia(d: Date): Date {
  const r = relogio(d);
  return doRelogio(new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate())));
}

export function inicioDaSemana(d: Date): Date {
  const dia = inicioDoDia(d);
  const diasDesdeSegunda = (relogio(dia).getUTCDay() + 6) % 7;
  return somarDias(dia, -diasDesdeSegunda);
}

export function inicioDoMes(d: Date): Date {
  const r = relogio(d);
  return doRelogio(new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), 1)));
}

export function somarDias(d: Date, dias: number): Date {
  return new Date(d.getTime() + dias * DIA_MS);
}

export function somarMeses(d: Date, meses: number): Date {
  const r = relogio(d);
  return doRelogio(
    new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + meses, r.getUTCDate(), r.getUTCHours())),
  );
}

export function rotuloDia(d: Date): string {
  const r = relogio(d);
  return `${doisDigitos(r.getUTCDate())}/${doisDigitos(r.getUTCMonth() + 1)}`;
}

export function rotuloMes(d: Date): string {
  const r = relogio(d);
  return `${MESES[r.getUTCMonth()]}/${String(r.getUTCFullYear()).slice(2)}`;
}

/**
 * Lê um timestamp vindo do Supabase. Colunas `timestamp` (sem fuso), como
 * `pet.created_at`, chegam sem "Z" mas estão em UTC: sem este cuidado, o
 * Node leria como hora local da máquina.
 */
export function lerData(valor: string): Date {
  const comT = valor.includes('T') ? valor : valor.replace(' ', 'T');
  const temFuso = /([zZ]|[+-]\d{2}:?\d{2})$/.test(comT);
  return new Date(temFuso ? comT : `${comT}Z`);
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run lib/admin/analytics/tempo.test.ts`
Expected: PASS (6 testes)

- [ ] **Step 6: Escrever o teste de `periodo.ts`**

Create `lib/admin/analytics/periodo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ehPeriodo, montarPeriodo, PERIODO_PADRAO } from './periodo';

const agora = new Date('2026-11-20T15:00:00Z'); // 12h em Brasília

describe('montarPeriodo', () => {
  it('7 dias: hoje e os 6 anteriores, comparado com os 7 dias antes', () => {
    const p = montarPeriodo('7d', agora, null);
    expect(p.atual.inicio.toISOString()).toBe('2026-11-14T03:00:00.000Z');
    expect(p.atual.fim).toBe(agora);
    expect(p.anterior?.inicio.toISOString()).toBe('2026-11-07T03:00:00.000Z');
    expect(p.anterior?.fim.toISOString()).toBe('2026-11-14T03:00:00.000Z');
    expect(p.granularidade).toBe('dia');
  });

  it('30 dias agrupa por dia; 90 dias agrupa por semana', () => {
    expect(montarPeriodo('30d', agora, null).granularidade).toBe('dia');
    const p90 = montarPeriodo('90d', agora, null);
    expect(p90.granularidade).toBe('semana');
    expect(p90.atual.inicio.toISOString()).toBe('2026-08-23T03:00:00.000Z');
  });

  it('tudo começa no mês do evento mais antigo, sem comparação', () => {
    const p = montarPeriodo('tudo', agora, new Date('2026-07-15T12:00:00Z'));
    expect(p.atual.inicio.toISOString()).toBe('2026-07-01T03:00:00.000Z');
    expect(p.anterior).toBeNull();
    expect(p.granularidade).toBe('mes');
  });

  it('tudo sem nenhum evento começa no mês atual', () => {
    expect(montarPeriodo('tudo', agora, null).atual.inicio.toISOString()).toBe('2026-11-01T03:00:00.000Z');
  });
});

describe('ehPeriodo', () => {
  it('aceita só os 4 períodos', () => {
    expect(ehPeriodo('30d')).toBe(true);
    expect(ehPeriodo('tudo')).toBe(true);
    expect(ehPeriodo('1a')).toBe(false);
    expect(ehPeriodo(null)).toBe(false);
    expect(PERIODO_PADRAO).toBe('30d');
  });
});
```

- [ ] **Step 7: Rodar e ver falhar**

Run: `npx vitest run lib/admin/analytics/periodo.test.ts`
Expected: FAIL, "Failed to resolve import './periodo'"

- [ ] **Step 8: Implementar `periodo.ts`**

```ts
import { PERIODOS, type Periodo, type PeriodoChave } from './tipos';
import { inicioDoDia, inicioDoMes, somarDias } from './tempo';

const DIAS: Record<Exclude<PeriodoChave, 'tudo'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

export const PERIODO_PADRAO: PeriodoChave = '30d';

export function ehPeriodo(v: unknown): v is PeriodoChave {
  return typeof v === 'string' && (PERIODOS as readonly string[]).includes(v);
}

export function montarPeriodo(chave: PeriodoChave, agora: Date, maisAntigo: Date | null): Periodo {
  if (chave === 'tudo') {
    return {
      chave,
      atual: { inicio: inicioDoMes(maisAntigo ?? agora), fim: agora },
      anterior: null,
      granularidade: 'mes',
    };
  }
  const dias = DIAS[chave];
  const inicio = somarDias(inicioDoDia(agora), -(dias - 1));
  return {
    chave,
    atual: { inicio, fim: agora },
    anterior: { inicio: somarDias(inicio, -dias), fim: inicio },
    granularidade: chave === '90d' ? 'semana' : 'dia',
  };
}
```

- [ ] **Step 9: Rodar e ver passar**

Run: `npx vitest run lib/admin/analytics/`
Expected: PASS (tempo 6, periodo 5)

- [ ] **Step 10: Commit**

```bash
git add lib/admin/analytics/tipos.ts lib/admin/analytics/tempo.ts lib/admin/analytics/tempo.test.ts lib/admin/analytics/periodo.ts lib/admin/analytics/periodo.test.ts
git commit -m "feat(admin): tipos, fuso de Brasília e período da análise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Intervalos e contagens (`agrupar.ts`)

**Files:**
- Create: `lib/admin/analytics/agrupar.ts`
- Test: `lib/admin/analytics/agrupar.test.ts`

**Interfaces:**
- Consumes: `Intervalo`, `Granularidade` (tipos.ts); `inicioDoDia`, `inicioDaSemana`, `inicioDoMes`, `somarDias`, `somarMeses`, `rotuloDia`, `rotuloMes` (tempo.ts).
- Produces: `interface Balde { inicio: Date; fim: Date; rotulo: string }`, `criarBaldes(intervalo: Intervalo, granularidade: Granularidade): Balde[]`, `contarPorBalde(baldes: Balde[], datas: Date[]): number[]`, `acumuladoAte(baldes: Balde[], datas: Date[]): number[]`.

- [ ] **Step 1: Escrever o teste**

```ts
import { describe, expect, it } from 'vitest';
import { acumuladoAte, contarPorBalde, criarBaldes } from './agrupar';

const agora = new Date('2026-11-20T15:00:00Z');

describe('criarBaldes', () => {
  it('7 dias = 7 baldes diários', () => {
    const baldes = criarBaldes({ inicio: new Date('2026-11-14T03:00:00Z'), fim: agora }, 'dia');
    expect(baldes).toHaveLength(7);
    expect(baldes[0].rotulo).toBe('14/11');
    expect(baldes[6].rotulo).toBe('20/11');
  });

  it('semanas começam na segunda anterior ao início', () => {
    // 23/08/2026 é domingo: a 1ª semana começa na segunda 17/08
    const baldes = criarBaldes({ inicio: new Date('2026-08-23T03:00:00Z'), fim: agora }, 'semana');
    expect(baldes[0].inicio.toISOString()).toBe('2026-08-17T03:00:00.000Z');
    expect(baldes[0].rotulo).toBe('17/08');
    expect(baldes[baldes.length - 1].rotulo).toBe('16/11');
    expect(baldes).toHaveLength(14);
  });

  it('meses', () => {
    const baldes = criarBaldes({ inicio: new Date('2026-07-01T03:00:00Z'), fim: agora }, 'mes');
    expect(baldes.map((b) => b.rotulo)).toEqual(['jul/26', 'ago/26', 'set/26', 'out/26', 'nov/26']);
  });
});

describe('contarPorBalde e acumuladoAte', () => {
  const baldes = criarBaldes({ inicio: new Date('2026-11-14T03:00:00Z'), fim: agora }, 'dia');

  it('conta no dia de Brasília e ignora o que está fora', () => {
    const datas = [
      new Date('2026-11-21T02:30:00Z'), // 20/11 23:30 → último balde
      new Date('2026-11-14T02:59:00Z'), // 13/11 23:59 → fora
      new Date('2026-11-15T12:00:00Z'),
      new Date('2026-11-15T13:00:00Z'),
    ];
    expect(contarPorBalde(baldes, datas)).toEqual([0, 2, 0, 0, 0, 0, 1]);
  });

  it('acumula tudo o que aconteceu antes do fim de cada balde, inclusive antes do período', () => {
    const datas = [new Date('2026-11-01T12:00:00Z'), new Date('2026-11-15T12:00:00Z')];
    expect(acumuladoAte(baldes, datas)).toEqual([1, 2, 2, 2, 2, 2, 2]);
  });
});
```

Save as `lib/admin/analytics/agrupar.test.ts`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run lib/admin/analytics/agrupar.test.ts`
Expected: FAIL, "Failed to resolve import './agrupar'"

- [ ] **Step 3: Implementar `agrupar.ts`**

```ts
import type { Granularidade, Intervalo } from './tipos';
import {
  inicioDaSemana,
  inicioDoDia,
  inicioDoMes,
  rotuloDia,
  rotuloMes,
  somarDias,
  somarMeses,
} from './tempo';

export interface Balde {
  inicio: Date;
  fim: Date;
  rotulo: string;
}

function inicioDoBalde(d: Date, granularidade: Granularidade): Date {
  if (granularidade === 'dia') return inicioDoDia(d);
  if (granularidade === 'semana') return inicioDaSemana(d);
  return inicioDoMes(d);
}

function proximo(d: Date, granularidade: Granularidade): Date {
  if (granularidade === 'dia') return somarDias(d, 1);
  if (granularidade === 'semana') return somarDias(d, 7);
  return somarMeses(d, 1);
}

export function criarBaldes(intervalo: Intervalo, granularidade: Granularidade): Balde[] {
  const baldes: Balde[] = [];
  let inicio = inicioDoBalde(intervalo.inicio, granularidade);
  while (inicio < intervalo.fim) {
    const fim = proximo(inicio, granularidade);
    baldes.push({ inicio, fim, rotulo: granularidade === 'mes' ? rotuloMes(inicio) : rotuloDia(inicio) });
    inicio = fim;
  }
  return baldes;
}

export function contarPorBalde(baldes: Balde[], datas: Date[]): number[] {
  const contagem = baldes.map(() => 0);
  for (const d of datas) {
    const i = baldes.findIndex((b) => d >= b.inicio && d < b.fim);
    if (i >= 0) contagem[i] += 1;
  }
  return contagem;
}

export function acumuladoAte(baldes: Balde[], datas: Date[]): number[] {
  return baldes.map((b) => datas.filter((d) => d < b.fim).length);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run lib/admin/analytics/agrupar.test.ts`
Expected: PASS (5 testes)

- [ ] **Step 5: Commit**

```bash
git add lib/admin/analytics/agrupar.ts lib/admin/analytics/agrupar.test.ts
git commit -m "feat(admin): agrupamento por dia, semana e mês

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Funil por turma e variação

**Files:**
- Create: `lib/admin/analytics/funil.ts`
- Create: `lib/admin/analytics/variacao.ts`
- Test: `lib/admin/analytics/funil.test.ts`
- Test: `lib/admin/analytics/variacao.test.ts`

**Interfaces:**
- Consumes: `EtapaFunil`, `Variacao` (tipos.ts).
- Produces: `montarFunil(nomes: string[], entradas: Array<{ id: string; grupo?: string }>, etapas: Array<Set<string>>): EtapaFunil[]` (`nomes.length === etapas.length + 1`; a etapa 0 é a própria entrada); `conversaoDoFunil(funil: EtapaFunil[]): number | null` (% com 1 casa); `variacao(atual: number, anterior: number | null): Variacao`.

Regra do funil: cada entidade conta até a **etapa mais avançada** que alcançou. Quem pagou sem ter sido convidado (cadastro próprio) também conta como convidado, para o funil nunca crescer de uma etapa para a outra.

- [ ] **Step 1: Escrever os testes**

`lib/admin/analytics/funil.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { conversaoDoFunil, montarFunil } from './funil';

const nomes = ['Cadastrou', 'Cadastrou o 1º pet', 'Pagou'];

describe('montarFunil', () => {
  it('conta cada etapa e a % da anterior', () => {
    const funil = montarFunil(
      nomes,
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      [new Set(['a', 'b', 'c']), new Set(['a'])],
    );
    expect(funil.map((e) => e.total)).toEqual([4, 3, 1]);
    expect(funil.map((e) => e.pctDoAnterior)).toEqual([null, 75, 33]);
    expect(conversaoDoFunil(funil)).toBe(25);
  });

  it('quem pula etapa conta nas anteriores', () => {
    const funil = montarFunil(nomes, [{ id: 'a' }, { id: 'b' }], [new Set(['a']), new Set(['b'])]);
    expect(funil.map((e) => e.total)).toEqual([2, 2, 1]);
    expect(funil.map((e) => e.pctDoAnterior)).toEqual([null, 100, 50]);
  });

  it('ignora quem não está na turma', () => {
    const funil = montarFunil(nomes, [{ id: 'a' }], [new Set(['a', 'x']), new Set(['x'])]);
    expect(funil.map((e) => e.total)).toEqual([1, 1, 0]);
  });

  it('turma vazia', () => {
    const funil = montarFunil(nomes, [], [new Set(['a']), new Set(['a'])]);
    expect(funil.map((e) => e.total)).toEqual([0, 0, 0]);
    expect(funil.map((e) => e.pctDoAnterior)).toEqual([null, null, null]);
    expect(conversaoDoFunil(funil)).toBeNull();
  });

  it('divide por grupo', () => {
    const funil = montarFunil(
      ['No mapa', 'Pagou'],
      [
        { id: 'a', grupo: 'importadas' },
        { id: 'b', grupo: 'importadas' },
        { id: 'c', grupo: 'cadastroProprio' },
      ],
      [new Set(['c'])],
    );
    expect(funil[0].porGrupo).toEqual({ importadas: 2, cadastroProprio: 1 });
    expect(funil[1].porGrupo).toEqual({ cadastroProprio: 1 });
  });

  it('conversão com uma casa decimal', () => {
    const funil = montarFunil(['A', 'B'], [{ id: 'a' }, { id: 'b' }, { id: 'c' }], [new Set(['a'])]);
    expect(conversaoDoFunil(funil)).toBe(33.3);
  });
});
```

`lib/admin/analytics/variacao.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { variacao } from './variacao';

describe('variacao', () => {
  it('sem período anterior não compara', () => {
    expect(variacao(10, null)).toBeNull();
  });
  it('anterior zerado', () => {
    expect(variacao(0, 0)).toEqual({ tipo: 'pct', valor: 0 });
    expect(variacao(5, 0)).toEqual({ tipo: 'novo' });
  });
  it('% arredondada', () => {
    expect(variacao(12, 10)).toEqual({ tipo: 'pct', valor: 20 });
    expect(variacao(5, 10)).toEqual({ tipo: 'pct', valor: -50 });
    expect(variacao(2, 3)).toEqual({ tipo: 'pct', valor: -33 });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run lib/admin/analytics/funil.test.ts lib/admin/analytics/variacao.test.ts`
Expected: FAIL, "Failed to resolve import"

- [ ] **Step 3: Implementar**

`lib/admin/analytics/funil.ts`:

```ts
import type { EtapaFunil } from './tipos';

export function montarFunil(
  nomes: string[],
  entradas: Array<{ id: string; grupo?: string }>,
  etapas: Array<Set<string>>,
): EtapaFunil[] {
  const nivel = new Map<string, number>();
  for (const entrada of entradas) {
    let n = 0;
    etapas.forEach((quem, i) => {
      if (quem.has(entrada.id)) n = i + 1;
    });
    nivel.set(entrada.id, n);
  }

  const totais = nomes.map((nome, k) => {
    const chegaram = entradas.filter((e) => (nivel.get(e.id) ?? 0) >= k);
    const porGrupo: Record<string, number> = {};
    for (const e of chegaram) {
      if (e.grupo) porGrupo[e.grupo] = (porGrupo[e.grupo] || 0) + 1;
    }
    return { nome, total: chegaram.length, porGrupo };
  });

  return totais.map((etapa, k) => {
    const anterior = k === 0 ? 0 : totais[k - 1].total;
    return {
      ...etapa,
      pctDoAnterior: k === 0 || anterior === 0 ? null : Math.round((etapa.total / anterior) * 100),
    };
  });
}

export function conversaoDoFunil(funil: EtapaFunil[]): number | null {
  if (funil.length < 2 || funil[0].total === 0) return null;
  return Math.round((funil[funil.length - 1].total / funil[0].total) * 1000) / 10;
}
```

`lib/admin/analytics/variacao.ts`:

```ts
import type { Variacao } from './tipos';

export function variacao(atual: number, anterior: number | null): Variacao {
  if (anterior === null) return null;
  if (anterior === 0) return atual === 0 ? { tipo: 'pct', valor: 0 } : { tipo: 'novo' };
  return { tipo: 'pct', valor: Math.round(((atual - anterior) / anterior) * 100) };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run lib/admin/analytics/funil.test.ts lib/admin/analytics/variacao.test.ts`
Expected: PASS (funil 6, variacao 3)

- [ ] **Step 5: Commit**

```bash
git add lib/admin/analytics/funil.ts lib/admin/analytics/funil.test.ts lib/admin/analytics/variacao.ts lib/admin/analytics/variacao.test.ts
git commit -m "feat(admin): funil por turma e variação contra o período anterior

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Catálogo, montagem da análise e dados de exemplo

**Files:**
- Create: `lib/admin/analytics/catalogo.ts`
- Create: `lib/admin/analytics/montar.ts`
- Create: `lib/admin/analytics/exemplo.ts`
- Test: `lib/admin/analytics/montar.test.ts`
- Test: `lib/admin/analytics/exemplo.test.ts`

**Interfaces:**
- Consumes: tudo de `tipos.ts`, `agrupar.ts`, `funil.ts`, `variacao.ts`, `periodo.ts`; `FilaItem`, `montarFilaHoje` de `lib/admin/filaHoje.ts`.
- Produces (`catalogo.ts`): `PRECO_MENSAL: Record<string, number>`, `ROTULO_TIPO: Record<string, string>`, `categoriaDoPlano(planType: string, planCategory: string | null): 'tutor' | 'partner'`, `receitaMensal(planos: string[]): number`.
- Produces (`montar.ts`): `interface DadosBrutos`, `semEquipe(eventos: Evento[], idsEquipe: Set<string>): Evento[]`, `maisAntigo(eventos: Evento[]): Date | null`, `montarAnalise(dados: DadosBrutos, periodo: Periodo): Analise`.
- Produces (`exemplo.ts`): `dadosExemplo(agora: Date): DadosBrutos`, `analiseDeExemplo(chave: PeriodoChave, agora: Date): Analise`.

- [ ] **Step 1: Criar `catalogo.ts`** (os valores vêm de `app/api/admin/dashboard-stats/route.ts` e `app/admin/page.tsx`, que serão removidos)

```ts
// Preços mensais (BRL) para estimar a receita mensal: só planos com valor estável.
export const PRECO_MENSAL: Record<string, number> = {
  tutor_monthly: 29.49,
  tutor_annual: 238.8 / 12,
  // Parceiro virou 100% anual a partir de 2026-09: o valor é o preço à vista
  // dividido por 12 (receita reconhecida por mês), não a parcela com juros.
  partner_basic: 239.8 / 12,
  partner_annual: 238.8 / 12,
  partner_pro: 596.9 / 12,
  partner_enterprise: 826.8 / 12,
};

export const ROTULO_TIPO: Record<string, string> = {
  veterinario: 'Veterinários',
  petshop: 'Pet shops',
  creche: 'Creches',
  parque: 'Parques',
  hotel: 'Hotéis',
  petsitter: 'Pet sitters',
  petdriver: 'Pet drivers',
};

export function categoriaDoPlano(planType: string, planCategory: string | null): 'tutor' | 'partner' {
  if (planCategory === 'partner' || planCategory === 'tutor') return planCategory;
  return planType.startsWith('partner_') ? 'partner' : 'tutor';
}

export function receitaMensal(planos: string[]): number {
  const total = planos.reduce((soma, plano) => soma + (PRECO_MENSAL[plano] ?? 0), 0);
  return Math.round(total * 100) / 100;
}
```

- [ ] **Step 2: Escrever o teste de `montar.ts`**

`lib/admin/analytics/montar.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Evento, TipoEvento } from './tipos';
import { montarPeriodo } from './periodo';
import { maisAntigo, montarAnalise, semEquipe, type DadosBrutos } from './montar';
import { categoriaDoPlano, receitaMensal } from './catalogo';

const agora = new Date('2026-11-20T15:00:00Z');
const periodo = montarPeriodo('7d', agora, null); // atual 14/11–20/11, anterior 07/11–13/11

function ev(tipo: TipoEvento, quando: string, id: string, detalhe: Record<string, unknown> = {}, estimado = false): Evento {
  return {
    ocorridoEm: new Date(quando),
    publico: tipo.startsWith('tutor_') ? 'tutor' : 'empresa',
    tipo,
    entidadeId: id,
    detalhe,
    estimado,
  };
}

const eventos: Evento[] = [
  ev('tutor_entrou', '2026-11-15T12:00:00Z', 't1', { utm_source: 'instagram' }),
  ev('tutor_virou_pago', '2026-11-16T12:00:00Z', 't1'),
  ev('tutor_entrou', '2026-11-18T12:00:00Z', 't2'),
  ev('tutor_entrou', '2026-11-10T12:00:00Z', 't3', {}, true),
  ev('tutor_virou_pago', '2026-11-12T12:00:00Z', 't3', {}, true),
  ev('tutor_cancelou', '2026-11-19T12:00:00Z', 't3'),
  ev('empresa_entrou_mapa', '2026-11-15T12:00:00Z', 'p1', { origem: 'importada' }),
  ev('empresa_convidada', '2026-11-16T12:00:00Z', 'p1'),
  ev('empresa_ativou_painel', '2026-11-17T12:00:00Z', 'p1'),
  ev('empresa_virou_paga', '2026-11-18T12:00:00Z', 'p1'),
  ev('empresa_entrou_mapa', '2026-11-16T12:00:00Z', 'p2', { origem: 'cadastro_proprio' }),
  ev('empresa_ativou_painel', '2026-11-16T13:00:00Z', 'p2'),
  ev('empresa_entrou_mapa', '2026-11-01T12:00:00Z', 'p3', { origem: 'importada' }),
];

const dados: DadosBrutos = {
  eventos,
  primeiroPet: new Map([['t2', new Date('2026-11-18T13:00:00Z')]]),
  partners: [
    { id: 'p1', tipo: 'veterinario', premium: true },
    { id: 'p2', tipo: 'petshop', premium: false },
    { id: 'p3', tipo: 'veterinario', premium: false },
  ],
  usoMapa: [
    { ocorridoEm: new Date('2026-11-19T12:00:00Z'), tipo: 'view' },
    { ocorridoEm: new Date('2026-11-19T13:00:00Z'), tipo: 'view' },
    { ocorridoEm: new Date('2026-11-20T12:00:00Z'), tipo: 'whatsapp_click' },
    { ocorridoEm: new Date('2026-11-01T12:00:00Z'), tipo: 'view' },
  ],
  assinaturasAtivas: [
    { planType: 'tutor_monthly', categoria: 'tutor' },
    { planType: 'partner_pro', categoria: 'partner' },
  ],
  fila: [],
};

describe('montarAnalise — tutores', () => {
  const { tutores } = montarAnalise(dados, periodo);

  it('números-chave com comparação', () => {
    expect(tutores.numeros.novos).toEqual({ valor: 2, variacao: { tipo: 'pct', valor: 100 } });
    expect(tutores.numeros.pagos).toEqual({ valor: 1, variacao: { tipo: 'pct', valor: 0 } });
    expect(tutores.numeros.cancelamentos).toBe(1);
    expect(tutores.numeros.receitaMensal).toBe(29.49);
    expect(tutores.numeros.conversaoPct).toBe(50);
  });

  it('funil da turma: quem pagou sem pet conta como "cadastrou pet"', () => {
    expect(tutores.funil.map((e) => [e.nome, e.total])).toEqual([
      ['Cadastrou', 2],
      ['Cadastrou o 1º pet', 2],
      ['Pagou', 1],
    ]);
  });

  it('entradas por dia', () => {
    expect(tutores.entradas.map((p) => p.rotulo)).toEqual(['14/11', '15/11', '16/11', '17/11', '18/11', '19/11', '20/11']);
    expect(tutores.entradas.map((p) => p.cadastros)).toEqual([0, 1, 0, 0, 1, 0, 0]);
    expect(tutores.entradas.map((p) => p.pagos)).toEqual([0, 0, 1, 0, 0, 0, 0]);
  });

  it('crescimento acumulado inclui o passado e desconta cancelamentos', () => {
    expect(tutores.crescimento[0]).toEqual({ rotulo: '14/11', cadastros: 1, pagos: 1 });
    expect(tutores.crescimento[6]).toEqual({ rotulo: '20/11', cadastros: 3, pagos: 1 });
  });

  it('origem da turma, vazio vira "Direto"', () => {
    expect(tutores.origem).toEqual([
      { origem: 'Direto', cadastros: 1, pagos: 0 },
      { origem: 'instagram', cadastros: 1, pagos: 1 },
    ]);
  });
});

describe('montarAnalise — empresas', () => {
  const { empresas } = montarAnalise(dados, periodo);

  it('números-chave', () => {
    expect(empresas.numeros.entraram).toEqual({ valor: 2, variacao: { tipo: 'novo' } });
    expect(empresas.numeros.importadas).toBe(1);
    expect(empresas.numeros.cadastroProprio).toBe(1);
    expect(empresas.numeros.convidadas.valor).toBe(1);
    expect(empresas.numeros.ativaram.valor).toBe(2);
    expect(empresas.numeros.pagas.valor).toBe(1);
    expect(empresas.numeros.receitaMensal).toBe(49.74);
  });

  it('funil de 4 etapas com divisão por origem', () => {
    expect(empresas.funil.map((e) => e.total)).toEqual([2, 2, 2, 1]);
    expect(empresas.funil[0].porGrupo).toEqual({ importadas: 1, cadastroProprio: 1 });
    expect(empresas.funil[3].porGrupo).toEqual({ importadas: 1 });
  });

  it('entradas separadas por origem', () => {
    expect(empresas.entradas[1]).toEqual({ rotulo: '15/11', importadas: 1, cadastroProprio: 0 });
    expect(empresas.entradas[2]).toEqual({ rotulo: '16/11', importadas: 0, cadastroProprio: 1 });
  });

  it('por tipo, do maior para o menor', () => {
    expect(empresas.porTipo).toEqual([
      { tipo: 'veterinario', rotulo: 'Veterinários', total: 2, pagas: 1 },
      { tipo: 'petshop', rotulo: 'Pet shops', total: 1, pagas: 0 },
    ]);
  });

  it('uso do mapa só dentro do período', () => {
    expect(empresas.usoMapa[5]).toEqual({ rotulo: '19/11', visualizacoes: 2, whatsapp: 0 });
    expect(empresas.usoMapa[6]).toEqual({ rotulo: '20/11', visualizacoes: 0, whatsapp: 1 });
    expect(empresas.usoMapa.reduce((s, p) => s + p.visualizacoes, 0)).toBe(2);
  });
});

describe('montarAnalise — geral', () => {
  it('nota de estimado só quando há estimado no período', () => {
    const analise = montarAnalise(dados, periodo);
    expect(analise.temEstimado).toBe(false);
    expect(analise.estimadoAte).toBe('2026-11-12T12:00:00.000Z');
    const comEstimado = montarAnalise(
      { ...dados, eventos: [...eventos, ev('tutor_entrou', '2026-11-15T10:00:00Z', 't9', {}, true)] },
      periodo,
    );
    expect(comEstimado.temEstimado).toBe(true);
  });

  it('devolve o período em ISO', () => {
    const analise = montarAnalise(dados, periodo);
    expect(analise.periodo).toEqual({
      chave: '7d',
      granularidade: 'dia',
      inicio: '2026-11-14T03:00:00.000Z',
      fim: '2026-11-20T15:00:00.000Z',
    });
  });
});

describe('auxiliares', () => {
  it('semEquipe tira as contas da equipe', () => {
    expect(semEquipe(eventos, new Set(['t1', 'p1'])).some((e) => e.entidadeId === 't1' || e.entidadeId === 'p1')).toBe(false);
  });
  it('maisAntigo', () => {
    expect(maisAntigo(eventos)?.toISOString()).toBe('2026-11-01T12:00:00.000Z');
    expect(maisAntigo([])).toBeNull();
  });
  it('catálogo', () => {
    expect(categoriaDoPlano('partner_pro', null)).toBe('partner');
    expect(categoriaDoPlano('tutor_monthly', null)).toBe('tutor');
    expect(categoriaDoPlano('unknown', 'partner')).toBe('partner');
    expect(receitaMensal(['tutor_monthly', 'tutor_monthly', 'unknown'])).toBe(58.98);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run lib/admin/analytics/montar.test.ts`
Expected: FAIL, "Failed to resolve import './montar'"

- [ ] **Step 4: Implementar `montar.ts`**

```ts
import type { FilaItem } from '@/lib/admin/filaHoje';
import { acumuladoAte, contarPorBalde, criarBaldes, type Balde } from './agrupar';
import { receitaMensal, ROTULO_TIPO } from './catalogo';
import { conversaoDoFunil, montarFunil } from './funil';
import type {
  Analise,
  AnaliseEmpresas,
  AnaliseTutores,
  Evento,
  Intervalo,
  NumeroChave,
  Periodo,
  TipoEvento,
} from './tipos';
import { variacao } from './variacao';

export interface DadosBrutos {
  /** Já sem as contas da equipe. */
  eventos: Evento[];
  /** Data do 1º pet de cada tutor. */
  primeiroPet: Map<string, Date>;
  /** Estado atual das empresas, para o ranking por tipo. */
  partners: Array<{ id: string; tipo: string; premium: boolean }>;
  /** Visualizações e cliques no mapa, a partir do início do período. */
  usoMapa: Array<{ ocorridoEm: Date; tipo: 'view' | 'whatsapp_click' }>;
  assinaturasAtivas: Array<{ planType: string; categoria: 'tutor' | 'partner' }>;
  fila: FilaItem[];
}

export function semEquipe(eventos: Evento[], idsEquipe: Set<string>): Evento[] {
  return eventos.filter((e) => !idsEquipe.has(e.entidadeId));
}

export function maisAntigo(eventos: Evento[]): Date | null {
  let menor: Date | null = null;
  for (const e of eventos) {
    if (!menor || e.ocorridoEm < menor) menor = e.ocorridoEm;
  }
  return menor;
}

function dentro(d: Date, intervalo: Intervalo): boolean {
  return d >= intervalo.inicio && d < intervalo.fim;
}

function doTipo(eventos: Evento[], tipo: TipoEvento): Evento[] {
  return eventos.filter((e) => e.tipo === tipo);
}

function datas(eventos: Evento[], intervalo?: Intervalo): Date[] {
  const todas = eventos.map((e) => e.ocorridoEm);
  return intervalo ? todas.filter((d) => dentro(d, intervalo)) : todas;
}

function ids(eventos: Evento[]): Set<string> {
  return new Set(eventos.map((e) => e.entidadeId));
}

function numero(eventos: Evento[], periodo: Periodo): NumeroChave {
  const atual = datas(eventos, periodo.atual).length;
  const anterior = periodo.anterior ? datas(eventos, periodo.anterior).length : null;
  return { valor: atual, variacao: variacao(atual, anterior) };
}

function montarTutores(dados: DadosBrutos, periodo: Periodo, baldes: Balde[]): AnaliseTutores {
  const eventos = dados.eventos.filter((e) => e.publico === 'tutor');
  const entrou = doTipo(eventos, 'tutor_entrou');
  const pagou = doTipo(eventos, 'tutor_virou_pago');
  const cancelou = doTipo(eventos, 'tutor_cancelou');

  const turma = entrou.filter((e) => dentro(e.ocorridoEm, periodo.atual));
  const idsPagos = ids(pagou);
  const funil = montarFunil(
    ['Cadastrou', 'Cadastrou o 1º pet', 'Pagou'],
    turma.map((e) => ({ id: e.entidadeId })),
    [new Set(dados.primeiroPet.keys()), idsPagos],
  );

  const porOrigem = new Map<string, { cadastros: number; pagos: number }>();
  for (const e of turma) {
    const bruto = e.detalhe.utm_source;
    const origem = typeof bruto === 'string' && bruto.trim() ? bruto.trim() : 'Direto';
    const atual = porOrigem.get(origem) ?? { cadastros: 0, pagos: 0 };
    atual.cadastros += 1;
    if (idsPagos.has(e.entidadeId)) atual.pagos += 1;
    porOrigem.set(origem, atual);
  }
  const origem = Array.from(porOrigem, ([nome, v]) => ({ origem: nome, ...v })).sort(
    (a, b) => b.cadastros - a.cadastros || a.origem.localeCompare(b.origem, 'pt-BR'),
  );

  const cadastrosPorBalde = contarPorBalde(baldes, datas(entrou, periodo.atual));
  const pagosPorBalde = contarPorBalde(baldes, datas(pagou, periodo.atual));
  const baseCadastros = acumuladoAte(baldes, datas(entrou));
  const basePagos = acumuladoAte(baldes, datas(pagou));
  const baseCancelados = acumuladoAte(baldes, datas(cancelou));

  return {
    numeros: {
      novos: numero(entrou, periodo),
      pagos: numero(pagou, periodo),
      conversaoPct: conversaoDoFunil(funil),
      receitaMensal: receitaMensal(
        dados.assinaturasAtivas.filter((a) => a.categoria === 'tutor').map((a) => a.planType),
      ),
      cancelamentos: datas(cancelou, periodo.atual).length,
    },
    entradas: baldes.map((b, i) => ({ rotulo: b.rotulo, cadastros: cadastrosPorBalde[i], pagos: pagosPorBalde[i] })),
    crescimento: baldes.map((b, i) => ({
      rotulo: b.rotulo,
      cadastros: baseCadastros[i],
      pagos: Math.max(0, basePagos[i] - baseCancelados[i]),
    })),
    funil,
    origem,
  };
}

type OrigemEmpresa = 'importadas' | 'cadastroProprio';

function origemDaEmpresa(e: Evento): OrigemEmpresa {
  return e.detalhe.origem === 'cadastro_proprio' ? 'cadastroProprio' : 'importadas';
}

function montarEmpresas(dados: DadosBrutos, periodo: Periodo, baldes: Balde[]): AnaliseEmpresas {
  const eventos = dados.eventos.filter((e) => e.publico === 'empresa');
  const entrou = doTipo(eventos, 'empresa_entrou_mapa');
  const convidada = doTipo(eventos, 'empresa_convidada');
  const ativou = doTipo(eventos, 'empresa_ativou_painel');
  const pagou = doTipo(eventos, 'empresa_virou_paga');
  const cancelou = doTipo(eventos, 'empresa_cancelou');

  const turma = entrou.filter((e) => dentro(e.ocorridoEm, periodo.atual));
  const importadas = turma.filter((e) => origemDaEmpresa(e) === 'importadas');
  const proprias = turma.filter((e) => origemDaEmpresa(e) === 'cadastroProprio');

  const funil = montarFunil(
    ['No mapa', 'Convidada', 'Ativou o painel', 'Pagou'],
    turma.map((e) => ({ id: e.entidadeId, grupo: origemDaEmpresa(e) })),
    [ids(convidada), ids(ativou), ids(pagou)],
  );

  const porTipoMapa = new Map<string, { total: number; pagas: number }>();
  for (const p of dados.partners) {
    const atual = porTipoMapa.get(p.tipo) ?? { total: 0, pagas: 0 };
    atual.total += 1;
    if (p.premium) atual.pagas += 1;
    porTipoMapa.set(p.tipo, atual);
  }
  const porTipo = Array.from(porTipoMapa, ([tipo, v]) => ({ tipo, rotulo: ROTULO_TIPO[tipo] ?? tipo, ...v })).sort(
    (a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo, 'pt-BR'),
  );

  const importadasPorBalde = contarPorBalde(baldes, datas(importadas));
  const propriasPorBalde = contarPorBalde(baldes, datas(proprias));
  const usoNoPeriodo = dados.usoMapa.filter((u) => dentro(u.ocorridoEm, periodo.atual));
  const views = contarPorBalde(baldes, usoNoPeriodo.filter((u) => u.tipo === 'view').map((u) => u.ocorridoEm));
  const whats = contarPorBalde(
    baldes,
    usoNoPeriodo.filter((u) => u.tipo === 'whatsapp_click').map((u) => u.ocorridoEm),
  );

  return {
    numeros: {
      entraram: numero(entrou, periodo),
      importadas: importadas.length,
      cadastroProprio: proprias.length,
      convidadas: numero(convidada, periodo),
      ativaram: numero(ativou, periodo),
      pagas: numero(pagou, periodo),
      receitaMensal: receitaMensal(
        dados.assinaturasAtivas.filter((a) => a.categoria === 'partner').map((a) => a.planType),
      ),
      cancelamentos: datas(cancelou, periodo.atual).length,
    },
    entradas: baldes.map((b, i) => ({
      rotulo: b.rotulo,
      importadas: importadasPorBalde[i],
      cadastroProprio: propriasPorBalde[i],
    })),
    funil,
    porTipo,
    usoMapa: baldes.map((b, i) => ({ rotulo: b.rotulo, visualizacoes: views[i], whatsapp: whats[i] })),
  };
}

export function montarAnalise(dados: DadosBrutos, periodo: Periodo): Analise {
  const baldes = criarBaldes(periodo.atual, periodo.granularidade);
  const estimados = dados.eventos.filter((e) => e.estimado);
  let estimadoAte: Date | null = null;
  for (const e of estimados) {
    if (!estimadoAte || e.ocorridoEm > estimadoAte) estimadoAte = e.ocorridoEm;
  }

  return {
    periodo: {
      chave: periodo.chave,
      granularidade: periodo.granularidade,
      inicio: periodo.atual.inicio.toISOString(),
      fim: periodo.atual.fim.toISOString(),
    },
    fila: dados.fila,
    tutores: montarTutores(dados, periodo, baldes),
    empresas: montarEmpresas(dados, periodo, baldes),
    temEstimado: estimados.some((e) => dentro(e.ocorridoEm, periodo.atual)),
    estimadoAte: estimadoAte ? estimadoAte.toISOString() : null,
  };
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run lib/admin/analytics/montar.test.ts`
Expected: PASS (15 testes)

- [ ] **Step 6: Escrever o teste de `exemplo.ts`**

`lib/admin/analytics/exemplo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PERIODOS } from './tipos';
import { analiseDeExemplo } from './exemplo';

describe('analiseDeExemplo', () => {
  const agora = new Date('2026-11-20T15:00:00Z');

  it.each(PERIODOS)('monta o período %s com dados suficientes', (chave) => {
    const analise = analiseDeExemplo(chave, agora);
    expect(analise.tutores.entradas.length).toBeGreaterThan(0);
    expect(analise.tutores.funil[0].total).toBeGreaterThanOrEqual(5);
    expect(analise.empresas.funil[0].total).toBeGreaterThanOrEqual(analise.empresas.funil[3].total);
    expect(analise.fila.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 7: Rodar e ver falhar**

Run: `npx vitest run lib/admin/analytics/exemplo.test.ts`
Expected: FAIL, "Failed to resolve import './exemplo'"

- [ ] **Step 8: Implementar `exemplo.ts`**

```ts
// Dados inventados para conferir a tela localmente, sem as chaves do Supabase.
// Só são usados quando isOpenAccess() e ANALISE_EXEMPLO=1 (ver a rota).
import { montarFilaHoje } from '@/lib/admin/filaHoje';
import { maisAntigo, montarAnalise, type DadosBrutos } from './montar';
import { montarPeriodo } from './periodo';
import type { Analise, Evento, PeriodoChave, TipoEvento } from './tipos';

const DIA_MS = 24 * 60 * 60 * 1000;
const HORA_MS = 60 * 60 * 1000;
const ORIGENS = ['instagram', 'google', '', 'whatsapp'];
const TIPOS = ['veterinario', 'petshop', 'creche', 'hotel', 'petsitter'];

export function dadosExemplo(agora: Date): DadosBrutos {
  const eventos: Evento[] = [];
  const antesDe = (dias: number, horas = 0) => new Date(agora.getTime() - dias * DIA_MS - horas * HORA_MS);
  const limiteEstimado = antesDe(60);
  const add = (tipo: TipoEvento, quando: Date, id: string, detalhe: Record<string, unknown> = {}) => {
    if (quando >= agora) return;
    eventos.push({
      ocorridoEm: quando,
      publico: tipo.startsWith('tutor_') ? 'tutor' : 'empresa',
      tipo,
      entidadeId: id,
      detalhe,
      estimado: quando < limiteEstimado,
    });
  };

  const primeiroPet = new Map<string, Date>();
  // 300 tutores espalhados em 150 dias: cada dia recebe ~2 cadastros.
  for (let i = 0; i < 300; i++) {
    const id = `tutor-${i}`;
    const entrou = antesDe((i * 37) % 150, i % 24);
    add('tutor_entrou', entrou, id, { utm_source: ORIGENS[i % ORIGENS.length] });
    if (i % 3 !== 0) primeiroPet.set(id, new Date(entrou.getTime() + 2 * HORA_MS));
    if (i % 6 === 0) add('tutor_virou_pago', new Date(entrou.getTime() + 3 * DIA_MS), id);
    if (i % 30 === 0) add('tutor_cancelou', new Date(entrou.getTime() + 20 * DIA_MS), id);
  }

  const partners: DadosBrutos['partners'] = [];
  for (let i = 0; i < 320; i++) {
    const id = `empresa-${i}`;
    const propria = i % 13 === 0;
    const entrou = propria ? antesDe((i * 11) % 120) : antesDe(75, i % 5);
    const tipo = TIPOS[i % TIPOS.length];
    const paga = i % 26 === 0;
    partners.push({ id, tipo, premium: paga });
    add('empresa_entrou_mapa', entrou, id, { origem: propria ? 'cadastro_proprio' : 'importada', tipo });
    if (!propria && i % 2 === 0) add('empresa_convidada', antesDe((i * 7) % 70), id, { canal: 'whatsapp' });
    if (i % 9 === 0 || propria) add('empresa_ativou_painel', antesDe((i * 5) % 60), id);
    if (paga) add('empresa_virou_paga', antesDe((i * 3) % 50), id);
  }

  const usoMapa: DadosBrutos['usoMapa'] = [];
  for (let d = 0; d < 150; d++) {
    for (let v = 0; v < (d * 7) % 13; v++) usoMapa.push({ ocorridoEm: antesDe(d, v), tipo: 'view' });
    for (let w = 0; w < d % 4; w++) usoMapa.push({ ocorridoEm: antesDe(d, w + 1), tipo: 'whatsapp_click' });
  }

  return {
    eventos,
    primeiroPet,
    partners,
    usoMapa,
    assinaturasAtivas: [
      { planType: 'tutor_monthly', categoria: 'tutor' },
      { planType: 'tutor_monthly', categoria: 'tutor' },
      { planType: 'tutor_annual', categoria: 'tutor' },
      { planType: 'partner_pro', categoria: 'partner' },
    ],
    fila: montarFilaHoje({ premiumSemPainel: 1, pendentesComEmail: 12, whatsappPendentes: 40, feedbackRuim: 2 }),
  };
}

export function analiseDeExemplo(chave: PeriodoChave, agora: Date): Analise {
  const dados = dadosExemplo(agora);
  return montarAnalise(dados, montarPeriodo(chave, agora, maisAntigo(dados.eventos)));
}
```

- [ ] **Step 9: Rodar e ver passar**

Run: `npx vitest run lib/admin/analytics/`
Expected: PASS (todos os arquivos da pasta)

- [ ] **Step 10: Commit**

```bash
git add lib/admin/analytics/catalogo.ts lib/admin/analytics/montar.ts lib/admin/analytics/montar.test.ts lib/admin/analytics/exemplo.ts lib/admin/analytics/exemplo.test.ts
git commit -m "feat(admin): monta a análise de tutores e empresas a partir do diário

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Leitura do Supabase e rota `/api/admin/analytics`

**Files:**
- Create: `lib/admin/analytics/carregar.ts`
- Create: `app/api/admin/analytics/route.ts`
- Test: `lib/admin/analytics/carregar.test.ts`
- Test: `app/api/admin/analytics/route.test.ts`
- Delete: `app/api/admin/dashboard-stats/route.ts` (fica sem uso quando a página nova entra na Task 9; apagar aqui, junto com a rota nova, deixa a página antiga quebrada só entre os commits 6 e 9 do mesmo ramo)

**Interfaces:**
- Consumes: `montarAnalise`, `semEquipe`, `maisAntigo`, `DadosBrutos` (montar.ts); `montarPeriodo`, `PERIODO_PADRAO` (periodo.ts); `categoriaDoPlano` (catalogo.ts); `lerData` (tempo.ts); `analiseDeExemplo` (exemplo.ts); `contarWhatsappPendentes`, `montarFilaHoje` (lib/admin/filaHoje.ts); `STATUS_PREMIUM` (lib/assinatura.ts); `ADMIN_EMAILS`, `getSupabaseAdmin` (lib/supabase/admin.ts); `requireAdmin` (lib/authz.ts); `isOpenAccess` (lib/openAccess.ts).
- Produces: `class TabelaAusenteError extends Error`, `buscarEmLotes<T>(consulta: (de: number, ate: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>): Promise<T[]>`, `carregarAnalise(supabase: SupabaseClient, chave: PeriodoChave, agora?: Date, emailsEquipe?: string[]): Promise<Analise>`. Rota: `GET /api/admin/analytics?periodo=7d|30d|90d|tudo` → `200 Analise` | `400 { error }` | `401` | `503 { error }` | `500 { error }`.

- [ ] **Step 1: Escrever o teste de `buscarEmLotes`**

`lib/admin/analytics/carregar.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { buscarEmLotes } from './carregar';

describe('buscarEmLotes', () => {
  it('pede lotes de 1000 até vir um lote menor', async () => {
    const consulta = vi.fn(async (de: number) => ({
      data: Array.from({ length: de === 0 ? 1000 : 250 }, (_, i) => ({ n: de + i })),
      error: null,
    }));
    const linhas = await buscarEmLotes<{ n: number }>(consulta);
    expect(linhas).toHaveLength(1250);
    expect(consulta).toHaveBeenNthCalledWith(1, 0, 999);
    expect(consulta).toHaveBeenNthCalledWith(2, 1000, 1999);
  });

  it('repassa o erro do Supabase', async () => {
    const erro = { code: '42P01', message: 'relation does not exist' };
    await expect(buscarEmLotes(async () => ({ data: null, error: erro }))).rejects.toBe(erro);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run lib/admin/analytics/carregar.test.ts`
Expected: FAIL, "Failed to resolve import './carregar'"

- [ ] **Step 3: Implementar `carregar.ts`**

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { contarWhatsappPendentes, montarFilaHoje } from '@/lib/admin/filaHoje';
import { STATUS_PREMIUM } from '@/lib/assinatura';
import { ADMIN_EMAILS } from '@/lib/supabase/admin';
import { categoriaDoPlano } from './catalogo';
import { maisAntigo, montarAnalise, semEquipe, type DadosBrutos } from './montar';
import { montarPeriodo } from './periodo';
import { lerData } from './tempo';
import type { Analise, Evento, PeriodoChave, Publico, TipoEvento } from './tipos';

/** A migração 20261120_admin_eventos.sql ainda não foi rodada. */
export class TabelaAusenteError extends Error {
  constructor() {
    super('Tabela admin_eventos não existe');
    this.name = 'TabelaAusenteError';
  }
}

// O Supabase devolve no máximo 1000 linhas por consulta.
const LOTE = 1000;

export async function buscarEmLotes<T>(
  consulta: (de: number, ate: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>,
): Promise<T[]> {
  const linhas: T[] = [];
  for (let de = 0; ; de += LOTE) {
    const { data, error } = await consulta(de, de + LOTE - 1);
    if (error) throw error;
    const lote = (data ?? []) as T[];
    linhas.push(...lote);
    if (lote.length < LOTE) return linhas;
  }
}

function tabelaAusente(erro: unknown): boolean {
  const code = (erro as { code?: string } | null)?.code;
  return code === '42P01' || code === 'PGRST205';
}

interface EventoLinha {
  ocorrido_em: string;
  publico: Publico;
  tipo: TipoEvento;
  entidade_id: string;
  detalhe: Record<string, unknown> | null;
  estimado: boolean | null;
}

interface PartnerLinha {
  id: string;
  tipo: string;
  premium: boolean | null;
  user_id: string | null;
  email: string | null;
  status: string | null;
  telefone: string | null;
  whatsapp_contatado_em: string | null;
}

export async function carregarAnalise(
  supabase: SupabaseClient,
  chave: PeriodoChave,
  agora: Date = new Date(),
  emailsEquipe: string[] = ADMIN_EMAILS,
): Promise<Analise> {
  let linhasEventos: EventoLinha[];
  try {
    linhasEventos = await buscarEmLotes<EventoLinha>((de, ate) =>
      supabase
        .from('admin_eventos')
        .select('ocorrido_em, publico, tipo, entidade_id, detalhe, estimado')
        .order('id')
        .range(de, ate),
    );
  } catch (erro) {
    if (tabelaAusente(erro)) throw new TabelaAusenteError();
    throw erro;
  }

  const [equipeRes, partners] = await Promise.all([
    supabase.from('tutor').select('id').in('email', emailsEquipe),
    buscarEmLotes<PartnerLinha>((de, ate) =>
      supabase
        .from('partners')
        .select('id, tipo, premium, user_id, email, status, telefone, whatsapp_contatado_em')
        .order('id')
        .range(de, ate),
    ),
  ]);
  if (equipeRes.error) throw equipeRes.error;

  // Contas da equipe ficam fora dos gráficos: o tutor e a empresa ligada ao mesmo login.
  const idsTutorEquipe = new Set((equipeRes.data ?? []).map((t: { id: string }) => t.id));
  const idsEquipe = new Set(idsTutorEquipe);
  for (const p of partners) {
    if (p.user_id && idsTutorEquipe.has(p.user_id)) idsEquipe.add(p.id);
  }

  const eventos: Evento[] = semEquipe(
    linhasEventos.map((l) => ({
      ocorridoEm: lerData(l.ocorrido_em),
      publico: l.publico,
      tipo: l.tipo,
      entidadeId: l.entidade_id,
      detalhe: l.detalhe ?? {},
      estimado: !!l.estimado,
    })),
    idsEquipe,
  );

  const periodo = montarPeriodo(chave, agora, maisAntigo(eventos));

  const [pets, uso, assinaturasRes, feedbackRuimRes] = await Promise.all([
    buscarEmLotes<{ tutor_id: string; created_at: string | null }>((de, ate) =>
      supabase.from('pet').select('tutor_id, created_at').order('id').range(de, ate),
    ),
    buscarEmLotes<{ event_type: 'view' | 'whatsapp_click'; created_at: string }>((de, ate) =>
      supabase
        .from('partner_events')
        .select('event_type, created_at')
        .gte('created_at', periodo.atual.inicio.toISOString())
        .order('id')
        .range(de, ate),
    ),
    supabase
      .from('subscriptions')
      .select('plan_type, plan_category, user_id')
      .in('status', [...STATUS_PREMIUM]),
    supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('humor', 'ruim'),
  ]);
  if (assinaturasRes.error) throw assinaturasRes.error;

  const primeiroPet = new Map<string, Date>();
  for (const pet of pets) {
    if (!pet.created_at) continue;
    const quando = lerData(pet.created_at);
    const atual = primeiroPet.get(pet.tutor_id);
    if (!atual || quando < atual) primeiroPet.set(pet.tutor_id, quando);
  }

  const assinaturasAtivas = (
    (assinaturasRes.data ?? []) as Array<{ plan_type: string; plan_category: string | null; user_id: string }>
  )
    .filter((s) => !idsTutorEquipe.has(s.user_id))
    .map((s) => ({ planType: s.plan_type, categoria: categoriaDoPlano(s.plan_type, s.plan_category) }));

  const fila = montarFilaHoje({
    premiumSemPainel: partners.filter((p) => p.premium && !p.user_id).length,
    pendentesComEmail: partners.filter((p) => p.email && p.status !== 'sent').length,
    whatsappPendentes: contarWhatsappPendentes(partners),
    feedbackRuim: feedbackRuimRes.count ?? 0,
  });

  const dados: DadosBrutos = {
    eventos,
    primeiroPet,
    partners: partners.map((p) => ({ id: p.id, tipo: p.tipo, premium: !!p.premium })),
    usoMapa: uso.map((u) => ({ ocorridoEm: lerData(u.created_at), tipo: u.event_type })),
    assinaturasAtivas,
    fila,
  };

  return montarAnalise(dados, periodo);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run lib/admin/analytics/carregar.test.ts`
Expected: PASS (2 testes)

- [ ] **Step 5: Escrever o teste da rota**

`app/api/admin/analytics/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const { requireAdminMock, carregarMock, TabelaAusenteErrorMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  carregarMock: vi.fn(),
  TabelaAusenteErrorMock: class extends Error {},
}));

vi.mock('@/lib/authz', () => ({ requireAdmin: requireAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}), ADMIN_EMAILS: [] }));
vi.mock('@/lib/admin/analytics/carregar', () => ({
  carregarAnalise: carregarMock,
  TabelaAusenteError: TabelaAusenteErrorMock,
}));

const { GET } = await import('./route');

function pedir(query = '') {
  return GET(new NextRequest(`http://localhost/api/admin/analytics${query}`));
}

describe('GET /api/admin/analytics', () => {
  beforeEach(() => {
    requireAdminMock.mockReset();
    carregarMock.mockReset();
    delete process.env.ANALISE_EXEMPLO;
    requireAdminMock.mockResolvedValue({ ok: true, user: { email: 'equipe@example.com' } });
  });

  it('repassa o bloqueio de quem não é admin', async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await pedir('?periodo=30d');
    expect(res.status).toBe(401);
    expect(carregarMock).not.toHaveBeenCalled();
  });

  it('recusa período inválido', async () => {
    const res = await pedir('?periodo=1a');
    expect(res.status).toBe(400);
    expect(carregarMock).not.toHaveBeenCalled();
  });

  it('usa 30 dias quando não vem período', async () => {
    carregarMock.mockResolvedValue({ ok: 'analise' });
    const res = await pedir();
    expect(res.status).toBe(200);
    expect(carregarMock).toHaveBeenCalledWith({}, '30d');
    expect(await res.json()).toEqual({ ok: 'analise' });
  });

  it('avisa quando a migração não foi rodada', async () => {
    carregarMock.mockRejectedValue(new TabelaAusenteErrorMock());
    const res = await pedir('?periodo=7d');
    expect(res.status).toBe(503);
    expect((await res.json()).error).toContain('20261120_admin_eventos.sql');
  });

  it('erro qualquer vira 500', async () => {
    carregarMock.mockRejectedValue(new Error('boom'));
    const res = await pedir('?periodo=7d');
    expect(res.status).toBe(500);
  });

  it('modo exemplo desligado exige admin mesmo com ANALISE_EXEMPLO sem OPEN_ACCESS', async () => {
    process.env.ANALISE_EXEMPLO = '1';
    requireAdminMock.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await pedir('?periodo=7d');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `npx vitest run app/api/admin/analytics/route.test.ts`
Expected: FAIL, "Failed to resolve import './route'"

- [ ] **Step 7: Implementar a rota**

`app/api/admin/analytics/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/authz';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isOpenAccess } from '@/lib/openAccess';
import { carregarAnalise, TabelaAusenteError } from '@/lib/admin/analytics/carregar';
import { analiseDeExemplo } from '@/lib/admin/analytics/exemplo';
import { PERIODO_PADRAO } from '@/lib/admin/analytics/periodo';
import { PERIODOS } from '@/lib/admin/analytics/tipos';

export const dynamic = 'force-dynamic';

const PeriodoSchema = z.enum(PERIODOS);

export async function GET(req: NextRequest) {
  const periodo = PeriodoSchema.safeParse(req.nextUrl.searchParams.get('periodo') ?? PERIODO_PADRAO);
  if (!periodo.success) {
    return NextResponse.json({ error: 'Período inválido. Use 7d, 30d, 90d ou tudo.' }, { status: 400 });
  }

  // Só local: isOpenAccess() é sempre falso em produção na Vercel, e os dados são inventados.
  if (isOpenAccess() && process.env.ANALISE_EXEMPLO === '1') {
    return NextResponse.json(analiseDeExemplo(periodo.data, new Date()));
  }

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    return NextResponse.json(await carregarAnalise(getSupabaseAdmin(), periodo.data));
  } catch (erro) {
    if (erro instanceof TabelaAusenteError) {
      return NextResponse.json(
        { error: 'Rode a migração 20261120_admin_eventos.sql no Supabase.' },
        { status: 503 },
      );
    }
    console.error('admin analytics:', erro);
    return NextResponse.json({ error: 'Erro ao carregar a análise' }, { status: 500 });
  }
}
```

- [ ] **Step 8: Rodar e ver passar**

Run: `npx vitest run app/api/admin/analytics/route.test.ts lib/admin/analytics/`
Expected: PASS

- [ ] **Step 9: Remover a rota antiga e conferir que nada mais a usa**

```bash
git rm app/api/admin/dashboard-stats/route.ts
grep -rn "dashboard-stats" app components lib hooks
```
Expected: só `app/admin/page.tsx` aparece (a página é reescrita na Task 9).

- [ ] **Step 10: Checar tipos**

Run: `npx tsc --noEmit -p .`
Expected: sem erros. Se `buscarEmLotes` reclamar do tipo das consultas do Supabase, mude só o parâmetro para `(de: number, ate: number) => PromiseLike<{ data: unknown; error: unknown }>` e faça `(data ?? []) as T[]`. Não use `any`.

- [ ] **Step 11: Commit**

```bash
git add lib/admin/analytics/carregar.ts lib/admin/analytics/carregar.test.ts app/api/admin/analytics/route.ts app/api/admin/analytics/route.test.ts
git commit -m "feat(admin): rota /api/admin/analytics lendo o diário em lotes

Substitui /api/admin/dashboard-stats.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Peças básicas da tela

**Files:**
- Create: `components/admin/analytics/formato.ts`
- Create: `components/admin/analytics/CartaoNumero.tsx`
- Create: `components/admin/analytics/PeriodoFiltro.tsx`
- Create: `components/admin/analytics/FaixaFila.tsx`
- Create: `components/admin/analytics/SeletorAbas.tsx`
- Create: `components/admin/analytics/BlocoGrafico.tsx`
- Create: `components/admin/analytics/Legenda.tsx`
- Test: `components/admin/analytics/formato.test.ts`

**Interfaces:**
- Consumes: `PERIODOS`, `PeriodoChave`, `Granularidade`, `Variacao` (tipos.ts); `FilaItem` (filaHoje.ts).
- Produces:
  - `formato.ts`: `COR = { gratis, pago, proprio, eixo, grade }`, `MINIMO_DADOS = 5`, `ROTULO_PERIODO: Record<PeriodoChave, string>`, `ROTULO_GRANULARIDADE: Record<Granularidade, string>`, `reais(v: number): string`, `dataCurta(iso: string): string`, `soma(dados: ReadonlyArray<object>, chaves: string[]): number`.
  - `<CartaoNumero rotulo valor variacao? dica? />`, `<PeriodoFiltro valor aoMudar />`, `<FaixaFila itens />`, `<SeletorAbas valor aoMudar />` + `type AbaChave = 'tutores' | 'empresas'` + `ehAba(v: unknown): v is AbaChave`, `<BlocoGrafico titulo subtitulo? total children />`, `<Legenda itens: Array<{ nome: string; cor: string }> />`.

- [ ] **Step 1: Escrever o teste de `formato.ts`**

`components/admin/analytics/formato.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { dataCurta, reais, soma } from './formato';

describe('formato', () => {
  it('reais', () => {
    expect(reais(1234.5)).toBe('R$ 1.234,50');
    expect(reais(0)).toBe('R$ 0,00');
  });
  it('dataCurta no fuso de Brasília', () => {
    expect(dataCurta('2026-11-21T02:30:00.000Z')).toBe('20/11/2026');
  });
  it('soma várias séries', () => {
    expect(soma([{ a: 1, b: 2 }, { a: 3, b: 0 }], ['a', 'b'])).toBe(6);
    expect(soma([], ['a'])).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run components/admin/analytics/formato.test.ts`
Expected: FAIL, "Failed to resolve import './formato'"

- [ ] **Step 3: Implementar `formato.ts`**

```ts
import type { Granularidade, PeriodoChave } from '@/lib/admin/analytics/tipos';

export const COR = {
  gratis: '#94a3b8',
  pago: '#d97706',
  proprio: '#0284c7',
  eixo: '#94a3b8',
  grade: 'rgba(148, 163, 184, 0.25)',
} as const;

export const MINIMO_DADOS = 5;

export const ROTULO_PERIODO: Record<PeriodoChave, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  tudo: 'Tudo',
};

export const ROTULO_GRANULARIDADE: Record<Granularidade, string> = {
  dia: 'por dia',
  semana: 'por semana',
  mes: 'por mês',
};

export function reais(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function soma(dados: ReadonlyArray<object>, chaves: string[]): number {
  return dados.reduce<number>((total, ponto) => {
    const linha = ponto as Record<string, unknown>;
    return total + chaves.reduce((s, c) => s + (typeof linha[c] === 'number' ? (linha[c] as number) : 0), 0);
  }, 0);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run components/admin/analytics/formato.test.ts`
Expected: PASS (3 testes). Se `reais` falhar por causa de um espaço especial (` `) do Node, troque a expectativa pelo resultado de `'R$ ' + (1234.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })`. O código já monta `R$ ` com espaço comum.

- [ ] **Step 5: Criar os componentes**

`components/admin/analytics/CartaoNumero.tsx`:

```tsx
import type { Variacao } from '@/lib/admin/analytics/tipos';

function SeloVariacao({ variacao }: { variacao: NonNullable<Variacao> }) {
  if (variacao.tipo === 'novo') {
    return <span className="text-xs font-medium text-sky-700 dark:text-sky-400">novo</span>;
  }
  const { valor } = variacao;
  const cor =
    valor > 0
      ? 'text-emerald-700 dark:text-emerald-400'
      : valor < 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-400';
  const seta = valor > 0 ? '▲ ' : valor < 0 ? '▼ ' : '';
  return (
    <span className={`text-xs font-medium tabular-nums ${cor}`} title="Comparado ao período anterior">
      {seta}
      {Math.abs(valor)}%
    </span>
  );
}

export function CartaoNumero({
  rotulo,
  valor,
  variacao,
  dica,
}: {
  rotulo: string;
  valor: string | number;
  variacao?: Variacao;
  dica?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{rotulo}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">{valor}</p>
        {variacao && <SeloVariacao variacao={variacao} />}
      </div>
      {dica && <p className="mt-1 text-xs text-slate-400">{dica}</p>}
    </div>
  );
}
```

`components/admin/analytics/PeriodoFiltro.tsx`:

```tsx
import { PERIODOS, type PeriodoChave } from '@/lib/admin/analytics/tipos';
import { ROTULO_PERIODO } from './formato';

export function PeriodoFiltro({ valor, aoMudar }: { valor: PeriodoChave; aoMudar: (p: PeriodoChave) => void }) {
  return (
    <div
      role="group"
      aria-label="Período"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900"
    >
      {PERIODOS.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={p === valor}
          onClick={() => aoMudar(p)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 ${
            p === valor
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {ROTULO_PERIODO[p]}
        </button>
      ))}
    </div>
  );
}
```

`components/admin/analytics/FaixaFila.tsx`:

```tsx
import Link from 'next/link';
import type { FilaItem } from '@/lib/admin/filaHoje';

export function FaixaFila({ itens }: { itens: FilaItem[] }) {
  if (itens.length === 0) return null;
  const atencao = itens.some((i) => i.atencao);
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-4 py-2.5 text-sm ${
        atencao
          ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <span className="font-semibold text-slate-900 dark:text-white">Fila de hoje</span>
      {itens.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          title={item.detalhe}
          className="text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
        >
          {item.titulo}
        </Link>
      ))}
    </div>
  );
}
```

`components/admin/analytics/SeletorAbas.tsx`:

```tsx
export type AbaChave = 'tutores' | 'empresas';

const ABAS: Array<{ chave: AbaChave; nome: string }> = [
  { chave: 'tutores', nome: 'Tutores' },
  { chave: 'empresas', nome: 'Empresas' },
];

export function ehAba(v: unknown): v is AbaChave {
  return v === 'tutores' || v === 'empresas';
}

export function SeletorAbas({ valor, aoMudar }: { valor: AbaChave; aoMudar: (a: AbaChave) => void }) {
  return (
    <div role="tablist" aria-label="Público" className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
      {ABAS.map((aba) => (
        <button
          key={aba.chave}
          type="button"
          role="tab"
          aria-selected={aba.chave === valor}
          onClick={() => aoMudar(aba.chave)}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
            aba.chave === valor
              ? 'border-amber-600 text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {aba.nome}
        </button>
      ))}
    </div>
  );
}
```

`components/admin/analytics/Legenda.tsx`:

```tsx
export function Legenda({ itens }: { itens: Array<{ nome: string; cor: string }> }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      {itens.map((item) => (
        <li key={item.nome} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.cor }} aria-hidden />
          {item.nome}
        </li>
      ))}
    </ul>
  );
}
```

`components/admin/analytics/BlocoGrafico.tsx`:

```tsx
import type { ReactNode } from 'react';
import { MINIMO_DADOS } from './formato';

export function BlocoGrafico({
  titulo,
  subtitulo,
  total,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  total: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{titulo}</h2>
      {subtitulo && <p className="mt-0.5 text-xs text-slate-400">{subtitulo}</p>}
      {total < MINIMO_DADOS ? (
        <p className="mt-6 pb-2 text-sm text-slate-500 dark:text-slate-400">Poucos dados no período ({total}).</p>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </section>
  );
}
```

- [ ] **Step 6: Checar tipos e lint**

Run: `npx tsc --noEmit -p . && npx next lint --dir components/admin`
Expected: sem erros

- [ ] **Step 7: Commit**

```bash
git add components/admin/analytics/
git commit -m "feat(admin): peças básicas da Visão geral (cartões, filtro, fila, abas)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Gráficos

**Files:**
- Create: `components/admin/analytics/GraficoSeries.tsx`
- Create: `components/admin/analytics/Funil.tsx`
- Create: `components/admin/analytics/RankingBarras.tsx`

**Interfaces:**
- Consumes: `COR` (formato.ts), `Legenda` (Legenda.tsx), `EtapaFunil` (tipos.ts).
- Produces: `interface Serie { chave: string; nome: string; cor: string }`; `<GraficoSeries tipo: 'barras' | 'linhas' dados: ReadonlyArray<object> series: Serie[] empilhado?: boolean />` (o eixo X lê `rotulo`); `<Funil etapas: EtapaFunil[] grupos?: Serie[] />`; `<RankingBarras itens: Array<{ rotulo: string; total: number; destaque: number }> nomeTotal: string nomeDestaque: string />`.

Sem testes automáticos (o Vitest roda em `node`, sem DOM). A conferência visual fica na Task 9.

- [ ] **Step 1: Criar `GraficoSeries.tsx`**

```tsx
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COR } from './formato';
import { Legenda } from './Legenda';

export interface Serie {
  chave: string;
  nome: string;
  cor: string;
}

const eixo = { fontSize: 11, fill: COR.eixo };
// Dica escura nos dois temas: lê bem no claro e no escuro.
const dica = {
  contentStyle: { backgroundColor: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: '#f8fafc' },
  labelStyle: { color: '#f8fafc', marginBottom: 4 },
  cursor: { fill: 'rgba(148, 163, 184, 0.12)' },
};

export function GraficoSeries({
  tipo,
  dados,
  series,
  empilhado = false,
}: {
  tipo: 'barras' | 'linhas';
  dados: ReadonlyArray<object>;
  series: Serie[];
  empilhado?: boolean;
}) {
  const data = dados as object[];
  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {tipo === 'barras' ? (
            <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COR.grade} />
              <XAxis dataKey="rotulo" tick={eixo} axisLine={false} tickLine={false} minTickGap={12} />
              <YAxis allowDecimals={false} tick={eixo} axisLine={false} tickLine={false} />
              <Tooltip {...dica} />
              {series.map((s, i) => (
                <Bar
                  key={s.chave}
                  dataKey={s.chave}
                  name={s.nome}
                  fill={s.cor}
                  stackId={empilhado ? 'total' : undefined}
                  radius={empilhado && i < series.length - 1 ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COR.grade} />
              <XAxis dataKey="rotulo" tick={eixo} axisLine={false} tickLine={false} minTickGap={12} />
              <YAxis allowDecimals={false} tick={eixo} axisLine={false} tickLine={false} />
              <Tooltip {...dica} cursor={{ stroke: COR.eixo, strokeDasharray: '3 3' }} />
              {series.map((s) => (
                <Line
                  key={s.chave}
                  type="monotone"
                  dataKey={s.chave}
                  name={s.nome}
                  stroke={s.cor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <Legenda itens={series} />
    </div>
  );
}
```

- [ ] **Step 2: Criar `Funil.tsx`**

```tsx
import type { EtapaFunil } from '@/lib/admin/analytics/tipos';
import { COR } from './formato';
import { Legenda } from './Legenda';
import type { Serie } from './GraficoSeries';

export function Funil({ etapas, grupos }: { etapas: EtapaFunil[]; grupos?: Serie[] }) {
  const topo = etapas[0]?.total ?? 0;
  return (
    <div>
      <ol className="space-y-3">
        {etapas.map((etapa, i) => {
          const largura = etapa.total > 0 && topo > 0 ? Math.max(2, (etapa.total / topo) * 100) : 0;
          return (
            <li key={etapa.nome}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-slate-700 dark:text-slate-200">{etapa.nome}</span>
                <span className="shrink-0 tabular-nums">
                  <strong className="font-semibold text-slate-900 dark:text-white">{etapa.total}</strong>
                  {i > 0 && etapa.pctDoAnterior !== null && (
                    <span className="ml-2 text-xs text-slate-400">{etapa.pctDoAnterior}% da etapa anterior</span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="flex h-3 overflow-hidden rounded-full" style={{ width: `${largura}%` }}>
                  {grupos ? (
                    grupos.map((g) => {
                      const n = etapa.porGrupo[g.chave] ?? 0;
                      if (n === 0) return null;
                      return (
                        <div
                          key={g.chave}
                          title={`${g.nome}: ${n}`}
                          style={{ width: `${(n / etapa.total) * 100}%`, backgroundColor: g.cor }}
                        />
                      );
                    })
                  ) : (
                    <div className="w-full" style={{ backgroundColor: COR.pago }} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {grupos && <Legenda itens={grupos} />}
    </div>
  );
}
```

- [ ] **Step 3: Criar `RankingBarras.tsx`**

```tsx
import { COR } from './formato';
import { Legenda } from './Legenda';

export function RankingBarras({
  itens,
  nomeTotal,
  nomeDestaque,
}: {
  itens: Array<{ rotulo: string; total: number; destaque: number }>;
  nomeTotal: string;
  nomeDestaque: string;
}) {
  const maior = Math.max(1, ...itens.map((i) => i.total));
  return (
    <div>
      <ul className="space-y-2.5">
        {itens.map((item) => (
          <li key={item.rotulo}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-slate-700 dark:text-slate-200">{item.rotulo}</span>
              <span className="shrink-0 tabular-nums text-slate-900 dark:text-white">
                {item.total}
                <span className="ml-1.5 text-xs text-amber-700 dark:text-amber-400">
                  · {item.destaque} {nomeDestaque.toLowerCase()}
                </span>
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="relative h-2 overflow-hidden rounded-full"
                style={{ width: `${(item.total / maior) * 100}%`, backgroundColor: COR.gratis }}
              >
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: item.total > 0 ? `${(item.destaque / item.total) * 100}%` : '0%',
                    backgroundColor: COR.pago,
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Legenda
        itens={[
          { nome: nomeTotal, cor: COR.gratis },
          { nome: nomeDestaque, cor: COR.pago },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 4: Checar tipos e lint**

Run: `npx tsc --noEmit -p . && npx next lint --dir components/admin`
Expected: sem erros

- [ ] **Step 5: Commit**

```bash
git add components/admin/analytics/GraficoSeries.tsx components/admin/analytics/Funil.tsx components/admin/analytics/RankingBarras.tsx
git commit -m "feat(admin): gráficos de séries, funil e ranking

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Abas e a página nova

**Files:**
- Create: `components/admin/analytics/AbaTutores.tsx`
- Create: `components/admin/analytics/AbaEmpresas.tsx`
- Modify (reescrever inteiro): `app/admin/page.tsx`

**Interfaces:**
- Consumes: tudo das Tasks 7 e 8; `Analise`, `AnaliseTutores`, `AnaliseEmpresas`, `Granularidade`, `PeriodoChave` (tipos.ts); `ehPeriodo`, `PERIODO_PADRAO` (periodo.ts).
- Produces: `<AbaTutores dados granularidade />`, `<AbaEmpresas dados granularidade />`, página `/admin?aba=tutores|empresas&periodo=7d|30d|90d|tudo`.

- [ ] **Step 1: Criar `AbaTutores.tsx`**

```tsx
import type { AnaliseTutores, Granularidade } from '@/lib/admin/analytics/tipos';
import { BlocoGrafico } from './BlocoGrafico';
import { CartaoNumero } from './CartaoNumero';
import { COR, reais, ROTULO_GRANULARIDADE, soma } from './formato';
import { Funil } from './Funil';
import { GraficoSeries } from './GraficoSeries';
import { RankingBarras } from './RankingBarras';

export function AbaTutores({ dados, granularidade }: { dados: AnaliseTutores; granularidade: Granularidade }) {
  const { numeros } = dados;
  const baseFinal = dados.crescimento[dados.crescimento.length - 1]?.cadastros ?? 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CartaoNumero rotulo="Novos cadastros" valor={numeros.novos.valor} variacao={numeros.novos.variacao} />
        <CartaoNumero rotulo="Viraram pagos" valor={numeros.pagos.valor} variacao={numeros.pagos.variacao} />
        <CartaoNumero
          rotulo="Conversão da turma"
          valor={numeros.conversaoPct === null ? '—' : `${numeros.conversaoPct.toLocaleString('pt-BR')}%`}
          dica="Dos que entraram no período, quantos já pagam"
        />
        <CartaoNumero
          rotulo="Receita mensal"
          valor={reais(numeros.receitaMensal)}
          dica={
            numeros.cancelamentos > 0
              ? `−${numeros.cancelamentos} ${numeros.cancelamentos === 1 ? 'cancelamento' : 'cancelamentos'} no período`
              : 'Assinaturas ativas hoje'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BlocoGrafico
          titulo="Entradas"
          subtitulo={`Cadastros e novos pagantes, ${ROTULO_GRANULARIDADE[granularidade]}`}
          total={soma(dados.entradas, ['cadastros', 'pagos'])}
        >
          <GraficoSeries
            tipo="barras"
            dados={dados.entradas}
            series={[
              { chave: 'cadastros', nome: 'Cadastros', cor: COR.gratis },
              { chave: 'pagos', nome: 'Viraram pagos', cor: COR.pago },
            ]}
          />
        </BlocoGrafico>

        <BlocoGrafico titulo="Crescimento" subtitulo="Base total ao fim de cada intervalo" total={baseFinal}>
          <GraficoSeries
            tipo="linhas"
            dados={dados.crescimento}
            series={[
              { chave: 'cadastros', nome: 'Cadastrados', cor: COR.gratis },
              { chave: 'pagos', nome: 'Pagantes', cor: COR.pago },
            ]}
          />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Funil da turma"
          subtitulo="Só quem se cadastrou no período, e até onde chegou"
          total={dados.funil[0]?.total ?? 0}
        >
          <Funil etapas={dados.funil} />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Origem"
          subtitulo="De onde veio quem se cadastrou no período"
          total={soma(dados.origem, ['cadastros'])}
        >
          <RankingBarras
            itens={dados.origem.map((o) => ({ rotulo: o.origem, total: o.cadastros, destaque: o.pagos }))}
            nomeTotal="Cadastros"
            nomeDestaque="Pagos"
          />
        </BlocoGrafico>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `AbaEmpresas.tsx`**

```tsx
import type { AnaliseEmpresas, Granularidade } from '@/lib/admin/analytics/tipos';
import { BlocoGrafico } from './BlocoGrafico';
import { CartaoNumero } from './CartaoNumero';
import { COR, reais, ROTULO_GRANULARIDADE, soma } from './formato';
import { Funil } from './Funil';
import { GraficoSeries, type Serie } from './GraficoSeries';
import { RankingBarras } from './RankingBarras';

const ORIGENS: Serie[] = [
  { chave: 'importadas', nome: 'Importadas pela equipe', cor: COR.gratis },
  { chave: 'cadastroProprio', nome: 'Cadastro próprio', cor: COR.proprio },
];

export function AbaEmpresas({ dados, granularidade }: { dados: AnaliseEmpresas; granularidade: Granularidade }) {
  const { numeros } = dados;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CartaoNumero
          rotulo="Entraram no mapa"
          valor={numeros.entraram.valor}
          variacao={numeros.entraram.variacao}
          dica={`${numeros.importadas} importadas · ${numeros.cadastroProprio} cadastro próprio`}
        />
        <CartaoNumero rotulo="Convidadas" valor={numeros.convidadas.valor} variacao={numeros.convidadas.variacao} />
        <CartaoNumero rotulo="Ativaram o painel" valor={numeros.ativaram.valor} variacao={numeros.ativaram.variacao} />
        <CartaoNumero
          rotulo="Viraram pagas"
          valor={numeros.pagas.valor}
          variacao={numeros.pagas.variacao}
          dica={`Receita mensal ${reais(numeros.receitaMensal)}${
            numeros.cancelamentos > 0 ? ` · −${numeros.cancelamentos} no período` : ''
          }`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BlocoGrafico
          titulo="Entradas no mapa"
          subtitulo={`Importadas vs cadastro próprio, ${ROTULO_GRANULARIDADE[granularidade]}`}
          total={soma(dados.entradas, ['importadas', 'cadastroProprio'])}
        >
          <GraficoSeries tipo="barras" empilhado dados={dados.entradas} series={ORIGENS} />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Funil da turma"
          subtitulo="Só quem entrou no mapa no período, e até onde chegou"
          total={dados.funil[0]?.total ?? 0}
        >
          <Funil etapas={dados.funil} grupos={ORIGENS} />
        </BlocoGrafico>

        <BlocoGrafico titulo="Por tipo" subtitulo="Todas no mapa hoje" total={soma(dados.porTipo, ['total'])}>
          <RankingBarras
            itens={dados.porTipo.map((t) => ({ rotulo: t.rotulo, total: t.total, destaque: t.pagas }))}
            nomeTotal="No mapa"
            nomeDestaque="Pagas"
          />
        </BlocoGrafico>

        <BlocoGrafico
          titulo="Uso do mapa"
          subtitulo={`Visualizações e cliques no WhatsApp, ${ROTULO_GRANULARIDADE[granularidade]}`}
          total={soma(dados.usoMapa, ['visualizacoes', 'whatsapp'])}
        >
          <GraficoSeries
            tipo="linhas"
            dados={dados.usoMapa}
            series={[
              { chave: 'visualizacoes', nome: 'Visualizações', cor: COR.gratis },
              { chave: 'whatsapp', nome: 'Cliques no WhatsApp', cor: COR.pago },
            ]}
          />
        </BlocoGrafico>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Reescrever `app/admin/page.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ehPeriodo, PERIODO_PADRAO } from '@/lib/admin/analytics/periodo';
import type { Analise, PeriodoChave } from '@/lib/admin/analytics/tipos';
import { AbaEmpresas } from '@/components/admin/analytics/AbaEmpresas';
import { AbaTutores } from '@/components/admin/analytics/AbaTutores';
import { FaixaFila } from '@/components/admin/analytics/FaixaFila';
import { PeriodoFiltro } from '@/components/admin/analytics/PeriodoFiltro';
import { ehAba, SeletorAbas, type AbaChave } from '@/components/admin/analytics/SeletorAbas';
import { dataCurta } from '@/components/admin/analytics/formato';

export default function AdminVisaoGeralPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const periodoBruto = params.get('periodo');
  const periodo: PeriodoChave = ehPeriodo(periodoBruto) ? periodoBruto : PERIODO_PADRAO;
  const abaBruta = params.get('aba');
  const aba: AbaChave = ehAba(abaBruta) ? abaBruta : 'tutores';

  const [analise, setAnalise] = useState<Analise | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    fetch(`/api/admin/analytics?periodo=${periodo}`)
      .then(async (res) => {
        const corpo = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(corpo.error || 'Erro ao carregar a análise');
        return corpo as Analise;
      })
      .then((dados) => {
        if (ativo) setAnalise(dados);
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [periodo]);

  const mudar = useCallback(
    (campo: 'aba' | 'periodo', valor: string) => {
      const novos = new URLSearchParams(params.toString());
      novos.set(campo, valor);
      router.push(`${pathname}?${novos.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="space-y-5 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Visão geral</h1>
          <p className="mt-1 text-sm text-slate-500">Entrada e conversão de tutores e empresas. Contas da equipe ficam de fora.</p>
        </div>
        <PeriodoFiltro valor={periodo} aoMudar={(p) => mudar('periodo', p)} />
      </div>

      {analise && <FaixaFila itens={analise.fila} />}

      <SeletorAbas valor={aba} aoMudar={(a) => mudar('aba', a)} />

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{erro}</p>
          <p className="mt-1 text-xs text-slate-500">Confira o login de equipe e o banco.</p>
        </div>
      ) : !analise ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className={`transition-opacity ${carregando ? 'opacity-60' : ''}`} aria-busy={carregando}>
          {aba === 'tutores' ? (
            <AbaTutores dados={analise.tutores} granularidade={analise.periodo.granularidade} />
          ) : (
            <AbaEmpresas dados={analise.empresas} granularidade={analise.periodo.granularidade} />
          )}
          {analise.temEstimado && analise.estimadoAte && (
            <p className="mt-4 text-xs text-slate-400">
              * inclui datas aproximadas de antes de {dataCurta(analise.estimadoAte)}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Testes, tipos, lint e build**

Run: `npm test && npx tsc --noEmit -p . && npm run lint && npm run build`
Expected: tudo passa. `grep -rn "dashboard-stats" app components lib hooks` não acha nada.

- [ ] **Step 5: Conferência visual local com dados de exemplo**

```bash
OPEN_ACCESS=true ANALISE_EXEMPLO=1 npm run start -- -p 3100
```

Abra `http://localhost:3100/admin` e confira:
- [ ] aba Tutores e aba Empresas, nos períodos 7 dias, 30 dias, 90 dias e Tudo;
- [ ] trocar a aba ou o período muda o endereço, e o "voltar" do navegador desfaz;
- [ ] `?periodo=xyz` cai em 30 dias, e `?aba=xyz` cai em Tutores;
- [ ] tema claro e escuro (botão do menu lateral);
- [ ] largura de 360px: números em 2 colunas, sem rolagem horizontal;
- [ ] a Faixa da Fila aparece e os links abrem `/admin/parceiros` e `/admin/feedback?humor=ruim`;
- [ ] a nota "* inclui datas aproximadas…" aparece em 90 dias e em Tudo.

Pare o servidor depois.

- [ ] **Step 6: Commit**

```bash
git add components/admin/analytics/AbaTutores.tsx components/admin/analytics/AbaEmpresas.tsx app/admin/page.tsx
git commit -m "feat(admin): Visão geral com abas Tutores e Empresas, gráficos e funis

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Entrega

**Files:** nenhum arquivo novo.

- [ ] **Step 1: Suíte inteira e build limpos**

Run: `npm test && npm run build`
Expected: PASS e build concluído

- [ ] **Step 2: Conferir a spec item por item**

Abra `docs/superpowers/specs/2026-11-20-admin-analise-design.md`, seção "Critérios de pronto". Os itens que dependem do Supabase de produção (migração, cadastro real, webhook real, falha forçada) ficam para o usuário, com o roteiro `2026-11-20-admin-analise-verificacao.sql`.

- [ ] **Step 3: Seguir para a skill `finishing-a-development-branch`**

Ela decide com o usuário: abrir o PR, juntar, ou manter o ramo. O texto do PR precisa dizer, em linguagem simples:
1. rode `supabase/migrations/20261120_admin_eventos.sql` no SQL editor **depois** do merge;
2. confira com `docs/superpowers/specs/2026-11-20-admin-analise-verificacao.sql`;
3. até a migração rodar, a Visão geral mostra "Rode a migração 20261120_admin_eventos.sql no Supabase.".
