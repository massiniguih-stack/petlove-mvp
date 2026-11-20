import { PERIODOS, type Periodo, type PeriodoChave } from './tipos';
import { inicioDoDia, inicioDoMes, somarDias } from './tempo';

const DIAS: Record<Exclude<PeriodoChave, 'tudo'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

export const PERIODO_PADRAO: PeriodoChave = '30d';

export function ehPeriodo(v: unknown): v is PeriodoChave {
  return typeof v === 'string' && (PERIODOS as readonly string[]).includes(v);
}

export function montarPeriodo(chave: PeriodoChave, agora: Date, maisAntigo: Date | null): Periodo {
  if (chave === 'tudo') {
    return {
      chave,
      atual: { inicio: inicioDoMes(maisAntigo ?? agora), fim: agora },
      anterior: null,
      granularidade: 'mes',
    };
  }
  const dias = DIAS[chave];
  const inicio = somarDias(inicioDoDia(agora), -(dias - 1));
  return {
    chave,
    atual: { inicio, fim: agora },
    anterior: { inicio: somarDias(inicio, -dias), fim: somarDias(agora, -dias) },
    granularidade: chave === '90d' ? 'semana' : 'dia',
  };
}
