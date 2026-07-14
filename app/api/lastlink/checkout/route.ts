import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getLastlinkCheckoutUrl, isValidPlanType } from '@/lib/lastlink';

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
    const { error: upsertError } = await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: user.id,
        provider_subscription_id: `pending_${user.id}_${Date.now()}`,
        provider_price_id: planType,
        status: 'pending',
        plan_type: planType,
      },
      { onConflict: 'user_id' }
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
