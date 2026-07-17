import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com').split(',');

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    nome, tipo, endereco, numero, complemento, bairro, cidade, uf,
    telefone, whatsapp, email, website, instagram,
    horarioAbertura, horarioFechamento, horarioEspecial,
    servicos, plantao24h, aceiteTermos,
  } = body;

  if (!nome || !email || !Array.isArray(tipo) || tipo.length === 0 || !aceiteTermos) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  const enderecoCompleto = [endereco, numero].filter(Boolean).join(', ') + (complemento ? ` - ${complemento}` : '');
  const horario = horarioEspecial || (horarioAbertura && horarioFechamento ? `${horarioAbertura} - ${horarioFechamento}` : null);

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from('partners').insert({
    tipo: tipo[0],
    nome,
    endereco: enderecoCompleto || null,
    bairro: bairro || null,
    cidade: cidade || null,
    estado: uf || null,
    telefone: whatsapp || telefone || null,
    email,
    website: website || null,
    instagram: instagram || null,
    horario,
    servicos: Array.isArray(servicos) && servicos.length > 0 ? servicos : null,
    plantao24h: !!plantao24h,
    status: 'new_signup',
  });

  if (error) {
    console.error('Erro ao salvar cadastro de parceiro:', error);
    return NextResponse.json({ error: 'Erro ao salvar cadastro' }, { status: 500 });
  }

  try {
    await resend.emails.send({
      from: 'Patinha <onboarding@resend.dev>',
      to: email,
      subject: 'Patinha - Recebemos seu cadastro! 🐾',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 30px;">
          <h1 style="color: #7c3aed;">Recebemos seu cadastro! 🎉</h1>
          <p style="color: #334155; font-size: 16px; line-height: 1.7;">Olá, <strong>${nome}</strong>!</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.7;">
            Nossa equipe vai analisar suas informações e entrar em contato em até 48 horas.
          </p>
          <p style="color: #64748b; font-size: 14px;">Qualquer dúvida, responda este email.</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('Falha ao enviar email de confirmação:', emailErr);
  }

  try {
    await resend.emails.send({
      from: 'Patinha <onboarding@resend.dev>',
      to: ADMIN_EMAILS,
      subject: `Novo cadastro de parceiro: ${nome}`,
      html: `<p>${nome} (${tipo.join(', ')}) se cadastrou em ${cidade}/${uf}. Email: ${email}. Telefone: ${whatsapp || telefone || '—'}.</p>`,
    });
  } catch (emailErr) {
    console.error('Falha ao notificar admin sobre novo cadastro:', emailErr);
  }

  return NextResponse.json({ success: true });
}
