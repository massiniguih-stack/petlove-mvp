'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { PremiumIcon3D, PinIcon3D, MedalIcon3D, StarIcon3D } from '@/components/Icons3D';
import type { ComponentType } from 'react';

// Preços reais de UI (EXP-13B): mensal partner_basic · anual partner_annual no LastLink.
const PRECO_MENSAL = 39.8;
const PRECO_ANUAL = 238.8; // ~50% off vs 12 × mensal (R$ 477,60)

const features = [
  'Listagem no mapa',
  'Selo Premium',
  'Destaque no topo da busca da sua cidade',
  'WhatsApp direto no perfil',
  'Informações de contato completas',
];

const beneficios: {
  Icon: ComponentType<{ size?: number; className?: string }>;
  titulo: string;
  descricao: string;
}[] = [
  {
    Icon: StarIcon3D,
    titulo: 'Destaque no Mapa',
    descricao: 'Seu negócio aparece no topo da lista e com selo de destaque na sua cidade.',
  },
  {
    Icon: PinIcon3D,
    titulo: 'Prioridade na Busca',
    descricao: 'Quando alguém buscar na sua cidade, você aparece primeiro — antes dos concorrentes.',
  },
  {
    Icon: MedalIcon3D,
    titulo: 'Selo Premium',
    descricao: 'Badge exclusivo que transmite confiança e credibilidade para novos clientes.',
  },
  {
    Icon: PremiumIcon3D,
    titulo: 'WhatsApp Direto',
    descricao: 'Botão de WhatsApp no perfil para clientes chamarem direto pelo app.',
  },
];

function formatBRL(valor: number) {
  return valor.toFixed(2).replace('.', ',');
}

export default function PremiumClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal');
  const router = useRouter();
  const supabase = createClient();

  const planType = periodo === 'anual' ? 'partner_annual' : 'partner_basic';
  const precoExibidoMes = periodo === 'mensal' ? PRECO_MENSAL : PRECO_ANUAL / 12;
  const economiaAnual = PRECO_MENSAL * 12 - PRECO_ANUAL;
  const descontoPct = Math.round((economiaAnual / (PRECO_MENSAL * 12)) * 100);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/parceiros/premium');
        return;
      }
      const res = await fetch('/api/lastlink/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-4 py-20 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white" />
          </div>
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
              <PremiumIcon3D size={28} /> Parceiro Premium
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Seja o <span className="text-yellow-200">Primeiro</span> que os<br />tutores encontram
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-orange-100">
              Apareça no topo do mapa, ganhe um selo de destaque e atrairá mais clientes para sua clínica ou pet shop.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#planos"
                className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-orange-600 shadow-lg transition hover:bg-orange-50"
              >
                Ver planos e assinar
              </a>
              <a href="#beneficios" className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10">
                Conhecer benefícios
              </a>
            </div>
          </div>
        </section>

        {/* Planos — mensal + anual */}
        <section id="planos" className="px-4 py-16">
          <div className="mx-auto max-w-md">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                <PremiumIcon3D size={28} /> Plano Premium
              </div>
              <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                Escolha o <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">período</span>
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Mesmo benefícios · pague mensal ou economize no anual</p>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setPeriodo('mensal')}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                    periodo === 'mensal'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodo('anual')}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                    periodo === 'anual'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Anual
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                    -{descontoPct}%
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="mt-10 rounded-3xl border-2 border-amber-400 bg-white p-6 shadow-lg shadow-amber-500/10 dark:bg-slate-900">
              <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40">
                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">Parceiro Premium</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Destaque seu negócio para quem está perto
                </p>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">R$</span>
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {formatBRL(precoExibidoMes)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/mês</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {periodo === 'mensal'
                    ? 'Cobrado mensalmente · pagamento via LastLink'
                    : `R$ ${formatBRL(PRECO_ANUAL)} cobrados uma vez ao ano · LastLink`}
                </p>
                {periodo === 'anual' && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Economia de R$ {formatBRL(economiaAnual)} no ano
                  </p>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600 dark:bg-blue-950 dark:text-blue-300">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className={`mt-6 w-full rounded-2xl py-4 text-sm font-black transition ${loading ? 'cursor-wait bg-slate-200 text-slate-500 dark:bg-slate-700' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-2xl'}`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processando…
                  </span>
                ) : periodo === 'anual' ? (
                  'Assinar Premium anual'
                ) : (
                  'Assinar Premium mensal'
                )}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>Pagamento seguro via LastLink</span>
              <span>·</span>
              <span>Cancele quando quiser na área de membros</span>
            </div>
          </div>
        </section>

        <section id="beneficios" className="bg-white px-4 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">
              Tudo que você precisa para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">crescer</span>
            </h2>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Benefícios do Parceiro Premium</p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {beneficios.map((b) => (
                <div key={b.titulo} className="group rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                  <div className="icon-3d-slot h-20 w-20 transition group-hover:scale-110">
                    <b.Icon size={64} />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{b.titulo}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{b.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
