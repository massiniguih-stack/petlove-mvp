-- Lembretes da rotina: o sino nos compromissos de Atividades e Ração.
--
-- 1) lembrete_rotina: um sino ligado = uma linha. Vale para TODOS os dias
--    (é a rotina), até o tutor desligar. ultimo_envio_dia evita avisar duas
--    vezes no mesmo dia.
-- 2) app_segredo: token aleatório que só o servidor (service role) lê. O
--    despertador abaixo manda ele para provar que a chamada é legítima.
-- 3) Despertador: pg_cron chama /api/cron/lembretes a cada 5 minutos (o
--    Vercel Cron do plano grátis só roda 1x por dia).
--
-- Rodar inteiro no SQL Editor do Supabase. Pode rodar de novo sem problema.

-- 1) Lembretes -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lembrete_rotina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pet(id) ON DELETE CASCADE,
  lista text NOT NULL CHECK (lista IN ('atividade', 'refeicao')),
  nome text NOT NULL,
  hora text NOT NULL CHECK (hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  detalhe text,
  ultimo_envio_dia date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pet_id, lista, nome, hora)
);

ALTER TABLE public.lembrete_rotina ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lembrete_rotina_select_own" ON public.lembrete_rotina;
CREATE POLICY "lembrete_rotina_select_own" ON public.lembrete_rotina FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = lembrete_rotina.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "lembrete_rotina_insert_own" ON public.lembrete_rotina;
CREATE POLICY "lembrete_rotina_insert_own" ON public.lembrete_rotina FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = lembrete_rotina.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "lembrete_rotina_update_own" ON public.lembrete_rotina;
CREATE POLICY "lembrete_rotina_update_own" ON public.lembrete_rotina FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = lembrete_rotina.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "lembrete_rotina_delete_own" ON public.lembrete_rotina;
CREATE POLICY "lembrete_rotina_delete_own" ON public.lembrete_rotina FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = lembrete_rotina.pet_id AND pet.tutor_id = auth.uid())
);

-- 2) Segredo do despertador -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_segredo (
  nome text PRIMARY KEY,
  valor text NOT NULL
);
-- RLS ligado e nenhuma policy: anon/authenticated não leem nada.
ALTER TABLE public.app_segredo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_segredo FROM anon, authenticated;

INSERT INTO public.app_segredo (nome, valor)
VALUES ('cron_lembretes', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
ON CONFLICT (nome) DO NOTHING;

-- 3) Despertador a cada 5 minutos -----------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('patinha-lembretes-rotina')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'patinha-lembretes-rotina');

SELECT cron.schedule(
  'patinha-lembretes-rotina',
  '*/5 * * * *',
  $job$
    SELECT net.http_post(
      url := 'https://patinha-mvp.vercel.app/api/cron/lembretes',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT valor FROM public.app_segredo WHERE nome = 'cron_lembretes')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 30000
    );
  $job$
);
