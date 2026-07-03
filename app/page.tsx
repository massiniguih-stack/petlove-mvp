import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { PawPrint, Heart, MapPin, BowlFood } from '@phosphor-icons/react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Cuidado do seu cachorro em um só lugar
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Acompanhe o desenvolvimento do seu pet, encontre serviços próximos e receba recomendações de ração personalizadas.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Cadastrar meu pet
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Ver dashboard
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Heart size={28} className="text-brand-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">Acompanhamento do filhote</p>
                <p className="mt-1 text-xs text-slate-600">Registre peso, vacinas e crescimento ao longo do tempo.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <MapPin size={28} className="text-brand-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">Serviços próximos</p>
                <p className="mt-1 text-xs text-slate-600">Veterinários, parques e hotéis na sua região.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <BowlFood size={28} className="text-brand-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">Ração por raça</p>
                <p className="mt-1 text-xs text-slate-600">Recomendações alinhadas à raça e objetivo do seu pet.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <PawPrint size={28} className="text-brand-600" />
                <p className="mt-3 text-sm font-medium text-slate-900">Jornada completa</p>
                <p className="mt-1 text-xs text-slate-600">Do filhote ao adulto, com orientações por fase de vida.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
