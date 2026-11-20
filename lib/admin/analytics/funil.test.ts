import { describe, expect, it } from 'vitest';
import { conversaoDoFunil, montarFunil } from './funil';

const nomes = ['Cadastrou', 'Cadastrou o 1º pet', 'Pagou'];

describe('montarFunil', () => {
  it('conta cada etapa e a % da anterior', () => {
    const funil = montarFunil(
      nomes,
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      [new Set(['a', 'b', 'c']), new Set(['a'])],
    );
    expect(funil.map((e) => e.total)).toEqual([4, 3, 1]);
    expect(funil.map((e) => e.pctDoAnterior)).toEqual([null, 75, 33]);
    expect(conversaoDoFunil(funil)).toBe(25);
  });

  it('quem pula etapa conta nas anteriores', () => {
    const funil = montarFunil(nomes, [{ id: 'a' }, { id: 'b' }], [new Set(['a']), new Set(['b'])]);
    expect(funil.map((e) => e.total)).toEqual([2, 2, 1]);
    expect(funil.map((e) => e.pctDoAnterior)).toEqual([null, 100, 50]);
  });

  it('ignora quem não está na turma', () => {
    const funil = montarFunil(nomes, [{ id: 'a' }], [new Set(['a', 'x']), new Set(['x'])]);
    expect(funil.map((e) => e.total)).toEqual([1, 1, 0]);
  });

  it('turma vazia', () => {
    const funil = montarFunil(nomes, [], [new Set(['a']), new Set(['a'])]);
    expect(funil.map((e) => e.total)).toEqual([0, 0, 0]);
    expect(funil.map((e) => e.pctDoAnterior)).toEqual([null, null, null]);
    expect(conversaoDoFunil(funil)).toBeNull();
  });

  it('divide por grupo', () => {
    const funil = montarFunil(
      ['No mapa', 'Pagou'],
      [
        { id: 'a', grupo: 'importadas' },
        { id: 'b', grupo: 'importadas' },
        { id: 'c', grupo: 'cadastroProprio' },
      ],
      [new Set(['c'])],
    );
    expect(funil[0].porGrupo).toEqual({ importadas: 2, cadastroProprio: 1 });
    expect(funil[1].porGrupo).toEqual({ cadastroProprio: 1 });
  });

  it('conversão com uma casa decimal', () => {
    const funil = montarFunil(['A', 'B'], [{ id: 'a' }, { id: 'b' }, { id: 'c' }], [new Set(['a'])]);
    expect(conversaoDoFunil(funil)).toBe(33.3);
  });
});
