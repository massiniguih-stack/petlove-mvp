import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Public endpoint: list partners (vets, pet shops, etc.) for the /mapa page.
// No auth required — this is public business-listing data.
export async function GET(req: NextRequest) {
  const cidade = req.nextUrl.searchParams.get('cidade');

  if (!cidade) {
    return NextResponse.json({ error: 'cidade is required' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: partners, error } = await supabaseAdmin
    .from('partners')
    .select('id, tipo, nome, endereco, bairro, cidade, telefone, instagram, website, avaliacao, premium, destaque, plantao24h, horario, servicos, lat, lng')
    .eq('cidade', cidade);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ servicos: partners || [] });
}
