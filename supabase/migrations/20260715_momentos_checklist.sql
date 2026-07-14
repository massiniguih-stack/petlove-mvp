-- /vida (linha do tempo: vacinas, marcos, fotos) e os checklists diários de
-- /atividades e /racao eram só estado em memória (vida) ou localStorage
-- (atividades/racao) — nunca chegavam no banco. Estas tabelas dão
-- persistência real, seguindo o mesmo padrão de RLS via pet.tutor_id usado
-- em peso_historico/vacina.

CREATE TABLE IF NOT EXISTS public.momento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pet(id) ON DELETE CASCADE NOT NULL,
  data timestamp NOT NULL,
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL CHECK (categoria IN ('nascimento','vacina','doenca','conquista','evento','foto','viagem')),
  foto_url text,
  status_vacina text CHECK (status_vacina IN ('tomada','pendente')),
  data_agendada date,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checklist_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES public.pet(id) ON DELETE CASCADE NOT NULL,
  lista text NOT NULL CHECK (lista IN ('atividade','refeicao')),
  dia date NOT NULL DEFAULT CURRENT_DATE,
  hora text NOT NULL,
  nome text NOT NULL,
  detalhe text,
  concluida boolean NOT NULL DEFAULT false,
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.momento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_item ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "momento_select_own" ON public.momento;
CREATE POLICY "momento_select_own" ON public.momento FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = momento.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "momento_insert_own" ON public.momento;
CREATE POLICY "momento_insert_own" ON public.momento FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = momento.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "momento_update_own" ON public.momento;
CREATE POLICY "momento_update_own" ON public.momento FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = momento.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "momento_delete_own" ON public.momento;
CREATE POLICY "momento_delete_own" ON public.momento FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = momento.pet_id AND pet.tutor_id = auth.uid())
);

DROP POLICY IF EXISTS "checklist_item_select_own" ON public.checklist_item;
CREATE POLICY "checklist_item_select_own" ON public.checklist_item FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = checklist_item.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "checklist_item_insert_own" ON public.checklist_item;
CREATE POLICY "checklist_item_insert_own" ON public.checklist_item FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = checklist_item.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "checklist_item_update_own" ON public.checklist_item;
CREATE POLICY "checklist_item_update_own" ON public.checklist_item FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = checklist_item.pet_id AND pet.tutor_id = auth.uid())
);
DROP POLICY IF EXISTS "checklist_item_delete_own" ON public.checklist_item;
CREATE POLICY "checklist_item_delete_own" ON public.checklist_item FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.pet WHERE pet.id = checklist_item.pet_id AND pet.tutor_id = auth.uid())
);
