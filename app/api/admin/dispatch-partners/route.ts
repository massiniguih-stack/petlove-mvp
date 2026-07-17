import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin } from '@/lib/supabase/admin';
import { getEstadoByCidade } from '@/lib/cidadeEstado';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET: Fetch all users grouped by state
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100);
  const offset = (page - 1) * limit;

  const { count } = await supabaseAdmin
    .from('tutor')
    .select('*', { count: 'exact', head: true });

  const { data: tutors, error } = await supabaseAdmin
    .from('tutor')
    .select('id, nome, email, cidade')
    .order('nome')
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get sent status
  const { data: sentData } = await supabaseAdmin
    .from('partner_sends')
    .select('user_id, status, sent_at')
    .eq('status', 'sent');

  const sentMap = new Map(sentData?.map(s => [s.user_id, s.sent_at]) || []);

  // Group by state
  const byState: Record<string, unknown[]> = {};
  for (const tutor of tutors || []) {
    const estado = getEstadoByCidade(tutor.cidade);
    if (!byState[estado]) byState[estado] = [];
    byState[estado].push({
      ...tutor,
      estado,
      sent: sentMap.has(tutor.id),
      sentAt: sentMap.get(tutor.id),
    });
  }

  // Sort states
  const sortedStates = Object.keys(byState).sort();

  return NextResponse.json({
    users: byState,
    states: sortedStates,
    total: count || 0,
    totalSent: sentMap.size,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST: Send emails to a batch of users
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userIds, subject, html } = await req.json();
  const supabaseAdmin = getSupabaseAdmin();

  if (!userIds || userIds.length === 0) {
    return NextResponse.json({ error: 'No users selected' }, { status: 400 });
  }

  if (!subject || !html) {
    return NextResponse.json({ error: 'Subject and html required' }, { status: 400 });
  }

  // Limit to 100 per batch
  const batch = userIds.slice(0, 100);

  // Get users
  const { data: tutors } = await supabaseAdmin
    .from('tutor')
    .select('id, nome, email, cidade')
    .in('id', batch);

  let sent = 0;
  let failed = 0;

  // Send emails in parallel batches of 10
  const BATCH_SIZE = 10;
  const tutorsToSend = (tutors || []).filter(t => t.email);

  for (let i = 0; i < tutorsToSend.length; i += BATCH_SIZE) {
    const chunk = tutorsToSend.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      chunk.map(async (tutor) => {
        const personalizedBody = html.replace(/\{nome\}/g, tutor.nome || 'Parceiro');
        const personalizedSubject = subject.replace(/\{nome\}/g, tutor.nome || 'Parceiro');

        await resend.emails.send({
          from: 'Patinha <onboarding@resend.dev>',
          to: tutor.email,
          subject: personalizedSubject,
          html: personalizedBody,
        });

        await supabaseAdmin.from('partner_sends').upsert({
          user_id: tutor.id,
          email: tutor.email,
          nome: tutor.nome,
          estado: getEstadoByCidade(tutor.cidade),
          status: 'sent',
          sent_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        return tutor;
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') sent++;
      else {
        console.error('Failed to send:', result.reason);
        failed++;
      }
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: batch.length });
}
