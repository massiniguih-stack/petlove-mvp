'use client';

import { usePetStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format, differenceInMonths } from 'date-fns';
import {
  DashboardPawIcon3D,
  DogIcon3D,
  CalendarIcon3D,
  ActivityIcon3D,
  BowlIcon3D,
  PinIcon3D,
  GearIcon3D,
  ChartIcon3D,
} from '@/components/Icons3D';
import { BreedDogIcon } from '@/components/BreedDogIcon';
import { trackMetaEvent } from '@/components/MetaPixel';

const benefits = [
  { title: 'Saúde e peso', desc: 'Acompanhe o crescimento do seu pet.', Icon: ChartIcon3D },
  { title: 'Ração certa', desc: 'Sugestões por raça e objetivo.', Icon: BowlIcon3D },
  { title: 'Serviços perto', desc: 'Vet, parque e hotel no mapa.', Icon: PinIcon3D },
];

export default function HomePage() {
  const { pet } = usePetStore();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [proximaVacina, setProximaVacina] = useState<{ titulo: string; data: Date } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pet?.id) { setProximaVacina(null); return; }
    const supabase = createClient();
    supabase
      .from('momento')
      .select('titulo, data_agendada')
      .eq('pet_id', pet.id)
      .eq('categoria', 'vacina')
      .eq('status_vacina', 'pendente')
      .not('data_agendada', 'is', null)
      .order('data_agendada', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProximaVacina({ titulo: data[0].titulo as string, data: new Date(data[0].data_agendada as string) });
        } else {
          setProximaVacina(null);
        }
      });
  }, [pet?.id]);

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
            <div className="icon-3d-slot mx-auto">
              <DogIcon3D size={72} />
            </div>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
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
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Cadastrar meu pet agora
            </Link>

            <Link
              href="/parceiros/cadastro"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              Sou parceiro pet (vet / petshop)
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
              <h1 className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                <span
                  className="icon-3d-slot inline-flex shrink-0 items-center justify-center overflow-visible"
                  title={pet.raca}
                  aria-label={pet.raca}
                >
                  {pet.fotoUrl ? (
                    // Foto real do pet — sem moldura, só o animal
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pet.fotoUrl}
                      alt={pet.raca}
                      className="h-16 w-16 rounded-2xl object-cover md:h-20 md:w-20"
                    />
                  ) : (
                    <BreedDogIcon size={72} raca={pet.raca} peso={pet.peso} alt={pet.raca} />
                  )}
                </span>
                <span>Olá, {pet.nome}!</span>
              </h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                O que você quer fazer agora?
              </p>
              <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
                <span>🐾 {(() => {
                  const meses = differenceInMonths(new Date(), new Date(pet.dataNascimento));
                  return meses < 12 ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : `${Math.floor(meses / 12)} ${Math.floor(meses / 12) === 1 ? 'ano' : 'anos'}`;
                })()}</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span>⚖️ {pet.peso.toLocaleString('pt-BR')} kg</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                {proximaVacina ? (
                  <Link href="/vida" className="text-amber-600 hover:underline dark:text-amber-400">
                    💉 Próxima vacina: {format(proximaVacina.data, 'dd/MM')}
                  </Link>
                ) : (
                  <span>💉 Nenhuma vacina agendada</span>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { href: '/dashboard', Icon: DashboardPawIcon3D, titulo: 'Dashboard', desc: `Peso, vacinas e tudo sobre ${pet.nome}.` },
                { href: '/racao', Icon: BowlIcon3D, titulo: 'Ração', desc: 'Porções e nutrição ideal.' },
                { href: '/atividades', Icon: ActivityIcon3D, titulo: 'Atividades', desc: `Exercícios e dicas para ${pet.nome}.` },
                { href: '/vida', Icon: CalendarIcon3D, titulo: 'Linha do tempo', desc: 'Marcos, vacinas e conquistas.' },
                { href: '/mapa', Icon: PinIcon3D, titulo: 'Serviços', desc: 'Veterinários, parques e hotéis.' },
                { href: '/onboarding', Icon: GearIcon3D, titulo: 'Editar perfil', desc: `Atualize dados de ${pet.nome}.` },
                { href: '/comparar', Icon: ChartIcon3D, titulo: 'Comparar pets', desc: 'Compare seus pets lado a lado.' },
              ].map(({ href, Icon, titulo, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-700"
                >
                  <div className="icon-3d-slot flex h-12 w-12 items-center justify-center overflow-visible">
                    <Icon size={44} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{titulo}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
                </Link>
              ))}
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
                <div className="icon-3d-slot relative p-2 md:p-3">
                  <DogIcon3D size={120} />
                </div>
              </div>
            </div>
            <h1 className="mt-8 text-6xl font-black tracking-tight md:text-7xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">
                Patinha
              </span>
            </h1>
            <p className="mt-3 text-sm font-bold tracking-[0.3em] text-slate-400 uppercase dark:text-slate-500">
              Cuidados para o seu melhor amigo
            </p>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400">
              Saúde, ração e serviços perto de você. <span className="font-semibold text-slate-700 dark:text-slate-300">Grátis para começar · Premium opcional</span>
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
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                  {step.n}
                </div>
                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">{step.t}</p>
                <p className="text-xs text-slate-400">{step.d}</p>
              </div>
            ))}
          </div>

          {/* CTAs — EXP-03: tutor primário, parceiro secundário · EXP-17 eventos */}
          <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/cadastro"
              onClick={() => trackMetaEvent('ViewContent', { content_name: 'cta_home_tutor' })}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Começar grátis
            </Link>
            <Link
              href="/login"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Já tenho conta
            </Link>
          </div>

          <div className="mx-auto mt-4 max-w-md">
            <Link
              href="/parceiros/cadastro"
              onClick={() => trackMetaEvent('ViewContent', { content_name: 'cta_home_parceiro' })}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sou parceiro pet (vet / petshop)
            </Link>
          </div>

          {/* Benefícios */}
          <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white p-6 text-center ring-1 ring-slate-100 dark:bg-slate-900/90 dark:ring-slate-700/80"
              >
                <div className="icon-3d-slot mx-auto mb-1 h-16 w-16">
                  <b.Icon size={56} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">{b.title}</h3>
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
