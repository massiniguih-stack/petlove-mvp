import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const nome =
    (user.user_metadata?.nome as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    '';

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('tutor')
    .upsert({ id: user.id, nome, email: user.email || '' }, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.error('Erro ao garantir linha de tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
