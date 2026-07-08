import { create } from 'zustand';

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
  addPet: (pet: Pet) => void;
  removePet: (id: string) => void;
  selectPet: (id: string) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  setPremium: (value: boolean) => void;
  clearAll: () => void;
  pet: Pet | null;
}

const PETS_KEY = 'petlove_pets';
const SELECTED_KEY = 'petlove_selected_pet';
const PREMIUM_KEY = 'petlove_premium';

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
  const pets = loadPets();
  const selectedId = loadSelectedId();
  const isPremium = loadPremium();

  const currentPet = pets.find((p) => p.id === selectedId) || pets[0] || null;

  return {
    pets,
    selectedPetId: currentPet?.id || null,
    isPremium,
    pet: currentPet,

    addPet: (pet) => {
      const { pets, isPremium } = get();
      if (!isPremium && pets.length >= 1) return;
      const newPets = [...pets, pet];
      savePets(newPets);
      set({ pets: newPets, pet, selectedPetId: pet.id });
      saveSelectedId(pet.id);
    },

    removePet: (id) => {
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
    },

    selectPet: (id) => {
      const { pets } = get();
      const pet = pets.find((p) => p.id === id);
      saveSelectedId(id);
      set({ selectedPetId: id, pet: pet || null });
    },

    updatePet: (id, updates) => {
      const { pets, selectedPetId } = get();
      const newPets = pets.map((p) => (p.id === id ? { ...p, ...updates } : p));
      savePets(newPets);
      const selectedPet = newPets.find((p) => p.id === selectedPetId);
      set({ pets: newPets, pet: selectedPet || null });
    },

    setPremium: (value) => {
      savePremium(value);
      set({ isPremium: value });
    },

    clearAll: () => {
      localStorage.removeItem(PETS_KEY);
      localStorage.removeItem(SELECTED_KEY);
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem('petlove_pet');
      set({ pets: [], selectedPetId: null, pet: null, isPremium: false });
    },
  };
});
