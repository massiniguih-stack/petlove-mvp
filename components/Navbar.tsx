import Link from 'next/link';
import { PawPrint } from '@phosphor-icons/react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint size={28} className="text-brand-600" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              PetLove
            </span>
          </Link>
          <div className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/onboarding" className="hover:text-brand-600">
              Cadastrar pet
            </Link>
            <Link href="/dashboard" className="hover:text-brand-600">
              Dashboard
            </Link>
            <Link href="/mapa" className="hover:text-brand-600">
              Mapa
            </Link>
            <Link href="/racao" className="hover:text-brand-600">
              Ração
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
