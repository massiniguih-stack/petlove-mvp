import { createClient as createAdminClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com').split(',');

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
