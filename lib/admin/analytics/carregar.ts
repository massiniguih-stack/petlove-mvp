import type { SupabaseClient } from '@supabase/supabase-js';
import { contarWhatsappPendentes, montarFilaHoje } from '@/lib/admin/filaHoje';
import { STATUS_PREMIUM } from '@/lib/assinatura';
import { ADMIN_EMAILS } from '@/lib/supabase/admin';
import { categoriaDoPlano } from './catalogo';
import { maisAntigo, montarAnalise, semEquipe, type DadosBrutos } from './montar';
import { montarPeriodo } from './periodo';
import { lerData } from './tempo';
import type { Analise, Evento, PeriodoChave, Publico, TipoEvento } from './tipos';

/** A migração 20261120_admin_eventos.sql ainda não foi rodada. */
export class TabelaAusenteError extends Error {
  constructor() {
    super('Tabela admin_eventos não existe');
    this.name = 'TabelaAusenteError';
  }
}

// O Supabase devolve no máximo 1000 linhas por consulta.
const LOTE = 1000;

export async function buscarEmLotes<T>(
  consulta: (de: number, ate: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>,
): Promise<T[]> {
  const linhas: T[] = [];
  for (let de = 0; ; de += LOTE) {
    const { data, error } = await consulta(de, de + LOTE - 1);
    if (error) throw error;
    const lote = (data ?? []) as T[];
    linhas.push(...lote);
    if (lote.length < LOTE) return linhas;
  }
}

function tabelaAusente(erro: unknown): boolean {
  const code = (erro as { code?: string } | null)?.code;
  return code === '42P01' || code === 'PGRST205';
}

interface EventoLinha {
  ocorrido_em: string;
  publico: Publico;
  tipo: TipoEvento;
  entidade_id: string;
  detalhe: Record<string, unknown> | null;
  estimado: boolean | null;
}

interface PartnerLinha {
  id: string;
  tipo: string;
  premium: boolean | null;
  user_id: string | null;
  email: string | null;
  status: string | null;
  telefone: string | null;
  whatsapp_contatado_em: string | null;
}

export async function carregarAnalise(
  supabase: SupabaseClient,
  chave: PeriodoChave,
  agora: Date = new Date(),
  emailsEquipe: string[] = ADMIN_EMAILS,
): Promise<Analise> {
  let linhasEventos: EventoLinha[];
  try {
    linhasEventos = await buscarEmLotes<EventoLinha>((de, ate) =>
      supabase
        .from('admin_eventos')
        .select('ocorrido_em, publico, tipo, entidade_id, detalhe, estimado')
        .order('id')
        .range(de, ate),
    );
  } catch (erro) {
    if (tabelaAusente(erro)) throw new TabelaAusenteError();
    throw erro;
  }

  const [equipeRes, partners] = await Promise.all([
    supabase.from('tutor').select('id').in('email', emailsEquipe),
    buscarEmLotes<PartnerLinha>((de, ate) =>
      supabase
        .from('partners')
        .select('id, tipo, premium, user_id, email, status, telefone, whatsapp_contatado_em')
        .order('id')
        .range(de, ate),
    ),
  ]);
  if (equipeRes.error) throw equipeRes.error;

  // Contas da equipe ficam fora dos gráficos: o tutor e a empresa ligada ao mesmo login.
  const idsTutorEquipe = new Set((equipeRes.data ?? []).map((t: { id: string }) => t.id));
  const idsEquipe = new Set(idsTutorEquipe);
  for (const p of partners) {
    if (p.user_id && idsTutorEquipe.has(p.user_id)) idsEquipe.add(p.id);
  }

  const eventos: Evento[] = semEquipe(
    linhasEventos.map((l) => ({
      ocorridoEm: lerData(l.ocorrido_em),
      publico: l.publico,
      tipo: l.tipo,
      entidadeId: l.entidade_id,
      detalhe: l.detalhe ?? {},
      estimado: !!l.estimado,
    })),
    idsEquipe,
  );

  const periodo = montarPeriodo(chave, agora, maisAntigo(eventos));

  const [pets, uso, assinaturas, feedbackRuimRes] = await Promise.all([
    buscarEmLotes<{ tutor_id: string; created_at: string | null }>((de, ate) =>
      supabase.from('pet').select('tutor_id, created_at').order('id').range(de, ate),
    ),
    buscarEmLotes<{ event_type: 'view' | 'whatsapp_click'; created_at: string }>((de, ate) =>
      supabase
        .from('partner_events')
        .select('event_type, created_at')
        .gte('created_at', periodo.atual.inicio.toISOString())
        .order('id')
        .range(de, ate),
    ),
    buscarEmLotes<{ plan_type: string; plan_category: string | null; user_id: string }>((de, ate) =>
      supabase
        .from('subscriptions')
        .select('plan_type, plan_category, user_id')
        .in('status', [...STATUS_PREMIUM])
        .order('id')
        .range(de, ate),
    ),
    supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('humor', 'ruim'),
  ]);
  if (feedbackRuimRes.error) throw feedbackRuimRes.error;

  const primeiroPet = new Map<string, Date>();
  for (const pet of pets) {
    if (!pet.created_at) continue;
    const quando = lerData(pet.created_at);
    const atual = primeiroPet.get(pet.tutor_id);
    if (!atual || quando < atual) primeiroPet.set(pet.tutor_id, quando);
  }

  const assinaturasAtivas = assinaturas
    .filter((s) => !idsTutorEquipe.has(s.user_id))
    .map((s) => ({ planType: s.plan_type, categoria: categoriaDoPlano(s.plan_type, s.plan_category) }));

  const fila = montarFilaHoje({
    premiumSemPainel: partners.filter((p) => p.premium && !p.user_id).length,
    pendentesComEmail: partners.filter((p) => p.email && p.status !== 'sent').length,
    whatsappPendentes: contarWhatsappPendentes(partners),
    feedbackRuim: feedbackRuimRes.count ?? 0,
  });

  const dados: DadosBrutos = {
    eventos,
    primeiroPet,
    // Empresas da equipe ficam fora do ranking "Por tipo"; a fila acima usa a lista completa.
    partners: partners
      .filter((p) => !idsEquipe.has(p.id))
      .map((p) => ({ id: p.id, tipo: p.tipo, premium: !!p.premium })),
    usoMapa: uso.map((u) => ({ ocorridoEm: lerData(u.created_at), tipo: u.event_type })),
    assinaturasAtivas,
    fila,
  };

  return montarAnalise(dados, periodo);
}
