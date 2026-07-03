'use client';

import { useState } from 'react';
import { usePetStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RacaoPage() {
  const { pet } = usePetStore();
  const [objetivo, setObjetivo] = useState(pet?.objetivo ?? 'manutencao');
  const [resultado, setResultado] = useState<string | null>(null);

  if (!pet) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-4 py-12 text-center">
            <p className="text-slate-600">Cadastre um pet primeiro para ver recomendações.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCalcular = () => {
    setResultado(
      `Para um ${pet.raca} de ${pet.peso} kg com objetivo de ${objetivo}, recomendamos iniciar com uma ração premium com teor de proteína adequado à fase de vida. Consulte um veterinário para confirmar a escolha.`
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Recomendação de ração
          </h1>
          <p className="mt-2 text-slate-600">
            Ajuste as informações e veja sugestões personalizadas para o {pet.nome}.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Objetivo
              </label>
              <select
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="manutencao">Manutenção</option>
                <option value="pelagem">Pelagem</option>
                <option value="desempenho">Desempenho</option>
              </select>
            </div>

            <button
              onClick={handleCalcular}
              className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Gerar recomendação
            </button>

            {resultado && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
                {resultado}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
