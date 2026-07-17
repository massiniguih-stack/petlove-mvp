import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, to, subject, html } = await req.json();

  // Email notification to an arbitrary recipient — only the admin panel
  // (app/admin/emails) is allowed to do this; everyone else can only
  // trigger the fixed templates below, always sent to their own address.
  if (type === 'email' && to && subject && html) {
    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
      const { data, error } = await resend.emails.send({
        from: 'Patinha <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: data?.id });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  }

  // Welcome email
  if (type === 'welcome') {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Patinha <onboarding@resend.dev>',
        to: user.email!,
        subject: 'Bem-vindo ao Patinha! 🐾',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed;">Bem-vindo ao Patinha!</h1>
            <p>Ola! Estamos muito felizes em ter voce conosco.</p>
            <p>Com o Patinha, voce pode:</p>
            <ul>
              <li>Cadastrar seu pet com perfil completo</li>
              <li>Acompanhar o peso e saude</li>
              <li>Receber alertas de vacinas</li>
              <li>Encontrar servicos perto de voce</li>
            </ul>
            <a href="https://petlove-mvp.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
              Acessar Dashboard
            </a>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">
              Qualquer duvida, responda este email.
            </p>
          </div>
        `,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: data?.id });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
    }
  }

  // Premium confirmation email
  if (type === 'premium') {
    const { planName } = await req.json();
    try {
      const { data, error } = await resend.emails.send({
        from: 'Patinha <onboarding@resend.dev>',
        to: user.email!,
        subject: 'Parabens! Voce agora e Premium! 🎉',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 30px 0;">
              <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">Parabens! 🎉</h1>
              <p style="color: #666; font-size: 16px; margin-top: 8px;">Voce agora e membro Premium do Patinha</p>
            </div>
            <div style="background: linear-gradient(135deg, #fdf2f8, #f3e8ff); border-radius: 16px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #7c3aed; font-size: 18px; margin: 0 0 12px 0;">Seu plano ativo:</h2>
              <p style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">${planName || 'Premium'}</p>
            </div>
            <h3 style="color: #333; font-size: 16px;">Agora voce tem acesso a:</h3>
            <ul style="color: #555; line-height: 1.8;">
              <li>Cadastro ilimitado de pets</li>
              <li>Controle de peso avancado</li>
              <li>Linha do tempo completa</li>
              <li>Mapa de servicos premium</li>
              <li>Relatorios de desempenho</li>
              <li>Suporte prioritario</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://petlove-mvp.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Acessar Dashboard
              </a>
            </div>
            <p style="color: #999; font-size: 13px; text-align: center; margin-top: 30px;">
              Para gerenciar sua assinatura, acesse Configuracoes > Assinatura.
            </p>
          </div>
        `,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: data?.id });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to send premium email' }, { status: 500 });
    }
  }

  // Vaccine reminder email
  if (type === 'vaccine_reminder') {
    const { petName, vaccineName, dueDate } = await req.json();
    try {
      const { data, error } = await resend.emails.send({
        from: 'Patinha <onboarding@resend.dev>',
        to: user.email!,
        subject: `Lembrete: Vacina ${vaccineName} do ${petName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed;">Lembrete de Vacina 🐾</h1>
            <p>A vacina <strong>${vaccineName}</strong> do <strong>${petName}</strong> esta programada para <strong>${dueDate}</strong>.</p>
            <p>Nao esqueca de agendar a consulta com o veterinario!</p>
            <a href="https://petlove-mvp.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
              Ver Dashboard
            </a>
          </div>
        `,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: data?.id });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to send vaccine reminder' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
