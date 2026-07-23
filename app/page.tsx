'use client';

import { usePetStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format, differenceInMonths } from 'date-fns';
import {
  PawIcon3D,
  DogIcon3D,
  CalendarIcon3D,
  ActivityIcon3D,
  BowlIcon3D,
  PinIcon3D,
  GearIcon3D,
  ChartIcon3D,
} from '@/components/Icons3D';

const benefits = [
  { title: 'Saúde e peso', desc: 'Acompanhe o crescimento do seu pet.', Icon: ChartIcon3D },
  { title: 'Ração certa', desc: 'Sugestões por raça e objetivo.', Icon: BowlIcon3D },
  { title: 'Serviços perto', desc: 'Vet, parque e hotel no mapa.', Icon: PinIcon3D },
];

export default function HomePage() {
  const { pet, isPremium } = usePetStore();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [proximaVacina, setProximaVacina] = useState<{ titulo: string; data: Date } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pet?.id) { setProximaVacina(null); return; }
    const supabase = createClient();
    supabase
      .from('momento')
      .select('titulo, data_agendada')
      .eq('pet_id', pet.id)
      .eq('categoria', 'vacina')
      .eq('status_vacina', 'pendente')
      .not('data_agendada', 'is', null)
      .order('data_agendada', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProximaVacina({ titulo: data[0].titulo as string, data: new Date(data[0].data_agendada as string) });
        } else {
          setProximaVacina(null);
        }
      });
  }, [pet?.id]);

  if (!mounted || authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  // Conta logada, ainda sem pet → puxa para o onboarding
  if (user && !pet) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1">
          <section className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
            <div className="icon-3d-slot mx-auto">
              <DogIcon3D size={72} />
            </div>
            <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Falta só cadastrar seu pet
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Sua conta já está pronta. Em menos de 1 minuto você entra no painel.
            </p>

            <div className="mt-8 space-y-3 rounded-2xl bg-white p-5 text-left text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold dark:bg-emerald-900">
                  ✓
                </span>
                Conta criada
              </div>
              <div className="flex items-center gap-3 font-semibold text-amber-600 dark:text-amber-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold dark:bg-amber-900">
                  2
                </span>
                Dados do pet
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                  3
                </span>
                Usar o app
              </div>
            </div>

            <Link
              href="/onboarding"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl"
            >
              Cadastrar meu pet agora
            </Link>

            <Link
              href="/parceiros/cadastro"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Sou parceiro pet (vet / petshop)
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Já tem pet → hub rápido
  if (pet) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">
                Olá,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  {pet.nome}
                </span>
                ! 👋
              </h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                O que você quer fazer agora?
              </p>
              {/* EXP-05: upsell só com benefícios já gateados */}
              {!isPremium && (
                <Link
                  href="/planos"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800"
                >
                  Premium: comparar pets · histórico completo · pets ilimitados →
                </Link>
              )}
              <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
                <span>🐾 {(() => {
                  const meses = differenceInMonths(new Date(), new Date(pet.dataNascimento));
                  return meses < 12 ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : `${Math.floor(meses / 12)} ${Math.floor(meses / 12) === 1 ? 'ano' : 'anos'}`;
                })()}</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span>⚖️ {pet.peso.toLocaleString('pt-BR')} kg</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                {proximaVacina ? (
                  <Link href="/vida" className="text-amber-600 hover:underline dark:text-amber-400">
                    💉 Próxima vacina: {format(proximaVacina.data, 'dd/MM')}
                  </Link>
                ) : (
                  <span>💉 Nenhuma vacina agendada</span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/dashboard"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/35"
              >
                <div className="relative">
                  <div className="icon-3d-slot h-20 w-20">
                    <PawIcon3D size={72} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Dashboard</h3>
                  <p className="mt-1.5 text-sm text-amber-100">
                    Peso, vacinas e tudo sobre {pet.nome}.
                  </p>
                </div>
              </Link>

              <Link
                href="/vida"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-rose-500 p-6 text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <div className="icon-3d-slot h-20 w-20">
                    <CalendarIcon3D size={72} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Linha do tempo</h3>
                  <p className="mt-1.5 text-sm text-rose-100">Marcos, vacinas e conquistas.</p>
                </div>
              </Link>

              <Link
                href="/atividades"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <div className="icon-3d-slot h-20 w-20">
                    <ActivityIcon3D size={72} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Atividades</h3>
                  <p className="mt-1.5 text-sm text-blue-100">Exercícios e dicas para {pet.nome}.</p>
                </div>
              </Link>

              <Link
                href="/racao"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <div className="icon-3d-slot h-20 w-20">
                    <BowlIcon3D size={72} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Ração</h3>
                  <p className="mt-1.5 text-sm text-emerald-100">Porções e nutrição ideal.</p>
                </div>
              </Link>

              <Link
                href="/mapa"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 p-6 text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <div className="icon-3d-slot h-20 w-20">
                    <PinIcon3D size={72} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Serviços</h3>
                  <p className="mt-1.5 text-sm text-rose-100">Veterinários, parques e hotéis.</p>
                </div>
              </Link>

              <Link
                href="/onboarding"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-600 to-slate-800 p-6 text-white shadow-lg shadow-slate-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <div className="icon-3d-slot h-20 w-20">
                    <GearIcon3D size={72} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">
                    Editar perfil
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-300">
                    Atualize dados de {pet.nome}.
                  </p>
                </div>
              </Link>

              <Link
                href="/comparar"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 p-6 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <div className="icon-3d-slot h-20 w-20">
                    <ChartIcon3D size={72} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Comparar pets</h3>
                  <p className="mt-1.5 text-sm text-violet-100">Compare seus pets lado a lado.</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Visitante novo → jornada clara sem formulário pesado na home
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-2xl" />
                <div className="icon-3d-slot relative p-2 md:p-3">
                  <DogIcon3D size={120} />
                </div>
              </div>
            </div>
            <h1 className="mt-8 text-6xl font-black tracking-tight md:text-7xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">
                Patinha
              </span>
            </h1>
            <p className="mt-3 text-sm font-bold tracking-[0.3em] text-slate-400 uppercase dark:text-slate-500">
              Cuidados para o seu melhor amigo
            </p>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400">
              Saúde, ração e serviços perto de você. <span className="font-semibold text-slate-700 dark:text-slate-300">Grátis para começar · Premium opcional</span>
            </p>
          </div>

          {/* Jornada em 3 passos (visual) */}
          <div className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { n: '1', t: 'Crie sua conta', d: '1 minuto' },
              { n: '2', t: 'Cadastre o pet', d: 'dados essenciais' },
              { n: '3', t: 'Use o app', d: 'painel pronto' },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-black text-white">
                  {step.n}
                </div>
                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">{step.t}</p>
                <p className="text-xs text-slate-400">{step.d}</p>
              </div>
            ))}
          </div>

          {/* CTAs — EXP-03: tutor primário, parceiro secundário */}
          <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/cadastro"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl"
            >
              Começar grátis
            </Link>
            <Link
              href="/login"
              className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Já tenho conta
            </Link>
          </div>

          <div className="mx-auto mt-4 max-w-md">
            <Link
              href="/parceiros/cadastro"
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sou parceiro pet (vet / petshop)
            </Link>
          </div>

          {/* Benefícios */}
          <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white p-6 text-center ring-1 ring-slate-100 dark:bg-slate-900/90 dark:ring-slate-700/80"
              >
                <div className="icon-3d-slot mx-auto mb-1 h-16 w-16">
                  <b.Icon size={56} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">{b.title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
