import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getLastlinkCheckoutUrl, isValidPlanType, planCategory } from '@/lib/lastlink';
import { STATUS_PREMIUM } from '@/lib/assinatura';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await request.json();

    if (!planType || !isValidPlanType(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const checkoutUrl = getLastlinkCheckoutUrl(planType);

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Checkout URL not configured' }, { status: 500 });
    }

    // Store pending checkout in metadata (webhook will confirm).
    // subscriptions has no RLS write policy for regular users (service role
    // handles all writes), so this must go through the admin client.
    const supabaseAdmin = getSupabaseAdmin();

    // Quem já tem assinatura ativa nesta categoria não abre outro checkout:
    // o upsert abaixo trocaria a linha ativa por "pending" e a pessoa
    // perderia o Premium que já pagou.
    const { data: ativa } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('plan_category', planCategory(planType))
      .in('status', [...STATUS_PREMIUM])
      .limit(1)
      .maybeSingle();

    if (ativa) {
      return NextResponse.json(
        { error: 'Você já tem uma assinatura ativa.', jaAssinante: true },
        { status: 409 }
      );
    }

    const { error: upsertError } = await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: user.id,
        provider_subscription_id: `pending_${user.id}_${Date.now()}`,
        provider_price_id: planType,
        status: 'pending',
        plan_type: planType,
        plan_category: planCategory(planType),
      },
      { onConflict: 'user_id,plan_category' }
    );

    if (upsertError) {
      console.error('Failed to store pending checkout:', upsertError);
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
