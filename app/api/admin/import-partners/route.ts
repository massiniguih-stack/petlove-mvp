import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin } from '@/lib/supabase/admin';
import { getEstadoByCidade } from '@/lib/cidadeEstado';
import { servicosMock } from '@/data/servicos';

async function checkAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return null;
  }
  return user;
}

// POST: Import all services from servicosMock into partners table
export async function POST(req: NextRequest) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Check if partners already exist
  const { count } = await supabaseAdmin.from('partners').select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    return NextResponse.json({ error: 'Parceiros ja importados', count });
  }

  // Import all services in batches of 50
  const rows = servicosMock.map(s => ({
    tipo: s.tipo,
    nome: s.nome,
    endereco: s.endereco || null,
    bairro: s.bairro || null,
    cidade: s.cidade || null,
    estado: getEstadoByCidade(s.cidade),
    telefone: s.telefone || null,
    instagram: s.instagram || null,
    website: s.website || null,
    avaliacao: s.avaliacao || null,
    premium: s.premium || false,
    status: 'pending',
    lat: s.lat ?? null,
    lng: s.lng ?? null,
    servicos: s.servicos || null,
    horario: s.horario || null,
    destaque: s.destaque || false,
    plantao24h: s.plantao24h || false,
  }));

  let imported = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabaseAdmin.from('partners').insert(batch);
    if (error) {
      return NextResponse.json({ error: error.message, batch: i }, { status: 500 });
    }
    imported += batch.length;
  }

  return NextResponse.json({ success: true, imported });
}

// GET: Fetch partners grouped by state with pagination
export async function GET(req: NextRequest) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 500);
  const offset = (page - 1) * limit;

  const { count } = await supabaseAdmin
    .from('partners')
    .select('*', { count: 'exact', head: true });

  const { data: partners, error } = await supabaseAdmin
    .from('partners')
    .select('*')
    .order('estado')
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by state
  const byState: Record<string, any[]> = {};
  for (const p of partners || []) {
    const estado = p.estado || 'OUTRO';
    if (!byState[estado]) byState[estado] = [];
    byState[estado].push(p);
  }

  const states = Object.keys(byState).sort();

  return NextResponse.json({
    partners: byState,
    states,
    total: count || 0,
    totalSent: partners?.filter(p => p.status === 'sent').length || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// PATCH: Update partner email
export async function PATCH(req: NextRequest) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, email } = await req.json();
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from('partners')
    .update({ email })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
