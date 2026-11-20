-- Notificações em TODOS os aparelhos da pessoa (celular, computador...).
--
-- Antes: push_subscriptions tinha um registro por pessoa (chave = user_id),
-- então só o ÚLTIMO aparelho que ativou recebia. Quem ativava no computador
-- depois deixava de receber no celular.
-- Agora: um registro por aparelho (chave = token).
--
-- Rodar inteiro no SQL Editor do Supabase ANTES do deploy. Pode rodar de novo.

-- Se o mesmo aparelho aparecer repetido (duas contas no mesmo navegador),
-- fica só o registro mais recente.
DELETE FROM public.push_subscriptions a
USING public.push_subscriptions b
WHERE a.token = b.token
  AND (a.created_at, a.user_id) < (b.created_at, b.user_id);

DO $$
BEGIN
  -- Troca a chave de user_id para token (só se ainda estiver no formato antigo).
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.push_subscriptions'::regclass
      AND contype = 'p'
      AND pg_get_constraintdef(oid) = 'PRIMARY KEY (user_id)'
  ) THEN
    ALTER TABLE public.push_subscriptions DROP CONSTRAINT push_subscriptions_pkey;
    ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (token);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);
