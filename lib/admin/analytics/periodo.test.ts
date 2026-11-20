import { describe, expect, it } from 'vitest';
import { ehPeriodo, montarPeriodo, PERIODO_PADRAO } from './periodo';

const agora = new Date('2026-11-20T15:00:00Z'); // 12h em Brasília

describe('montarPeriodo', () => {
  it('7 dias: hoje e os 6 anteriores, comparado com os 7 dias antes', () => {
    const p = montarPeriodo('7d', agora, null);
    expect(p.atual.inicio.toISOString()).toBe('2026-11-14T03:00:00.000Z');
    expect(p.atual.fim).toBe(agora);
    expect(p.anterior?.inicio.toISOString()).toBe('2026-11-07T03:00:00.000Z');
    expect(p.anterior?.fim.toISOString()).toBe('2026-11-14T03:00:00.000Z');
    expect(p.granularidade).toBe('dia');
  });

  it('30 dias agrupa por dia; 90 dias agrupa por semana', () => {
    expect(montarPeriodo('30d', agora, null).granularidade).toBe('dia');
    const p90 = montarPeriodo('90d', agora, null);
    expect(p90.granularidade).toBe('semana');
    expect(p90.atual.inicio.toISOString()).toBe('2026-08-23T03:00:00.000Z');
  });

  it('tudo começa no mês do evento mais antigo, sem comparação', () => {
    const p = montarPeriodo('tudo', agora, new Date('2026-07-15T12:00:00Z'));
    expect(p.atual.inicio.toISOString()).toBe('2026-07-01T03:00:00.000Z');
    expect(p.anterior).toBeNull();
    expect(p.granularidade).toBe('mes');
  });

  it('tudo sem nenhum evento começa no mês atual', () => {
    expect(montarPeriodo('tudo', agora, null).atual.inicio.toISOString()).toBe('2026-11-01T03:00:00.000Z');
  });
});

describe('ehPeriodo', () => {
  it('aceita só os 4 períodos', () => {
    expect(ehPeriodo('30d')).toBe(true);
    expect(ehPeriodo('tudo')).toBe(true);
    expect(ehPeriodo('1a')).toBe(false);
    expect(ehPeriodo(null)).toBe(false);
    expect(PERIODO_PADRAO).toBe('30d');
  });
});
