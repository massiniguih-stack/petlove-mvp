import { describe, expect, it } from 'vitest';
import { SITE, buildPartnerWhatsAppMessage, buildPartnerWhatsAppUrl } from './partner-invite-messages';

describe('buildPartnerWhatsAppMessage', () => {
  const msg = buildPartnerWhatsAppMessage({ nome: '14Pets', cidade: 'Maringá' });

  it('personaliza com o nome da loja e a cidade', () => {
    expect(msg).toContain('A *14Pets* já aparece no mapa');
    expect(msg).toContain('tutores de Maringá');
  });

  it('diz que é grátis, explica o plano pago e ensina a instalar', () => {
    expect(msg).toMatch(/app \*gratuito\*/);
    expect(msg).toContain('R$ 239,80 por ano');
    expect(msg).toContain('Adicionar à Tela de Início');
    expect(msg).toContain('Instalar app');
  });

  it('leva para o app e para os planos, e oferece saída', () => {
    expect(msg).toContain(`Conhecer o app: ${SITE}\n`);
    expect(msg).toContain(`${SITE}/parceiros/premium`);
    expect(msg).toContain('responda *SAIR*');
  });

  it('usa quebra de linha de verdade, sem "\\n" escrito no texto', () => {
    expect(msg).not.toContain('\\n');
    expect(msg.split('\n').length).toBeGreaterThan(20);
  });
});

describe('buildPartnerWhatsAppUrl', () => {
  it('monta o link wa.me com 55 e a mensagem codificada', () => {
    const url = buildPartnerWhatsAppUrl('(44) 99999-0000', { nome: 'Loja', cidade: 'Sarandi' });
    expect(url).toMatch(/^https:\/\/wa\.me\/5544999990000\?text=/);
    expect(decodeURIComponent(url!.split('text=')[1])).toContain('tutores de Sarandi');
  });

  it('recusa telefone curto', () => {
    expect(buildPartnerWhatsAppUrl('123', { nome: 'x' })).toBeNull();
  });
});
