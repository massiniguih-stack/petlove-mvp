-- Mapeamento pet de Maringá e região (planilha com 631 estabelecimentos).
--
-- `whatsapp`: número de WhatsApp do estabelecimento (só dígitos, com 55),
-- separado de `telefone`. É uso interno da equipe em /admin/parceiros para
-- o disparo de mensagens — a rota pública /api/servicos NÃO seleciona esta
-- coluna, então o número não aparece no /mapa para listagens grátis.
--
-- `origem`: de onde a linha veio (ex.: 'mapeamento-maringa-2026-11'), para
-- conseguir filtrar ou desfazer um lote importado.
--
-- Depois de rodar este arquivo: /admin/parceiros → Mais → "Importar
-- mapeamento Maringá e região".
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS origem TEXT;

CREATE INDEX IF NOT EXISTS partners_origem_idx ON public.partners(origem);
