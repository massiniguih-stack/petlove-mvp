'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="#000" opacity="0.1"/>
      <ellipse cx="32" cy="42" rx="16" ry="14" fill="url(#bodyGrad)" filter="url(#shadow)"/>
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="url(#bellyGrad)"/>
      <ellipse cx="18" cy="22" rx="8" ry="12" fill="url(#earGrad)" transform="rotate(-15 18 22)"/>
      <ellipse cx="46" cy="22" rx="8" ry="12" fill="url(#earGrad)" transform="rotate(15 46 22)"/>
      <circle cx="32" cy="28" r="16" fill="url(#bodyGrad)" filter="url(#shadow)"/>
      <ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#bellyGrad)"/>
      <circle cx="26" cy="26" r="3" fill="#1f2937"/>
      <circle cx="25" cy="25" r="1" fill="white"/>
      <circle cx="38" cy="26" r="3" fill="#1f2937"/>
      <circle cx="37" cy="25" r="1" fill="white"/>
      <ellipse cx="32" cy="32" rx="4" ry="3" fill="url(#noseGrad)"/>
      <ellipse cx="32" cy="31.5" rx="2" ry="1" fill="#6b7280" opacity="0.5"/>
      <path d="M32 35 Q28 39 24 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 35 Q36 39 40 37" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="32" cy="38" rx="3" ry="4" fill="#f472b6"/>
      <ellipse cx="32" cy="37" rx="2" ry="2" fill="#f9a8d4"/>
      <circle cx="22" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
      <circle cx="42" cy="30" r="3" fill="#fbcfe8" opacity="0.6"/>
      <ellipse cx="24" cy="52" rx="5" ry="4" fill="url(#bodyGrad)"/>
      <ellipse cx="40" cy="52" rx="5" ry="4" fill="url(#bodyGrad)"/>
      <circle cx="22" cy="51" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="24" cy="50" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="26" cy="51" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="38" cy="51" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="40" cy="50" r="1.5" fill="url(#bellyGrad)"/>
      <circle cx="42" cy="51" r="1.5" fill="url(#bellyGrad)"/>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/[0.06]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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

        <div className="hidden items-center gap-8 md:flex">
          <a href="#funcionalidades" className="text-sm text-slate-400 transition hover:text-white">Funcionalidades</a>
          <a href="#planos" className="text-sm text-slate-400 transition hover:text-white">Planos</a>
          <a href="#faq" className="text-sm text-slate-400 transition hover:text-white">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30 active:scale-[0.98]"
          >
            Comecar
          </Link>
        </div>
      </div>
    </nav>
  );
}
