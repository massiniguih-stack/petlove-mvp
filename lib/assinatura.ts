// Regras pequenas sobre a assinatura do tutor, num lugar só, para o app e o
// servidor concordarem sobre quem é Premium.

/** Status de `subscriptions` que liberam o Premium. */
export const STATUS_PREMIUM = ['active', 'trialing'] as const;

export function statusDaPremium(status: string | null | undefined): boolean {
  return !!status && (STATUS_PREMIUM as readonly string[]).includes(status);
}

/** Intervalo mínimo entre duas consultas automáticas da assinatura. */
export const INTERVALO_RECONSULTA_MS = 60_000;

/**
 * Quando o tutor volta para o app (troca de aba, reabre o celular), vale
 * perguntar de novo ao servidor se ele virou Premium — o pagamento é
 * confirmado pela LastLink em segundo plano. Sem exagero: no máximo uma vez
 * por intervalo.
 */
export function deveReconsultarAssinatura(
  ultimaConsultaMs: number | null,
  agoraMs: number,
  intervaloMs = INTERVALO_RECONSULTA_MS,
): boolean {
  return ultimaConsultaMs === null || agoraMs - ultimaConsultaMs >= intervaloMs;
}
