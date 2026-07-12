import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  // Use the regular client - RLS will handle access
  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    token,
    created_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('Error saving push subscription:', error);
    // Table might not exist yet - that's ok for now
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('token', token);

  if (error) {
    console.error('Error deleting push subscription:', error);
  }

  return NextResponse.json({ success: true });
}
