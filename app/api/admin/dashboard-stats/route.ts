import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin, ADMIN_EMAILS } from '@/lib/supabase/admin';

// Monthly price (BRL) for plan types with a known, stable price — used only
// to estimate MRR. Plans not listed here are still counted but excluded
// from the revenue estimate rather than guessed at.
const PRECO_MENSAL: Record<string, number> = {
  tutor_monthly: 19.9,
  tutor_annual: 115 / 12, // R$115/ano (ver lastlink_products) convertido pra equivalente mensal
  partner_basic: 39.8,
  partner_annual: 238.8 / 12, // R$238,80/ano · ~50% off vs 12× mensal
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

  // Contas de admin (o time interno) não são "clientes" — excluídas das
  // métricas de tutores/pets pra não inflar os números com quem só está
  // usando a própria conta pra testar o app.
  const emailsAdminLista = `(${ADMIN_EMAILS.map((e) => `"${e}"`).join(',')})`;
  const { data: tutoresAdmin } = await supabaseAdmin.from('tutor').select('id').in('email', ADMIN_EMAILS);
  const idsAdmin = (tutoresAdmin || []).map((t) => t.id);
  const idsAdminLista = idsAdmin.length > 0 ? `(${idsAdmin.join(',')})` : '(00000000-0000-0000-0000-000000000000)';

  const [
    partnersRes,
    tutorTotalRes,
    tutorNovos7Res,
    tutorNovos30Res,
    petTotalRes,
    subscriptionsRes,
    eventosRes,
    servicosRealizadosRes,
  ] = await Promise.all([
    supabaseAdmin.from('partners').select('tipo, status, email, user_id, premium'),
    supabaseAdmin.from('tutor').select('*', { count: 'exact', head: true }).not('email', 'in', emailsAdminLista),
    supabaseAdmin.from('tutor').select('*', { count: 'exact', head: true }).not('email', 'in', emailsAdminLista).gte('created_at', diasAtras(7)),
    supabaseAdmin.from('tutor').select('*', { count: 'exact', head: true }).not('email', 'in', emailsAdminLista).gte('created_at', diasAtras(30)),
    supabaseAdmin.from('pet').select('*', { count: 'exact', head: true }).not('tutor_id', 'in', idsAdminLista),
    supabaseAdmin.from('subscriptions').select('status, plan_type').not('user_id', 'in', idsAdminLista),
    supabaseAdmin.from('partner_events').select('event_type').gte('created_at', diasAtras(30)),
    supabaseAdmin.from('service_logs').select('origem').gte('created_at', diasAtras(30)),
  ]);

  const partners = partnersRes.data || [];
  const porTipo: Record<string, number> = {};
  let convitesEnviados = 0;
  let comEmail = 0;
  let pendentesComEmail = 0;
  let painelAtivado = 0;
  let premiumSemPainel = 0;
  for (const p of partners) {
    porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    if (p.status === 'sent') convitesEnviados++;
    if (p.email) comEmail++;
    if (p.email && p.status !== 'sent') pendentesComEmail++;
    if (p.user_id) painelAtivado++;
    if (p.premium && !p.user_id) premiumSemPainel++;
  }

  const eventos = eventosRes.data || [];
  const visualizacoes30dias = eventos.filter((e) => e.event_type === 'view').length;
  const whatsappCliques30dias = eventos.filter((e) => e.event_type === 'whatsapp_click').length;

  const servicosRealizados = servicosRealizadosRes.data || [];
  const registradosPorParceiros30dias = servicosRealizados.filter((s) => s.origem === 'parceiro').length;
  const confirmadosPorTutores30dias = servicosRealizados.filter((s) => s.origem === 'tutor').length;

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
      painelAtivado,
      premiumSemPainel,
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
    mapa30dias: {
      visualizacoes: visualizacoes30dias,
      whatsappCliques: whatsappCliques30dias,
    },
    servicos30dias: {
      registradosPorParceiros: registradosPorParceiros30dias,
      confirmadosPorTutores: confirmadosPorTutores30dias,
    },
  });
}
