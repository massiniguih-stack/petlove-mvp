import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { clientIp, cronAuthorized, rateLimit } from '@/lib/authz';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'gru1';

// Mantém o Supabase (plano gratuito) acordado. Ele pausa projetos após ~7
// dias sem atividade — foi o que derrubou o login com Google em 2026-11-09.
// A Vercel chama esta rota 1x por dia (ver vercel.json) e ela faz uma
// consulta mínima no banco.
//
// Proteção: se CRON_SECRET estiver configurado na Vercel, exige o token
// (a Vercel manda sozinha). Se não estiver, a rota continua funcionando — o
// ping é inofensivo (uma contagem, sem devolver dados) — mas com limite de
// tentativas por IP, pra ninguém usar isso para martelar o banco.
export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    if (!cronAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    const limited = rateLimit(`keepalive:${clientIp(req)}`, { limit: 5, windowMs: 60 * 60_000 });
    if (limited) return limited;
  }

  const { error } = await getSupabaseAdmin()
    .from('lastlink_products')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Keepalive: Supabase não respondeu:', error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
