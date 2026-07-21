import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { User } from '@supabase/supabase-js';

export interface OwnPartnerRow {
  id: string;
  tipo: string;
  nome: string;
  descricao: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  instagram: string | null;
  website: string | null;
  email: string | null;
  horario: string | null;
  servicos: string[] | null;
  plantao24h: boolean;
  premium: boolean;
  destaque: boolean;
  status: string;
  user_id: string | null;
}

// Acha a linha de `partners` da conta logada. Cobre dois casos:
// 1. Compra recente: o webhook do LastLink já gravou partners.user_id.
// 2. Parceiro premium de antes dessa feature (ou onde o casamento por
//    e-mail nunca rodou): faz o vínculo na hora, comparando o e-mail da
//    conta logada com partners.email de uma linha ainda sem user_id.
export async function getOwnPartner(): Promise<{ user: User | null; partner: OwnPartnerRow | null }> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { user: null, partner: null };

  const supabaseAdmin = getSupabaseAdmin();

  const { data: linked } = await supabaseAdmin
    .from('partners')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (linked) return { user, partner: linked as OwnPartnerRow };

  if (!user.email) return { user, partner: null };

  const { data: byEmail } = await supabaseAdmin
    .from('partners')
    .select('*')
    .eq('email', user.email)
    .is('user_id', null)
    .maybeSingle();

  if (!byEmail) return { user, partner: null };

  const { data: updated } = await supabaseAdmin
    .from('partners')
    .update({ user_id: user.id })
    .eq('id', byEmail.id)
    .select('*')
    .maybeSingle();

  return { user, partner: (updated as OwnPartnerRow) || (byEmail as OwnPartnerRow) };
}
