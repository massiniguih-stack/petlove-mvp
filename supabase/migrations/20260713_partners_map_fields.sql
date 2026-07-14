-- Add fields needed for the public map (/mapa) and partner contact management
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS lng NUMERIC;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS servicos TEXT[];
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS horario TEXT;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS plantao24h BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS email TEXT;
