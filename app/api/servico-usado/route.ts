import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOwnPet } from '@/lib/tutor';

// Tutor confirma que usou um serviço de um parceiro — alimenta o gráfico
// dele em /parceiro/dashboard como "confirmado por tutores", separado do
// que o próprio parceiro registra (ver app/api/parceiro/servicos-realizados).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { partnerId, petId, tipoServico, data } = body;

  if (!partnerId || !petId || !tipoServico || !data) {
    return NextResponse.json({ error: 'Preencha o pet, o serviço e a data' }, { status: 400 });
  }

  const { user, pet } = await getOwnPet(petId);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!pet) return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 });

  const supabaseAdmin = getSupabaseAdmin();
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
