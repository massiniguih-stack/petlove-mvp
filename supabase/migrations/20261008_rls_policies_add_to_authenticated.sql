-- Auditoria de segurança (2026-10-08): 26 policies de RLS foram criadas
-- sem cláusula `TO`, o que no Postgres/Supabase vale para QUALQUER role,
-- incluindo `anon`. Nenhuma delas é explorável hoje — todas usam
-- `auth.uid() = dono` (anon nunca tem auth.uid(), então a comparação
-- sempre falha), mas a falta do `TO` deixa a policy sendo avaliada à toa
-- em toda requisição anônima e foge do padrão documentado no projeto
-- (ver CLAUDE.md: "RLS policies must include TO <role>"). ALTER POLICY
-- só troca os roles — USING/WITH CHECK ficam exatamente como estavam.
--
-- Conferido direto no banco antes de aplicar (2026-10-08): das 26
-- policies originais, 6 pertencem a tabelas que não existem mais em
-- produção — ficaram pra trás quando o schema evoluiu sem uma migração
-- registrando o DROP:
--   - `stripe_customers`/`payment_customers` (20260709) — trocado por
--     LastLink, nunca recriado.
--   - `vacina`, `peso_historico`, `recomendacao_racao` (20260714) —
--     substituídas pela tabela unificada `momento` (categoria='vacina'
--     cobre o que era `vacina`; peso mora em `pet.peso`).
-- As 20 policies abaixo são as que de fato existem hoje; todas
-- confirmadas via `select tablename, policyname from pg_policies`.

ALTER POLICY "Users can view own subscription" ON public.subscriptions TO authenticated;
ALTER POLICY "Authenticated users can view products" ON public.lastlink_products TO authenticated;

ALTER POLICY "pet_select_own" ON public.pet TO authenticated;
ALTER POLICY "pet_insert_own" ON public.pet TO authenticated;
ALTER POLICY "pet_update_own" ON public.pet TO authenticated;
ALTER POLICY "pet_delete_own" ON public.pet TO authenticated;

ALTER POLICY "momento_select_own" ON public.momento TO authenticated;
ALTER POLICY "momento_insert_own" ON public.momento TO authenticated;
ALTER POLICY "momento_update_own" ON public.momento TO authenticated;
ALTER POLICY "momento_delete_own" ON public.momento TO authenticated;

ALTER POLICY "checklist_item_select_own" ON public.checklist_item TO authenticated;
ALTER POLICY "checklist_item_insert_own" ON public.checklist_item TO authenticated;
ALTER POLICY "checklist_item_update_own" ON public.checklist_item TO authenticated;
ALTER POLICY "checklist_item_delete_own" ON public.checklist_item TO authenticated;

ALTER POLICY "push_subscriptions_select_own" ON public.push_subscriptions TO authenticated;
ALTER POLICY "push_subscriptions_insert_own" ON public.push_subscriptions TO authenticated;
ALTER POLICY "push_subscriptions_update_own" ON public.push_subscriptions TO authenticated;
ALTER POLICY "push_subscriptions_delete_own" ON public.push_subscriptions TO authenticated;

ALTER POLICY "feedback_select_own" ON public.feedback TO authenticated;
ALTER POLICY "feedback_insert_own" ON public.feedback TO authenticated;
