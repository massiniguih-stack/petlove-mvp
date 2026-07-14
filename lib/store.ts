import { create } from 'zustand';
import { createClient } from './supabase/client';

export interface Tutor {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface Pet {
  id: string;
  nome: string;
  raca: string;
  dataNascimento: string;
  peso: number;
  sexo: 'macho' | 'femea';
  objetivo: 'manutencao' | 'pelagem' | 'desempenho' | 'emagrecimento';
  fotoUrl: string | null;
  tutor: Tutor;
}

interface PetState {
  pets: Pet[];
  selectedPetId: string | null;
  isPremium: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  petsCarregados: boolean;
  hydrated: boolean;
  hydrate: () => void;
  addPet: (pet: Pet) => Promise<{ error?: string }>;
  removePet: (id: string) => Promise<void>;
  selectPet: (id: string) => void;
  updatePet: (id: string, updates: Partial<Pet>) => Promise<{ error?: string }>;
  fetchPets: () => Promise<void>;
  setPremium: (value: boolean) => void;
  setPlan: (plan: string | null, status: string | null, periodEnd: string | null, cancel: boolean) => void;
  fetchSubscription: () => Promise<void>;
  clearAll: () => void;
  pet: Pet | null;
}

// Banco <-> forma local usada pelo app
function petFromRow(row: Record<string, unknown>, tutor: Tutor): Pet {
  return {
    id: row.id as string,
    nome: row.nome as string,
    raca: row.raca as string,
    dataNascimento: row.data_nascimento as string,
    peso: Number(row.peso_atual),
    sexo: row.sexo as Pet['sexo'],
    objetivo: row.objetivo as Pet['objetivo'],
    fotoUrl: (row.foto_url as string) || null,
    tutor,
  };
}

// Garante que o tutor tenha uma linha na tabela `tutor` antes de mexer em
// pets — o trigger que cria essa linha automaticamente só existe desde uma
// certa data; contas mais antigas podem não ter sido cobertas por ele.
// Feito via rota de servidor (service role) porque a tabela `tutor` não tem
// policy de RLS para INSERT no cliente, só SELECT/UPDATE.
async function ensureTutorRow(_supabase: ReturnType<typeof createClient>, _user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  try {
    await fetch('/api/tutor/ensure', { method: 'POST' });
  } catch {
    // não bloqueia o fluxo local se a chamada falhar
  }
}

function petToRow(pet: Partial<Pet>) {
  const row: Record<string, unknown> = {};
  if (pet.nome !== undefined) row.nome = pet.nome;
  if (pet.raca !== undefined) row.raca = pet.raca;
  if (pet.dataNascimento !== undefined) row.data_nascimento = pet.dataNascimento;
  if (pet.peso !== undefined) row.peso_atual = pet.peso;
  if (pet.sexo !== undefined) row.sexo = pet.sexo;
  if (pet.objetivo !== undefined) row.objetivo = pet.objetivo;
  if (pet.fotoUrl !== undefined) row.foto_url = pet.fotoUrl;
  return row;
}

const PETS_KEY = 'petlove_pets';
const SELECTED_KEY = 'petlove_selected_pet';
const PREMIUM_KEY = 'petlove_premium';
const PLAN_KEY = 'petlove_plan';
const PLAN_CACHE_KEY = 'petlove_plan_cache';
const PLAN_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function loadPets(): Pet[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PETS_KEY);
    if (data) return JSON.parse(data);
    const oldData = localStorage.getItem('petlove_pet');
    if (oldData) {
      const pet = JSON.parse(oldData);
      localStorage.removeItem('petlove_pet');
      return [pet];
    }
    return [];
  } catch {
    return [];
  }
}

function loadSelectedId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_KEY);
}

function loadPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PREMIUM_KEY) === 'true';
}

