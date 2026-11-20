import { NextRequest, NextResponse } from 'next/server';
import { getEmailFrom } from '@/lib/emailFrom';
import { createClient } from '@supabase/supabase-js';
import { getResend } from '@/lib/resend';
import { planCategory } from '@/lib/lastlink';
import { getAppUrl } from '@/lib/appUrl';
import { guardarCompraSemConta, type DadosAssinatura } from '@/lib/compraSemConta';
import { tokenMatches } from '@/lib/authz';


interface LastlinkEvent {
  Id: string;
  IsTest: boolean;
  Event: string;
  CreatedAt: string;
  Data: {
    Products?: Array<{ Id: string; Name: string; Price?: { Value: number } }>;
    Buyer?: {
      Id?: string;
      Email: string;
      Name: string;
      PhoneNumber?: string;
      Document?: string;
    };
    Purchase?: {
      PaymentId?: string;
      Recurrency?: number;
      PaymentDate?: string;
      Price?: { Value: number };
      Payment?: { NumberOfInstallments: number; PaymentMethod: string };
    };
    Subscriptions?: Array<{
      Id: string;
      ProductId: string;
      CanceledDate?: string;
      ExpiredDate?: string;
    }>;
  };
}

// Map LastLink product IDs to plan types.
// Some LastLink products bundle monthly and annual offers under the same
// product_id (e.g. tutor_monthly/tutor_annual), so when a product_id
// matches more than one row we disambiguate using the event's price.
async function getPlanTypeFromProductId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  productId: string,
  price?: number
): Promise<string | null> {
  const { data } = await supabase
    .from('lastlink_products')
    .select('plan_type, price')
    .eq('product_id', productId);

  if (!data || data.length === 0) return null;
  if (data.length === 1) return data[0].plan_type;

  if (price != null) {
    const closest = data.reduce((best: { plan_type: string; price: number | null }, row: { plan_type: string; price: number | null }) => {
      if (row.price == null) return best;
      if (best.price == null) return row;
      return Math.abs(row.price - price) < Math.abs(best.price - price) ? row : best;
    }, data[0]);
    return closest.plan_type;
  }

  return data[0].plan_type;
}

// Find user by email. listUsers() is paginated (50 per page by default), so
// we walk every page — otherwise buyers beyond the first page would pay and
// never get Premium. Comparison ignores case ("Ana@Gmail.com" == "ana@gmail.com").
const USERS_PER_PAGE = 1000;
const MAX_USER_PAGES = 50;

async function getUserByEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  email: string
): Promise<{ id: string } | null> {
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= MAX_USER_PAGES; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: USERS_PER_PAGE });
    if (error) throw error;
    const users: Array<{ id: string; email?: string }> = data?.users || [];
    const found = users.find((u) => u.email?.trim().toLowerCase() === target);
    if (found) return found;
    if (users.length < USERS_PER_PAGE) return null;
  }
  return null;
}

// Escapes LIKE wildcards so an e-mail like "a_b@x.com" only matches itself.
function exactILike(value: string): string {
  return value.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Ligamos o pagamento ao perfil do parceiro no /mapa casando o e-mail
// de quem pagou com partners.email (o mesmo e-mail cadastrado em
// /parceiros/cadastro) — e, quando a conta já existe, gravamos user_id, que é
// o que dá acesso ao painel em /parceiro/dashboard.
//
// Escada de planos no mapa:
// - free (sem pagamento): premium=false, destaque=false
// - partner_basic: selo Premium, sem “Destaque” no topo
// - partner_pro / partner_enterprise / partner_annual: Premium + Destaque
async function atualizarParceiroPorEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  planType: string | null,
  status: string,
  buyerEmail: string,
  userId: string | null
) {
  if (!planType?.startsWith('partner_')) return;
  const ativo = status === 'active';
  const isTopTier =
    planType === 'partner_pro' ||
    planType === 'partner_enterprise' ||
    planType === 'partner_annual';
  const partnerFlags: Record<string, unknown> = {
    premium: ativo,
    destaque: ativo && isTopTier,
  };
  // Sem conta ainda: liga o selo no mapa e deixa o vínculo do painel para
  // quando a pessoa entrar (o resgate em /api/subscription não mexe aqui).
  if (userId) partnerFlags.user_id = userId;
  const { error: partnerError, count } = await supabaseAdmin
    .from('partners')
    .update(partnerFlags, { count: 'exact' })
    .ilike('email', exactILike(buyerEmail));
  if (partnerError) {
    console.error('Failed to update partner premium status:', partnerError);
  } else if (!count) {
    console.error(`Payment confirmed for ${buyerEmail} but no partners row matches this email — premium not activated on the map.`);
  }
}

