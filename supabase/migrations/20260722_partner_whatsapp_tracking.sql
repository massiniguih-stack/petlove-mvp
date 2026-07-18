-- Rastreia quando o admin abriu o WhatsApp pra contatar um parceiro pela
-- lista de cliques em /admin/parceiros. Não confirma que a mensagem foi
-- enviada de fato (não temos WhatsApp Business API) — só marca que o
-- admin já abriu a conversa, pra saber quem falta contatar.
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS whatsapp_contatado_em timestamptz;
