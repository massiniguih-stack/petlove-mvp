// Regras puras das notificações do aparelho (testáveis sem navegador).

/** O que o app lembra do último token enviado ao servidor. */
export interface TokenEnviado {
  token: string;
  em: number; // Date.now() do envio
}

export const REENVIO_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * O Firebase pode trocar o token do aparelho, e o servidor só guarda um por
 * pessoa. Reenvia quando o token mudou, quando nunca foi enviado, ou a cada
 * 7 dias (para o "último aparelho" voltar a ser este).
 */
export function precisaReenviarToken(salvo: TokenEnviado | null, tokenAtual: string, agoraMs: number): boolean {
  if (!salvo) return true;
  if (salvo.token !== tokenAtual) return true;
  return agoraMs - salvo.em >= REENVIO_TOKEN_MS;
}

export function lerTokenEnviado(bruto: string | null): TokenEnviado | null {
  if (!bruto) return null;
  try {
    const v = JSON.parse(bruto);
    return typeof v?.token === 'string' && typeof v?.em === 'number' ? v : null;
  } catch {
    return null;
  }
}

/** iPhone/iPad só recebem notificação de site instalado na tela de início. */
export function precisaInstalarNoIphone(userAgent: string, standalone: boolean): boolean {
  const ehIos = /iPhone|iPad|iPod/i.test(userAgent);
  return ehIos && !standalone;
}
