import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

// Confirma que o pet pertence à conta logada antes de gravar algo em nome
// dela — mesmo espírito de lib/partner.ts::getOwnPartner(). Usa o client
// cookie-scoped (não o de service role) pra deixar a RLS de `pet`
// (pet_select_own: auth.uid() = tutor_id) fazer a checagem.
export async function getOwnPet(petId: string): Promise<{ user: User | null; pet: { id: string; nome: string } | null }> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { user: null, pet: null };

  const { data: pet } = await supabase
    .from('pet')
    .select('id, nome')
    .eq('id', petId)
    .maybeSingle();

  return { user, pet: pet || null };
}
