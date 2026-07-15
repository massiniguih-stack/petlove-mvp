import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
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

  // Atribuição de campanha (opcional): enviada pelo client a partir do que
  // ficou salvo no localStorage no primeiro acesso (ver lib/utm.ts).
  // ignoreDuplicates faz com que isso só grave na primeira vez, preservando
  // o primeiro toque mesmo que o usuário volte depois por outro canal.
  const body = await request.json().catch(() => ({}));
  const utm_source = typeof body.utm_source === 'string' ? body.utm_source : null;
  const utm_medium = typeof body.utm_medium === 'string' ? body.utm_medium : null;
  const utm_campaign = typeof body.utm_campaign === 'string' ? body.utm_campaign : null;

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('tutor')
    .upsert(
      { id: user.id, nome, email: user.email || '', utm_source, utm_medium, utm_campaign },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (error) {
    console.error('Erro ao garantir linha de tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
