import { describe, expect, it } from 'vitest';
import { acumuladoAte, contarPorBalde, criarBaldes } from './agrupar';

const agora = new Date('2026-11-20T15:00:00Z');

describe('criarBaldes', () => {
  it('7 dias = 7 baldes diários', () => {
    const baldes = criarBaldes({ inicio: new Date('2026-11-14T03:00:00Z'), fim: agora }, 'dia');
    expect(baldes).toHaveLength(7);
    expect(baldes[0].rotulo).toBe('14/11');
    expect(baldes[6].rotulo).toBe('20/11');
  });

  it('semanas começam na segunda anterior ao início', () => {
    // 23/08/2026 é domingo: a 1ª semana começa na segunda 17/08
    const baldes = criarBaldes({ inicio: new Date('2026-08-23T03:00:00Z'), fim: agora }, 'semana');
    expect(baldes[0].inicio.toISOString()).toBe('2026-08-17T03:00:00.000Z');
    expect(baldes[0].rotulo).toBe('17/08');
    expect(baldes[baldes.length - 1].rotulo).toBe('16/11');
    expect(baldes).toHaveLength(14);
  });

  it('meses', () => {
    const baldes = criarBaldes({ inicio: new Date('2026-07-01T03:00:00Z'), fim: agora }, 'mes');
    expect(baldes.map((b) => b.rotulo)).toEqual(['jul/26', 'ago/26', 'set/26', 'out/26', 'nov/26']);
  });
});

describe('contarPorBalde e acumuladoAte', () => {
  const baldes = criarBaldes({ inicio: new Date('2026-11-14T03:00:00Z'), fim: agora }, 'dia');

  it('conta no dia de Brasília e ignora o que está fora', () => {
    const datas = [
      new Date('2026-11-21T02:30:00Z'), // 20/11 23:30 → último balde
      new Date('2026-11-14T02:59:00Z'), // 13/11 23:59 → fora
      new Date('2026-11-15T12:00:00Z'),
      new Date('2026-11-15T13:00:00Z'),
    ];
    expect(contarPorBalde(baldes, datas)).toEqual([0, 2, 0, 0, 0, 0, 1]);
  });

  it('acumula tudo o que aconteceu antes do fim de cada balde, inclusive antes do período', () => {
    const datas = [new Date('2026-11-01T12:00:00Z'), new Date('2026-11-15T12:00:00Z')];
    expect(acumuladoAte(baldes, datas)).toEqual([1, 2, 2, 2, 2, 2, 2]);
  });
});
