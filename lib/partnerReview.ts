// Parceiros que se cadastram sozinhos em /parceiros/cadastro entram com este
// status e NÃO aparecem no /mapa até a equipe aprovar no /admin/parceiros.
// Sem isso, qualquer pessoa conseguia publicar uma "clínica" falsa no mapa.
//
// Os demais status (pending/sent) são do funil de convites de parceiros que
// a própria equipe importou — esses já são confiáveis e seguem visíveis.
export const AWAITING_REVIEW_STATUS = 'new_signup';
export const APPROVED_STATUS = 'ativo';

export function isAwaitingReview(status: string | null | undefined): boolean {
  return status === AWAITING_REVIEW_STATUS;
}
