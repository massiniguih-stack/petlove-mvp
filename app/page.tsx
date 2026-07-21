'use client';

import { usePetStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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

function DogIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="bodyGradHome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="earGradHome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="bellyGradHome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="noseGradHome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <filter id="shadowHome" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>

      <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.1" />
      <ellipse cx="32" cy="42" rx="16" ry="14" fill="url(#bodyGradHome)" filter="url(#shadowHome)" />
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="url(#bellyGradHome)" />
      <ellipse cx="18" cy="22" rx="8" ry="12" fill="url(#earGradHome)" transform="rotate(-15 18 22)" />
      <ellipse cx="46" cy="22" rx="8" ry="12" fill="url(#earGradHome)" transform="rotate(15 46 22)" />
      <circle cx="32" cy="28" r="16" fill="url(#bodyGradHome)" filter="url(#shadowHome)" />
      <ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#bellyGradHome)" />
      <circle cx="26" cy="26" r="3" fill="#1f2937" />
      <circle cx="25" cy="25" r="1" fill="white" />
      <circle cx="38" cy="26" r="3" fill="#1f2937" />
      <circle cx="37" cy="25" r="1" fill="white" />
      <ellipse cx="32" cy="32" rx="4" ry="3" fill="url(#noseGradHome)" />
      <ellipse cx="32" cy="31.5" rx="2" ry="1" fill="#6b7280" opacity="0.5" />
      <path d="M32 35 Q28 39 24 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 35 Q36 39 40 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="32" cy="38" rx="3" ry="4" fill="#f472b6" />
      <ellipse cx="32" cy="37" rx="2" ry="2" fill="#f9a8d4" />
      <circle cx="22" cy="30" r="3" fill="#fbcfe8" opacity="0.6" />
      <circle cx="42" cy="30" r="3" fill="#fbcfe8" opacity="0.6" />
      <ellipse cx="24" cy="52" rx="5" ry="4" fill="url(#bodyGradHome)" />
      <ellipse cx="40" cy="52" rx="5" ry="4" fill="url(#bodyGradHome)" />
      <circle cx="22" cy="51" r="1.5" fill="url(#bellyGradHome)" />
      <circle cx="24" cy="50" r="1.5" fill="url(#bellyGradHome)" />
      <circle cx="26" cy="51" r="1.5" fill="url(#bellyGradHome)" />
      <circle cx="38" cy="51" r="1.5" fill="url(#bellyGradHome)" />
      <circle cx="40" cy="50" r="1.5" fill="url(#bellyGradHome)" />
      <circle cx="42" cy="51" r="1.5" fill="url(#bellyGradHome)" />
    </svg>
  );
}

const benefits = [
  { title: 'Saúde e peso', desc: 'Acompanhe o crescimento do seu pet.', Icon: ChartIcon3D },
  { title: 'Ração certa', desc: 'Sugestões por raça e objetivo.', Icon: BowlIcon3D },
  { title: 'Serviços perto', desc: 'Vet, parque e hotel no mapa.', Icon: PinIcon3D },
];

export default function HomePage() {
  const { pet } = usePetStore();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg ring-1 ring-amber-100 dark:from-amber-950 dark:to-orange-950 dark:ring-amber-900">
              <DogIcon3D size={44} />
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
              href="/parceiro/dashboard"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl"
            >
              Sou parceiro (vet/petshop)
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
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25"
              >
                Ir para o painel
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/dashboard"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/35"
              >
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <PawIcon3D size={56} />
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
                  <div className="flex h-16 w-16 items-center justify-center">
                    <CalendarIcon3D size={56} />
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
                  <div className="flex h-16 w-16 items-center justify-center">
                    <ActivityIcon3D size={56} />
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
                  <div className="flex h-16 w-16 items-center justify-center">
                    <BowlIcon3D size={56} />
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
                  <div className="flex h-16 w-16 items-center justify-center">
                    <PinIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Serviços</h3>
                  <p className="mt-1.5 text-sm text-rose-100">Veterinários, parques e hotéis.</p>
                </div>
              </Link>

              <Link
                href="/onboarding"
                className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <GearIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black text-slate-700 dark:text-slate-200">
                    Editar perfil
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Atualize dados de {pet.nome}.
                  </p>
                </div>
              </Link>

              <Link
                href="/comparar"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 p-6 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <ChartIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Comparar pets</h3>
                  <p className="mt-1.5 text-sm text-violet-100">Compare seus pets lado a lado.</p>
                </div>
              </Link>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/parceiro/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl"
              >
                Sou parceiro (vet/petshop)
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
                <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:from-amber-950 dark:to-orange-950">
                  <DogIcon size={72} />
                </div>
              </div>
            </div>
            <h1 className="mt-8 text-6xl font-black tracking-tight md:text-7xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">
                Patinha
              </span>
            </h1>
            <p className="mt-3 text-sm font-bold tracking-[0.3em] text-slate-400 uppercase">
              Cuidados premium para seu melhor amigo
            </p>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400">
              Saúde, ração e serviços perto de você — comece em 2 passos simples.
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

          {/* CTAs principais */}
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
              href="/parceiro/dashboard"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl"
            >
              Sou parceiro (vet/petshop)
            </Link>
          </div>

          {/* Benefícios */}
          <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white p-5 text-center ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800"
              >
                <div className="flex justify-center"><b.Icon size={32} /></div>
                <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">{b.title}</h3>
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
