import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com').split(',');

const cadastroSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  tipo: z.array(z.enum(['veterinario', 'petshop', 'creche', 'hotel', 'petsitter', 'parque'])).min(1),
  descricao: z.string().trim().max(2000).optional(),
  endereco: z.string().trim().max(200).optional(),
  numero: z.string().trim().max(20).optional(),
  complemento: z.string().trim().max(100).optional(),
  bairro: z.string().trim().max(100).optional(),
  cidade: z.string().trim().max(100).optional(),
  uf: z.string().trim().length(2).optional(),
  telefone: z.string().trim().max(20).optional(),
  whatsapp: z.string().trim().max(20).optional(),
  email: z.string().trim().email().max(200),
  website: z.string().trim().url().max(200).optional().or(z.literal('')),
  instagram: z.string().trim().max(100).optional(),
  horarioAbertura: z.string().trim().max(20).optional(),
  horarioFechamento: z.string().trim().max(20).optional(),
  horarioEspecial: z.string().trim().max(100).optional(),
  servicos: z.array(z.string().trim().max(50)).max(20).optional(),
  plantao24h: z.boolean().optional(),
  aceiteTermos: z.literal(true, { message: 'É preciso aceitar os termos' }),
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export async function POST(req: NextRequest) {
  const parsed = cadastroSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Dados inválidos' }, { status: 400 });
  }
  const {
    nome, tipo, descricao, endereco, numero, complemento, bairro, cidade, uf,
    telefone, whatsapp, email, website, instagram,
    horarioAbertura, horarioFechamento, horarioEspecial,
    servicos, plantao24h,
  } = parsed.data;

  const enderecoCompleto = [endereco, numero].filter(Boolean).join(', ') + (complemento ? ` - ${complemento}` : '');
  const horario = horarioEspecial || (horarioAbertura && horarioFechamento ? `${horarioAbertura} - ${horarioFechamento}` : null);

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from('partners').insert({
    tipo: tipo[0],
    nome,
    descricao: descricao || null,
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
          <p style="color: #334155; font-size: 16px; line-height: 1.7;">Olá, <strong>${escapeHtml(nome)}</strong>!</p>
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
      html: `<p>${escapeHtml(nome)} (${tipo.join(', ')}) se cadastrou em ${escapeHtml(cidade || '—')}/${escapeHtml(uf || '—')}. Email: ${escapeHtml(email)}. Telefone: ${escapeHtml(whatsapp || telefone || '—')}.</p>`,
    });
  } catch (emailErr) {
    console.error('Falha ao notificar admin sobre novo cadastro:', emailErr);
  }

  return NextResponse.json({ success: true });
}
