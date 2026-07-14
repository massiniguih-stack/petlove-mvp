import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);
  const offset = (page - 1) * limit;

  const { count } = await supabaseAdmin
    .from('tutor')
    .select('*', { count: 'exact', head: true });

  const { data: tutors, error } = await supabaseAdmin
    .from('tutor')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }

  return NextResponse.json({
    data: tutors || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
