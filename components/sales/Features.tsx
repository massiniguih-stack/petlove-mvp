'use client';

import { motion, useReducedMotion } from 'motion/react';

const pages = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    description: 'Peso, vacinas e saude',
    gradient: 'from-slate-50 to-slate-100',
    preview: (
      <div className="flex flex-col gap-3 p-4">
        {/* Pet photo */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 ring-4 ring-emerald-100" />
          <div className="mt-1 h-2 w-20 rounded-sm bg-slate-200" />
        </div>
        {/* Pet name */}
        <div className="text-center">
          <div className="text-lg font-black text-slate-800">Zeus</div>
          <div className="mt-1 flex items-center justify-center gap-2">
            <div className="h-2 w-14 rounded-full bg-slate-200" />
            <div className="h-2 w-10 rounded-full bg-slate-200" />
            <div className="h-2 w-10 rounded-full bg-slate-200" />
          </div>
        </div>
        {/* Quick actions */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl bg-emerald-50 py-2 text-center">
            <span className="text-[8px] font-bold text-emerald-600">Atividades</span>
          </div>
          <div className="flex-1 rounded-xl bg-amber-50 py-2 text-center">
            <span className="text-[8px] font-bold text-amber-600">Racao</span>
          </div>
          <div className="flex-1 rounded-xl bg-purple-50 py-2 text-center">
            <span className="text-[8px] font-bold text-purple-600">Timeline</span>
          </div>
        </div>
        {/* Peso card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-4 shadow-lg shadow-amber-500/20">
          <div className="text-[9px] font-medium text-white/80">Peso atual</div>
          <div className="mt-1 text-2xl font-black text-white">44 kg</div>
        </div>
        {/* Meta card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 p-4 shadow-lg shadow-emerald-500/20">
          <div className="text-[9px] font-medium text-white/80">Meta de saude</div>
          <div className="mt-1 text-lg font-bold text-white">85 pts</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Linha do Tempo',
    href: '/vida',
    description: 'Marcos e conquistas',
    gradient: 'from-slate-50 to-slate-100',
    preview: (
      <div className="flex flex-col gap-2 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-28 rounded-sm bg-slate-200" />
          <div className="h-6 w-6 rounded-lg bg-slate-200" />
        </div>
        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-xs shadow-lg shadow-pink-500/20">🍼</div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="h-2.5 w-24 rounded-sm bg-slate-300" />
                <div className="mt-1 h-2 w-16 rounded-sm bg-slate-200" />
              </div>
              <div className="h-4 w-12 shrink-0 rounded-full bg-pink-100 pt-px text-center text-[7px] font-bold text-pink-600">Jan</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs shadow-lg shadow-blue-500/20">💉</div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="h-2.5 w-20 rounded-sm bg-slate-300" />
                <div className="mt-1 h-2 w-14 rounded-sm bg-slate-200" />
              </div>
              <div className="h-4 w-12 shrink-0 rounded-full bg-blue-100 pt-px text-center text-[7px] font-bold text-blue-600">Mar</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs shadow-lg shadow-amber-500/20">🏆</div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="h-2.5 w-28 rounded-sm bg-slate-300" />
                <div className="mt-1 h-2 w-18 rounded-sm bg-slate-200" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs shadow-lg shadow-emerald-500/20">📸</div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="h-2.5 w-16 rounded-sm bg-slate-300" />
                <div className="mt-1 h-2 w-20 rounded-sm bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Atividades',
    href: '/atividades',
    description: 'Exercicios diarios',
    gradient: 'from-slate-50 to-slate-100',
    preview: (
      <div className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-emerald-100" />
          <div className="h-3 w-32 rounded-sm bg-slate-200" />
        </div>
        {/* Progresso */}
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-2 w-16 rounded-sm bg-slate-200" />
            <div className="h-2 w-6 rounded-sm bg-emerald-300" />
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
          </div>
        </div>
        {/* Checklist */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="h-5 w-5 shrink-0 rounded-full border-2 border-emerald-400 bg-emerald-400/20">
              <div className="flex h-full items-center justify-center text-[8px] text-emerald-500">✓</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-24 rounded-sm bg-slate-300" />
              <div className="mt-1 h-1.5 w-16 rounded-sm bg-slate-200" />
            </div>
            <div className="text-xs">🐕</div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-20 rounded-sm bg-slate-300" />
              <div className="mt-1 h-1.5 w-14 rounded-sm bg-slate-200" />
            </div>
            <div className="text-xs">🐾</div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-200" />
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-28 rounded-sm bg-slate-300" />
              <div className="mt-1 h-1.5 w-12 rounded-sm bg-slate-200" />
            </div>
            <div className="text-xs">🦴</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Racao',
    href: '/racao',
    description: 'Nutricao e planos',
    gradient: 'from-slate-50 to-slate-100',
    preview: (
      <div className="flex flex-col gap-3 p-4">
        {/* Marcas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-2.5 text-center shadow-sm">
            <div className="text-xs">👑</div>
            <div className="mt-1 h-2 w-12 rounded-sm bg-amber-200" />
            <div className="mt-0.5 h-1.5 w-8 rounded-sm bg-slate-100" />
          </div>
          <div className="rounded-xl bg-white p-2.5 text-center shadow-sm">
            <div className="text-xs">🥩</div>
            <div className="mt-1 h-2 w-12 rounded-sm bg-slate-200" />
            <div className="mt-0.5 h-1.5 w-8 rounded-sm bg-slate-100" />
          </div>
          <div className="rounded-xl bg-white p-2.5 text-center shadow-sm">
            <div className="text-xs">🦴</div>
            <div className="mt-1 h-2 w-12 rounded-sm bg-slate-200" />
            <div className="mt-0.5 h-1.5 w-8 rounded-sm bg-slate-100" />
          </div>
        </div>
        {/* Nutrientes */}
        <div className="rounded-xl bg-white p-3.5 shadow-sm">
          <div className="h-2.5 w-16 rounded-sm bg-slate-200" />
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <div className="h-2 flex-1 rounded-full bg-slate-100">
                <div className="h-2 w-4/5 rounded-full bg-emerald-300" />
              </div>
              <div className="h-1.5 w-5 rounded-sm bg-slate-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <div className="h-2 flex-1 rounded-full bg-slate-100">
                <div className="h-2 w-3/5 rounded-full bg-amber-300" />
              </div>
              <div className="h-1.5 w-5 rounded-sm bg-slate-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <div className="h-2 flex-1 rounded-full bg-slate-100">
                <div className="h-2 w-1/3 rounded-full bg-blue-300" />
              </div>
              <div className="h-1.5 w-5 rounded-sm bg-slate-200" />
            </div>
          </div>
        </div>
        {/* Refeicoes */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-full bg-white py-2 text-center shadow-sm">
            <span className="text-[8px] font-semibold text-slate-500">☀️ Manha</span>
          </div>
          <div className="flex-1 rounded-full bg-amber-100 py-2 text-center shadow-sm">
            <span className="text-[8px] font-semibold text-amber-600">🌙 Noite</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Mapa',
    href: '/mapa',
    description: 'Servicos perto de voce',
    gradient: 'from-slate-50 to-slate-100',
    preview: (
      <div className="flex flex-col gap-3 p-4">
        {/* Mapa */}
        <div className="relative h-28 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 via-blue-50 to-pink-50 ring-1 ring-slate-200">
          <div className="absolute inset-0">
            <div className="absolute left-0 right-0 top-1/3 h-px bg-slate-200/50" />
            <div className="absolute left-0 right-0 top-2/3 h-px bg-slate-200/50" />
            <div className="absolute bottom-0 left-1/4 top-0 w-px bg-slate-200/50" />
            <div className="absolute bottom-0 left-1/2 top-0 w-px bg-slate-200/50" />
            <div className="absolute bottom-0 left-3/4 top-0 w-px bg-slate-200/50" />
          </div>
          <div className="absolute left-4 top-3">
            <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/30" />
          </div>
          <div className="absolute right-5 top-6">
            <div className="h-3 w-3 rounded-full bg-rose-400 shadow-lg shadow-rose-500/30" />
          </div>
          <div className="absolute bottom-4 left-8">
            <div className="h-3 w-3 rounded-full bg-amber-400 shadow-lg shadow-amber-500/30" />
          </div>
          <div className="absolute bottom-5 right-4">
            <div className="h-3 w-3 rounded-full bg-purple-400 shadow-lg shadow-purple-500/30" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40 ring-2 ring-white" />
          </div>
        </div>
        {/* Filtros */}
        <div className="flex gap-1.5">
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-[8px] font-semibold text-emerald-600">🩺 Vet</div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-[8px] text-slate-500">🛁 Pet</div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-[8px] text-slate-500">🌳 Parque</div>
        </div>
        {/* Card servico */}
        <div className="rounded-xl bg-white p-3.5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs">🩺</div>
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-24 rounded-sm bg-slate-300" />
              <div className="mt-1 h-2 w-20 rounded-sm bg-slate-200" />
              <div className="mt-1.5 flex gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="h-4 w-4 shrink-0 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    ),
  },
];

export default function Features() {
  const reduce = useReducedMotion();

  return (
    <section id="funcionalidades" className="relative overflow-hidden px-6 py-24 md:py-32">
      {/* 3D Isometric Bones Background */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute left-[8%] top-[12%] opacity-20" width="80" height="80" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="fbt1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="fbs1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
            <linearGradient id="fbb1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b45309"/><stop offset="100%" stopColor="#92400e"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#fbt1)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#fbs1)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#fbt1)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#fbt1)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#fbs1)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#fbt1)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#fbs1)"/>
        </svg>
        <svg className="absolute right-[5%] top-[8%] opacity-15" width="100" height="100" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="fbt2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="fbs2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#fbt2)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#fbs2)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#fbt2)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#fbt2)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#fbs2)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#fbt2)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#fbs2)"/>
        </svg>
        <svg className="absolute left-[12%] bottom-[18%] opacity-15" width="70" height="70" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="fbt3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="fbs3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#fbt3)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#fbs3)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#fbt3)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#fbt3)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#fbs3)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#fbt3)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#fbs3)"/>
        </svg>
        <svg className="absolute right-[8%] bottom-[22%] opacity-10" width="90" height="90" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="fbt4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="fbs4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#fbt4)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#fbs4)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#fbt4)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#fbt4)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#fbs4)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#fbt4)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#fbs4)"/>
        </svg>
        <svg className="absolute left-[30%] top-[40%] opacity-10" width="60" height="60" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="fbt5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="fbs5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#fbt5)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#fbs5)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#fbt5)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#fbt5)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#fbs5)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#fbt5)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#fbs5)"/>
        </svg>
        <svg className="absolute right-[25%] top-[45%] opacity-12" width="75" height="75" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="fbt6" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="fbs6" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#fbt6)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#fbs6)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#fbt6)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#fbt6)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#fbs6)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#fbt6)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#fbs6)"/>
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl font-black tracking-tighter md:text-4xl"
        >
          Tudo que voce precisa
        </motion.h2>

        <div className="sticky top-24 z-10 mt-14">
          <div className="flex gap-12 overflow-x-auto pb-8 pt-4 scrollbar-hide">
            {pages.map((p, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="min-w-[380px] shrink-0"
              >
                <div className="group rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-amber-500/5">
                  {/* Phone mockup */}
                  <div className="mx-auto w-full max-w-[380px]">
                    <div className="rounded-[2.6rem] border-[4px] border-slate-700 bg-slate-900 p-[5px] shadow-2xl shadow-black/50">
                      <div className={`flex flex-col rounded-[2.2rem] bg-gradient-to-b ${p.gradient} overflow-hidden`}>
                        {/* Status bar */}
                        <div className="flex items-center justify-between px-7 pt-3.5 pb-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">9:41</span>
                          <div className="flex items-center gap-1.5">
                            <div className="h-px w-3 rounded-sm bg-slate-300" />
                            <div className="h-px w-3 rounded-sm bg-slate-300" />
                            <div className="h-px w-3 rounded-sm bg-slate-300" />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="min-h-[480px]">
                          {p.preview}
                        </div>
                        {/* Bottom nav */}
                        <div className="flex items-center justify-around border-t border-slate-200 px-6 py-3.5 bg-white/50">
                          <div className="flex flex-col items-center gap-1.5">
                            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
                              <defs>
                                <linearGradient id="dBody" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#fbbf24"/>
                                  <stop offset="100%" stopColor="#f59e0b"/>
                                </linearGradient>
                                <linearGradient id="dEar" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#d97706"/>
                                  <stop offset="100%" stopColor="#b45309"/>
                                </linearGradient>
                                <linearGradient id="dBelly" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#fef3c7"/>
                                  <stop offset="100%" stopColor="#fde68a"/>
                                </linearGradient>
                              </defs>
                              <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.1"/>
                              <ellipse cx="32" cy="42" rx="16" ry="14" fill="url(#dBody)"/>
                              <ellipse cx="32" cy="44" rx="10" ry="8" fill="url(#dBelly)"/>
                              <ellipse cx="18" cy="22" rx="8" ry="12" fill="url(#dEar)" transform="rotate(-15 18 22)"/>
                              <ellipse cx="46" cy="22" rx="8" ry="12" fill="url(#dEar)" transform="rotate(15 46 22)"/>
                              <circle cx="32" cy="28" r="16" fill="url(#dBody)"/>
                              <ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#dBelly)"/>
                              <circle cx="26" cy="26" r="3" fill="#1f2937"/>
                              <circle cx="25" cy="25" r="1" fill="white"/>
                              <circle cx="38" cy="26" r="3" fill="#1f2937"/>
                              <circle cx="37" cy="25" r="1" fill="white"/>
                              <ellipse cx="32" cy="32" rx="4" ry="3" fill="#374151"/>
                              <path d="M32 35 Q28 39 24 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M32 35 Q36 39 40 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                              <ellipse cx="32" cy="38" rx="3" ry="4" fill="#f472b6"/>
                              <circle cx="22" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
                              <circle cx="42" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
                              <ellipse cx="24" cy="52" rx="5" ry="4" fill="url(#dBody)"/>
                              <ellipse cx="40" cy="52" rx="5" ry="4" fill="url(#dBody)"/>
                            </svg>
                            <div className="h-1 w-5 rounded bg-amber-400" />
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-slate-300" />
                            <div className="h-1 w-5 rounded bg-slate-200" />
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-slate-300" />
                            <div className="h-1 w-5 rounded bg-slate-200" />
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-slate-300" />
                            <div className="h-1 w-5 rounded bg-slate-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-8 text-center">
                    <h3 className="text-base font-bold text-white">{p.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{p.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
