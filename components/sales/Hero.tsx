'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pt-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-black tracking-tighter leading-[1.1] md:text-6xl lg:text-7xl"
        >
          Seu pet merece{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            o melhor.
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-[65ch] text-base leading-relaxed text-slate-400 md:text-lg"
        >
          Saude, nutricao, atividades e servicos. Tudo em um so lugar.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/cadastro"
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Comecar agora
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-300"
          >
            Ja tem conta? Entrar
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-16"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-amber-500/5 backdrop-blur-sm">
          <div className="flex h-[400px] w-[340px] items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 sm:h-[460px] sm:w-[380px]">
            <div className="px-8 text-center">
              <svg width="120" height="120" viewBox="0 0 64 64" fill="none" className="mx-auto mb-6">
                <defs>
                  <linearGradient id="heroBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24"/>
                    <stop offset="100%" stopColor="#f59e0b"/>
                  </linearGradient>
                  <linearGradient id="heroEar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706"/>
                    <stop offset="100%" stopColor="#b45309"/>
                  </linearGradient>
                  <linearGradient id="heroBelly" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fef3c7"/>
                    <stop offset="100%" stopColor="#fde68a"/>
                  </linearGradient>
                  <linearGradient id="heroNose" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#374151"/>
                    <stop offset="100%" stopColor="#1f2937"/>
                  </linearGradient>
                  <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.2"/>
                  </filter>
                </defs>
                <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.1"/>
                <ellipse cx="32" cy="42" rx="16" ry="14" fill="url(#heroBody)" filter="url(#heroShadow)"/>
                <ellipse cx="32" cy="44" rx="10" ry="8" fill="url(#heroBelly)"/>
                <ellipse cx="18" cy="22" rx="8" ry="12" fill="url(#heroEar)" transform="rotate(-15 18 22)"/>
                <ellipse cx="46" cy="22" rx="8" ry="12" fill="url(#heroEar)" transform="rotate(15 46 22)"/>
                <circle cx="32" cy="28" r="16" fill="url(#heroBody)" filter="url(#heroShadow)"/>
                <ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#heroBelly)"/>
                <circle cx="26" cy="26" r="3" fill="#1f2937"/>
                <circle cx="25" cy="25" r="1" fill="white"/>
                <circle cx="38" cy="26" r="3" fill="#1f2937"/>
                <circle cx="37" cy="25" r="1" fill="white"/>
                <ellipse cx="32" cy="32" rx="4" ry="3" fill="url(#heroNose)"/>
                <ellipse cx="32" cy="31.5" rx="2" ry="1" fill="#6b7280" opacity="0.5"/>
                <path d="M32 35 Q28 39 24 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M32 35 Q36 39 40 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                <ellipse cx="32" cy="38" rx="3" ry="4" fill="#f472b6"/>
                <ellipse cx="32" cy="37" rx="2" ry="2" fill="#f9a8d4"/>
                <circle cx="22" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
                <circle cx="42" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
                <ellipse cx="24" cy="52" rx="5" ry="4" fill="url(#heroBody)"/>
                <ellipse cx="40" cy="52" rx="5" ry="4" fill="url(#heroBody)"/>
                <circle cx="22" cy="51" r="1.5" fill="url(#heroBelly)"/>
                <circle cx="24" cy="50" r="1.5" fill="url(#heroBelly)"/>
                <circle cx="26" cy="51" r="1.5" fill="url(#heroBelly)"/>
                <circle cx="38" cy="51" r="1.5" fill="url(#heroBelly)"/>
                <circle cx="40" cy="50" r="1.5" fill="url(#heroBelly)"/>
                <circle cx="42" cy="51" r="1.5" fill="url(#heroBelly)"/>
              </svg>
              <p className="text-base font-bold text-white">PetLove</p>
              <p className="mt-1.5 text-sm text-slate-400">Seu pet, nosso cuidado</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
