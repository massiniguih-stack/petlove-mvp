// Dados inventados para conferir a tela localmente, sem as chaves do Supabase.
// Só são usados quando isOpenAccess() e ANALISE_EXEMPLO=1 (ver a rota).
import { montarFilaHoje } from '@/lib/admin/filaHoje';
import { maisAntigo, montarAnalise, type DadosBrutos } from './montar';
import { montarPeriodo } from './periodo';
import type { Analise, Evento, PeriodoChave, TipoEvento } from './tipos';

const DIA_MS = 24 * 60 * 60 * 1000;
const HORA_MS = 60 * 60 * 1000;
const ORIGENS = ['instagram', 'google', '', 'whatsapp'];
const TIPOS = ['veterinario', 'petshop', 'creche', 'hotel', 'petsitter'];

export function dadosExemplo(agora: Date): DadosBrutos {
  const eventos: Evento[] = [];
  const antesDe = (dias: number, horas = 0) => new Date(agora.getTime() - dias * DIA_MS - horas * HORA_MS);
  const limiteEstimado = antesDe(60);
  const add = (tipo: TipoEvento, quando: Date, id: string, detalhe: Record<string, unknown> = {}) => {
    if (quando >= agora) return;
    eventos.push({
      ocorridoEm: quando,
      publico: tipo.startsWith('tutor_') ? 'tutor' : 'empresa',
      tipo,
      entidadeId: id,
      detalhe,
      estimado: quando < limiteEstimado,
    });
  };

  const primeiroPet = new Map<string, Date>();
  // 300 tutores espalhados em 150 dias: cada dia recebe ~2 cadastros.
  for (let i = 0; i < 300; i++) {
    const id = `tutor-${i}`;
    const entrou = antesDe((i * 37) % 150, i % 24);
    add('tutor_entrou', entrou, id, { utm_source: ORIGENS[i % ORIGENS.length] });
    if (i % 3 !== 0) primeiroPet.set(id, new Date(entrou.getTime() + 2 * HORA_MS));
    if (i % 6 === 0) add('tutor_virou_pago', new Date(entrou.getTime() + 3 * DIA_MS), id);
    if (i % 30 === 0) add('tutor_cancelou', new Date(entrou.getTime() + 20 * DIA_MS), id);
  }

  const partners: DadosBrutos['partners'] = [];
  for (let i = 0; i < 320; i++) {
    const id = `empresa-${i}`;
    const propria = i % 13 === 0;
    const entrou = propria ? antesDe((i * 11) % 120) : antesDe(75, i % 5);
    const tipo = TIPOS[i % TIPOS.length];
    const paga = i % 26 === 0;
    partners.push({ id, tipo, premium: paga });
    add('empresa_entrou_mapa', entrou, id, { origem: propria ? 'cadastro_proprio' : 'importada', tipo });
    if (!propria && i % 2 === 0) add('empresa_convidada', antesDe((i * 7) % 70), id, { canal: 'whatsapp' });
    if (i % 9 === 0 || propria) add('empresa_ativou_painel', antesDe((i * 5) % 60), id);
    if (paga) add('empresa_virou_paga', antesDe((i * 3) % 50), id);
  }

  const usoMapa: DadosBrutos['usoMapa'] = [];
  for (let d = 0; d < 150; d++) {
    for (let v = 0; v < (d * 7) % 13; v++) usoMapa.push({ ocorridoEm: antesDe(d, v), tipo: 'view' });
    for (let w = 0; w < d % 4; w++) usoMapa.push({ ocorridoEm: antesDe(d, w + 1), tipo: 'whatsapp_click' });
  }

  return {
    eventos,
    primeiroPet,
    partners,
    usoMapa,
    assinaturasAtivas: [
      { planType: 'tutor_monthly', categoria: 'tutor' },
      { planType: 'tutor_monthly', categoria: 'tutor' },
      { planType: 'tutor_annual', categoria: 'tutor' },
      { planType: 'partner_pro', categoria: 'partner' },
    ],
    fila: montarFilaHoje({ premiumSemPainel: 1, pendentesComEmail: 12, whatsappPendentes: 40, feedbackRuim: 2 }),
  };
}

export function analiseDeExemplo(chave: PeriodoChave, agora: Date): Analise {
  const dados = dadosExemplo(agora);
  return montarAnalise(dados, montarPeriodo(chave, agora, maisAntigo(dados.eventos)));
}
