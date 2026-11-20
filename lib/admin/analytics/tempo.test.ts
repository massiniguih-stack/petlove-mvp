import { describe, expect, it } from 'vitest';
import {
  inicioDaSemana,
  inicioDoDia,
  inicioDoMes,
  lerData,
  rotuloDia,
  rotuloMes,
  somarDias,
  somarMeses,
} from './tempo';

describe('tempo (fuso de Brasília)', () => {
  it('23h30 em Brasília ainda é o mesmo dia', () => {
    // 21/11 02:30 UTC = 20/11 23:30 em Brasília
    expect(inicioDoDia(new Date('2026-11-21T02:30:00Z')).toISOString()).toBe('2026-11-20T03:00:00.000Z');
  });

  it('semana começa na segunda', () => {
    // 20/11/2026 é sexta; 22/11 é domingo; 16/11 é segunda
    expect(inicioDaSemana(new Date('2026-11-20T15:00:00Z')).toISOString()).toBe('2026-11-16T03:00:00.000Z');
    expect(inicioDaSemana(new Date('2026-11-22T12:00:00Z')).toISOString()).toBe('2026-11-16T03:00:00.000Z');
    expect(inicioDaSemana(new Date('2026-11-16T03:00:00Z')).toISOString()).toBe('2026-11-16T03:00:00.000Z');
  });

  it('mês respeita o fuso', () => {
    // 01/12 02:00 UTC = 30/11 23:00 em Brasília
    expect(inicioDoMes(new Date('2026-12-01T02:00:00Z')).toISOString()).toBe('2026-11-01T03:00:00.000Z');
  });

  it('soma dias e meses, inclusive virando o ano', () => {
    expect(somarDias(new Date('2026-11-20T03:00:00Z'), -6).toISOString()).toBe('2026-11-14T03:00:00.000Z');
    expect(somarMeses(new Date('2026-11-01T03:00:00Z'), 1).toISOString()).toBe('2026-12-01T03:00:00.000Z');
    expect(somarMeses(new Date('2026-12-01T03:00:00Z'), 1).toISOString()).toBe('2027-01-01T03:00:00.000Z');
  });

  it('rótulos curtos', () => {
    expect(rotuloDia(new Date('2026-11-20T03:00:00Z'))).toBe('20/11');
    expect(rotuloMes(new Date('2026-11-01T03:00:00Z'))).toBe('nov/26');
  });

  it('lê timestamps do Supabase com e sem fuso', () => {
    expect(lerData('2026-11-20T10:00:00').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(lerData('2026-11-20 10:00:00').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(lerData('2026-11-20T10:00:00+00:00').toISOString()).toBe('2026-11-20T10:00:00.000Z');
    expect(lerData('2026-11-20T07:00:00.123456-03:00').toISOString()).toBe('2026-11-20T10:00:00.123Z');
  });
});
