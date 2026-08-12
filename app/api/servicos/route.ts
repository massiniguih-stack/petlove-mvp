import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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
    const supabaseAdmin = getSupabaseAdmin();

    const { data: partners, error } = await supabaseAdmin
      .from('partners')
      .select(
        'id, tipo, nome, endereco, bairro, cidade, telefone, instagram, website, avaliacao, premium, destaque, plantao24h, horario, servicos, lat, lng'
      )
      .eq('cidade', cidade);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ servicos: partners || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar serviços';
    // "fetch failed" = DNS/rede/URL do Supabase inacessível
    return NextResponse.json(
      {
        error: message,
        code: 'SUPABASE_UNREACHABLE',
        hint: 'Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local',
      },
      { status: 503 }
    );
  }
}
