'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 100 100">
            <ellipse cx="50" cy="78" rx="16" ry="12" fill="#fbbf24"/>
            <ellipse cx="30" cy="55" rx="9" ry="9" fill="#fbbf24"/>
            <ellipse cx="50" cy="48" rx="9" ry="9" fill="#fbbf24"/>
            <ellipse cx="70" cy="55" rx="9" ry="9" fill="#fbbf24"/>
          </svg>
          <span className="text-sm font-bold text-white">PetLove</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <Link href="/login" className="transition hover:text-white">
            Entrar
          </Link>
          <Link href="/cadastro" className="transition hover:text-white">
            Criar conta
          </Link>
          <Link href="/politica-de-privacidade" className="transition hover:text-white">
            Privacidade
          </Link>
          <a href="mailto:contato@petlove.app" className="transition hover:text-white">
            Contato
          </a>
        </nav>

        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} PetLove
        </p>
      </div>
    </footer>
  );
}
