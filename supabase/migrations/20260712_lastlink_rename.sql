-- Rename stripe_customers -> payment_customers
ALTER TABLE IF EXISTS public.stripe_customers RENAME TO payment_customers;
ALTER TABLE IF EXISTS public.payment_customers RENAME COLUMN stripe_customer_id TO provider_customer_id;
ALTER INDEX IF EXISTS idx_stripe_customers_user_id RENAME TO idx_payment_customers_user_id;
ALTER INDEX IF EXISTS idx_stripe_customers_stripe_id RENAME TO idx_payment_customers_provider_id;

-- Rename subscriptions columns
ALTER TABLE IF EXISTS public.subscriptions RENAME COLUMN stripe_subscription_id TO provider_subscription_id;
ALTER TABLE IF EXISTS public.subscriptions RENAME COLUMN stripe_price_id TO provider_price_id;
ALTER INDEX IF EXISTS idx_subscriptions_stripe_id RENAME TO idx_subscriptions_provider_id;

-- Create lastlink_products mapping table
CREATE TABLE public.lastlink_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,  -- LastLink product UUID
  plan_type TEXT NOT NULL UNIQUE,   -- tutor_monthly, partner_basic, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default product mappings (user will fill in actual IDs)
INSERT INTO public.lastlink_products (product_id, plan_type) VALUES
  ('TODO_TUTOR_MONTHLY', 'tutor_monthly'),
  ('TODO_TUTOR_ANNUAL', 'tutor_annual'),
  ('TODO_PARTNER_BASIC', 'partner_basic'),
  ('TODO_PARTNER_PRO', 'partner_pro'),
  ('TODO_PARTNER_ENTERPRISE', 'partner_enterprise')
ON CONFLICT (plan_type) DO NOTHING;

-- RLS for lastlink_products (read-only for authenticated users)
ALTER TABLE public.lastlink_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view products"
  ON public.lastlink_products FOR SELECT
  USING (auth.role() = 'authenticated');
