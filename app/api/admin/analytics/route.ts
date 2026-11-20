import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/authz';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isOpenAccess } from '@/lib/openAccess';
import { carregarAnalise, TabelaAusenteError } from '@/lib/admin/analytics/carregar';
import { analiseDeExemplo } from '@/lib/admin/analytics/exemplo';
import { PERIODO_PADRAO } from '@/lib/admin/analytics/periodo';
import { PERIODOS } from '@/lib/admin/analytics/tipos';

export const dynamic = 'force-dynamic';

const PeriodoSchema = z.enum(PERIODOS);

export async function GET(req: NextRequest) {
  const periodo = PeriodoSchema.safeParse(req.nextUrl.searchParams.get('periodo') ?? PERIODO_PADRAO);
  if (!periodo.success) {
    return NextResponse.json({ error: 'Período inválido. Use 7d, 30d, 90d ou tudo.' }, { status: 400 });
  }

  // Só local: isOpenAccess() é sempre falso em produção na Vercel, e os dados são inventados.
  if (isOpenAccess() && process.env.ANALISE_EXEMPLO === '1') {
    return NextResponse.json(analiseDeExemplo(periodo.data, new Date()));
  }

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    return NextResponse.json(await carregarAnalise(getSupabaseAdmin(), periodo.data));
  } catch (erro) {
    if (erro instanceof TabelaAusenteError) {
      return NextResponse.json(
        { error: 'Rode a migração 20261120_admin_eventos.sql no Supabase.' },
        { status: 503 },
      );
    }
    console.error('admin analytics:', erro);
    return NextResponse.json({ error: 'Erro ao carregar a análise' }, { status: 500 });
  }
}
