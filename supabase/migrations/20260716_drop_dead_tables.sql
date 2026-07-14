-- Remove unused tables: never referenced by any application code, no FK dependents.
DROP TABLE IF EXISTS public.peso_historico;
DROP TABLE IF EXISTS public.vacina;
DROP TABLE IF EXISTS public.servico;
DROP TABLE IF EXISTS public.recomendacao_racao;
DROP TABLE IF EXISTS public.payment_customers;
