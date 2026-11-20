import type { FilaItem } from '@/lib/admin/filaHoje';
import { acumuladoAte, contarPorBalde, criarBaldes, type Balde } from './agrupar';
import { receitaMensal, ROTULO_TIPO } from './catalogo';
import { conversaoDoFunil, montarFunil } from './funil';
import type {
  Analise,
  AnaliseEmpresas,
  AnaliseTutores,
  Evento,
  Intervalo,
  NumeroChave,
  Periodo,
  TipoEvento,
} from './tipos';
import { variacao } from './variacao';

export interface DadosBrutos {
  /** Já sem as contas da equipe. */
  eventos: Evento[];
  /** Data do 1º pet de cada tutor. */
  primeiroPet: Map<string, Date>;
  /** Estado atual das empresas, para o ranking por tipo. */
  partners: Array<{ id: string; tipo: string; premium: boolean }>;
  /** Visualizações e cliques no mapa, a partir do início do período. */
  usoMapa: Array<{ ocorridoEm: Date; tipo: 'view' | 'whatsapp_click' }>;
  assinaturasAtivas: Array<{ planType: string; categoria: 'tutor' | 'partner' }>;
  fila: FilaItem[];
}

export function semEquipe(eventos: Evento[], idsEquipe: Set<string>): Evento[] {
  return eventos.filter((e) => !idsEquipe.has(e.entidadeId));
}

export function maisAntigo(eventos: Evento[]): Date | null {
  let menor: Date | null = null;
  for (const e of eventos) {
    if (!menor || e.ocorridoEm < menor) menor = e.ocorridoEm;
  }
  return menor;
}

function dentro(d: Date, intervalo: Intervalo): boolean {
  return d >= intervalo.inicio && d < intervalo.fim;
}

function doTipo(eventos: Evento[], tipo: TipoEvento): Evento[] {
  return eventos.filter((e) => e.tipo === tipo);
}

function datas(eventos: Evento[], intervalo?: Intervalo): Date[] {
  const todas = eventos.map((e) => e.ocorridoEm);
  return intervalo ? todas.filter((d) => dentro(d, intervalo)) : todas;
}

function ids(eventos: Evento[]): Set<string> {
  return new Set(eventos.map((e) => e.entidadeId));
}

function numero(eventos: Evento[], periodo: Periodo): NumeroChave {
  const atual = datas(eventos, periodo.atual).length;
  const anterior = periodo.anterior ? datas(eventos, periodo.anterior).length : null;
  return { valor: atual, variacao: variacao(atual, anterior) };
}

function montarTutores(dados: DadosBrutos, periodo: Periodo, baldes: Balde[]): AnaliseTutores {
  const eventos = dados.eventos.filter((e) => e.publico === 'tutor');
  const entrou = doTipo(eventos, 'tutor_entrou');
  const pagou = doTipo(eventos, 'tutor_virou_pago');
  const cancelou = doTipo(eventos, 'tutor_cancelou');

  const turma = entrou.filter((e) => dentro(e.ocorridoEm, periodo.atual));
  const idsPagos = ids(pagou);
  const funil = montarFunil(
    ['Cadastrou', 'Cadastrou o 1º pet', 'Pagou'],
    turma.map((e) => ({ id: e.entidadeId })),
    [new Set(dados.primeiroPet.keys()), idsPagos],
  );

  const porOrigem = new Map<string, { cadastros: number; pagos: number }>();
  for (const e of turma) {
    const bruto = e.detalhe.utm_source;
    const origem = typeof bruto === 'string' && bruto.trim() ? bruto.trim() : 'Direto';
    const atual = porOrigem.get(origem) ?? { cadastros: 0, pagos: 0 };
    atual.cadastros += 1;
    if (idsPagos.has(e.entidadeId)) atual.pagos += 1;
    porOrigem.set(origem, atual);
  }
  const origem = Array.from(porOrigem, ([nome, v]) => ({ origem: nome, ...v })).sort(
    (a, b) => b.cadastros - a.cadastros || a.origem.localeCompare(b.origem, 'pt-BR'),
  );

  const cadastrosPorBalde = contarPorBalde(baldes, datas(entrou, periodo.atual));
  const pagosPorBalde = contarPorBalde(baldes, datas(pagou, periodo.atual));
  const baseCadastros = acumuladoAte(baldes, datas(entrou));
  const basePagos = acumuladoAte(baldes, datas(pagou));
  const baseCancelados = acumuladoAte(baldes, datas(cancelou));

  return {
    numeros: {
      novos: numero(entrou, periodo),
      pagos: numero(pagou, periodo),
      conversaoPct: conversaoDoFunil(funil),
      receitaMensal: receitaMensal(
        dados.assinaturasAtivas.filter((a) => a.categoria === 'tutor').map((a) => a.planType),
      ),
      cancelamentos: datas(cancelou, periodo.atual).length,
    },
    entradas: baldes.map((b, i) => ({ rotulo: b.rotulo, cadastros: cadastrosPorBalde[i], pagos: pagosPorBalde[i] })),
    crescimento: baldes.map((b, i) => ({
      rotulo: b.rotulo,
      cadastros: baseCadastros[i],
      pagos: Math.max(0, basePagos[i] - baseCancelados[i]),
    })),
    funil,
    origem,
  };
}

