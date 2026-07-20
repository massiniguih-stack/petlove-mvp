-- A constraint UNIQUE(user_id) (20260718) resolveu um bug (upsert falhando
-- sem constraint nenhuma), mas criou outro: a mesma pessoa não pode ter uma
-- assinatura de tutor E uma de parceiro ao mesmo tempo — a segunda sempre
-- sobrescreve a primeira na mesma linha. Troca pra UNIQUE(user_id, plan_category),
-- permitindo até 1 assinatura ativa de cada categoria por conta.

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_category text;

UPDATE public.subscriptions
SET plan_category = CASE WHEN plan_type LIKE 'partner_%' THEN 'partner' ELSE 'tutor' END
WHERE plan_category IS NULL;

ALTER TABLE public.subscriptions ALTER COLUMN plan_category SET NOT NULL;

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_category_key UNIQUE (user_id, plan_category);
