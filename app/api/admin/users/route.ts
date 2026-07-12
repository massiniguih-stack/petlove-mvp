import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100);

  // List users from Supabase Auth with pagination
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
    page,
    perPage: limit,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get premium subscriptions
  const { data: subs } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, status')
    .eq('status', 'active');

  const premiumUserIds = new Set(subs?.map(s => s.user_id) || []);

  const formattedUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    is_premium: premiumUserIds.has(u.id),
    email_confirmed: u.email_confirmed_at !== null,
  }));

  return NextResponse.json({
    users: formattedUsers,
    page,
    limit,
  });
}
