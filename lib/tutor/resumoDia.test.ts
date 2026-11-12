import { describe, it, expect } from 'vitest';
import { legendaProgresso, resumoDoDia, type ItemDoDia } from './resumoDia';

function item(parcial: Partial<ItemDoDia>): ItemDoDia {
  return { id: 'x', lista: 'refeicao', hora: '07:00', nome: 'Café da manhã', detalhe: '120g', concluida: false, ...parcial };
}

describe('resumoDoDia', () => {
  it('dia sem nenhum registro vira zero, sem dividir por zero', () => {
    const r = resumoDoDia([]);
    expect(r.refeicoes).toEqual({ feitas: 0, total: 0, percentual: 0, proxima: null });
    expect(r.atividades.total).toBe(0);
    expect(r.feitos).toEqual([]);
    expect(legendaProgresso(r.refeicoes)).toBe('Toque para começar o dia');
  });

  it('conta refeições e atividades separadamente', () => {
    const r = resumoDoDia([
      item({ id: 'a', concluida: true }),
      item({ id: 'b', hora: '12:00', nome: 'Almoço' }),
      item({ id: 'c', hora: '18:00', nome: 'Jantar' }),
      item({ id: 'd', lista: 'atividade', hora: '07:00', nome: 'Passeio matinal', detalhe: '🐕', concluida: true }),
      item({ id: 'e', lista: 'atividade', hora: '10:00', nome: 'Brincadeira', detalhe: '🎾', concluida: true }),
    ]);
    expect(r.refeicoes).toMatchObject({ feitas: 1, total: 3, percentual: 33 });
    expect(r.atividades).toMatchObject({ feitas: 2, total: 2, percentual: 100, proxima: null });
    expect(legendaProgresso(r.atividades)).toBe('Tudo feito por hoje');
  });

  it('a próxima pendente é a de horário mais cedo, mesmo fora de ordem', () => {
    const r = resumoDoDia([
      item({ id: 'c', hora: '18:00', nome: 'Jantar' }),
      item({ id: 'b', hora: '12:00', nome: 'Almoço' }),
      item({ id: 'a', concluida: true }),
    ]);
    expect(r.refeicoes.proxima).toEqual({ nome: 'Almoço', hora: '12:00' });
    expect(legendaProgresso(r.refeicoes)).toBe('Falta: Almoço · 12:00');
  });

  it('lista o que já foi feito em ordem de horário, sem o emoji da atividade', () => {
    const r = resumoDoDia([
      item({ id: 'd', lista: 'atividade', hora: '10:00', nome: 'Brincadeira', detalhe: '🎾', concluida: true }),
      item({ id: 'a', concluida: true }),
      item({ id: 'b', hora: '12:00', nome: 'Almoço' }),
    ]);
    expect(r.feitos).toEqual([
      { id: 'a', tipo: 'refeicao', hora: '07:00', nome: 'Café da manhã', detalhe: '120g' },
      { id: 'd', tipo: 'atividade', hora: '10:00', nome: 'Brincadeira', detalhe: null },
    ]);
  });

  it('ignora listas desconhecidas e item sem horário vai para o fim', () => {
    const r = resumoDoDia([
      item({ id: 'z', lista: 'outra', concluida: true }),
      item({ id: 'n', hora: null, nome: 'Lanche', concluida: true }),
      item({ id: 'a', concluida: true }),
    ]);
    expect(r.feitos.map((f) => f.id)).toEqual(['a', 'n']);
    expect(r.refeicoes.total).toBe(2);
  });
});
