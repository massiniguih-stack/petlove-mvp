// Número de WhatsApp de um parceiro para a equipe (admin) entrar em contato.
// Nunca vai para o /mapa: a rota pública /api/servicos não seleciona a
// coluna `whatsapp`.

/** Marca as linhas que vieram da planilha "mapeamento pet · maringá e região". */
export const ORIGEM_MAPEAMENTO_MARINGA = 'mapeamento-maringa-2026-11';

type ContatoParceiro = {
  whatsapp?: string | null;
  telefone?: string | null;
  origem?: string | null;
};

function comDDI(digitos: string): string | null {
  if (digitos.length < 10) return null;
  return digitos.startsWith('55') && digitos.length >= 12 ? digitos : `55${digitos}`;
}

/**
 * Devolve só os dígitos (com 55 na frente) ou null se não há WhatsApp.
 *
 * - Com `whatsapp` preenchido: usa ele.
 * - Linha do mapeamento sem `whatsapp`: a planilha já disse que a loja não
 *   tem WhatsApp (em geral é telefone fixo), então fica fora da fila.
 * - Parceiros antigos (sem a coluna): segue valendo o telefone, como antes.
 */
export function numeroWhatsappParceiro(parceiro: ContatoParceiro): string | null {
  const whatsapp = (parceiro.whatsapp || '').replace(/\D/g, '');
  if (whatsapp) return comDDI(whatsapp);
  if (parceiro.origem === ORIGEM_MAPEAMENTO_MARINGA) return null;
  return comDDI((parceiro.telefone || '').replace(/\D/g, ''));
}
