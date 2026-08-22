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
 * Mensagem persuasiva para o dono da clínica/pet shop:
 * facilidade, crescimento e reconhecimento no mapa do Patinha.
 */
export function buildPartnerWhatsAppMessage(parceiro: PartnerInviteContext): string {
  const cidade = parceiro.cidade?.trim() || 'sua cidade';
  const nome = parceiro.nome.trim() || 'sua clínica';

  return (
    `Olá! Tudo bem? 🐾\n` +
    `\n` +
    `Falo da equipe do *Patinha* — o app em que tutores de ${cidade} cuidam do pet e *buscam clínicas e pet shops perto de casa*.\n` +
    `\n` +
    `A *${nome}* pode estar *lá*, na frente dos tutores certos, com *muito pouco esforço* da sua parte.\n` +
    `\n` +
    `✨ *Por que isso importa pra você*\n` +
    `• *Crescimento* — mais tutores te encontram quando precisam de consulta, banho, hotel…\n` +
    `• *Reconhecimento* — seu nome e serviços aparecem com clareza no mapa da região\n` +
    `• *Facilidade* — cadastro rápido, sem complicação; a gente te ajuda se precisar\n` +
    `\n` +
    `📍 Dá pra *começar grátis* (listagem no mapa após uma análise simples). Se quiser mais visibilidade, tem Básico (selo + WhatsApp) e Profissional (destaque no mapa) — mas o primeiro passo é entrar.\n` +
    `\n` +
    `👉 Cadastro em poucos minutos:\n` +
    `${SITE}/parceiros/cadastro\n` +
    `\n` +
    `Se preferir, responde aqui que eu te oriento passo a passo. Vale a pena estar onde o tutor já está olhando. 😊`
  );
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
