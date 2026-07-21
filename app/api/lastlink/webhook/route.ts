import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { planCategory } from '@/lib/lastlink';

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Find user by email
async function getUserByEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  email: string
): Promise<{ id: string } | null> {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  return users.find((u: { email?: string }) => u.email === email) || null;
}

export async function POST(request: NextRequest) {
  const webhookToken = request.headers.get('x-webhook-token');
  if (webhookToken !== process.env.LASTLINK_WEBHOOK_TOKEN) {
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

    // Find user
    const user = await getUserByEmail(supabaseAdmin, buyerEmail);
    if (!user) {
      console.error('User not found for email:', buyerEmail);
      return NextResponse.json({ received: true });
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

    // Upsert subscription
    const resolvedPlanType = planType || 'unknown';
    const subscriptionData = {
      user_id: user.id,
      provider_subscription_id: lastlinkSubscriptionId || `lastlink_${event.Id}`,
      provider_price_id: resolvedPlanType,
      status,
      plan_type: resolvedPlanType,
      plan_category: planCategory(resolvedPlanType),
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_end: event.Data.Purchase?.PaymentDate
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Estimate 30 days
        : null,
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

    // Planos de parceiro (vet/petshop) não têm login próprio — a única forma
    // de ligar o pagamento ao perfil dele no /mapa é casar o e-mail de quem
    // pagou com partners.email (o mesmo e-mail cadastrado em
    // /parceiros/cadastro). Sem isso, pagar não mudava nada no mapa.
    if (planType?.startsWith('partner_')) {
      const ativo = status === 'active';
      const { error: partnerError, count } = await supabaseAdmin
        .from('partners')
        .update({ premium: ativo, destaque: ativo }, { count: 'exact' })
        .eq('email', buyerEmail);
      if (partnerError) {
        console.error('Failed to update partner premium status:', partnerError);
      } else if (!count) {
        console.error(`Payment confirmed for ${buyerEmail} but no partners row matches this email — premium not activated on the map.`);
      }
    }

    // Send email for first payment
    if (event.Event === 'Purchase_Order_Confirmed') {
      try {
        const planName = planType?.replaceAll('_', ' ') || 'Premium';
        await resend.emails.send({
          from: 'Patinha <onboarding@resend.dev>',
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
                <a href="https://patinha-mvp.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
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
