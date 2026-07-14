import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin } from '@/lib/supabase/admin';

// Monthly price (BRL) for plan types with a known, stable price — used only
// to estimate MRR. Plans not listed here are still counted but excluded
// from the revenue estimate rather than guessed at.
const PRECO_MENSAL: Record<string, number> = {
  tutor_monthly: 19.9,
  partner_basic: 39.8,
  partner_pro: 69.8,
  partner_enterprise: 129.8,
};

function diasAtras(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const [
    partnersRes,
    tutorTotalRes,
    tutorNovos7Res,
    tutorNovos30Res,
    petTotalRes,
    subscriptionsRes,
  ] = await Promise.all([
    supabaseAdmin.from('partners').select('tipo, status, email'),
    supabaseAdmin.from('tutor').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('tutor').select('*', { count: 'exact', head: true }).gte('created_at', diasAtras(7)),
    supabaseAdmin.from('tutor').select('*', { count: 'exact', head: true }).gte('created_at', diasAtras(30)),
    supabaseAdmin.from('pet').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions').select('status, plan_type'),
  ]);

  const partners = partnersRes.data || [];
  const porTipo: Record<string, number> = {};
  let convitesEnviados = 0;
  let comEmail = 0;
  let pendentesComEmail = 0;
  for (const p of partners) {
    porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    if (p.status === 'sent') convitesEnviados++;
    if (p.email) comEmail++;
    if (p.email && p.status !== 'sent') pendentesComEmail++;
  }

  const subscriptions = subscriptionsRes.data || [];
  const ativas = subscriptions.filter((s) => s.status === 'active');
  const porPlano: Record<string, number> = {};
  let mrrEstimado = 0;
  for (const s of ativas) {
    porPlano[s.plan_type] = (porPlano[s.plan_type] || 0) + 1;
    if (PRECO_MENSAL[s.plan_type]) mrrEstimado += PRECO_MENSAL[s.plan_type];
  }

  return NextResponse.json({
    parceiros: {
      total: partners.length,
      porTipo,
      comEmail,
      convitesEnviados,
      pendentesComEmail,
    },
    tutores: {
      total: tutorTotalRes.count || 0,
      novos7dias: tutorNovos7Res.count || 0,
      novos30dias: tutorNovos30Res.count || 0,
    },
    pets: {
      total: petTotalRes.count || 0,
    },
    assinaturas: {
      ativas: ativas.length,
      porPlano,
      mrrEstimado: Math.round(mrrEstimado * 100) / 100,
    },
  });
}
