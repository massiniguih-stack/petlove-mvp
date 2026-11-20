import type { FilaItem } from '@/lib/admin/filaHoje';

export const TIPOS_EVENTO = [
  'tutor_entrou',
  'tutor_virou_pago',
  'tutor_cancelou',
  'empresa_entrou_mapa',
  'empresa_convidada',
  'empresa_ativou_painel',
  'empresa_virou_paga',
  'empresa_cancelou',
] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];
export type Publico = 'tutor' | 'empresa';

export interface Evento {
  ocorridoEm: Date;
  publico: Publico;
  tipo: TipoEvento;
  entidadeId: string;
  detalhe: Record<string, unknown>;
  estimado: boolean;
}

export const PERIODOS = ['7d', '30d', '90d', 'tudo'] as const;
export type PeriodoChave = (typeof PERIODOS)[number];
export type Granularidade = 'dia' | 'semana' | 'mes';

/** Intervalo de tempo: `inicio` incluído, `fim` excluído. */
export interface Intervalo {
  inicio: Date;
  fim: Date;
}

export interface Periodo {
  chave: PeriodoChave;
  atual: Intervalo;
  anterior: Intervalo | null;
  granularidade: Granularidade;
}

export type Variacao = { tipo: 'pct'; valor: number } | { tipo: 'novo' } | null;

export interface NumeroChave {
  valor: number;
  variacao: Variacao;
}

export interface EtapaFunil {
  nome: string;
  total: number;
  /** % em relação à etapa anterior; null na 1ª etapa ou quando a anterior é 0. */
  pctDoAnterior: number | null;
  porGrupo: Record<string, number>;
}

export interface AnaliseTutores {
  numeros: {
    novos: NumeroChave;
    pagos: NumeroChave;
    conversaoPct: number | null;
    receitaMensal: number;
    cancelamentos: number;
  };
  entradas: Array<{ rotulo: string; cadastros: number; pagos: number }>;
  crescimento: Array<{ rotulo: string; cadastros: number; pagos: number }>;
  funil: EtapaFunil[];
  origem: Array<{ origem: string; cadastros: number; pagos: number }>;
}

export interface AnaliseEmpresas {
  numeros: {
    entraram: NumeroChave;
    importadas: number;
    cadastroProprio: number;
    convidadas: NumeroChave;
    ativaram: NumeroChave;
    pagas: NumeroChave;
    receitaMensal: number;
    cancelamentos: number;
  };
  entradas: Array<{ rotulo: string; importadas: number; cadastroProprio: number }>;
  funil: EtapaFunil[];
  porTipo: Array<{ tipo: string; rotulo: string; total: number; pagas: number }>;
  usoMapa: Array<{ rotulo: string; visualizacoes: number; whatsapp: number }>;
}

export interface Analise {
  periodo: { chave: PeriodoChave; granularidade: Granularidade; inicio: string; fim: string };
  fila: FilaItem[];
  tutores: AnaliseTutores;
  empresas: AnaliseEmpresas;
  /** Há eventos reconstruídos (datas aproximadas) dentro do período. */
  temEstimado: boolean;
  /** Data (ISO) do evento reconstruído mais recente, para a nota "* inclui datas aproximadas de antes de …". */
  estimadoAte: string | null;
}
