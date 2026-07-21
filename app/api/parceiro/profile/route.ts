import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOwnPartner } from '@/lib/partner';

export async function GET() {
  const { user, partner } = await getOwnPartner();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ partner });
}

// Campos que o próprio parceiro pode editar. status/premium/destaque/email/
// user_id ficam de fora — só admin ou o webhook de pagamento mexem nesses.
const EDITABLE_FIELDS = ['descricao', 'telefone', 'instagram', 'website', 'horario', 'plantao24h', 'servicos'] as const;

export async function PATCH(req: NextRequest) {
  const { user, partner } = await getOwnPartner();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!partner) {
    return NextResponse.json({ error: 'Nenhum parceiro vinculado a esta conta' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('partners')
    .update(updates)
    .eq('id', partner.id)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Failed to update partner profile:', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }

  return NextResponse.json({ partner: data });
}
