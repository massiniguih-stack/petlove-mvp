-- Guarda o canal de origem (utm_source/medium/campaign) do primeiro toque
-- do tutor, capturado no client e enviado uma única vez na criação da linha
-- (ver app/api/tutor/ensure/route.ts), para medir retorno de campanhas pagas.
ALTER TABLE public.tutor ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.tutor ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.tutor ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
