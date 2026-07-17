-- O app já promete na tela /vida ("Você receberá um lembrete antes da
-- data agendada") mas nada nunca enviava esse lembrete de verdade. Esta
-- coluna evita reenviar o mesmo lembrete todo dia enquanto a vacina
-- continuar pendente.
ALTER TABLE public.momento ADD COLUMN IF NOT EXISTS lembrete_enviado_em timestamptz;
