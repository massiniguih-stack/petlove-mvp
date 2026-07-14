'use client';

import { usePetStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ScaleIcon3D, TargetIcon3D, BuildingIcon3D, CalendarIcon3D } from '@/components/Icons3D';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function PetPhoto({ pet, onPhotoChange }: { pet: { nome: string; fotoUrl: string | null }; onPhotoChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-emerald-200 bg-slate-100 dark:border-emerald-800 dark:bg-slate-800"
        onClick={() => fileInputRef.current?.click()}
      >
        {pet.fotoUrl ? (
          <img src={pet.fotoUrl} alt={pet.nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 dark:text-slate-600">
              <path d="M18 9V7c0-1.1-.9-2-2-2h-1V3.5C15 2.12 13.88 1 12.5 1S10 2.12 10 3.5V5H9C7.9 5 7 5.9 7 7v2c0 .55.23 1.05.59 1.41L6 12v2c0 1.1.9 2 2 2h1v1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V16h1c1.1 0 2-.9 2-2v-2l-1.59-1.59c.36-.36.59-.86.59-1.41z"/>
            </svg>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
          <span className="text-xs font-medium text-white">Trocar foto</span>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Clique para adicionar foto</p>
    </div>
  );
}

export default function DashboardPage() {
  const { pet, updatePet } = usePetStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pet) router.push('/onboarding');
  }, [pet, router]);

  if (!pet) return null;

  if (!mounted) return null;

  const handlePhotoChange = (url: string) => {
    updatePet(pet.id, { fotoUrl: url });
  };

  const idadeEmMeses = (() => {
    const diff = new Date().getTime() - new Date(pet.dataNascimento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  })();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <PetPhoto pet={pet} onPhotoChange={handlePhotoChange} />
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                PET VIP
              </div>
              <h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">{pet.nome}</span>
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 sm:justify-start">
                <Link href="/atividades" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 transition hover:bg-amber-100 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-amber-900 dark:hover:text-amber-300">
                  <span>🐕</span> {pet.raca}
                </Link>
                <Link href="/vida" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 transition hover:bg-blue-100 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-900 dark:hover:text-blue-300">
                  <span>📅</span> {idadeEmMeses < 12 ? `${idadeEmMeses}m` : `${Math.floor(idadeEmMeses / 12)}a ${idadeEmMeses % 12}m`}
                </Link>
                <Link href="/atividades" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 transition hover:bg-pink-100 hover:text-pink-700 dark:bg-slate-800 dark:hover:bg-pink-900 dark:hover:text-pink-300">
                  <span>{pet.sexo === 'macho' ? '♂️' : '♀️'}</span> {pet.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link href="/atividades" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  Atividades
                </Link>
                <Link href="/racao" className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12h8"/>
                    <path d="M12 8v8"/>
                  </svg>
                  Ração
                </Link>
                <Link href="/vida" className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Timeline
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/desempenho" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl hover:shadow-amber-500/40">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
              <div className="relative">
                <ScaleIcon3D size={40} />
                <p className="mt-3 text-sm font-medium text-white/80">Peso atual</p>
                <p className="text-2xl font-bold">{pet.peso.toLocaleString('pt-BR')} kg</p>
              </div>
            </Link>

            <Link href="/racao" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
              <div className="relative">
                <TargetIcon3D size={40} />
                <p className="mt-3 text-sm font-medium text-white/80">Objetivo</p>
                <p className="text-2xl font-bold">{pet.objetivo === 'manutencao' ? 'Manutenção' : pet.objetivo === 'pelagem' ? 'Pelagem' : pet.objetivo === 'emagrecimento' ? 'Emagrecimento' : 'Desempenho'}</p>
              </div>
            </Link>

            <Link href="/mapa" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 p-5 text-white shadow-lg shadow-rose-500/30 transition hover:shadow-xl hover:shadow-rose-500/40">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
              <div className="relative">
                <BuildingIcon3D size={40} />
                <p className="mt-3 text-sm font-medium text-white/80">Serviços</p>
                <p className="text-2xl font-bold">Vets e parques</p>
              </div>
            </Link>

            <Link href="/vida" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 p-5 text-white shadow-lg shadow-rose-500/30 transition hover:shadow-xl hover:shadow-rose-500/40">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
              <div className="relative">
                <CalendarIcon3D size={40} />
                <p className="mt-3 text-sm font-medium text-white/80">Linha do tempo</p>
                <p className="text-2xl font-bold">
                  {idadeEmMeses < 12 ? `${idadeEmMeses}m` : `${Math.floor(idadeEmMeses / 12)}a ${idadeEmMeses % 12}m`}
                </p>
              </div>
            </Link>
          </div>

          {/* CTA Premium */}
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white shadow-xl shadow-violet-500/20">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <span className="text-3xl">👑</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black">Desbloqueie o PetLove Premium</h3>
                <p className="mt-1 text-sm text-violet-100">Planos personalizados, alertas de vacinas, gráficos avançados e muito mais por apenas <strong>R$ 19,90/mês</strong>.</p>
              </div>
              <a
                href="/planos"
                className="shrink-0 rounded-2xl bg-white px-6 py-3 text-sm font-black text-violet-600 shadow-lg transition hover:bg-violet-50 hover:shadow-xl"
              >
                Ver Planos →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
