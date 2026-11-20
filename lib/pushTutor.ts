import { sendPushNotification } from '@/lib/push';
import type { getSupabaseAdmin } from '@/lib/supabase/admin';

type Admin = Pick<ReturnType<typeof getSupabaseAdmin>, 'from'>;

export interface ResultadoEnvio {
  /** Quantos aparelhos a pessoa tem cadastrados. */
  aparelhos: number;
  /** Em quantos a notificação foi entregue ao Firebase. */
  enviados: number;
  /** Aparelhos com endereço vencido (apagados da lista). */
  vencidos: number;
}

// Manda a mesma notificação para TODOS os aparelhos da pessoa (celular,
// computador...). Antes só o último aparelho que ativou recebia — quem
// ativava no computador depois deixava de receber no celular.
export async function enviarParaTutor(
  admin: Admin,
  userId: string,
  titulo: string,
  corpo: string,
  url?: string
): Promise<ResultadoEnvio> {
  const { data } = await admin.from('push_subscriptions').select('token').eq('user_id', userId);
  const tokens = Array.from(new Set(((data || []) as { token: string }[]).map((r) => r.token).filter(Boolean)));

  let enviados = 0;
  let vencidos = 0;
  for (const token of tokens) {
    const { sent, tokenInvalido } = await sendPushNotification(token, titulo, corpo, url);
    if (sent) enviados++;
    if (tokenInvalido) {
      vencidos++;
      await admin.from('push_subscriptions').delete().eq('token', token);
    }
  }
  return { aparelhos: tokens.length, enviados, vencidos };
}
