import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STATUS_PREMIUM, statusDaPremium } from '@/lib/assinatura';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isPremium: false, plan: null, status: null });
    }

    // Uma conta pode ter uma assinatura de tutor e outra de parceiro ao
    // mesmo tempo (ver plan_category) — esta rota alimenta isPremium do
    // app do tutor, então precisa olhar só pra categoria tutor.
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .eq('plan_category', 'tutor')
      .in('status', [...STATUS_PREMIUM])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ isPremium: false, plan: null, status: null });
    }

    return NextResponse.json({
      isPremium: statusDaPremium(subscription.status),
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
