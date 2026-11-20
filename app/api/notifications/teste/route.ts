import { NextResponse } from 'next/server';
import { rateLimitShared, requireUser } from '@/lib/authz';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { enviarParaTutor } from '@/lib/pushTutor';
import { getAppUrl } from '@/lib/appUrl';

// POST: manda uma notificação de teste para TODOS os aparelhos da própria
// pessoa logada. Serve para o tutor — e para a equipe — confirmar no
// celular que as notificações chegam.
export async function POST() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const limitado = await rateLimitShared(`push-teste:${gate.user.id}`, { limit: 3, windowMs: 60_000 });
  if (limitado) return limitado;

  const r = await enviarParaTutor(
    getSupabaseAdmin(),
    gate.user.id,
    'Patinha 🐾',
    'Notificações funcionando! Seus lembretes vão chegar aqui.',
    `${getAppUrl()}/dashboard`
  );

  if (r.aparelhos === 0) {
    return NextResponse.json(
      { error: 'Este aparelho ainda não ativou as notificações.', semToken: true },
      { status: 404 }
    );
  }

  if (r.enviados === 0 && r.vencidos === r.aparelhos) {
    return NextResponse.json(
      { error: 'O endereço deste aparelho venceu. Ative as notificações de novo.', semToken: true },
      { status: 410 }
    );
  }

  if (r.enviados === 0) {
    return NextResponse.json({ error: 'O envio de notificações está indisponível agora.' }, { status: 503 });
  }

  return NextResponse.json({ enviado: true, aparelhos: r.enviados });
}
