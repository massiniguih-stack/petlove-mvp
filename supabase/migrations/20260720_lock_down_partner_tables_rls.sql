-- As policies antigas de `partners` e `partner_sends` usavam
-- `USING (true) WITH CHECK (true)` sem `TO`, o que no Postgres/Supabase
-- vale para QUALQUER role (incluindo `anon`), liberando leitura e escrita
-- irrestritas para qualquer visitante com a chave pública do projeto.
--
-- Todo o acesso legítimo a essas tabelas já passa pelas rotas server-side
-- em app/api/admin/** e app/api/servicos, que usam o client de service role
-- (getSupabaseAdmin), o qual ignora RLS. Então essas tabelas não precisam
-- liberar nada para `anon`/`authenticated` — só o service role.

DROP POLICY IF EXISTS "Admin can manage partner sends" ON partner_sends;
CREATE POLICY "Service role can manage partner sends"
  ON partner_sends FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can manage partners" ON partners;
CREATE POLICY "Service role can manage partners"
  ON partners FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
