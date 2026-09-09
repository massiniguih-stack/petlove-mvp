import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin, isAdmin, ADMIN_EMAILS } from '@/lib/supabase/admin';
import { isOpenAccess } from '@/lib/openAccess';

// Preços mensais (BRL) para estimar MRR — só planos com valor estável.
const PRECO_MENSAL: Record<string, number> = {
  tutor_monthly: 29.49,
  tutor_annual: 238.8 / 12,
  // Parceiro virou 100% anual em 12x (sem juros) a partir de 2026-09 — o
  // valor aqui é a parcela mensal, igual ao exibido em /parceiros/premium.
  partner_basic: 19.98,
  partner_annual: 238.8 / 12,
  partner_pro: 49.69,
  partner_enterprise: 68.9,
};

function diasAtras(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((!user || !isAdmin(user.email)) && !isOpenAccess()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Contas de admin não contam como clientes nas métricas.
  const emailsAdminLista = `(${ADMIN_EMAILS.map((e) => `"${e}"`).join(',')})`;
  const { data: tutoresAdmin } = await supabaseAdmin
    .from('tutor')
    .select('id')
    .in('email', ADMIN_EMAILS);
  const idsAdmin = (tutoresAdmin || []).map((t) => t.id);
  const idsAdminLista =
    idsAdmin.length > 0
      ? `(${idsAdmin.join(',')})`
      : '(00000000-0000-0000-0000-000000000000)';

  const [
    partnersRes,
    tutorTotalRes,
    tutorNovos7Res,
    tutorNovos30Res,
    petTotalRes,
    petEquipeRes,
    subscriptionsRes,
    eventosRes,
    eventos7Res,
    servicosRealizadosRes,
    feedbackRes,
    feedback7Res,
    pushRes,
  ] = await Promise.all([
    supabaseAdmin
      .from('partners')
      .select('tipo, status, email, user_id, premium, destaque'),
    supabaseAdmin
      .from('tutor')
      .select('*', { count: 'exact', head: true })
      .not('email', 'in', emailsAdminLista),
    supabaseAdmin
      .from('tutor')
      .select('*', { count: 'exact', head: true })
      .not('email', 'in', emailsAdminLista)
      .gte('created_at', diasAtras(7)),
    supabaseAdmin
      .from('tutor')
      .select('*', { count: 'exact', head: true })
      .not('email', 'in', emailsAdminLista)
      .gte('created_at', diasAtras(30)),
    supabaseAdmin
      .from('pet')
      .select('*', { count: 'exact', head: true })
      .not('tutor_id', 'in', idsAdminLista),
    supabaseAdmin
      .from('pet')
      .select('*', { count: 'exact', head: true })
      .in('tutor_id', idsAdmin.length > 0 ? idsAdmin : ['00000000-0000-0000-0000-000000000000']),
    supabaseAdmin
      .from('subscriptions')
      .select('status, plan_type, plan_category, user_id')
      .not('user_id', 'in', idsAdminLista),
    supabaseAdmin
      .from('partner_events')
      .select('event_type')
      .gte('created_at', diasAtras(30)),
    supabaseAdmin
      .from('partner_events')
      .select('event_type')
      .gte('created_at', diasAtras(7)),
    supabaseAdmin
      .from('service_logs')
      .select('origem')
      .gte('created_at', diasAtras(30)),
    supabaseAdmin.from('feedback').select('humor'),
    supabaseAdmin
      .from('feedback')
      .select('humor')
      .gte('created_at', diasAtras(7)),
    supabaseAdmin
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true }),
  ]);

  const partners = partnersRes.data || [];
  const porTipo: Record<string, number> = {};
  let convitesEnviados = 0;
  let comEmail = 0;
  let pendentesComEmail = 0;
  let painelAtivado = 0;
  let premiumSemPainel = 0;
  let pagos = 0;
  let gratuitos = 0;
  let comDestaque = 0;
  for (const p of partners) {
    porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    if (p.status === 'sent') convitesEnviados++;
    if (p.email) comEmail++;
    if (p.email && p.status !== 'sent') pendentesComEmail++;
    if (p.user_id) painelAtivado++;
    if (p.premium && !p.user_id) premiumSemPainel++;
    if (p.premium) pagos++;
    else gratuitos++;
    if (p.destaque) comDestaque++;
  }

  const eventos = eventosRes.data || [];
  const eventos7 = eventos7Res.data || [];
  const visualizacoes30dias = eventos.filter((e) => e.event_type === 'view').length;
  const whatsappCliques30dias = eventos.filter((e) => e.event_type === 'whatsapp_click').length;
  const visualizacoes7dias = eventos7.filter((e) => e.event_type === 'view').length;
  const whatsappCliques7dias = eventos7.filter((e) => e.event_type === 'whatsapp_click').length;

  const servicosRealizados = servicosRealizadosRes.data || [];
  const registradosPorParceiros30dias = servicosRealizados.filter((s) => s.origem === 'parceiro').length;
  const confirmadosPorTutores30dias = servicosRealizados.filter((s) => s.origem === 'tutor').length;

  const subscriptions = subscriptionsRes.data || [];
  const ativas = subscriptions.filter((s) => s.status === 'active');
  const porPlano: Record<string, number> = {};
  let mrrEstimado = 0;
  let tutorPremium = 0;
  let partnerPremium = 0;
  for (const s of ativas) {
    porPlano[s.plan_type] = (porPlano[s.plan_type] || 0) + 1;
    if (PRECO_MENSAL[s.plan_type]) mrrEstimado += PRECO_MENSAL[s.plan_type];
    const cat =
      s.plan_category ||
      (typeof s.plan_type === 'string' && s.plan_type.startsWith('partner_')
        ? 'partner'
        : 'tutor');
    if (cat === 'partner') partnerPremium++;
    else tutorPremium++;
  }

  const tutoresTotal = tutorTotalRes.count || 0;
  const tutoresFree = Math.max(0, tutoresTotal - tutorPremium);

  const humores = feedbackRes.data || [];
  const resumoFeedback = { otimo: 0, ok: 0, ruim: 0 };
  for (const f of humores) {
    if (f.humor in resumoFeedback) {
      resumoFeedback[f.humor as keyof typeof resumoFeedback]++;
    }
  }
  const feedbackTotal = humores.length;
  const feedback7dias = (feedback7Res.data || []).length;
  const satisfacaoPct =
    feedbackTotal > 0
      ? Math.round((resumoFeedback.otimo / feedbackTotal) * 100)
      : 0;

  return NextResponse.json({
    parceiros: {
      total: partners.length,
      porTipo,
      comEmail,
      convitesEnviados,
      pendentesComEmail,
      painelAtivado,
      premiumSemPainel,
      gratuitos,
      pagos,
      comDestaque,
    },
    tutores: {
      total: tutoresTotal,
      novos7dias: tutorNovos7Res.count || 0,
      novos30dias: tutorNovos30Res.count || 0,
      free: tutoresFree,
      premium: tutorPremium,
    },
    pets: {
      total: petTotalRes.count || 0,
    },
    equipe: {
      tutores: idsAdmin.length,
      pets: petEquipeRes.count || 0,
    },
    assinaturas: {
      ativas: ativas.length,
      porPlano,
      mrrEstimado: Math.round(mrrEstimado * 100) / 100,
      tutorPremium,
      partnerPremium,
    },
    acesso: {
      // Proxy de uso real do app (não temos pageview global; usamos sinais do produto)
      mapaViews7dias: visualizacoes7dias,
      mapaViews30dias: visualizacoes30dias,
      whatsappCliques7dias,
      whatsappCliques30dias,
      atendimentos30dias:
        registradosPorParceiros30dias + confirmadosPorTutores30dias,
      pushDevices: pushRes.count || 0,
    },
    mapa30dias: {
      visualizacoes: visualizacoes30dias,
      whatsappCliques: whatsappCliques30dias,
    },
    servicos30dias: {
      registradosPorParceiros: registradosPorParceiros30dias,
      confirmadosPorTutores: confirmadosPorTutores30dias,
    },
    feedback: {
      total: feedbackTotal,
      novos7dias: feedback7dias,
      resumo: resumoFeedback,
      satisfacaoPct,
    },
  });
}
