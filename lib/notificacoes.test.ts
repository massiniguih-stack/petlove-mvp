import { describe, expect, it } from 'vitest';
import { REENVIO_TOKEN_MS, chaveVapidValida, lerTokenEnviado, precisaInstalarNoIphone, precisaReenviarToken } from './notificacoes';

describe('precisaReenviarToken', () => {
  it('envia quando nunca enviou', () => {
    expect(precisaReenviarToken(null, 'a', 0)).toBe(true);
  });
  it('envia quando o Firebase trocou o token', () => {
    expect(precisaReenviarToken({ token: 'a', em: 0 }, 'b', 1)).toBe(true);
  });
  it('não reenvia o mesmo token dentro de 7 dias', () => {
    expect(precisaReenviarToken({ token: 'a', em: 0 }, 'a', REENVIO_TOKEN_MS - 1)).toBe(false);
  });
  it('reenvia o mesmo token depois de 7 dias', () => {
    expect(precisaReenviarToken({ token: 'a', em: 0 }, 'a', REENVIO_TOKEN_MS)).toBe(true);
  });
});

describe('lerTokenEnviado', () => {
  it('lê o que foi salvo e ignora lixo', () => {
    expect(lerTokenEnviado('{"token":"a","em":5}')).toEqual({ token: 'a', em: 5 });
    expect(lerTokenEnviado('nada')).toBeNull();
    expect(lerTokenEnviado('{"token":1}')).toBeNull();
    expect(lerTokenEnviado(null)).toBeNull();
  });
});

describe('precisaInstalarNoIphone', () => {
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15';
  it('iPhone no Safari precisa instalar na tela de início', () => {
    expect(precisaInstalarNoIphone(iphone, false)).toBe(true);
  });
  it('iPhone com o app instalado não precisa', () => {
    expect(precisaInstalarNoIphone(iphone, true)).toBe(false);
  });
  it('Android não precisa', () => {
    expect(precisaInstalarNoIphone('Mozilla/5.0 (Linux; Android 14)', false)).toBe(false);
  });
});

describe('chaveVapidValida', () => {
  const publica = 'BMI45NMbo6sImh15XeefDM65zOInZ7fDDGZz81NJjephmMk2cXG9Fu_XWjswqcIFEIP8P4RstOxthBwRq3QU_AQ';
  it('aceita a chave pública do Firebase, mesmo com espaço sobrando', () => {
    expect(chaveVapidValida(publica)).toBe(true);
    expect(chaveVapidValida(` ${publica}\n`)).toBe(true);
  });
  it('recusa a chave privada (32 bytes) colada no lugar', () => {
    expect(chaveVapidValida('x'.repeat(43))).toBe(false);
  });
  it('recusa lixo, aspas e vazio', () => {
    expect(chaveVapidValida(`"${publica}"`)).toBe(false);
    expect(chaveVapidValida('AIzaSyA3Y8P61m--wEXNE3rkYxjeSN2iFadYjGI')).toBe(false);
    expect(chaveVapidValida('')).toBe(false);
  });
});
