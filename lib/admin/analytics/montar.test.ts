import { describe, expect, it } from 'vitest';
import type { Evento, TipoEvento } from './tipos';
import { montarPeriodo } from './periodo';
import { maisAntigo, montarAnalise, semEquipe, type DadosBrutos } from './montar';
import { categoriaDoPlano, receitaMensal } from './catalogo';

const agora = new Date('2026-11-20T15:00:00Z');
const periodo = montarPeriodo('7d', agora, null); // atual 14/11–20/11, anterior 07/11–13/11

function ev(tipo: TipoEvento, quando: string, id: string, detalhe: Record<string, unknown> = {}, estimado = false): Evento {
  return {
    ocorridoEm: new Date(quando),
    publico: tipo.startsWith('tutor_') ? 'tutor' : 'empresa',
    tipo,
    entidadeId: id,
    detalhe,
    estimado,
  };
}

const eventos: Evento[] = [
  ev('tutor_entrou', '2026-11-15T12:00:00Z', 't1', { utm_source: 'instagram' }),
  ev('tutor_virou_pago', '2026-11-16T12:00:00Z', 't1'),
  ev('tutor_entrou', '2026-11-18T12:00:00Z', 't2'),
  ev('tutor_entrou', '2026-11-10T12:00:00Z', 't3', {}, true),
  ev('tutor_virou_pago', '2026-11-12T12:00:00Z', 't3', {}, true),
  ev('tutor_cancelou', '2026-11-19T12:00:00Z', 't3'),
  ev('empresa_entrou_mapa', '2026-11-15T12:00:00Z', 'p1', { origem: 'importada' }),
  ev('empresa_convidada', '2026-11-16T12:00:00Z', 'p1'),
  ev('empresa_ativou_painel', '2026-11-17T12:00:00Z', 'p1'),
  ev('empresa_virou_paga', '2026-11-18T12:00:00Z', 'p1'),
  ev('empresa_entrou_mapa', '2026-11-16T12:00:00Z', 'p2', { origem: 'cadastro_proprio' }),
  ev('empresa_ativou_painel', '2026-11-16T13:00:00Z', 'p2'),
  ev('empresa_entrou_mapa', '2026-11-01T12:00:00Z', 'p3', { origem: 'importada' }),
];

const dados: DadosBrutos = {
  eventos,
  primeiroPet: new Map([['t2', new Date('2026-11-18T13:00:00Z')]]),
  partners: [
    { id: 'p1', tipo: 'veterinario', premium: true },
    { id: 'p2', tipo: 'petshop', premium: false },
    { id: 'p3', tipo: 'veterinario', premium: false },
  ],
  usoMapa: [
    { ocorridoEm: new Date('2026-11-19T12:00:00Z'), tipo: 'view' },
    { ocorridoEm: new Date('2026-11-19T13:00:00Z'), tipo: 'view' },
    { ocorridoEm: new Date('2026-11-20T12:00:00Z'), tipo: 'whatsapp_click' },
    { ocorridoEm: new Date('2026-11-01T12:00:00Z'), tipo: 'view' },
  ],
  assinaturasAtivas: [
    { planType: 'tutor_monthly', categoria: 'tutor' },
    { planType: 'partner_pro', categoria: 'partner' },
  ],
  fila: [],
};

describe('montarAnalise — tutores', () => {
  const { tutores } = montarAnalise(dados, periodo);

  it('números-chave com comparação', () => {
    expect(tutores.numeros.novos).toEqual({ valor: 2, variacao: { tipo: 'pct', valor: 100 } });
    expect(tutores.numeros.pagos).toEqual({ valor: 1, variacao: { tipo: 'pct', valor: 0 } });
    expect(tutores.numeros.cancelamentos).toBe(1);
    expect(tutores.numeros.receitaMensal).toBe(29.49);
    expect(tutores.numeros.conversaoPct).toBe(50);
  });

  it('funil da turma: quem pagou sem pet conta como "cadastrou pet"', () => {
    expect(tutores.funil.map((e) => [e.nome, e.total])).toEqual([
      ['Cadastrou', 2],
      ['Cadastrou o 1º pet', 2],
      ['Pagou', 1],
    ]);
  });

  it('entradas por dia', () => {
    expect(tutores.entradas.map((p) => p.rotulo)).toEqual(['14/11', '15/11', '16/11', '17/11', '18/11', '19/11', '20/11']);
    expect(tutores.entradas.map((p) => p.cadastros)).toEqual([0, 1, 0, 0, 1, 0, 0]);
    expect(tutores.entradas.map((p) => p.pagos)).toEqual([0, 0, 1, 0, 0, 0, 0]);
  });

  it('crescimento acumulado inclui o passado e desconta cancelamentos', () => {
    expect(tutores.crescimento[0]).toEqual({ rotulo: '14/11', cadastros: 1, pagos: 1 });
    expect(tutores.crescimento[6]).toEqual({ rotulo: '20/11', cadastros: 3, pagos: 1 });
  });

  it('origem da turma, vazio vira "Direto"', () => {
    expect(tutores.origem).toEqual([
      { origem: 'Direto', cadastros: 1, pagos: 0 },
      { origem: 'instagram', cadastros: 1, pagos: 1 },
    ]);
  });
});

