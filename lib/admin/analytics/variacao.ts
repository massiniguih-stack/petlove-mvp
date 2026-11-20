import type { Variacao } from './tipos';

export function variacao(atual: number, anterior: number | null): Variacao {
  if (anterior === null) return null;
  if (anterior === 0) return atual === 0 ? { tipo: 'pct', valor: 0 } : { tipo: 'novo' };
  return { tipo: 'pct', valor: Math.round(((atual - anterior) / anterior) * 100) };
}
