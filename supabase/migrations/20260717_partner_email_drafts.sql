-- Staging list for the admin partner-email campaign tool (app/admin/parceiros-emails),
-- previously stored only in the browser's localStorage.
CREATE TABLE public.partner_email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'veterinario',
  cidade TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_partner_email_drafts_created_at ON public.partner_email_drafts(created_at);

-- Only accessed via service-role admin API routes (no client-side policies needed).
ALTER TABLE public.partner_email_drafts ENABLE ROW LEVEL SECURITY;
