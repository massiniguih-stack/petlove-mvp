/**
 * Textos de outreach a parceiros (WhatsApp, e-mail, etc.).
 * Fonte única: admin /parceiros e scripts em /parceiros/convites.
 */

export const SITE = 'https://patinha-mvp.vercel.app';

export type PartnerInviteContext = {
  nome: string;
  cidade?: string | null;
};

/** Mensagem de apresentação + convite para WhatsApp (wa.me). */
export function buildPartnerWhatsAppMessage(parceiro: PartnerInviteContext): string {
  const cidade = parceiro.cidade?.trim() || 'sua região';
  const nome = parceiro.nome.trim() || 'seu negócio';

  return (
    `🐾 *Patinha* — apresentação rápida\n` +
    `\n` +
    `Olá! Tudo bem?\n` +
    `\n` +
    `Somos do *Patinha*, um app para tutores de cães e gatos organizarem o dia a dia do pet (saúde, peso, ração, vacinas e atividades) e *encontrarem serviços perto de casa* no mapa.\n` +
    `\n` +
    `Vi a *${nome}* em *${cidade}* e achei que faz muito sentido aparecerem para esses tutores.\n` +
    `\n` +
    `✅ *Listagem grátis* no mapa (após uma análise rápida)\n` +
    `✅ Perfil com serviços e contato\n` +
    `✅ Planos pagos opcionais: selo Premium, WhatsApp no app e destaque na cidade\n` +
    `\n` +
    `📋 *Planos*\n` +
    `• Grátis — entrar no mapa\n` +
    `• Básico — R$ 39,80/mês (selo + WhatsApp)\n` +
    `• Profissional — R$ 69,80/mês (selo + *Destaque* + painel)\n` +
    `• Empresarial — R$ 129,80/mês (máxima prioridade)\n` +
    `\n` +
    `🔗 Ver planos: ${SITE}/parceiros/premium\n` +
    `📝 Cadastro: ${SITE}/parceiros/cadastro\n` +
    `\n` +
    `Se quiser, respondo por aqui e te ajudo no cadastro. Obrigado! 😊`
  );
}

/** Monta URL wa.me com a mensagem de apresentação. */
export function buildPartnerWhatsAppUrl(telefone: string, parceiro: PartnerInviteContext): string | null {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10) return null;
  const numero = digitos.startsWith('55') ? digitos : `55${digitos}`;
  const mensagem = buildPartnerWhatsAppMessage(parceiro);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Template genérico com placeholder {CLINICA} (página de scripts). */
export function partnerWhatsAppTemplate(clinicaPlaceholder = '{CLINICA}'): string {
  return buildPartnerWhatsAppMessage({
    nome: clinicaPlaceholder,
    cidade: 'sua região',
  });
}
