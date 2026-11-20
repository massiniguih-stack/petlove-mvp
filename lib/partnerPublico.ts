type PartnerPublico = {
  tipo?: string | null;
  premium?: boolean | null;
  destaque?: boolean | null;
};

// Campos que uma loja do plano grátis expõe no /mapa: só o necessário para
// desenhar o pino e abrir o balão com nome e endereço.
const CAMPOS_SO_LOCALIZACAO = ['id', 'tipo', 'nome', 'endereco', 'bairro', 'cidade', 'lat', 'lng'] as const;

/**
 * Loja do plano grátis aparece no /mapa só como pino (nome e endereço).
 * Card na lista, telefone, horário, serviços, avaliação e redes são do plano pago.
 * Parques não são lojas (não têm plano) e continuam completos.
 */
export function soLocalizacaoNoMapa(p: PartnerPublico): boolean {
  return p.tipo !== 'parque' && !p.premium && !p.destaque;
}

// Cortar no servidor garante que o dado não vaza nem pelo JSON da rota.
// (O WhatsApp fica na coluna `whatsapp`, que nem é selecionada — uso interno do /admin.)
export function limitarPlanoGratisAoMapa<T extends PartnerPublico>(partners: T[]): T[] {
  return partners.map((p) => {
    if (!soLocalizacaoNoMapa(p)) return p;
    const reduzido: Record<string, unknown> = {};
    for (const campo of CAMPOS_SO_LOCALIZACAO) {
      if (campo in p) reduzido[campo] = (p as Record<string, unknown>)[campo];
    }
    return reduzido as T;
  });
}
