import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petlove-mvp.vercel.app';

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${APP_URL}/conta/assinatura`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
