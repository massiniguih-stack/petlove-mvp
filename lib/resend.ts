import { Resend } from 'resend';

// Cliente do Resend criado só na hora do envio.
//
// Criar o cliente no topo do arquivo da rota (`new Resend(process.env...)`)
// quebra o `next build` em qualquer ambiente sem RESEND_API_KEY (ex.: os
// deploys de Preview da Vercel), porque o construtor lança erro quando a
// chave está vazia. Aqui a falta da chave só aparece ao tentar enviar, e
// todo envio já está dentro de try/catch.
let client: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY não configurada');
  }
  if (!client) client = new Resend(key);
  return client;
}
