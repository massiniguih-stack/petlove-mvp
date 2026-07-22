'use client';

import { useState } from 'react';
import { usePetStore } from '@/lib/store';

export default function PetSelector() {
  const { pets, selectedPetId, selectPet, isPremium, removePet } = usePetStore();
  const [aberto, setAberto] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (pets.length === 0) return null;

  const petAtual = pets.find((p) => p.id === selectedPetId);

  const getPetEmoji = (sexo: string) => sexo === 'macho' ? '🐕' : '🐩';

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
      >
        <span className="text-xl">{petAtual ? getPetEmoji(petAtual.sexo) : '🐾'}</span>
        <span className="text-sm font-bold text-slate-900">{petAtual?.nome || 'Selecionar pet'}</span>
        {pets.length > 1 && (
          <span
            title={`Você tem ${pets.length} pets cadastrados`}
            className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600"
          >
            {pets.length}
          </span>
        )}
        <svg className={`h-4 w-4 text-slate-400 transition ${aberto ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="p-3">
            <p className="text-xs font-bold text-slate-500 px-1">Seus pets</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className={`flex items-center gap-3 px-3 py-2.5 transition hover:bg-slate-50 ${
                  pet.id === selectedPetId ? 'bg-blue-50' : ''
                }`}
              >
                <button
                  onClick={() => { selectPet(pet.id); setAberto(false); }}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="text-2xl">{getPetEmoji(pet.sexo)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{pet.nome}</p>
                    <p className="text-xs text-slate-500 truncate">{pet.raca} · {pet.peso}kg</p>
                  </div>
                  {pet.id === selectedPetId && (
                    <span className="text-blue-500">✓</span>
                  )}
                </button>
                {pets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirmDelete === pet.id) {
                        removePet(pet.id);
                        setConfirmDelete(null);
                      } else {
                        setConfirmDelete(pet.id);
                        setTimeout(() => setConfirmDelete(null), 3000);
                      }
                    }}
                    className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                      confirmDelete === pet.id
                        ? 'bg-red-100 text-red-600'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    {confirmDelete === pet.id ? 'Confirmar' : '✕'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {pets.length >= 2 && (
            <div className="border-t border-slate-100 p-3">
              <a
                href="/comparar"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-50 py-2.5 text-sm font-bold text-violet-600 transition hover:bg-violet-100"
              >
                📊 Comparar pets
                {!isPremium && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">PRO</span>
                )}
              </a>
            </div>
          )}
          <div className="border-t border-slate-100 p-3">
            <a
              href={!isPremium && pets.length >= 1 ? '/planos' : '/onboarding'}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
                isPremium
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>+</span> Adicionar pet
              {!isPremium && pets.length >= 1 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">PRO</span>
              )}
            </a>
            {!isPremium && pets.length >= 1 && (
              <p className="mt-2 text-center text-[10px] text-slate-400">
                <a href="/planos" className="text-blue-500 hover:underline">Assine Premium</a> para adicionar mais pets
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
