import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { publicSupabaseFailure, withOneRetry } from '@/lib/supabase/errors';

// Roda em São Paulo. A função em Ashburn (iad1) estava recebendo
// Cloudflare 521 ao falar com o Supabase e o mapa ficava vazio.
export const preferredRegion = 'gru1';
export const dynamic = 'force-dynamic';

const PARTNER_COLUMNS =
  'id, tipo, nome, endereco, bairro, cidade, telefone, instagram, website, avaliacao, premium, destaque, plantao24h, horario, servicos, lat, lng';

function fail(raw: unknown) {
  const failure = publicSupabaseFailure(raw);
  return NextResponse.json(
    { error: failure.error, code: failure.code },
    { status: failure.status }
  );
}

function listPartners(cidade: string) {
  return getSupabaseAdmin()
    .from('partners')
    .select(PARTNER_COLUMNS)
    .eq('cidade', cidade);
}

// Public endpoint: list partners (vets, pet shops, etc.) for the /mapa page.
// No auth required — this is public business-listing data.
export async function GET(req: NextRequest) {
  const cidade = req.nextUrl.searchParams.get('cidade');

  if (!cidade) {
    return NextResponse.json({ error: 'cidade is required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your_supabase')
  ) {
    return NextResponse.json(
      {
        error:
          'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL real no .env (não use placeholder).',
        code: 'SUPABASE_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }

  try {
    const { data: partners, error } = await withOneRetry(listPartners.bind(null, cidade), (result) =>
      Boolean(result.error)
    );

    if (error) {
      return fail(error.message);
    }

    return NextResponse.json({ servicos: partners || [] });
  } catch (err) {
    return fail(err);
  }
}
