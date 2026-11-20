import type { Granularidade, PeriodoChave } from '@/lib/admin/analytics/tipos';

export const COR = {
  gratis: '#94a3b8',
  pago: '#d97706',
  proprio: '#0284c7',
  eixo: '#94a3b8',
  grade: 'rgba(148, 163, 184, 0.25)',
} as const;

export const MINIMO_DADOS = 5;

export const ROTULO_PERIODO: Record<PeriodoChave, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  tudo: 'Tudo',
};

export const ROTULO_GRANULARIDADE: Record<Granularidade, string> = {
  dia: 'por dia',
  semana: 'por semana',
  mes: 'por mês',
};

export function reais(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function soma(dados: ReadonlyArray<object>, chaves: string[]): number {
  return dados.reduce<number>((total, ponto) => {
    const linha = ponto as Record<string, unknown>;
    return total + chaves.reduce((s, c) => s + (typeof linha[c] === 'number' ? (linha[c] as number) : 0), 0);
  }, 0);
}
