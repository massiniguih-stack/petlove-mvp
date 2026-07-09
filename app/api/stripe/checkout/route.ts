import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petlove-mvp.vercel.app';

const PRICE_MAP: Record<string, string> = {
  tutor_monthly: process.env.STRIPE_PRICE_TUTOR_MONTHLY!,
  tutor_annual: process.env.STRIPE_PRICE_TUTOR_ANNUAL!,
  partner_basic: process.env.STRIPE_PRICE_PARTNER_BASIC!,
  partner_pro: process.env.STRIPE_PRICE_PARTNER_PRO!,
  partner_enterprise: process.env.STRIPE_PRICE_PARTNER_ENTERPRISE!,
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await request.json();

    if (!planType || !PRICE_MAP[planType]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const priceId = PRICE_MAP[planType];

    // Get or create Stripe customer
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = existingCustomer?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/planos`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: planType,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
