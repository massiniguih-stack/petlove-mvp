import { createClient as createAdminClient } from '@supabase/supabase-js';

// O Next 14 guarda respostas de fetch no "Data Cache" da Vercel, inclusive as
// do supabase-js. Em 19/11/2026 o /mapa ficou mostrando 6 lojas de Maringá
// depois de importar 254, até alguém limpar o cache na mão. Dado do banco
// lido pelo servidor tem que ser sempre o atual: nunca guardar.
const fetchSemCache: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' });

export function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: fetchSemCache } }
  );
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