type OrigemEmpresa = 'importadas' | 'cadastroProprio';

function origemDaEmpresa(e: Evento): OrigemEmpresa {
  return e.detalhe.origem === 'cadastro_proprio' ? 'cadastroProprio' : 'importadas';
}

function montarEmpresas(dados: DadosBrutos, periodo: Periodo, baldes: Balde[]): AnaliseEmpresas {
  const eventos = dados.eventos.filter((e) => e.publico === 'empresa');
  const entrou = doTipo(eventos, 'empresa_entrou_mapa');
  const convidada = doTipo(eventos, 'empresa_convidada');
  const ativou = doTipo(eventos, 'empresa_ativou_painel');
  const pagou = doTipo(eventos, 'empresa_virou_paga');
  const cancelou = doTipo(eventos, 'empresa_cancelou');

  const turma = entrou.filter((e) => dentro(e.ocorridoEm, periodo.atual));
  const importadas = turma.filter((e) => origemDaEmpresa(e) === 'importadas');
  const proprias = turma.filter((e) => origemDaEmpresa(e) === 'cadastroProprio');

  const funil = montarFunil(
    ['No mapa', 'Convidada', 'Ativou o painel', 'Pagou'],
    turma.map((e) => ({ id: e.entidadeId, grupo: origemDaEmpresa(e) })),
    [ids(convidada), ids(ativou), ids(pagou)],
  );

  const porTipoMapa = new Map<string, { total: number; pagas: number }>();
  for (const p of dados.partners) {
    const atual = porTipoMapa.get(p.tipo) ?? { total: 0, pagas: 0 };
    atual.total += 1;
    if (p.premium) atual.pagas += 1;
    porTipoMapa.set(p.tipo, atual);
  }
  const porTipo = Array.from(porTipoMapa, ([tipo, v]) => ({ tipo, rotulo: ROTULO_TIPO[tipo] ?? tipo, ...v })).sort(
    (a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo, 'pt-BR'),
  );

  const importadasPorBalde = contarPorBalde(baldes, datas(importadas));
  const propriasPorBalde = contarPorBalde(baldes, datas(proprias));
  const usoNoPeriodo = dados.usoMapa.filter((u) => dentro(u.ocorridoEm, periodo.atual));
  const views = contarPorBalde(baldes, usoNoPeriodo.filter((u) => u.tipo === 'view').map((u) => u.ocorridoEm));
  const whats = contarPorBalde(
    baldes,
    usoNoPeriodo.filter((u) => u.tipo === 'whatsapp_click').map((u) => u.ocorridoEm),
  );

  return {
    numeros: {
      entraram: numero(entrou, periodo),
      importadas: importadas.length,
      cadastroProprio: proprias.length,
      convidadas: numero(convidada, periodo),
      ativaram: numero(ativou, periodo),
      pagas: numero(pagou, periodo),
      receitaMensal: receitaMensal(
        dados.assinaturasAtivas.filter((a) => a.categoria === 'partner').map((a) => a.planType),
      ),
      cancelamentos: datas(cancelou, periodo.atual).length,
    },
    entradas: baldes.map((b, i) => ({
      rotulo: b.rotulo,
      importadas: importadasPorBalde[i],
      cadastroProprio: propriasPorBalde[i],
    })),
    funil,
    porTipo,
    usoMapa: baldes.map((b, i) => ({ rotulo: b.rotulo, visualizacoes: views[i], whatsapp: whats[i] })),
  };
}

export function montarAnalise(dados: DadosBrutos, periodo: Periodo): Analise {
  const baldes = criarBaldes(periodo.atual, periodo.granularidade);
  const estimados = dados.eventos.filter((e) => e.estimado);
  let estimadoAte: Date | null = null;
  for (const e of estimados) {
    if (!estimadoAte || e.ocorridoEm > estimadoAte) estimadoAte = e.ocorridoEm;
  }

  return {
    periodo: {
      chave: periodo.chave,
      granularidade: periodo.granularidade,
      inicio: periodo.atual.inicio.toISOString(),
      fim: periodo.atual.fim.toISOString(),
    },
    fila: dados.fila,
    tutores: montarTutores(dados, periodo, baldes),
    empresas: montarEmpresas(dados, periodo, baldes),
    temEstimado: estimados.some((e) => dentro(e.ocorridoEm, periodo.atual)),
    estimadoAte: estimadoAte ? estimadoAte.toISOString() : null,
  };
}
