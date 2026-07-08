'use client';

import Link from 'next/link';
import { usePetStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import PetSelector from './PetSelector';
import { useDarkMode } from '@/providers/DarkModeProvider';

function DogIcon({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
        <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="100%" stopColor="#fde68a"/>
        </linearGradient>
        <linearGradient id="noseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151"/>
          <stop offset="100%" stopColor="#1f2937"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Shadow */}
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.1"/>
      
      {/* Body */}
      <ellipse cx="32" cy="42" rx="16" ry="14" fill="url(#bodyGrad)" filter="url(#shadow)"/>
      
      {/* Belly */}
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="url(#bellyGrad)"/>
      
      {/* Left Ear */}
      <ellipse cx="18" cy="22" rx="8" ry="12" fill="url(#earGrad)" transform="rotate(-15 18 22)"/>
      
      {/* Right Ear */}
      <ellipse cx="46" cy="22" rx="8" ry="12" fill="url(#earGrad)" transform="rotate(15 46 22)"/>
      
      {/* Head */}
      <circle cx="32" cy="28" r="16" fill="url(#bodyGrad)" filter="url(#shadow)"/>
      
      {/* Face patch */}
      <ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#bellyGrad)"/>
      
      {/* Left Eye */}
      <circle cx="26" cy="26" r="3" fill="#1f2937"/>
      <circle cx="25" cy="25" r="1" fill="white"/>
      
      {/* Right Eye */}
      <circle cx="38" cy="26" r="3" fill="#1f2937"/>
      <circle cx="37" cy="25" r="1" fill="white"/>
      
      {/* Nose */}
      <ellipse cx="32" cy="32" rx="4" ry="3" fill="url(#noseGrad)"/>
      <ellipse cx="32" cy="31.5" rx="2" ry="1" fill="#6b7280" opacity="0.5"/>
      
      {/* Mouth */}
      <path d="M32 35 Q28 39 24 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 35 Q36 39 40 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Tongue */}
      <ellipse cx="32" cy="38" rx="3" ry="4" fill="#f472b6"/>
      <ellipse cx="32" cy="37" rx="2" ry="2" fill="#f9a8d4"/>
      
      {/* Cheeks */}
      <circle cx="22" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
      <circle cx="42" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
      
      {/* Paws */}
      <ellipse cx="24" cy="52" rx="5" ry="4" fill="url(#bodyGrad)"/>
      <ellipse cx="40" cy="52" rx="5" ry="4" fill="url(#bodyGrad)"/>
      
      {/* Paw details */}
      <circle cx="22" cy="51" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="24" cy="50" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="26" cy="51" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="38" cy="51" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="40" cy="50" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="42" cy="51" r="1.5" fill="url(#bellyGrad)"/>
    </svg>
  );
}

function DarkModeToggle() {
  const { dark, toggle, mounted } = useDarkMode();

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      title={dark ? 'Modo claro' : 'Modo escuro'}
    >
      {dark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { pet } = usePetStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const petData = mounted ? pet : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-0 blur-md transition-opacity group-hover:opacity-30" />
              <DogIcon size={36} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Pet</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">Love</span>
              </span>
              <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Cuidados premium</span>
            </div>
          </Link>

          {petData && (
            <div className="hidden items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
              <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                Dashboard
              </Link>
              <Link href="/atividades" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                Atividades
              </Link>
              <Link href="/mapa" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                Mapa
              </Link>
              <Link href="/racao" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                Ração
              </Link>
              <Link href="/vida" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                Vida
              </Link>
              <Link href="/planos" className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md">
                ⭐ Premium
              </Link>
              <div className="ml-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <DarkModeToggle />
              <PetSelector />
            </div>
          )}

          {!petData && (
            <div className="hidden items-center gap-2 text-sm font-medium md:flex">
              <DarkModeToggle />
              <Link href="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                Entrar
              </Link>
              <Link href="/cadastro" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                Criar conta
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 py-4 dark:border-slate-800 md:hidden">
            {petData ? (
              <div className="space-y-1">
                <Link href="/onboarding" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold">Editar perfil</span>
                    <span className="block text-xs text-slate-400">Dados de {petData.nome}</span>
                  </div>
                </Link>

                <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-emerald-950">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>

                <Link href="/vida" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-purple-50 dark:text-slate-300 dark:hover:bg-purple-950">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Linha do tempo</span>
                </Link>

                <Link href="/atividades" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Atividades</span>
                </Link>

                <Link href="/racao" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-amber-950">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Ração</span>
                </Link>

                <Link href="/mapa" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-rose-50 dark:text-slate-300 dark:hover:bg-rose-950">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Mapa</span>
                </Link>

                <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
                <div className="px-4">
                  <DarkModeToggle />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-4 pb-2">
                  <DarkModeToggle />
                </div>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Entrar
                </Link>
                <Link href="/cadastro" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