function allowedWebhookTokens(): string[] {
  const primary = process.env.LASTLINK_WEBHOOK_TOKEN || '';
  const extra = process.env.LASTLINK_WEBHOOK_TOKENS || '';
  return [...primary.split(','), ...extra.split(',')]
    .map((token) => token.trim())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  // A LastLink envia o token em `x-lastlink-token` (confirmado nos logs de
  // produção em 13/11/2026). `x-webhook-token` fica como alternativa para
  // não quebrar integrações/testes que usavam o nome antigo.
  const webhookToken =
    request.headers.get('x-lastlink-token') ?? request.headers.get('x-webhook-token');
  if (!tokenMatches(webhookToken, allowedWebhookTokens())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const event: LastlinkEvent = await request.json();

    // Skip test events
    if (event.IsTest) {
      return NextResponse.json({ received: true, test: true });
    }

    const buyerEmail = event.Data.Buyer?.Email;
    if (!buyerEmail) {
      return NextResponse.json({ error: 'No buyer email' }, { status: 400 });
    }

    // Get product ID and price from event
    const productId = event.Data.Subscriptions?.[0]?.ProductId ||
                      event.Data.Products?.[0]?.Id;
    const price = event.Data.Purchase?.Price?.Value ??
                  event.Data.Products?.[0]?.Price?.Value;

    let planType: string | null = null;
    if (productId) {
      planType = await getPlanTypeFromProductId(supabaseAdmin, productId, price);
    }

    // Determine status from event
    let status: string;
    let cancelAtPeriodEnd = false;

    switch (event.Event) {
      case 'Purchase_Order_Confirmed':
      case 'Recurrent_Payment':
        status = 'active';
        break;
      case 'Subscription_Canceled':
        status = 'canceled';
        cancelAtPeriodEnd = false;
        break;
      case 'Subscription_Expired':
        status = 'expired';
        break;
      case 'Payment_Refund':
      case 'Payment_Chargeback':
        status = 'canceled';
        break;
      case 'Subscription_Renewal_Pending':
        status = 'active'; // Still active, waiting for payment
        break;
      default:
        // Unknown event, just acknowledge
        return NextResponse.json({ received: true, event: event.Event });
    }

    // Get subscription ID from LastLink
    const lastlinkSubscriptionId = event.Data.Subscriptions?.[0]?.Id;

    const resolvedPlanType = planType || 'unknown';
    // partner_basic/pro/enterprise viraram planos anuais em 2026-09 (cobrados
    // em 12x); tutor_annual e partner_annual já eram anuais. Todo o resto
    // (tutor_monthly) segue mensal.
    const isAnnualPlan =
      resolvedPlanType === 'tutor_annual' ||
      resolvedPlanType === 'partner_annual' ||
      resolvedPlanType === 'partner_basic' ||
      resolvedPlanType === 'partner_pro' ||
      resolvedPlanType === 'partner_enterprise';
    const periodDays = isAnnualPlan ? 365 : 30;
    const dadosAssinatura: DadosAssinatura = {
      plan_type: resolvedPlanType,
      plan_category: planCategory(resolvedPlanType),
      status,
      provider_subscription_id: lastlinkSubscriptionId || `lastlink_${event.Id}`,
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_end: event.Data.Purchase?.PaymentDate
        ? new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString() // Estimate
        : null,
    };

    // Find user
    const user = await getUserByEmail(supabaseAdmin, buyerEmail);
    if (!user) {
      // Pagou com um e-mail sem conta no app (comprou antes de se cadastrar,
      // ou usou outro e-mail no checkout). Antes isso era descartado e a
      // pessoa ficava grátis; agora a compra fica guardada e vira assinatura
      // quando alguém entrar com esse e-mail (ver /api/subscription).
      const { error: guardarError } = await guardarCompraSemConta(
        supabaseAdmin,
        buyerEmail,
        dadosAssinatura,
        event.Event,
      );
      if (guardarError) {
        console.error('compra_sem_conta: falha ao guardar', guardarError);
        // 500 faz a LastLink reenviar o aviso depois.
        return NextResponse.json({ error: 'Failed to save purchase' }, { status: 500 });
      }
      console.warn('compra_sem_conta: pagamento guardado até a pessoa criar conta com esse e-mail');
      await atualizarParceiroPorEmail(supabaseAdmin, planType, status, buyerEmail, null);
      if (event.Event === 'Purchase_Order_Confirmed') {
        try {
          await getResend().emails.send({
            from: getEmailFrom(),
            to: buyerEmail,
            subject: 'Seu Premium do Patinha está esperando por você',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #7c3aed; font-size: 24px;">Pagamento confirmado! 🎉</h1>
                <p style="color: #333; font-size: 16px;">Para usar o Premium, crie sua conta no Patinha com <strong>este mesmo e-mail</strong>. O Premium liga sozinho assim que você entrar.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${getAppUrl()}/cadastro" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    Criar minha conta
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">Já tem conta com outro e-mail? Escreva para contato@patinha.app.br e a gente passa o Premium para ela.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr);
        }
      }
      return NextResponse.json({ received: true, semConta: true });
    }

    const subscriptionData = {
      user_id: user.id,
      provider_price_id: resolvedPlanType,
      ...dadosAssinatura,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabaseAdmin.from('subscriptions').upsert(
      subscriptionData,
      { onConflict: 'user_id,plan_category' }
    );
    if (upsertError) {
      console.error('Failed to upsert subscription:', upsertError);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    await atualizarParceiroPorEmail(supabaseAdmin, planType, status, buyerEmail, user.id);

    // Send email for first payment
    if (event.Event === 'Purchase_Order_Confirmed') {
      try {
        const planName = planType?.replaceAll('_', ' ') || 'Premium';
        await getResend().emails.send({
          from: getEmailFrom(),
          to: buyerEmail,
          subject: 'Parabéns! Você agora é Premium! 🎉',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; padding: 30px 0;">
                <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">Parabéns! 🎉</h1>
                <p style="color: #666; font-size: 16px; margin-top: 8px;">Você agora é membro Premium do Patinha</p>
              </div>
              <div style="background: linear-gradient(135deg, #fdf2f8, #f3e8ff); border-radius: 16px; padding: 24px; margin: 20px 0;">
                <h2 style="color: #7c3aed; font-size: 18px; margin: 0 0 12px 0;">Seu plano ativo:</h2>
                <p style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">${planName}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${getAppUrl()}/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Acessar Dashboard
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }
}
