-- Suplementos que o tutor informa que o pet toma (tela de Ração).
-- O app não recomenda suplemento: só guarda o que o tutor cadastrou.
CREATE TABLE IF NOT EXISTS public.suplemento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pet(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL CHECK (char_length(btrim(nome)) BETWEEN 1 AND 80),
  dose text CHECK (dose IS NULL OR char_length(dose) <= 80),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suplemento_pet_id ON public.suplemento(pet_id);

ALTER TABLE public.suplemento ENABLE ROW LEVEL SECURITY;

-- Sempre com TO authenticated: sem o TO, a política vale também para anon.
DROP POLICY IF EXISTS "suplemento_select_own" ON public.suplemento;
CREATE POLICY "suplemento_select_own" ON public.suplemento FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = suplemento.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "suplemento_insert_own" ON public.suplemento;
CREATE POLICY "suplemento_insert_own" ON public.suplemento FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = suplemento.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "suplemento_delete_own" ON public.suplemento;
CREATE POLICY "suplemento_delete_own" ON public.suplemento FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = suplemento.pet_id AND pet.tutor_id = auth.uid())
);
