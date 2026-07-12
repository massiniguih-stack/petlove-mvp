-- Tabela de parceiros (servicos importados do servicosMock)
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  nome TEXT NOT NULL,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  telefone TEXT,
  instagram TEXT,
  website TEXT,
  avaliacao NUMERIC,
  premium BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage partners"
  ON partners FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partners_estado ON partners(estado);
CREATE INDEX IF NOT EXISTS idx_partners_tipo ON partners(tipo);
CREATE INDEX IF NOT EXISTS idx_partners_cidade ON partners(cidade);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
