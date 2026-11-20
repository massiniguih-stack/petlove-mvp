-- Conferência da migração 20261120_admin_eventos.sql.
-- Rode cada bloco separado no SQL editor do Supabase.
-- Os blocos 3 a 5 terminam em ROLLBACK: não deixam nada gravado.

-- 1. Quantos eventos existem por tipo (estimado = reconstruído do passado)
SELECT publico, tipo, estimado, count(*) AS total
  FROM public.admin_eventos
 GROUP BY publico, tipo, estimado
 ORDER BY publico, tipo, estimado;

-- 2. Rodar de novo não duplica:
--    rode a migração inteira mais uma vez e repita o bloco 1. Os totais devem ser iguais.

-- 3. Empresa: entrada, convite por e-mail, 2º convite por WhatsApp (não conta), painel
BEGIN;
INSERT INTO public.partners (id, nome, tipo, cidade, status, premium, destaque)
VALUES ('00000000-0000-4000-8000-000000000001', 'Teste do gatilho', 'petshop', 'Maringá', 'pending', false, false);
UPDATE public.partners SET status = 'sent' WHERE id = '00000000-0000-4000-8000-000000000001';
UPDATE public.partners SET whatsapp_contatado_em = now() WHERE id = '00000000-0000-4000-8000-000000000001';
SELECT tipo, detalhe FROM public.admin_eventos
 WHERE entidade_id = '00000000-0000-4000-8000-000000000001'
 ORDER BY tipo;
-- Esperado: 2 linhas
--   empresa_convidada   {"canal": "email"}
--   empresa_entrou_mapa {"origem": "importada", "tipo": "petshop"}
ROLLBACK;

-- 4. Assinatura de tutor: sair do pago e voltar gera cancelou + virou_pago
BEGIN;
CREATE TEMP TABLE alvo ON COMMIT DROP AS
SELECT user_id FROM public.subscriptions
 WHERE COALESCE(plan_category, 'tutor') = 'tutor'
 LIMIT 1;
UPDATE public.subscriptions s SET status = 'pending'
  FROM alvo WHERE s.user_id = alvo.user_id AND COALESCE(s.plan_category, 'tutor') = 'tutor';
UPDATE public.subscriptions s SET status = 'active'
  FROM alvo WHERE s.user_id = alvo.user_id AND COALESCE(s.plan_category, 'tutor') = 'tutor';
SELECT e.tipo, e.detalhe FROM public.admin_eventos e
  JOIN alvo ON e.entidade_id = alvo.user_id
 WHERE e.ocorrido_em = now()
 ORDER BY e.tipo;
-- Esperado: a última linha é tutor_virou_pago (antes dela, tutor_cancelou se a
-- assinatura já estava ativa). Nenhuma linha = não existe assinatura de tutor ainda.
ROLLBACK;

-- 5. Um defeito no diário não bloqueia a operação principal
BEGIN;
ALTER TABLE public.admin_eventos ADD CONSTRAINT teste_falha CHECK (false) NOT VALID;
INSERT INTO public.partners (id, nome, tipo, cidade, status, premium, destaque)
VALUES ('00000000-0000-4000-8000-000000000002', 'Teste de falha', 'petshop', 'Maringá', 'pending', false, false);
SELECT count(*) AS empresa_gravada FROM public.partners WHERE id = '00000000-0000-4000-8000-000000000002';
-- Esperado: empresa_gravada = 1, e um aviso "admin_eventos: não registrou ..." nas mensagens.
ROLLBACK;
