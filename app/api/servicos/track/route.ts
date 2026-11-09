import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { clientIp, rateLimitShared } from '@/lib/authz';
import { isAwaitingReview } from '@/lib/partnerReview';

export const preferredRegion = 'gru1';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Quanto tempo a mesma pessoa (IP) precisa esperar para contar de novo o
// mesmo evento no mesmo parceiro. Evita que alguém infle as métricas de um
// parceiro (ou derrube as de outro) recarregando a página em loop.
const DEDUPE_WINDOW_MS: Record<'view' | 'whatsapp_click', number> = {
  view: 30 * 60_000,
  whatsapp_click: 10 * 60_000,
};

// Público (igual /api/servicos) — registra visualização/clique de WhatsApp
// no perfil de um parceiro no /mapa, pra alimentar as métricas dele em
// /parceiro/dashboard.
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = await rateLimitShared(`track:${ip}`, { limit: 40, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const partnerId = body?.partnerId;
  const eventType = body?.eventType;

  if (
    typeof partnerId !== 'string' ||
    !UUID_RE.test(partnerId) ||
    (eventType !== 'view' && eventType !== 'whatsapp_click')
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Mesma pessoa, mesmo parceiro, mesmo evento dentro da janela: confirma
  // pro navegador mas não conta de novo.
  const repeated = await rateLimitShared(`track:${ip}:${partnerId}:${eventType}`, {
    limit: 1,
    windowMs: DEDUPE_WINDOW_MS[eventType as 'view' | 'whatsapp_click'],
  });
  if (repeated) return NextResponse.json({ received: true });

  const supabaseAdmin = getSupabaseAdmin();

  // Só conta evento de parceiro que existe e está visível no mapa.
  const { data: partner } = await supabaseAdmin
    .from('partners')
    .select('id, status')
    .eq('id', partnerId)
    .maybeSingle();
  if (!partner || isAwaitingReview(partner.status)) {
    return NextResponse.json({ received: true });
  }

  const { error } = await supabaseAdmin
    .from('partner_events')
    .insert({ partner_id: partnerId, event_type: eventType });

  if (error) {
    // Best-effort: métrica perdida não deve quebrar a navegação do tutor.
    console.error('Failed to record partner event:', error);
  }

  return NextResponse.json({ received: true });
}
