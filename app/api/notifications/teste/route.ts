import { NextResponse } from 'next/server';
import { rateLimitShared, requireUser } from '@/lib/authz';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendPushNotification } from '@/lib/push';
import { getAppUrl } from '@/lib/appUrl';

// POST: manda uma notificação de teste para o aparelho da PRÓPRIA pessoa
// logada (o último que ativou as notificações). Serve para o tutor — e para
// a equipe — confirmar no celular que as notificações chegam.
export async function POST() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const limitado = await rateLimitShared(`push-teste:${gate.user.id}`, { limit: 3, windowMs: 60_000 });
  if (limitado) return limitado;

  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from('push_subscriptions')
    .select('token')
    .eq('user_id', gate.user.id)
    .maybeSingle();

  if (!data?.token) {
    return NextResponse.json(
      { error: 'Este aparelho ainda não ativou as notificações.', semToken: true },
      { status: 404 }
    );
  }

  const { sent, tokenInvalido } = await sendPushNotification(
    data.token,
    'Patinha 🐾',
    'Notificações funcionando! Os lembretes de vacina vão chegar aqui.',
    `${getAppUrl()}/dashboard`
  );

  if (tokenInvalido) {
    await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', gate.user.id);
    return NextResponse.json(
      { error: 'O endereço deste aparelho venceu. Ative as notificações de novo.', semToken: true },
      { status: 410 }
    );
  }

  if (!sent) {
    return NextResponse.json({ error: 'O envio de notificações está indisponível agora.' }, { status: 503 });
  }

  return NextResponse.json({ enviado: true });
}
