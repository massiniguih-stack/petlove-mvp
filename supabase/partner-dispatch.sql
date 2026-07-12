-- Adicionar campo estado na tabela tutor
ALTER TABLE public.tutor ADD COLUMN IF NOT EXISTS estado text;

-- Criar tabela de envios de parceiros
CREATE TABLE IF NOT EXISTS partner_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  estado TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE partner_sends ENABLE ROW LEVEL SECURITY;

-- Only admin can manage
CREATE POLICY "Admin can manage partner sends"
  ON partner_sends FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_partner_sends_estado ON partner_sends(estado);
CREATE INDEX IF NOT EXISTS idx_partner_sends_status ON partner_sends(status);
CREATE INDEX IF NOT EXISTS idx_partner_sends_user_id ON partner_sends(user_id);
