import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com').split(',');

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PARTNER_TEMPLATE = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 40px 30px; text-align: center; border-radius: 0 0 24px 24px;">
    <div style="font-size: 48px; margin-bottom: 12px;">🐾</div>
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">PetLove</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0 0;">Cuidados premium para quem ama pets</p>
  </div>

  <div style="padding: 40px 30px;">
    <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">Ola, <strong>{nome}</strong>!</p>

    <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
      Voce ja conhece o <strong>PetLove</strong> e sabe como cuidamos bem dos pets. Agora, queremos te convidar para ser nosso <strong>parceiro</strong>.
    </p>

    <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
      Se voce tem um veterinario, pet shop, creche ou qualquer negocio pet, esta e a sua chance de aparecer para milhares de tutores na sua regiao.
    </p>

    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0;">
      <h3 style="color: #1e293b; font-size: 18px; font-weight: 800; margin: 0 0 16px 0;">Vantagens de ser parceiro:</h3>

      <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
        <div style="background: #ede9fe; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">📈</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Mais clientes</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Apareca para tutores que buscam servicos na sua regiao</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
        <div style="background: #fef3c7; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">💰</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Precos exclusivos</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Condicoes especiais para parceiros</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
        <div style="background: #dcfce7; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">⭐</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Perfil premium</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Destaque seu estabelecimento com selo premium</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <div style="background: #fce7f3; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">📱</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Voce tambem pode usar</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Gerencie seus proprios pets no app</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://petlove-mvp.vercel.app/parceiros/cadastro" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #9333ea); color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; letter-spacing: -0.3px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
        Quero ser parceiro
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Conheca nosso app:</p>
      <a href="https://petlove-mvp.vercel.app/app" style="color: #7c3aed; font-size: 15px; font-weight: 700; text-decoration: none;">petlove-mvp.vercel.app/app</a>
    </div>

    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
      Qualquer duvida, responda este email. Estamos aqui para ajudar!
    </p>
  </div>

  <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">PetLove - Cuidados premium para quem ama pets</p>
    <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
      <a href="https://petlove-mvp.vercel.app" style="color: #7c3aed; text-decoration: none;">petlove-mvp.vercel.app</a>
    </p>
  </div>
</div>`;

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Get all users from tutor table
  const { data: tutors, error } = await supabaseAdmin
    .from('tutor')
    .select('id, nome, email');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!tutors || tutors.length === 0) {
    return NextResponse.json({ success: true, sent: 0, message: 'No tutors found' });
  }

  let sent = 0;
  let failed = 0;

  for (const tutor of tutors) {
    if (!tutor.email) continue;

    const personalizedBody = PARTNER_TEMPLATE.replace(/\{nome\}/g, tutor.nome || 'Parceiro');

    try {
      await resend.emails.send({
        from: 'PetLove <onboarding@resend.dev>',
        to: tutor.email,
        subject: 'PetLove - Seja nosso parceiro! 🐾',
        html: personalizedBody,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${tutor.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: tutors.length });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tutorIds } = await req.json();
  const supabaseAdmin = getSupabaseAdmin();

  let query = supabaseAdmin.from('tutor').select('id, nome, email');

  if (tutorIds && tutorIds.length > 0) {
    query = query.in('id', tutorIds);
  }

  const { data: tutors, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const tutor of tutors || []) {
    if (!tutor.email) continue;

    const personalizedBody = PARTNER_TEMPLATE.replace(/\{nome\}/g, tutor.nome || 'Parceiro');

    try {
      await resend.emails.send({
        from: 'PetLove <onboarding@resend.dev>',
        to: tutor.email,
        subject: 'PetLove - Seja nosso parceiro! 🐾',
        html: personalizedBody,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${tutor.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ success: true, sent, failed });
}
