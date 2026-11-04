import { describe, expect, it } from 'vitest';
import { formatarIdade, idadeEmMeses } from './pet';

describe('idadeEmMeses', () => {
  it('conta meses de calendário, não aproximação por 30 dias', () => {
    expect(idadeEmMeses('2026-09-01', new Date('2026-10-08'))).toBe(1);
    expect(idadeEmMeses('2020-06-15', new Date('2026-10-08'))).toBe(75);
  });

  it('nunca fica negativo para datas futuras', () => {
    expect(idadeEmMeses('2026-12-01', new Date('2026-10-08'))).toBe(0);
  });
});

describe('formatarIdade', () => {
  it('usa singular para 1 mês ou 1 ano', () => {
    expect(formatarIdade(1)).toBe('1 mês');
    expect(formatarIdade(12)).toBe('1 ano');
  });

  it('usa plural para o resto', () => {
    expect(formatarIdade(0)).toBe('0 meses');
    expect(formatarIdade(5)).toBe('5 meses');
    expect(formatarIdade(24)).toBe('2 anos');
  });

  it('combina anos e meses quando sobra resto', () => {
    expect(formatarIdade(75)).toBe('6 anos e 3 meses');
    expect(formatarIdade(13)).toBe('1 ano e 1 mês');
  });
});
