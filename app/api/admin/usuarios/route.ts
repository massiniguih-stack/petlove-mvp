import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);
  const offset = (page - 1) * limit;

  const { count } = await supabaseAdmin
    .from('tutor')
    .select('*', { count: 'exact', head: true });

  const { data: tutors, error } = await supabaseAdmin
    .from('tutor')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }

  return NextResponse.json({
    data: tutors || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// Apaga o usuário do Supabase Auth — a tabela `tutor` referencia
// auth.users(id) ON DELETE CASCADE, então isso já leva junto o perfil de
// tutor, os pets, e tudo que depende deles (momentos, checklist, etc.),
// além de subscriptions/push_subscriptions/partner_sends que referenciam
// auth.users diretamente.
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  // A lista de usuários mostra todo mundo que já se cadastrou como tutor,
  // incluindo o próprio admin se ele também tiver uma conta de tutor —
  // sem essa checagem, dava pra apagar a própria conta por engano (já
  // aconteceu) e ficar sem acesso ao painel.
  if (id === user.id) {
    return NextResponse.json({ error: 'Você não pode excluir a própria conta por aqui.' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
