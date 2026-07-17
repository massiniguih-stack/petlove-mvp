'use client';

import { usePetStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ScaleIcon3D, TargetIcon3D, CalendarIcon3D, BowlIcon3D, ActivityIcon3D, PinIcon3D } from '@/components/Icons3D';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { calcularMeta } from '@/lib/metaDiaria';

export default function DesempenhoPage() {
  const { pet, hydrated } = usePetStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !pet) router.push('/onboarding');
  }, [hydrated, pet, router]);

  if (!pet) return null;

  const idadeEmMeses = (() => {
    const diff = new Date().getTime() - new Date(pet.dataNascimento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  })();

  const ultimoPeso = pet.peso;
  const meta = calcularMeta(idadeEmMeses, ultimoPeso, pet.objetivo);

  const fase = idadeEmMeses < 6 ? 'Filhote' : idadeEmMeses < 12 ? 'Adolescente' : idadeEmMeses < 84 ? 'Adulto' : 'Sênior';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Header */}
          <div className="mb-8">
            <BackButton href="/dashboard" label="Voltar ao dashboard" />
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl shadow-amber-500/30">
                <ScaleIcon3D size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Desempenho de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">{pet.nome}</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Acompanhe a evolução e veja o que é ideal para ele</p>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-xl shadow-amber-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/35 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition group-hover:scale-110" />
              <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-white/5" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <ScaleIcon3D size={30} />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-amber-100">Peso atual</p>
                <p className="mt-1 text-4xl font-black leading-tight">{ultimoPeso.toLocaleString('pt-BR')} <span className="text-lg font-bold">kg</span></p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white shadow-xl shadow-rose-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/35 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition group-hover:scale-110" />
              <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-white/5" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <CalendarIcon3D size={30} />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-rose-100">Idade</p>
                <p className="mt-1 text-4xl font-black leading-tight">
                  {idadeEmMeses < 12 ? idadeEmMeses : Math.floor(idadeEmMeses / 12)}
                </p>
                <p className="text-xs font-medium text-rose-100">{idadeEmMeses < 12 ? 'meses' : 'anos'} · {fase}</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/35 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition group-hover:scale-110" />
              <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-white/5" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <TargetIcon3D size={30} />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-emerald-100">Objetivo</p>
                <p className="mt-1 text-2xl font-black capitalize leading-tight">
                  {pet.objetivo === 'manutencao' ? 'Manutenção' : pet.objetivo === 'pelagem' ? 'Pelagem' : pet.objetivo === 'emagrecimento' ? 'Emagrecimento' : 'Desempenho'}
                </p>
              </div>
            </div>
          </div>

          {/* Recomendações */}
          <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Recomendações para {pet.nome}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Baseado no peso, idade e objetivo</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 ring-1 ring-amber-100/50 transition-all hover:shadow-md hover:ring-amber-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-md shadow-amber-400/20">
                    <BowlIcon3D size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Calorias</p>
                    <p className="text-xl font-black text-amber-700">{meta.caloriasDiarias} <span className="text-xs font-bold">kcal</span></p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 ring-1 ring-blue-100/50 transition-all hover:shadow-md hover:ring-blue-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 shadow-md shadow-blue-400/20">
                    <BowlIcon3D size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Ração</p>
                    <p className="text-xl font-black text-blue-700">{meta.racaoDiaria.toFixed(0)} <span className="text-xs font-bold">g</span></p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-emerald-100/50 transition-all hover:shadow-md hover:ring-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 shadow-md shadow-emerald-400/20">
                    <ActivityIcon3D size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Exercício</p>
                    <p className="text-xl font-black text-emerald-700">{meta.exercicioMinutos} <span className="text-xs font-bold">min</span></p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 ring-1 ring-purple-100/50 transition-all hover:shadow-md hover:ring-purple-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-md shadow-purple-400/20">
                    <PinIcon3D size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Água</p>
                    <p className="text-xl font-black text-purple-700">{(pet.peso * 50).toFixed(0)} <span className="text-xs font-bold">ml</span></p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
