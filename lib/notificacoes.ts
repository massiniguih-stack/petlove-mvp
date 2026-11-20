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

/**
 * A chave pública do push (VAPID) precisa ser um ponto P-256 de 65 bytes em
 * base64url (~87 caracteres, começa com "B"). Com outra coisa (ex.: a chave
 * PRIVADA colada no lugar) o navegador recusa com um "InvalidAccessError"
 * que ninguém entende — melhor detectar antes e explicar.
 */
/**
 * Motivo curto de um erro para mostrar ao tutor/suporte. O FirebaseError tem
 * um `code` ("installations/request-failed", "messaging/token-subscribe-failed"...)
 * que diz muito mais que o nome genérico "FirebaseError".
 */
export function motivoDoErro(err: unknown): string {
  const code = (err as { code?: unknown } | null)?.code;
  if (typeof code === 'string' && code) return code;
  return err instanceof Error ? err.name : 'erro';
}

export function chaveVapidValida(chave: string): boolean {
  const k = chave.trim().replace(/=+$/, '');
  if (!/^[A-Za-z0-9_-]+$/.test(k)) return false;
  try {
    const b64 = k.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    return bin.length === 65 && bin.charCodeAt(0) === 4;
  } catch {
    return false;
  }
}
