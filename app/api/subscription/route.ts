import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isPremium: false, plan: null, status: null });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ isPremium: false, plan: null, status: null });
    }

    return NextResponse.json({
      isPremium: subscription.status === 'active',
      plan: subscription.plan_type,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json({ isPremium: false, plan: null, status: null });
  }
}
