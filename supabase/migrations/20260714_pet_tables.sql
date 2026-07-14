-- schema.sql defined these tables but they were never actually applied to
-- production — only `tutor` (and its auth trigger) existed. The app has
-- always written pet/vaccine/weight data to localStorage only as a result.

CREATE TABLE IF NOT EXISTS public.pet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES public.tutor(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  raca text NOT NULL,
  data_nascimento date NOT NULL,
  sexo text NOT NULL CHECK (sexo IN ('macho','femea')),
  peso_atual numeric NOT NULL,
  foto_url text,
  fase_vida text NOT NULL DEFAULT 'filhote',
  objetivo text NOT NULL DEFAULT 'manutencao',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.peso_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pet(id) ON DELETE CASCADE NOT NULL,
  data timestamp DEFAULT now() NOT NULL,
  peso numeric NOT NULL,
  medidas jsonb
);

CREATE TABLE IF NOT EXISTS public.vacina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pet(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,
  data_aplicacao date NOT NULL,
  proxima_data date,
  veterinario_id uuid,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recomendacao_racao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pet(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,
  objetivo text NOT NULL,
  detalhes jsonb NOT NULL,
  data timestamp DEFAULT now() NOT NULL
);

ALTER TABLE public.pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peso_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recomendacao_racao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pet_select_own" ON public.pet;
CREATE POLICY "pet_select_own" ON public.pet FOR SELECT USING (auth.uid() = tutor_id);
DROP POLICY IF EXISTS "pet_insert_own" ON public.pet;
CREATE POLICY "pet_insert_own" ON public.pet FOR INSERT WITH CHECK (auth.uid() = tutor_id);
DROP POLICY IF EXISTS "pet_update_own" ON public.pet;
CREATE POLICY "pet_update_own" ON public.pet FOR UPDATE USING (auth.uid() = tutor_id);
DROP POLICY IF EXISTS "pet_delete_own" ON public.pet;
CREATE POLICY "pet_delete_own" ON public.pet FOR DELETE USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "peso_historico_select_own" ON public.peso_historico;
CREATE POLICY "peso_historico_select_own" ON public.peso_historico FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = peso_historico.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "peso_historico_insert_own" ON public.peso_historico;
CREATE POLICY "peso_historico_insert_own" ON public.peso_historico FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = peso_historico.pet_id AND pet.tutor_id = auth.uid())
);

DROP POLICY IF EXISTS "vacina_select_own" ON public.vacina;
CREATE POLICY "vacina_select_own" ON public.vacina FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = vacina.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "vacina_insert_own" ON public.vacina;
CREATE POLICY "vacina_insert_own" ON public.vacina FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = vacina.pet_id AND pet.tutor_id = auth.uid())
);

DROP POLICY IF EXISTS "recomendacao_racao_select_own" ON public.recomendacao_racao;
CREATE POLICY "recomendacao_racao_select_own" ON public.recomendacao_racao FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = recomendacao_racao.pet_id AND pet.tutor_id = auth.uid())
);
