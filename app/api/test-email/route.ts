import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const to = req.nextUrl.searchParams.get('to');

  if (!to) {
    return NextResponse.json({ error: 'Missing ?to= param' }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Patinha <onboarding@resend.dev>',
      to,
      subject: 'Email de teste - Patinha',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Email de teste!</h1>
          <p>Se voce recebeu este email, o Resend esta funcionando perfeitamente.</p>
          <p style="color: #666; font-size: 14px;">Equipe Patinha</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
