'use client';

import { usePetStore, type Pet } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { calcularMeta } from '@/lib/metaDiaria';

function idadeEmMesesDe(pet: Pet): number {
  const diff = new Date().getTime() - new Date(pet.dataNascimento).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
}

function formatarIdade(meses: number): string {
  return meses < 12 ? `${meses}m` : `${Math.floor(meses / 12)}a ${meses % 12}m`;
}

const objetivoLabel: Record<string, string> = {
  manutencao: 'Manutenção',
  pelagem: 'Pelagem',
  emagrecimento: 'Emagrecimento',
  desempenho: 'Desempenho',
};

export default function CompararPage() {
  const { pets, isPremium, hydrated } = usePetStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (hydrated && pets.length === 0) router.push('/onboarding');
  }, [hydrated, pets.length, router]);

  if (!mounted || pets.length === 0) return null;

  const maisPesado = pets.reduce((a, b) => (b.peso > a.peso ? b : a), pets[0]);
  const maisJovem = pets.reduce((a, b) => (idadeEmMesesDe(b) < idadeEmMesesDe(a) ? b : a), pets[0]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8">
            <BackButton href="/dashboard" label="Voltar ao dashboard" />
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Comparar <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-500">pets</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Veja lado a lado os dados e as recomendações de cada um</p>
          </div>

          {!isPremium ? (
            <div className="rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 text-center text-white shadow-xl shadow-violet-500/20">
              <span className="text-4xl">🔒</span>
              <h2 className="mt-3 text-xl font-black">Comparação entre pets é um recurso Premium</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-violet-100">Assine o Premium para comparar peso, idade, objetivo e recomendações entre todos os seus pets.</p>
              <a href="/planos" className="mt-5 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-black text-violet-600 shadow-lg transition hover:bg-violet-50 hover:shadow-xl">
                Ver Planos →
              </a>
            </div>
          ) : pets.length < 2 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-4xl">🐾</span>
              <h2 className="mt-3 text-lg font-black text-slate-900 dark:text-white">Cadastre mais um pet para comparar</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Você só tem 1 pet cadastrado. Adicione outro para ver a comparação lado a lado.</p>
              <a href="/onboarding" className="mt-5 inline-block rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl">
                + Adicionar pet
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Pet</th>
                    {pets.map((pet) => (
                      <th key={pet.id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-violet-200 bg-slate-100 dark:border-violet-800 dark:bg-slate-800">
                            {pet.fotoUrl ? (
                              <img src={pet.fotoUrl} alt={pet.nome} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">🐾</div>
                            )}
                          </div>
                          <span className="text-sm font-black text-slate-900 dark:text-white">{pet.nome}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Raça</td>
                    {pets.map((pet) => (
                      <td key={pet.id} className="p-4 text-center text-sm font-medium text-slate-900 dark:text-white">{pet.raca}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Sexo</td>
                    {pets.map((pet) => (
                      <td key={pet.id} className="p-4 text-center text-sm font-medium text-slate-900 dark:text-white">{pet.sexo === 'macho' ? '♂️ Macho' : '♀️ Fêmea'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Idade</td>
                    {pets.map((pet) => {
                      const meses = idadeEmMesesDe(pet);
                      return (
                        <td key={pet.id} className="p-4 text-center text-sm font-medium text-slate-900 dark:text-white">
                          {formatarIdade(meses)}
                          {pet.id === maisJovem.id && pets.length > 1 && <span className="ml-1 text-xs">🐣</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Peso</td>
                    {pets.map((pet) => (
                      <td key={pet.id} className="p-4 text-center text-sm font-medium text-slate-900 dark:text-white">
                        {pet.peso.toLocaleString('pt-BR')} kg
                        {pet.id === maisPesado.id && pets.length > 1 && <span className="ml-1 text-xs">🏋️</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Objetivo</td>
                    {pets.map((pet) => (
                      <td key={pet.id} className="p-4 text-center text-sm font-medium text-slate-900 dark:text-white">{objetivoLabel[pet.objetivo]}</td>
                    ))}
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Calorias/dia</td>
                    {pets.map((pet) => {
                      const meta = calcularMeta(idadeEmMesesDe(pet), pet.peso, pet.objetivo);
                      return (
                        <td key={pet.id} className="p-4 text-center text-sm font-bold text-amber-700 dark:text-amber-400">{meta.caloriasDiarias} kcal</td>
                      );
                    })}
                  </tr>
                  <tr className="bg-blue-50/50 dark:bg-blue-950/20">
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Ração/dia</td>
                    {pets.map((pet) => {
                      const meta = calcularMeta(idadeEmMesesDe(pet), pet.peso, pet.objetivo);
                      return (
                        <td key={pet.id} className="p-4 text-center text-sm font-bold text-blue-700 dark:text-blue-400">{meta.racaoDiaria.toFixed(0)} g</td>
                      );
                    })}
                  </tr>
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Exercício/dia</td>
                    {pets.map((pet) => {
                      const meta = calcularMeta(idadeEmMesesDe(pet), pet.peso, pet.objetivo);
                      return (
                        <td key={pet.id} className="p-4 text-center text-sm font-bold text-emerald-700 dark:text-emerald-400">{meta.exercicioMinutos} min</td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
