import { describe, expect, it } from 'vitest';
import { idadeDoPet, recadoVacina, recadoVacinaIndisponivel, rotuloObjetivo } from './recadoHoje';

describe('recadoVacina', () => {
  it('pede para marcar quando não há vacina', () => {
    expect(recadoVacina(null, () => '')).toEqual({
      titulo: 'Marcar a vacina',
      detalhe: 'Nenhuma vacina agendada',
      href: '/vida',
    });
  });

  it('mostra o nome e a data da próxima vacina', () => {
    const recado = recadoVacina(
      { titulo: 'V10', data: new Date('2026-10-12T12:00:00') },
      () => '12/10',
    );
    expect(recado.titulo).toBe('Próxima vacina: V10 · 12/10');
    expect(recado.href).toBe('/vida');
  });

  it('não inventa uma vacina quando a busca falha', () => {
    expect(recadoVacinaIndisponivel().titulo).toBe('Abrir a linha do tempo');
  });
});

describe('idadeDoPet', () => {
  it('fala em meses até um ano e em anos depois', () => {
    expect(idadeDoPet('2026-09-01', new Date('2026-10-08'))).toBe('1 mês');
    expect(idadeDoPet('2020-06-15', new Date('2026-10-08'))).toBe('6 anos e 3 meses');
  });
});

describe('rotuloObjetivo', () => {
  it('traduz o objetivo guardado no cadastro', () => {
    expect(rotuloObjetivo('manutencao')).toBe('Manutenção');
    expect(rotuloObjetivo('desempenho')).toBe('Desempenho');
  });
});
