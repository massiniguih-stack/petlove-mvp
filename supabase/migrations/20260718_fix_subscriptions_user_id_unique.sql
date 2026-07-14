-- The LastLink webhook upserts into subscriptions with onConflict: 'user_id',
-- but no unique constraint existed on user_id (only on provider_subscription_id),
-- so every upsert silently failed with 42P10 and no subscription was ever written.
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
