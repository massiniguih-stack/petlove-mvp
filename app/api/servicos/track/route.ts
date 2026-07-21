import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Público (igual /api/servicos) — registra visualização/clique de WhatsApp
// no perfil de um parceiro no /mapa, pra alimentar as métricas dele em
// /parceiro/dashboard.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const partnerId = body?.partnerId;
  const eventType = body?.eventType;

  if (typeof partnerId !== 'string' || (eventType !== 'view' && eventType !== 'whatsapp_click')) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('partner_events')
    .insert({ partner_id: partnerId, event_type: eventType });

  if (error) {
    // Best-effort: métrica perdida não deve quebrar a navegação do tutor.
    console.error('Failed to record partner event:', error);
  }

  return NextResponse.json({ received: true });
}
