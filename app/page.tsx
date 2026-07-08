'use client';

import { usePetStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { PawIcon3D, CalendarIcon3D, ActivityIcon3D, BowlIcon3D, PinIcon3D, GearIcon3D } from '@/components/Icons3D';

function DogIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="bodyGradHome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <linearGradient id="earGradHome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
        <linearGradient id="bellyGradHome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="100%" stopColor="#fde68a"/>
        </linearGradient>
        <linearGradient id="noseGradHome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151"/>
          <stop offset="100%" stopColor="#1f2937"/>
        </linearGradient>
        <filter id="shadowHome" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.1"/>
      <ellipse cx="32" cy="42" rx="16" ry="14" fill="url(#bodyGradHome)" filter="url(#shadowHome)"/>
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="url(#bellyGradHome)"/>
      <ellipse cx="18" cy="22" rx="8" ry="12" fill="url(#earGradHome)" transform="rotate(-15 18 22)"/>
      <ellipse cx="46" cy="22" rx="8" ry="12" fill="url(#earGradHome)" transform="rotate(15 46 22)"/>
      <circle cx="32" cy="28" r="16" fill="url(#bodyGradHome)" filter="url(#shadowHome)"/>
      <ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#bellyGradHome)"/>
      <circle cx="26" cy="26" r="3" fill="#1f2937"/>
      <circle cx="25" cy="25" r="1" fill="white"/>
      <circle cx="38" cy="26" r="3" fill="#1f2937"/>
      <circle cx="37" cy="25" r="1" fill="white"/>
      <ellipse cx="32" cy="32" rx="4" ry="3" fill="url(#noseGradHome)"/>
      <ellipse cx="32" cy="31.5" rx="2" ry="1" fill="#6b7280" opacity="0.5"/>
      <path d="M32 35 Q28 39 24 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 35 Q36 39 40 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="32" cy="38" rx="3" ry="4" fill="#f472b6"/>
      <ellipse cx="32" cy="37" rx="2" ry="2" fill="#f9a8d4"/>
      <circle cx="22" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
      <circle cx="42" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
      <ellipse cx="24" cy="52" rx="5" ry="4" fill="url(#bodyGradHome)"/>
      <ellipse cx="40" cy="52" rx="5" ry="4" fill="url(#bodyGradHome)"/>
      <circle cx="22" cy="51" r="1.5" fill="url(#bellyGradHome)"/>
      <circle cx="24" cy="50" r="1.5" fill="url(#bellyGradHome)"/>
      <circle cx="26" cy="51" r="1.5" fill="url(#bellyGradHome)"/>
      <circle cx="38" cy="51" r="1.5" fill="url(#bellyGradHome)"/>
      <circle cx="40" cy="50" r="1.5" fill="url(#bellyGradHome)"/>
      <circle cx="42" cy="51" r="1.5" fill="url(#bellyGradHome)"/>
    </svg>
  );
}

export default function HomePage() {
  const { pet } = usePetStore();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1" />
        <Footer />
      </div>
    );
  }

  if (pet) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">
                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">{pet.nome}</span>! 👋
              </h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/dashboard"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-1"
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-110" />
                <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <PawIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Dashboard</h3>
                  <p className="mt-1.5 text-sm text-amber-100">
                    Peso, vacinas, crescimento e tudo sobre {pet.nome}.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                    Acessar
                  </div>
                </div>
              </Link>

              <Link
                href="/vida"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/35 hover:-translate-y-1"
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-110" />
                <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <CalendarIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Linha do tempo</h3>
                  <p className="mt-1.5 text-sm text-purple-100">
                    Marcos, vacinas, conquistas e fotos de {pet.nome}.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                    Acessar
                  </div>
                </div>
              </Link>

              <Link
                href="/atividades"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-1"
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-110" />
                <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <ActivityIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Atividades</h3>
                  <p className="mt-1.5 text-sm text-blue-100">
                    Exercícios e dicas para manter {pet.nome} ativo.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                    Acessar
                  </div>
                </div>
              </Link>

              <Link
                href="/racao"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/35 hover:-translate-y-1"
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-110" />
                <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <BowlIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Ração</h3>
                  <p className="mt-1.5 text-sm text-emerald-100">
                    Marcas, porções e nutrição ideal para {pet.nome}.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                    Acessar
                  </div>
                </div>
              </Link>

              <Link
                href="/mapa"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 p-6 text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/35 hover:-translate-y-1"
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-110" />
                <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <PinIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black">Serviços</h3>
                  <p className="mt-1.5 text-sm text-rose-100">
                    Veterinários, parques, hotéis e pet driver em Maringá.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                    Acessar
                  </div>
                </div>
              </Link>

              <Link
                href="/onboarding"
                className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all duration-300 hover:border-slate-400 hover:shadow-lg hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-slate-50 transition group-hover:scale-110 dark:bg-slate-800" />
                <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-slate-50/50 dark:bg-slate-800/50" />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <GearIcon3D size={56} />
                  </div>
                  <h3 className="mt-3 text-xl font-black text-slate-700 dark:text-slate-200">Editar perfil</h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Atualize dados, raça, peso e objetivo de {pet.nome}.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Editar
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Pet</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">Love</span>
            </h1>
            <p className="mt-3 text-sm font-bold tracking-[0.3em] text-slate-400 uppercase">
              Cuidados premium para seu melhor amigo
            </p>
            <p className="mt-6 max-w-md mx-auto text-base text-slate-500 leading-relaxed dark:text-slate-400">
              Saúde, atividades, nutrição e serviços — tudo em um só lugar.
            </p>
          </div>

          {/* Auth Forms */}
          <div className="mx-auto mt-12 max-w-md">
            {/* Tabs */}
            <div className="mb-6 flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Criar conta
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Entrar
              </button>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              {activeTab === 'signup' ? <SignupForm /> : <LoginForm />}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-slate-400 text-xs font-medium dark:bg-slate-900">ou</span>
                </div>
              </div>

              <GoogleButton />

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {activeTab === 'signup' ? (
                  <>
                    Já tem conta?{' '}
                    <button onClick={() => setActiveTab('login')} className="font-semibold text-amber-600 hover:text-amber-700 transition dark:text-amber-400 dark:hover:text-amber-300">
                      Entrar
                    </button>
                  </>
                ) : (
                  <>
                    Não tem conta?{' '}
                    <button onClick={() => setActiveTab('signup')} className="font-semibold text-amber-600 hover:text-amber-700 transition dark:text-amber-400 dark:hover:text-amber-300">
                      Criar conta
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
