-- Bug: partners.user_id foi criado sem ON DELETE, então apagar uma conta
-- de tutor que também está vinculada a um parceiro (comprou Premium do
-- negócio dela) falhava com erro de chave estrangeira — travando a
-- exclusão no admin (app/api/admin/usuarios DELETE).
--
-- SET NULL é o comportamento certo aqui: apagar a conta de login não deve
-- apagar o parceiro (o negócio continua existindo no mapa), só desfazer o
-- vínculo — o auto-link (lib/partner.ts) recria a ligação se alguém
-- logar de novo com o mesmo e-mail.

ALTER TABLE public.partners DROP CONSTRAINT IF EXISTS partners_user_id_fkey;

ALTER TABLE public.partners
  ADD CONSTRAINT partners_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
