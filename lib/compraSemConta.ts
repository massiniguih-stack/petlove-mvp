import { statusDaPremium } from '@/lib/assinatura';

// Compra confirmada pela LastLink com um e-mail que ainda não tem conta no app
// (comprou antes de se cadastrar, ou pagou com outro e-mail). Fica guardada em
// `compras_sem_conta` e vira assinatura quando alguém entra com esse e-mail.

export type DadosAssinatura = {
  plan_type: string;
  plan_category: 'tutor' | 'partner';
  status: string;
  provider_subscription_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function guardarCompraSemConta(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  email: string,
  dados: DadosAssinatura,
  evento: string,
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('compras_sem_conta').upsert(
    {
      email: normalizarEmail(email),
      ...dados,
      ultimo_evento: evento,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email,plan_category' },
  );
  return { error };
}

/**
 * Passa para a conta as compras guardadas com o e-mail dela.
 * Uma compra cancelada/estornada não derruba uma assinatura que já está ativa
 * na conta (ex.: a pessoa assinou de novo depois, já logada).
 * Devolve quantas compras viraram assinatura.
 */
export async function resgatarComprasSemConta(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  user: { id: string; email?: string | null },
): Promise<number> {
  if (!user.email) return 0;
  const email = normalizarEmail(user.email);

  const { data: compras, error } = await supabase
    .from('compras_sem_conta')
    .select('id, plan_type, plan_category, status, provider_subscription_id, current_period_end, cancel_at_period_end')
    .eq('email', email);
  if (error || !compras || compras.length === 0) return 0;

  let resgatadas = 0;
  for (const compra of compras) {
    const { data: atual } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('plan_category', compra.plan_category)
      .maybeSingle();

    const naoDerrubaAtiva = statusDaPremium(atual?.status) && !statusDaPremium(compra.status);
    if (!naoDerrubaAtiva) {
      const { error: upsertError } = await supabase.from('subscriptions').upsert(
        {
          user_id: user.id,
          provider_subscription_id: compra.provider_subscription_id,
          provider_price_id: compra.plan_type,
          status: compra.status,
          plan_type: compra.plan_type,
          plan_category: compra.plan_category,
          cancel_at_period_end: compra.cancel_at_period_end,
          current_period_end: compra.current_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,plan_category' },
      );
      // Se não gravou, a compra continua guardada e tenta de novo na próxima visita.
      if (upsertError) {
        console.error('compra_sem_conta: falha ao passar para a conta', upsertError);
        continue;
      }
      resgatadas += 1;
    }

    await supabase.from('compras_sem_conta').delete().eq('id', compra.id);
  }
  return resgatadas;
}
