'use client';

import { usePetStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { BreedDogIcon } from '@/components/BreedDogIcon';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';
import FeedbackWidget from '@/components/FeedbackWidget';
import { createClient } from '@/lib/supabase/client';
import {
  idadeDoPet,
  recadoVacina,
  recadoVacinaIndisponivel,
  rotuloObjetivo,
} from '@/lib/tutor/recadoHoje';

function PetPhoto({
  pet,
  onPhotoChange,
}: {
  pet: { nome: string; fotoUrl: string | null; raca?: string; peso?: number };
  onPhotoChange: (url: string) => void;
}) {
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
        className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-amber-200 bg-amber-50 shadow-md shadow-amber-500/20 dark:border-amber-700 dark:bg-amber-950"
        onClick={() => fileInputRef.current?.click()}
      >
        {pet.fotoUrl ? (
          <img src={pet.fotoUrl} alt={pet.nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-amber-100 p-2 dark:bg-amber-950">
            <BreedDogIcon
              size={96}
              raca={pet.raca}
              peso={pet.peso}
              alt={pet.raca || pet.nome}
            />
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

const atalhos = [
  { href: '/racao', label: 'Ração' },
  { href: '/atividades', label: 'Atividades' },
  { href: '/mapa', label: 'Mapa' },
];

export default function DashboardPage() {
  const { pet, updatePet, petsCarregados, isPremium } = usePetStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [vacinaEstado, setVacinaEstado] = useState<'carregando' | 'pronta' | 'erro'>('carregando');
  const [proximaVacina, setProximaVacina] = useState<{ titulo: string; data: Date } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Só redireciona depois que fetchPets() (a busca real no servidor)
    // terminar — antes disso `pet` pode estar nulo só porque este
    // navegador ainda não confirmou o que a conta realmente tem.
    if (petsCarregados && !pet) router.push('/onboarding');
  }, [petsCarregados, pet, router]);

  useEffect(() => {
    if (!pet?.id) return;
    if (pet.id === 'demo-pet-preview') {
      setProximaVacina(null);
      setVacinaEstado('pronta');
      return;
    }
    let ativo = true;
    setVacinaEstado('carregando');
    const supabase = createClient();
    (async () => {
      try {
        const { data, error } = await supabase
          .from('momento')
          .select('titulo, data_agendada')
          .eq('pet_id', pet.id)
          .eq('categoria', 'vacina')
          .eq('status_vacina', 'pendente')
          .not('data_agendada', 'is', null)
          .order('data_agendada', { ascending: true })
          .limit(1);
        if (!ativo) return;
        if (error) {
          setProximaVacina(null);
          setVacinaEstado('erro');
          return;
        }
        if (data && data.length > 0) {
          setProximaVacina({
            titulo: data[0].titulo as string,
            data: new Date(data[0].data_agendada as string),
          });
        } else {
          setProximaVacina(null);
        }
        setVacinaEstado('pronta');
      } catch {
        if (!ativo) return;
        setProximaVacina(null);
        setVacinaEstado('erro');
      }
    })();
    return () => {
      ativo = false;
    };
  }, [pet?.id]);

  if (!pet || !mounted) return null;

  const handlePhotoChange = (url: string) => {
    updatePet(pet.id, { fotoUrl: url });
  };

  const recado =
    vacinaEstado === 'erro'
      ? recadoVacinaIndisponivel()
      : recadoVacina(proximaVacina, (data) => format(data, 'dd/MM'));

  const fatos: { label: string; href?: string }[] = [
    { label: pet.raca, href: '/atividades' },
    { label: idadeDoPet(pet.dataNascimento), href: '/vida' },
    { label: pet.sexo === 'macho' ? 'Macho' : 'Fêmea' },
    { label: `${pet.peso.toLocaleString('pt-BR')} kg`, href: '/racao' },
    { label: rotuloObjetivo(pet.objetivo), href: '/desempenho' },
  ].filter((fato) => fato.label);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <NotificationBanner />
          <FeedbackWidget />
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <PetPhoto pet={pet} onPhotoChange={handlePhotoChange} />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {pet.nome}
              </h1>
              <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:justify-start">
                {fatos.map((fato, i) => (
                  <span key={`${fato.label}-${i}`} className="inline-flex items-center gap-1.5">
                    {fato.href ? (
                      <Link href={fato.href} className="underline-offset-4 hover:text-slate-900 hover:underline dark:hover:text-white">
                        {fato.label}
                      </Link>
                    ) : (
                      <span>{fato.label}</span>
                    )}
                    {i < fatos.length - 1 && <span className="text-slate-400">·</span>}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Hoje</h2>
            {vacinaEstado === 'carregando' ? (
              <div className="mt-3 h-16 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
            ) : (
              <Link
                href={recado.href}
                className="mt-3 block rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:border-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-amber-900 dark:bg-amber-950/40"
              >
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {recado.titulo}
                </span>
                <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-300">
                  {recado.detalhe}
                </span>
              </Link>
            )}
          </section>

          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Atalhos do pet">
            {atalhos.map((atalho) => (
              <Link
                key={atalho.href}
                href={atalho.href}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-amber-700"
              >
                {atalho.label}
              </Link>
            ))}
          </nav>

          {!isPremium && (
            <Link
              href="/planos"
              className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm transition hover:border-violet-300 dark:border-violet-900 dark:bg-violet-950/40"
            >
              <span className="font-semibold text-slate-900 dark:text-white">Premium a partir de R$ 29,49/mês</span>
              <span className="shrink-0 font-semibold text-violet-700 dark:text-violet-300">Ver planos →</span>
            </Link>
          )}
          <p className={isPremium ? 'mt-8 text-sm' : 'mt-3 text-sm'}>
            <Link
              href="/conta/assinatura"
              className="text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
            >
              Minha conta
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
