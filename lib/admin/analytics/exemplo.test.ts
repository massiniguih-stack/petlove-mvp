import { describe, expect, it } from 'vitest';
import { PERIODOS } from './tipos';
import { analiseDeExemplo } from './exemplo';

describe('analiseDeExemplo', () => {
  const agora = new Date('2026-11-20T15:00:00Z');

  it.each(PERIODOS)('monta o período %s com dados suficientes', (chave) => {
    const analise = analiseDeExemplo(chave, agora);
    expect(analise.tutores.entradas.length).toBeGreaterThan(0);
    expect(analise.tutores.funil[0].total).toBeGreaterThanOrEqual(5);
    expect(analise.empresas.funil[0].total).toBeGreaterThanOrEqual(analise.empresas.funil[3].total);
    expect(analise.fila.length).toBeGreaterThan(0);
  });
});
