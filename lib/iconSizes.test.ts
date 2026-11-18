import { describe, it, expect } from 'vitest';
import { ICONE, papelParaTamanho } from './iconSizes';

describe('escala de ícones', () => {
  it('tem só os quatro degraus da tela de Saúde', () => {
    expect(ICONE).toEqual({ titulo: 28, atalho: 36, item: 48, destaque: 72 });
  });

  it('leva cada tamanho antigo ao degrau mais próximo', () => {
    expect([28, 32].map(papelParaTamanho)).toEqual(['titulo', 'titulo']);
    expect([36, 40, 44].map(papelParaTamanho)).toEqual(['atalho', 'atalho', 'atalho']);
    expect([48, 56].map(papelParaTamanho)).toEqual(['item', 'item']);
    expect([64, 72, 80, 88, 120].map(papelParaTamanho)).toEqual(Array(5).fill('destaque'));
  });
});
