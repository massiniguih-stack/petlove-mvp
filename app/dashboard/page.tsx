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
import { diaISO } from '@/lib/checklist';
import {
  legendaProgresso,
  resumoDoDia,
  type ItemDoDia,
  type ProgressoLista,
} from '@/lib/tutor/resumoDia';

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

function CartaoProgresso({
  titulo,
  href,
  progresso,
  cor,
}: {
  titulo: string;
  href: string;
  progresso: ProgressoLista;
  cor: 'amber' | 'sky';
}) {
  const barra = cor === 'amber' ? 'bg-amber-500' : 'bg-sky-500';
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <span className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        {titulo}
        <span aria-hidden className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200">→</span>
      </span>
      <span className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
          {progresso.total === 0 ? '—' : progresso.feitas}
        </span>
        {progresso.total > 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">de {progresso.total}</span>
        )}
      </span>
      <span
        className="mt-3 block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-label={`${titulo} feitas hoje`}
        aria-valuemin={0}
        aria-valuemax={progresso.total}
        aria-valuenow={progresso.feitas}
      >
        <span
          className={`block h-full rounded-full transition-[width] duration-500 ${barra}`}
          style={{ width: `${progresso.percentual}%` }}
        />
      </span>
      <span className="mt-2.5 block truncate text-xs text-slate-600 dark:text-slate-300">
        {legendaProgresso(progresso)}
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const { pet, updatePet, petsCarregados, isPremium } = usePetStore();
  const [diaEstado, setDiaEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const [itensDoDia, setItensDoDia] = useState<ItemDoDia[]>([]);
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

  // Mini painel do dia: só LÊ o que Ração e Atividades já gravaram hoje.
  // Quem cria a lista padrão do dia são aquelas telas, não o dashboard.
  useEffect(() => {
    if (!pet?.id) return;
    if (pet.id === 'demo-pet-preview') {
      setItensDoDia([]);
      setDiaEstado('pronto');
      return;
    }
    let ativo = true;
    setDiaEstado('carregando');
    const supabase = createClient();
    (async () => {
      try {
        const { data, error } = await supabase
          .from('checklist_item')
          .select('id, lista, hora, nome, detalhe, concluida')
          .eq('pet_id', pet.id)
          .eq('dia', diaISO(new Date()))
          .in('lista', ['refeicao', 'atividade']);
        if (!ativo) return;
        if (error) {
          setDiaEstado('erro');
          return;
        }
        setItensDoDia((data || []) as ItemDoDia[]);
        setDiaEstado('pronto');
      } catch {
        if (ativo) setDiaEstado('erro');
      }
    })();
    return () => {
      ativo = false;
    };
  }, [pet?.id]);

  if (!pet || !mounted) return null;

  const resumo = resumoDoDia(itensDoDia);

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

          <section className="mt-6" aria-label="O que já foi feito hoje">
            {diaEstado === 'carregando' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
              </div>
            ) : diaEstado === 'erro' ? (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                Não consegui carregar o dia agora. Veja direto em{' '}
                <Link href="/racao" className="font-semibold text-slate-900 underline underline-offset-4 dark:text-white">Ração</Link>
                {' '}ou{' '}
                <Link href="/atividades" className="font-semibold text-slate-900 underline underline-offset-4 dark:text-white">Atividades</Link>.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <CartaoProgresso titulo="Refeições" href="/racao" progresso={resumo.refeicoes} cor="amber" />
                  <CartaoProgresso titulo="Atividades" href="/atividades" progresso={resumo.atividades} cor="sky" />
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Já feito hoje</h3>
                  {resumo.feitos.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Nada marcado ainda. O que você concluir em Ração e Atividades aparece aqui.
                    </p>
                  ) : (
                    <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {resumo.feitos.map((feito) => (
                        <li key={feito.id} className="flex items-center gap-3 py-2 text-sm">
                          <span
                            aria-hidden
                            className={`h-2 w-2 shrink-0 rounded-full ${feito.tipo === 'refeicao' ? 'bg-amber-500' : 'bg-sky-500'}`}
                          />
                          <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">
                            {feito.nome}
                            {feito.detalhe && (
                              <span className="font-normal text-slate-500 dark:text-slate-400"> · {feito.detalhe}</span>
                            )}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                            {feito.tipo === 'refeicao' ? 'Refeição' : 'Atividade'}
                            {feito.hora ? ` · ${feito.hora}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>

          <section
            className="mt-8 flex flex-col gap-4 rounded-2xl bg-slate-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900 dark:ring-1 dark:ring-slate-800"
            aria-label="Seu plano"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Seu plano</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight">
                {isPremium ? 'Premium' : 'Gratuito'}
                {isPremium && (
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    Ativo
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {isPremium
                  ? 'Pets ilimitados, histórico completo e comparação entre pets.'
                  : 'Premium a partir de R$ 29,49/mês: pets ilimitados e histórico completo.'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <Link
                href={isPremium ? '/conta/assinatura' : '/planos'}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 active:scale-[0.98]"
              >
                {isPremium ? 'Gerenciar plano' : 'Mudar de plano'}
                <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
              </Link>
              {!isPremium && (
                <Link
                  href="/conta/assinatura"
                  className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                >
                  Minha conta
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
