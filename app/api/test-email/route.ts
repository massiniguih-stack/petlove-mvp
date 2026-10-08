import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { allowedTestEmail, requireAdmin } from '@/lib/authz';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const to = req.nextUrl.searchParams.get('to');

  if (!to || !allowedTestEmail(to, ADMIN_EMAILS)) {
    return NextResponse.json({ error: 'Destino de teste inválido' }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
