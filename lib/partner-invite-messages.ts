/**
 * Única mensagem de outreach a parceiros: WhatsApp.
 * Usada em /admin/parceiros (fila) e /parceiros/convites.
 */

import { getAppUrl } from '@/lib/appUrl';

export const SITE = getAppUrl();

export type PartnerInviteContext = {
  nome: string;
  cidade?: string | null;
};

/**
 * Mensagem de disparo para lojas que já estão no mapa (listagem grátis).
 * Ordem: o app é grátis → a loja já está lá → o que o tutor encontra →
 * objeções comuns → o que o plano pago acrescenta → como instalar → links.
 * Preço do Básico: manter igual a app/parceiros/premium/PremiumClient.tsx.
 */
export function buildPartnerWhatsAppMessage(parceiro: PartnerInviteContext): string {
  const cidade = parceiro.cidade?.trim() || 'sua cidade';
  const nome = parceiro.nome.trim() || 'sua loja';

  return [
    `Olá! Tudo bem? 🐾`,
    ``,
    `Aqui é da equipe do *Patinha*, um app *gratuito* que tutores de ${cidade} já estão usando para cuidar do pet e achar serviços perto de casa.`,
    ``,
    `📍 A *${nome}* já aparece no mapa do Patinha. Você não precisa fazer nada nem pagar nada para continuar lá.`,
    ``,
    `*O que o tutor encontra no app*`,
    `• Clínicas veterinárias, pet shops, banho e tosa, hotéis, creches e adestradores da região`,
    `• Lembrete de vacinas e consultas, controle de peso, ração e passeios do pet`,
    `• Rota até o seu endereço com um toque`,
    ``,
    `*Dúvidas comuns*`,
    `• _É pago?_ Não. O app é grátis para o tutor e a listagem no mapa é grátis para você.`,
    `• _Dá trabalho?_ Não. Seu endereço já está lá; completar o cadastro leva poucos minutos e é opcional.`,
    `• _Preciso baixar na loja de apps?_ Não. O Patinha abre pelo link e vira app no celular (explico abaixo).`,
    ``,
    `⭐ *Quer que o tutor fale direto com você?*`,
    `No grátis aparece só o seu pino, com nome e endereço. No plano *Básico* (R$ 239,80 por ano, menos de R$ 20 por mês), o tutor vê seu card completo com telefone, horário, serviços, *botão de WhatsApp* e selo, e sua loja aparece acima das grátis.`,
    ``,
    `📲 *Como deixar o Patinha como app no celular*`,
    `*iPhone:* abra o link no Safari → toque em Compartilhar (quadrado com seta) → "Adicionar à Tela de Início"`,
    `*Android:* abra o link no Chrome → toque nos 3 pontinhos → "Instalar app" ou "Adicionar à tela inicial"`,
    ``,
    `👉 Conhecer o app: ${SITE}`,
    `👉 Planos para sua loja: ${SITE}/parceiros/premium`,
    ``,
    `Qualquer dúvida, é só responder aqui. Se não quiser receber mensagens, responda *SAIR*. 😊`,
  ].join('\n');
}

/** Monta URL wa.me com a mensagem única de WhatsApp. */
export function buildPartnerWhatsAppUrl(telefone: string, parceiro: PartnerInviteContext): string | null {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10) return null;
  const numero = digitos.startsWith('55') ? digitos : `55${digitos}`;
  const mensagem = buildPartnerWhatsAppMessage(parceiro);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Template com placeholder {CLINICA} (página de prévia). */
export function partnerWhatsAppTemplate(clinicaPlaceholder = '{CLINICA}'): string {
  return buildPartnerWhatsAppMessage({
    nome: clinicaPlaceholder,
    cidade: 'sua cidade',
  });
}
