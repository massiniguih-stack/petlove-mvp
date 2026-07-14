-- LastLink can have monthly and annual offers under the same product_id
-- (confirmed for tutor_monthly/tutor_annual). product_id can no longer be
-- unique on its own; disambiguate same-product_id rows by price.
ALTER TABLE public.lastlink_products DROP CONSTRAINT IF EXISTS lastlink_products_product_id_key;
ALTER TABLE public.lastlink_products ADD COLUMN IF NOT EXISTS price NUMERIC;

UPDATE public.lastlink_products SET price = 19.90 WHERE plan_type = 'tutor_monthly';
UPDATE public.lastlink_products SET price = 115.00 WHERE plan_type = 'tutor_annual';
