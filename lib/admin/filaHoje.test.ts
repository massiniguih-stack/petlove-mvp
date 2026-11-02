import { describe, expect, it } from 'vitest';
import { contarWhatsappPendentes, montarFilaHoje } from './filaHoje';

describe('contarWhatsappPendentes', () => {
  it('conta telefone com 10 dígitos ou mais que ainda não foi marcado', () => {
    expect(
      contarWhatsappPendentes([
        { telefone: '(44) 99999-0000', whatsapp_contatado_em: null },
        { telefone: '44988880000', whatsapp_contatado_em: '2026-10-01' },
        { telefone: '123', whatsapp_contatado_em: null },
        { telefone: null, whatsapp_contatado_em: null },
      ]),
    ).toBe(1);
  });
});

describe('montarFilaHoje', () => {
  it('esconde a linha quando o número é zero e mantém a ordem combinada', () => {
    expect(
      montarFilaHoje({
        premiumSemPainel: 1,
        pendentesComEmail: 0,
        whatsappPendentes: 2,
        feedbackRuim: 3,
      }).map((item) => item.id),
    ).toEqual(['premium-sem-painel', 'whatsapp', 'feedback-ruim']);
  });

  it('fica vazia quando não há nada para fazer', () => {
    expect(
      montarFilaHoje({
        premiumSemPainel: 0,
        pendentesComEmail: 0,
        whatsappPendentes: 0,
        feedbackRuim: 0,
      }),
    ).toEqual([]);
  });

  it('leva a resposta ruim para o filtro da tela de feedback', () => {
    const [item] = montarFilaHoje({
      premiumSemPainel: 0,
      pendentesComEmail: 0,
      whatsappPendentes: 0,
      feedbackRuim: 1,
    });
    expect(item.href).toBe('/admin/feedback?humor=ruim');
    expect(item.titulo).toBe('1 resposta ruim');
    expect(item.atencao).toBe(true);
  });
});
