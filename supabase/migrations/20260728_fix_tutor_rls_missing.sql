-- Bug grave descoberto testando o formulário de onboarding: a tabela
-- `tutor` tem RLS habilitada (schema.sql) mas as policies de SELECT/UPDATE
-- pra dono da própria linha nunca foram de fato criadas em produção —
-- confirmado ao vivo: um tutor autenticado lendo/atualizando a própria
-- linha (telefone, endereço, consentimento) sempre via 0 linhas afetadas,
-- sem erro nenhum (RLS filtra silenciosamente, não retorna erro).
--
-- Isso significa que telefone/endereço/consentimento preenchidos no
-- onboarding NUNCA foram salvos de verdade pra nenhum tutor até agora.
--
-- `pet` já tem essas policies corretas (testado, funcionando) — aqui é só
-- replicar o mesmo padrão pra `tutor`.

DROP POLICY IF EXISTS "tutor_select_own" ON public.tutor;
CREATE POLICY "tutor_select_own" ON public.tutor
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "tutor_update_own" ON public.tutor;
CREATE POLICY "tutor_update_own" ON public.tutor
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