describe('montarAnalise — empresas', () => {
  const { empresas } = montarAnalise(dados, periodo);

  it('números-chave', () => {
    expect(empresas.numeros.entraram).toEqual({ valor: 2, variacao: { tipo: 'novo' } });
    expect(empresas.numeros.importadas).toBe(1);
    expect(empresas.numeros.cadastroProprio).toBe(1);
    expect(empresas.numeros.convidadas.valor).toBe(1);
    expect(empresas.numeros.ativaram.valor).toBe(2);
    expect(empresas.numeros.pagas.valor).toBe(1);
    expect(empresas.numeros.receitaMensal).toBe(49.74);
  });

  it('funil de 4 etapas com divisão por origem', () => {
    expect(empresas.funil.map((e) => e.total)).toEqual([2, 2, 2, 1]);
    expect(empresas.funil[0].porGrupo).toEqual({ importadas: 1, cadastroProprio: 1 });
    expect(empresas.funil[3].porGrupo).toEqual({ importadas: 1 });
  });

  it('entradas separadas por origem', () => {
    expect(empresas.entradas[1]).toEqual({ rotulo: '15/11', importadas: 1, cadastroProprio: 0 });
    expect(empresas.entradas[2]).toEqual({ rotulo: '16/11', importadas: 0, cadastroProprio: 1 });
  });

  it('por tipo, do maior para o menor', () => {
    expect(empresas.porTipo).toEqual([
      { tipo: 'veterinario', rotulo: 'Veterinários', total: 2, pagas: 1 },
      { tipo: 'petshop', rotulo: 'Pet shops', total: 1, pagas: 0 },
    ]);
  });

  it('uso do mapa só dentro do período', () => {
    expect(empresas.usoMapa[5]).toEqual({ rotulo: '19/11', visualizacoes: 2, whatsapp: 0 });
    expect(empresas.usoMapa[6]).toEqual({ rotulo: '20/11', visualizacoes: 0, whatsapp: 1 });
    expect(empresas.usoMapa.reduce((s, p) => s + p.visualizacoes, 0)).toBe(2);
  });
});

describe('montarAnalise — geral', () => {
  it('nota de estimado só quando há estimado no período', () => {
    const analise = montarAnalise(dados, periodo);
    expect(analise.temEstimado).toBe(false);
    expect(analise.estimadoAte).toBe('2026-11-12T12:00:00.000Z');
    const comEstimado = montarAnalise(
      { ...dados, eventos: [...eventos, ev('tutor_entrou', '2026-11-15T10:00:00Z', 't9', {}, true)] },
      periodo,
    );
    expect(comEstimado.temEstimado).toBe(true);
  });

  it('devolve o período em ISO', () => {
    const analise = montarAnalise(dados, periodo);
    expect(analise.periodo).toEqual({
      chave: '7d',
      granularidade: 'dia',
      inicio: '2026-11-14T03:00:00.000Z',
      fim: '2026-11-20T15:00:00.000Z',
    });
  });
});

describe('auxiliares', () => {
  it('semEquipe tira as contas da equipe', () => {
    expect(semEquipe(eventos, new Set(['t1', 'p1'])).some((e) => e.entidadeId === 't1' || e.entidadeId === 'p1')).toBe(false);
  });
  it('maisAntigo', () => {
    expect(maisAntigo(eventos)?.toISOString()).toBe('2026-11-01T12:00:00.000Z');
    expect(maisAntigo([])).toBeNull();
  });
  it('catálogo', () => {
    expect(categoriaDoPlano('partner_pro', null)).toBe('partner');
    expect(categoriaDoPlano('tutor_monthly', null)).toBe('tutor');
    expect(categoriaDoPlano('unknown', 'partner')).toBe('partner');
    expect(receitaMensal(['tutor_monthly', 'tutor_monthly', 'unknown'])).toBe(58.98);
  });
});
