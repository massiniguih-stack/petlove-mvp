type PartnerPublico = { premium?: boolean | null; instagram?: string | null };

// Listagem grátis não mostra canais de contato direto: o Instagram só vai
// para o /mapa de quem é premium. (O WhatsApp fica na coluna `whatsapp`,
// que nem é selecionada aqui — é uso interno do /admin.) Cortar no servidor
// garante que o dado não vaza nem pelo JSON da rota.
export function ocultarContatosDoPlanoGratis<T extends PartnerPublico>(partners: T[]): T[] {
  return partners.map((p) => (p.premium ? p : { ...p, instagram: null }));
}
