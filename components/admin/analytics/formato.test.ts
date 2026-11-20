import { describe, expect, it } from 'vitest';
import { dataCurta, reais, soma } from './formato';

describe('formato', () => {
  it('reais', () => {
    expect(reais(1234.5)).toBe('R$ 1.234,50');
    expect(reais(0)).toBe('R$ 0,00');
  });
  it('dataCurta no fuso de Brasília', () => {
    expect(dataCurta('2026-11-21T02:30:00.000Z')).toBe('20/11/2026');
  });
  it('soma várias séries', () => {
    expect(soma([{ a: 1, b: 2 }, { a: 3, b: 0 }], ['a', 'b'])).toBe(6);
    expect(soma([], ['a'])).toBe(0);
  });
});
