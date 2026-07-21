import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOwnPartner } from '@/lib/partner';

// Contagem simples dos últimos 30 dias — v1 propositalmente enxuta, sem
// gráfico/série temporal.
export async function GET() {
  const { user, partner } = await getOwnPartner();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!partner) {
    return NextResponse.json({ error: 'Nenhum parceiro vinculado a esta conta' }, { status: 404 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('partner_events')
    .select('event_type')
    .eq('partner_id', partner.id)
    .gte('created_at', desde);

  if (error) {
    console.error('Failed to load partner metrics:', error);
    return NextResponse.json({ error: 'Erro ao carregar métricas' }, { status: 500 });
  }

  const views = data?.filter((e) => e.event_type === 'view').length || 0;
  const whatsappClicks = data?.filter((e) => e.event_type === 'whatsapp_click').length || 0;

  return NextResponse.json({ views, whatsappClicks, periodoDias: 30 });
}
