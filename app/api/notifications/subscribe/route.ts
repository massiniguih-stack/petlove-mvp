import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json().catch(() => ({}));

  // Token do Firebase: texto de ~150-250 caracteres. Limite folgado só para
  // não aceitar lixo.
  if (typeof token !== 'string' || !token.trim() || token.length > 4096) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  // Um registro por APARELHO (token): a pessoa recebe em todos os que
  // ativou (celular, computador...). Service role porque o mesmo aparelho
  // pode ter sido de outra conta antes (trocou de login) — aí o registro
  // passa para quem está logado agora, e o RLS não deixaria mexer nele.
  const { error } = await getSupabaseAdmin().from('push_subscriptions').upsert({
    user_id: user.id,
    token,
    created_at: new Date().toISOString(),
  }, { onConflict: 'token' });

  if (error) {
    // Antes respondia sucesso mesmo sem salvar — o app achava que estava
    // tudo certo e a pessoa nunca recebia nada.
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Não consegui salvar este aparelho' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('token', token);

  if (error) {
    console.error('Error deleting push subscription:', error);
  }

  return NextResponse.json({ success: true });
}
