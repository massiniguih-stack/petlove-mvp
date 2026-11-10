import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOwnPet } from '@/lib/tutor';
import { rateLimitShared } from '@/lib/authz';
import { isAwaitingReview } from '@/lib/partnerReview';
import { tutorServiceLogSchema } from '@/lib/serviceLog';

// Tutor confirma que usou um serviço de um parceiro — alimenta o gráfico
// dele em /parceiro/dashboard como "confirmado por tutores", separado do
// que o próprio parceiro registra (ver app/api/parceiro/servicos-realizados).
export async function POST(req: NextRequest) {
  const parsed = tutorServiceLogSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Preencha o pet, o serviço e uma data válida' }, { status: 400 });
  }
  const { partnerId, petId, tipoServico, data } = parsed.data;

  const { user, pet } = await getOwnPet(petId);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!pet) return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 });

  const limited = await rateLimitShared(`servico-usado:${user.id}`, { limit: 20, windowMs: 60 * 60_000 });
  if (limited) return limited;

  const supabaseAdmin = getSupabaseAdmin();

  const { data: partner } = await supabaseAdmin
    .from('partners')
    .select('id, status')
    .eq('id', partnerId)
    .maybeSingle();
  if (!partner || isAwaitingReview(partner.status)) {
    return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
  }

  // Mesma confirmação repetida (mesmo pet, parceiro, serviço e dia) conta uma vez só.
  const { data: existing } = await supabaseAdmin
    .from('service_logs')
    .select('id')
    .eq('partner_id', partnerId)
    .eq('pet_id', petId)
    .eq('tutor_id', user.id)
    .eq('tipo_servico', tipoServico)
    .eq('data', data)
    .eq('origem', 'tutor')
    .limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  const { error } = await supabaseAdmin.from('service_logs').insert({
    partner_id: partnerId,
    pet_id: petId,
    tutor_id: user.id,
    tipo_servico: tipoServico,
    data,
    origem: 'tutor',
  });

  if (error) {
    console.error('Failed to record tutor service confirmation:', error);
    return NextResponse.json({ error: 'Erro ao registrar' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
