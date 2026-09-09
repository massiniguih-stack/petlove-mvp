-- Parceiro virou 100% anual em 2026-09 (ver app/parceiros/premium). Os 3
-- produtos de parceiro no LastLink foram recriados/renomeados com o preço
-- anual novo; product_id (a coluna "LastLink product UUID") e price
-- precisam apontar pros produtos novos, senão o webhook
-- (app/api/lastlink/webhook/route.ts → getPlanTypeFromProductId) não
-- reconhece o pagamento e o selo Premium não ativa sozinho.
--
-- product_id confirmado direto no LastLink (communityId usado nas chamadas
-- internas do painel, o mesmo UUID que aparece na URL de
-- Configurações > Integrações de cada produto):
--   PARCEIRO BASICO      -> a93152f6-29fd-435e-9923-a19c6d963778
--   PARCEIRO PRO          -> 2d894490-2ba0-4feb-bb4e-92f0e460406a
--   PARCEIRO EMPRESARIAL -> a2918284-40a4-41bd-8bc0-23fc79e7be0e
-- price é o valor à vista anual (o mesmo mostrado em /parceiros/premium).

UPDATE public.lastlink_products
SET product_id = 'a93152f6-29fd-435e-9923-a19c6d963778', price = 239.80
WHERE plan_type = 'partner_basic';

UPDATE public.lastlink_products
SET product_id = '2d894490-2ba0-4feb-bb4e-92f0e460406a', price = 596.90
WHERE plan_type = 'partner_pro';

UPDATE public.lastlink_products
SET product_id = 'a2918284-40a4-41bd-8bc0-23fc79e7be0e', price = 826.80
WHERE plan_type = 'partner_enterprise';
