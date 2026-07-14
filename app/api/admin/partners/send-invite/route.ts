import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildInviteEmail(nome: string) {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 40px 30px; text-align: center; border-radius: 0 0 24px 24px;">
    <div style="font-size: 48px; margin-bottom: 12px;">🐾</div>
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0;">PetLove</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0 0;">Cuidados premium para quem ama pets</p>
  </div>
  <div style="padding: 40px 30px;">
    <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">Olá, <strong>${nome}</strong>!</p>
    <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
      Encontramos a <strong>${nome}</strong> no mapa de serviços pet da sua região e gostaríamos de convidar vocês para serem nossos <strong>parceiros Premium</strong> no PetLove.
    </p>
    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0;">
      <h3 style="color: #1e293b; font-size: 18px; font-weight: 800; margin: 0 0 16px 0;">Vantagens de ser parceiro:</h3>
      <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">📈 Destaque no topo do mapa para tutores da sua região</p>
      <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">⭐ Selo de credibilidade no seu perfil</p>
      <p style="color: #64748b; font-size: 14px; margin: 0;">💬 Botão de WhatsApp direto no perfil</p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://petlove-mvp.vercel.app/parceiros/cadastro" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #9333ea); color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">
        Quero ser parceiro
      </a>
    </div>
    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
      Qualquer dúvida, responda este email. Estamos aqui para ajudar!
    </p>
  </div>
</div>`;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids is required' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: partners, error } = await supabaseAdmin
    .from('partners')
    .select('id, nome, email')
    .in('id', ids.slice(0, 200));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const partner of partners || []) {
    if (!partner.email) {
      skipped++;
      continue;
    }

    try {
      await resend.emails.send({
        from: 'PetLove <onboarding@resend.dev>',
        to: partner.email,
        subject: 'PetLove - Seja nosso parceiro! 🐾',
        html: buildInviteEmail(partner.nome),
      });

      await supabaseAdmin
        .from('partners')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', partner.id);

      sent++;
    } catch (err) {
      console.error(`Failed to send invite to ${partner.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ success: true, sent, failed, skipped });
}
