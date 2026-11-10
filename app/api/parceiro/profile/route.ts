import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOwnPartner } from '@/lib/partner';

export async function GET() {
  const { user, partner } = await getOwnPartner();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ partner });
}

// Campos que o próprio parceiro pode editar. status/premium/destaque/email/
// user_id ficam de fora — só admin ou o webhook de pagamento mexem nesses.
// Tudo passa por validação: tamanho máximo e site só http(s), pra ninguém
// pendurar um link malicioso (ex.: "javascript:") no perfil exibido aos tutores.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

const profileSchema = z
  .object({
    descricao: optionalText(2000),
    telefone: optionalText(20),
    instagram: z
      .string()
      .trim()
      .max(100)
      .nullable()
      .optional()
      .transform((v) => (v ? v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/+$/, '') : null))
      .refine((v) => v == null || /^[A-Za-z0-9._]{1,30}$/.test(v), 'Instagram inválido (use só o @ do perfil)'),
    website: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .optional()
      .transform((v) => (v ? (/^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`) : null))
      .refine((v) => {
        if (v == null) return true;
        try {
          const url = new URL(v);
          return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('.');
        } catch {
          return false;
        }
      }, 'Site inválido (ex.: https://suaclinica.com.br)'),
    horario: optionalText(100),
    plantao24h: z.boolean().optional(),
    servicos: z.array(z.string().trim().min(1).max(50)).max(20).nullable().optional(),
  })
  .strip();

export async function PATCH(req: NextRequest) {
  const { user, partner } = await getOwnPartner();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!partner) {
    return NextResponse.json({ error: 'Nenhum parceiro vinculado a esta conta' }, { status: 404 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(raw ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Dados inválidos' }, { status: 400 });
  }

  // Só grava o que veio no corpo (PATCH parcial).
  const updates: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(parsed.data)) {
    if (raw && typeof raw === 'object' && field in raw) updates[field] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('partners')
    .update(updates)
    .eq('id', partner.id)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Failed to update partner profile:', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }

  return NextResponse.json({ partner: data });
}
