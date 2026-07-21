-- Dá ao parceiro (vet/petshop) uma conta própria ligada à linha dele em
-- `partners`, pra ele acessar um painel próprio (perfil, métricas,
-- assinatura) sem depender do admin pra tudo.
--
-- O checkout de /parceiros/premium já exige login (mesma conta usada como
-- tutor), então o único elo que faltava era gravar esse `user_id` — não é
-- preciso nenhum sistema de convite/senha novo.

ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE UNIQUE INDEX IF NOT EXISTS partners_user_id_key
  ON public.partners(user_id)
  WHERE user_id IS NOT NULL;

-- Coluna que o formulário público de cadastro (CadastroClient.tsx) já
-- coleta, mas a rota de cadastro descartava por não existir a coluna.
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Métricas básicas de visualização/clique no perfil do parceiro no /mapa —
-- não existia nenhum tracking disso antes.
CREATE TABLE IF NOT EXISTS public.partner_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'whatsapp_click')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_events_partner_created
  ON public.partner_events(partner_id, created_at DESC);

ALTER TABLE public.partner_events ENABLE ROW LEVEL SECURITY;

-- Mesmo padrão de supabase/migrations/20260720_lock_down_partner_tables_rls.sql:
-- todo acesso passa por rotas server-side com o client de service role, então
-- anon/authenticated não precisam de nenhuma policy própria aqui.
CREATE POLICY "Service role can manage partner events"
  ON public.partner_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
