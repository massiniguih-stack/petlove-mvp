import { describe, expect, it } from 'vitest';
import { deveReconsultarAssinatura, statusDaPremium } from './assinatura';

describe('statusDaPremium', () => {
  it('libera Premium para assinatura ativa ou em teste', () => {
    expect(statusDaPremium('active')).toBe(true);
    expect(statusDaPremium('trialing')).toBe(true);
  });
  it('não libera para pendente, cancelada ou vazia', () => {
    for (const s of ['pending', 'canceled', 'past_due', null, undefined, '']) {
      expect(statusDaPremium(s)).toBe(false);
    }
  });
});

describe('deveReconsultarAssinatura', () => {
  it('consulta se nunca consultou', () => {
    expect(deveReconsultarAssinatura(null, 1000)).toBe(true);
  });
  it('não consulta de novo dentro do intervalo', () => {
    expect(deveReconsultarAssinatura(1000, 1000 + 59_999)).toBe(false);
  });
  it('consulta de novo depois do intervalo', () => {
    expect(deveReconsultarAssinatura(1000, 1000 + 60_000)).toBe(true);
  });
});
