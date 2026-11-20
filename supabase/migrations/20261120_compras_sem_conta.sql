-- Compras confirmadas pela LastLink cujo e-mail ainda não tem conta no app.
-- Antes o webhook respondia "ok" e descartava: a pessoa pagava e ficava grátis.
-- Agora a compra fica guardada aqui e vira assinatura quando alguém entra no
-- app com esse e-mail (ver lib/compraSemConta.ts e /api/subscription).
--
-- Só o servidor (service role) lê e escreve: RLS ligado e nenhuma política,
-- então anon e authenticated não enxergam nada (a tabela tem e-mails).
CREATE TABLE IF NOT EXISTS public.compras_sem_conta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = lower(btrim(email))),
  plan_type text NOT NULL,
  plan_category text NOT NULL CHECK (plan_category IN ('tutor', 'partner')),
  status text NOT NULL,
  provider_subscription_id text NOT NULL,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  ultimo_evento text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, plan_category)
);

ALTER TABLE public.compras_sem_conta ENABLE ROW LEVEL SECURITY;
