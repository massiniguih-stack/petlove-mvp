import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOwnPartner } from '@/lib/partner';

function mesParaIntervalo(mes: string | null): { inicio: string; fim: string } {
  const hoje = new Date();
  const [ano, mesNum] = mes && /^\d{4}-\d{2}$/.test(mes)
    ? mes.split('-').map(Number)
    : [hoje.getFullYear(), hoje.getMonth() + 1];
  const inicio = `${ano}-${String(mesNum).padStart(2, '0')}-01`;
  const proximoMes = mesNum === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mesNum + 1).padStart(2, '0')}-01`;
  return { inicio, fim: proximoMes };
}

export async function GET(req: NextRequest) {
  const { user, partner } = await getOwnPartner();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!partner) return NextResponse.json({ error: 'Nenhum parceiro vinculado a esta conta' }, { status: 404 });

  const { inicio, fim } = mesParaIntervalo(req.nextUrl.searchParams.get('mes'));

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('service_logs')
    .select('id, tipo_servico, data, origem, cliente_nome, observacao')
    .eq('partner_id', partner.id)
    .gte('data', inicio)
    .lt('data', fim)
    .order('data', { ascending: false });

  if (error) {
    console.error('Failed to load service logs:', error);
    return NextResponse.json({ error: 'Erro ao carregar registros' }, { status: 500 });
  }

  const porTipoMap = new Map<string, { registradoPeloParceiro: number; confirmadoPorTutor: number }>();
  for (const row of data || []) {
    const atual = porTipoMap.get(row.tipo_servico) || { registradoPeloParceiro: 0, confirmadoPorTutor: 0 };
    if (row.origem === 'parceiro') atual.registradoPeloParceiro += 1;
    else atual.confirmadoPorTutor += 1;
    porTipoMap.set(row.tipo_servico, atual);
  }
  const porTipo = Array.from(porTipoMap.entries()).map(([tipoServico, contagens]) => ({ tipoServico, ...contagens }));

  return NextResponse.json({ registros: data || [], porTipo });
}

export async function POST(req: NextRequest) {
  const { user, partner } = await getOwnPartner();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!partner) return NextResponse.json({ error: 'Nenhum parceiro vinculado a esta conta' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { tipoServico, data, clienteNome, observacao } = body;

  if (!tipoServico || !data) {
    return NextResponse.json({ error: 'Informe o tipo de serviço e a data' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: registro, error } = await supabaseAdmin
    .from('service_logs')
    .insert({
      partner_id: partner.id,
      tipo_servico: tipoServico,
      data,
      origem: 'parceiro',
      cliente_nome: clienteNome || null,
      observacao: observacao || null,
    })
    .select('id, tipo_servico, data, origem, cliente_nome, observacao')
    .single();

  if (error) {
    console.error('Failed to create service log:', error);
    return NextResponse.json({ error: 'Erro ao registrar atendimento' }, { status: 500 });
  }

  return NextResponse.json({ registro });
}

export async function DELETE(req: NextRequest) {
  const { user, partner } = await getOwnPartner();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!partner) return NextResponse.json({ error: 'Nenhum parceiro vinculado a esta conta' }, { status: 404 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Informe o id' }, { status: 400 });

  const supabaseAdmin = getSupabaseAdmin();
  const { error, count } = await supabaseAdmin
    .from('service_logs')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('partner_id', partner.id)
    .eq('origem', 'parceiro');

  if (error) {
    console.error('Failed to delete service log:', error);
    return NextResponse.json({ error: 'Erro ao apagar registro' }, { status: 500 });
  }
  if (!count) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
