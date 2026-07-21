-- Registro de atendimentos realizados, pra alimentar o gráfico de
-- desempenho por serviço no painel do parceiro (/parceiro/dashboard).
--
-- Não existe hoje nenhum contato tutor<->parceiro dentro do app (é tudo
-- por WhatsApp, por fora), então os dois lados registram por conta própria
-- — ver `origem`. Os dois registros NÃO são cruzados/deduplicados nessa
-- v1: o app mostra as duas contagens separadas, nunca somadas.

CREATE TABLE IF NOT EXISTS public.service_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pet(id) ON DELETE SET NULL,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo_servico TEXT NOT NULL,
  data DATE NOT NULL,
  origem TEXT NOT NULL CHECK (origem IN ('parceiro', 'tutor')),
  cliente_nome TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_logs_partner_data
  ON public.service_logs(partner_id, data DESC);

ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;

-- Mesmo padrão de partner_events/partners: todo acesso passa por rota de
-- API server-side com o client de service role.
CREATE POLICY "Service role can manage service logs"
  ON public.service_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
