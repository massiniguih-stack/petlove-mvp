// Remetente de todos os e-mails do app.
//
// Enquanto não houver domínio próprio verificado no Resend, usamos o
// remetente de teste do Resend (onboarding@resend.dev), que só entrega para o
// dono da conta Resend. Depois de verificar o domínio, basta definir na Vercel:
//   EMAIL_FROM="Patinha <nao-responda@patinha.app.br>"
// Valores mal formatados são ignorados para não derrubar o envio.
export const FALLBACK_EMAIL_FROM = 'Patinha <onboarding@resend.dev>';

const ADDRESS = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
const NAMED = /^[^<>]+<([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>$/;

export function getEmailFrom(): string {
  const raw = process.env.EMAIL_FROM?.trim().replace(/^"(.*)"$/, '$1').trim();
  if (raw && (ADDRESS.test(raw) || NAMED.test(raw))) return raw;
  return FALLBACK_EMAIL_FROM;
}
