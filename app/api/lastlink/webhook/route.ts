import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

// Map LastLink product IDs to plan types
// This will be populated from the lastlink_products table
async function getPlanTypeFromProductId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  productId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('lastlink_products')
    .select('plan_type')
    .eq('product_id', productId)
    .single();
  return data?.plan_type || null;
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

    // Get product ID from event
    const productId = event.Data.Subscriptions?.[0]?.ProductId ||
                      event.Data.Products?.[0]?.Id;

    let planType: string | null = null;
    if (productId) {
      planType = await getPlanTypeFromProductId(supabaseAdmin, productId);
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
    const subscriptionData = {
      user_id: user.id,
      provider_subscription_id: lastlinkSubscriptionId || `lastlink_${event.Id}`,
      provider_price_id: planType || 'unknown',
      status,
      plan_type: planType || 'unknown',
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_end: event.Data.Purchase?.PaymentDate
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Estimate 30 days
        : null,
      updated_at: new Date().toISOString(),
    };

    await supabaseAdmin.from('subscriptions').upsert(
      subscriptionData,
      { onConflict: 'user_id' }
    );

    // Send email for first payment
    if (event.Event === 'Purchase_Order_Confirmed') {
      try {
        const planName = planType?.replaceAll('_', ' ') || 'Premium';
        await resend.emails.send({
          from: 'PetLove <onboarding@resend.dev>',
          to: buyerEmail,
          subject: 'Parabéns! Você agora é Premium! 🎉',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; padding: 30px 0;">
                <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">Parabéns! 🎉</h1>
                <p style="color: #666; font-size: 16px; margin-top: 8px;">Você agora é membro Premium do PetLove</p>
              </div>
              <div style="background: linear-gradient(135deg, #fdf2f8, #f3e8ff); border-radius: 16px; padding: 24px; margin: 20px 0;">
                <h2 style="color: #7c3aed; font-size: 18px; margin: 0 0 12px 0;">Seu plano ativo:</h2>
                <p style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">${planName}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://petlove-mvp.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
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
