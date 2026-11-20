import { describe, expect, it } from 'vitest';
import { variacao } from './variacao';

describe('variacao', () => {
  it('sem período anterior não compara', () => {
    expect(variacao(10, null)).toBeNull();
  });
  it('anterior zerado', () => {
    expect(variacao(0, 0)).toEqual({ tipo: 'pct', valor: 0 });
    expect(variacao(5, 0)).toEqual({ tipo: 'novo' });
  });
  it('% arredondada', () => {
    expect(variacao(12, 10)).toEqual({ tipo: 'pct', valor: 20 });
    expect(variacao(5, 10)).toEqual({ tipo: 'pct', valor: -50 });
    expect(variacao(2, 3)).toEqual({ tipo: 'pct', valor: -33 });
  });
});