function loadPlanCache(): { plan: string | null; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(PLAN_CACHE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (Date.now() - parsed.timestamp > PLAN_CACHE_TTL) {
      localStorage.removeItem(PLAN_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePets(pets: Pet[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PETS_KEY, JSON.stringify(pets));
}

function saveSelectedId(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(SELECTED_KEY, id);
  } else {
    localStorage.removeItem(SELECTED_KEY);
  }
}

function savePremium(value: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREMIUM_KEY, String(value));
}

export const usePetStore = create<PetState>((set, get) => {
  // Estado inicial precisa bater com o que o servidor renderiza (sem acesso a
  // localStorage) para não causar erro de hidratação do React. Os dados reais
  // só entram depois, via hydrate() chamado num useEffect (ver SubscriptionLoader).
  return {
    pets: [],
    selectedPetId: null,
    isPremium: false,
    plan: null,
    subscriptionStatus: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    petsCarregados: false,
    hydrated: false,
    pet: null,

    hydrate: () => {
      const pets = loadPets();
      const selectedId = loadSelectedId();
      const isPremium = loadPremium();
      const planCache = loadPlanCache();
      const currentPet = pets.find((p) => p.id === selectedId) || pets[0] || null;

      set({
        pets,
        selectedPetId: currentPet?.id || null,
        isPremium,
        plan: planCache?.plan || null,
        pet: currentPet,
        hydrated: true,
      });
    },

    fetchPets: async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await ensureTutorRow(supabase, user);

        const { data: tutorRow } = await supabase.from('tutor').select('*').eq('id', user.id).single();
        const tutor: Tutor = {
          nome: (tutorRow?.nome as string) || '',
          email: (tutorRow?.email as string) || user.email || '',
          telefone: (tutorRow?.telefone as string) || '',
          endereco: (tutorRow?.endereco as string) || '',
        };

        const { data: rows, error } = await supabase.from('pet').select('*').order('created_at');
        if (error) throw error;

        // Primeira sincronização: pets que só existiam no localStorage sobem pro banco
        const { pets: petsLocais } = get();
        if ((!rows || rows.length === 0) && petsLocais.length > 0) {
          const inseridos: Pet[] = [];
          for (const p of petsLocais) {
            const { data: novo, error: insertErr } = await supabase
              .from('pet')
              .insert({ id: p.id, tutor_id: user.id, ...petToRow(p) })
              .select()
              .single();
            if (!insertErr && novo) inseridos.push(petFromRow(novo, tutor));
          }
          if (inseridos.length > 0) {
            savePets(inseridos);
            const selectedId = get().selectedPetId;
            const selected = inseridos.find((p) => p.id === selectedId) || inseridos[0];
            set({ pets: inseridos, pet: selected, selectedPetId: selected?.id || null, petsCarregados: true });
            return;
          }
        }

        const petsServidor = (rows || []).map((r) => petFromRow(r, tutor));
        savePets(petsServidor);
        const selectedId = get().selectedPetId;
        const selected = petsServidor.find((p) => p.id === selectedId) || petsServidor[0] || null;
        if (selected) saveSelectedId(selected.id);
        set({ pets: petsServidor, pet: selected, selectedPetId: selected?.id || null, petsCarregados: true });
      } catch (error) {
        console.error('Failed to fetch pets:', error);
        set({ petsCarregados: true });
      }
    },

    addPet: async (pet) => {
      const { pets, isPremium } = get();
      if (!isPremium && pets.length >= 1) return { error: 'Limite de pets do plano gratuito atingido' };

      // Atualiza local imediatamente para a UI responder na hora
      const newPets = [...pets, pet];
      savePets(newPets);
      set({ pets: newPets, pet, selectedPetId: pet.id });
      saveSelectedId(pet.id);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Sessão expirada, faça login novamente' };

        await ensureTutorRow(supabase, user);

        const { error } = await supabase.from('pet').insert({ id: pet.id, tutor_id: user.id, ...petToRow(pet) });
        if (error) throw error;

        if (pet.tutor?.telefone || pet.tutor?.endereco) {
          await supabase.from('tutor').update({
            telefone: pet.tutor.telefone || null,
            endereco: pet.tutor.endereco || null,
          }).eq('id', user.id);
        }
        return {};
      } catch (error) {
        console.error('Failed to save pet to database:', error);
        return { error: 'Não foi possível salvar no servidor — os dados ficaram só neste dispositivo por enquanto.' };
      }
    },

    removePet: async (id) => {
      const { pets, selectedPetId } = get();
      const newPets = pets.filter((p) => p.id !== id);
      savePets(newPets);
      const newSelected = selectedPetId === id ? newPets[0]?.id || null : selectedPetId;
      saveSelectedId(newSelected);
      set({
        pets: newPets,
        selectedPetId: newSelected,
        pet: newPets.find((p) => p.id === newSelected) || null,
      });

      try {
        const supabase = createClient();
        await supabase.from('pet').delete().eq('id', id);
      } catch (error) {
        console.error('Failed to delete pet from database:', error);
      }
    },

    selectPet: (id) => {
      const { pets } = get();
      const pet = pets.find((p) => p.id === id);
      saveSelectedId(id);
      set({ selectedPetId: id, pet: pet || null });
    },

    updatePet: async (id, updates) => {
      const { pets, selectedPetId } = get();
      const newPets = pets.map((p) => (p.id === id ? { ...p, ...updates } : p));
      savePets(newPets);
      const selectedPet = newPets.find((p) => p.id === selectedPetId);
      set({ pets: newPets, pet: selectedPet || null });

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Sessão expirada, faça login novamente' };

        const row = petToRow(updates);
        if (Object.keys(row).length > 0) {
          const { error } = await supabase.from('pet').update(row).eq('id', id);
          if (error) throw error;
        }

        if (updates.tutor?.telefone !== undefined || updates.tutor?.endereco !== undefined) {
          await supabase.from('tutor').update({
            telefone: updates.tutor?.telefone || null,
            endereco: updates.tutor?.endereco || null,
          }).eq('id', user.id);
        }
        return {};
      } catch (error) {
        console.error('Failed to update pet in database:', error);
        return { error: 'Não foi possível salvar no servidor — os dados ficaram só neste dispositivo por enquanto.' };
      }
    },

    setPremium: (value) => {
      savePremium(value);
      set({ isPremium: value });
    },

    setPlan: (plan, status, periodEnd, cancel) => {
      savePremium(!!plan);
      localStorage.setItem(PLAN_KEY, plan || '');
      localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({ plan, timestamp: Date.now() }));
      set({
        isPremium: !!plan,
        plan,
        subscriptionStatus: status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: cancel,
      });
    },

    fetchSubscription: async () => {
      try {
        const res = await fetch('/api/subscription');
        const data = await res.json();
        const { setPlan } = get();
        setPlan(data.plan, data.status, data.currentPeriodEnd, data.cancelAtPeriodEnd);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    },

    clearAll: () => {
      localStorage.removeItem(PETS_KEY);
      localStorage.removeItem(SELECTED_KEY);
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem(PLAN_KEY);
      localStorage.removeItem(PLAN_CACHE_KEY);
      localStorage.removeItem('petlove_pet');
      set({
        pets: [],
        selectedPetId: null,
        pet: null,
        isPremium: false,
        plan: null,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    },
  };
});
