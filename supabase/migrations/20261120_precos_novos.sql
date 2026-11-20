-- Preços de 20/11/2026 (tutor e parceiro).
-- O webhook da LastLink usa `price` só para desempatar quando o mesmo
-- produto tem mais de uma oferta (ex.: mensal e anual no mesmo produto).
-- Rodar no Supabase → SQL Editor depois de mudar os valores no LastLink.
UPDATE public.lastlink_products SET price = 17.90  WHERE plan_type = 'tutor_monthly';
UPDATE public.lastlink_products SET price = 118.80 WHERE plan_type = 'tutor_annual';
UPDATE public.lastlink_products SET price = 250.80 WHERE plan_type = 'partner_basic';
UPDATE public.lastlink_products SET price = 358.80 WHERE plan_type = 'partner_pro';
UPDATE public.lastlink_products SET price = 478.80 WHERE plan_type = 'partner_enterprise';
