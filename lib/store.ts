import { create } from 'zustand';

export interface Pet {
  id: string;
  nome: string;
  raca: string;
  dataNascimento: string;
  peso: number;
  sexo: 'macho' | 'femea';
  objetivo: 'manutencao' | 'pelagem' | 'desempenho';
  fotoUrl: string | null;
  tutorId: string;
}

interface PetState {
  pet: Pet | null;
  setPet: (pet: Pet) => void;
  clearPet: () => void;
}

export const usePetStore = create<PetState>((set) => ({
  pet: null,
  setPet: (pet) => set({ pet }),
  clearPet: () => set({ pet: null }),
}));
