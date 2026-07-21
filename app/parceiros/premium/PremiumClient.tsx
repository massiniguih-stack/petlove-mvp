'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

// Só existe um nível real de benefício hoje (destaque + selo + WhatsApp —
// ver app/api/lastlink/webhook/route.ts e app/mapa/page.tsx). Os 3 planos
// antigos (Básico/Profissional/Empresarial) prometiam diferenças — fotos,
// painel de métricas, múltiplas unidades — que nenhum código implementa.
// Um plano único, honesto, até essas diferenças existirem de verdade.
const plano = {
  planType: 'partner_basic',
  nome: 'Parceiro Premium',
  descricao: 'Destaque seu negócio para quem está perto',
  mensal: 39.80,
  anual: 238.80,
  features: [
    'Listagem no mapa',
    'Selo Premium',
    'Destaque no topo da busca da sua cidade',
    'WhatsApp direto no perfil',
    'Informações de contato completas',
  ],
};

const beneficios = [
  {
    icon: '⭐',
    titulo: 'Destaque no Mapa',
    descricao: 'Seu negócio aparece no topo da lista e com selo de destaque na sua cidade.',
  },
  {
    icon: '📍',
    titulo: 'Prioridade na Busca',
    descricao: 'Quando alguém buscar na sua cidade, você aparece primeiro — antes dos concorrentes.',
  },
  {
    icon: '🏅',
    titulo: 'Selo Premium',
    descricao: 'Badge exclusivo que transmite confiança e credibilidade para novos clientes.',
  },
  {
    icon: '💬',
    titulo: 'WhatsApp Direto',
    descricao: 'Botão de WhatsApp no perfil para clientes chamarem direto pelo app.',
  },
];

export default function PremiumClient() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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
        body: JSON.stringify({ planType: plano.planType }),
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
              <span>🏆</span> Parceiro Premium
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Seja o <span className="text-yellow-200">Primeiro</span> que os<br />tutores encontram
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-orange-100">
              Apareça no topo do mapa, ganhe um selo de destaque e atraira mais clientes para sua clínica ou pet shop.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#beneficios" className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10">
                Conhecer Benefícios
              </a>
            </div>
          </div>
        </section>

        {/* Plano */}
        <section id="planos" className="px-4 py-16">
          <div className="mx-auto max-w-md">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                <span>🏆</span> Plano Premium
              </div>
              <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                Um plano, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">tudo incluso</span>
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Invista na visibilidade do seu estabelecimento</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                🎉 50% OFF para membros Patinha — Desconto aplicado automaticamente
              </div>
            </div>

            {/* Seletor */}
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  onClick={() => setPeriodo('mensal')}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition ${periodo === 'mensal' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setPeriodo('anual')}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition ${periodo === 'anual' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Anual
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">-20%</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Card */}
            <div className="mt-10 rounded-3xl border-2 border-amber-400 bg-white dark:bg-slate-900 p-6 shadow-lg shadow-amber-500/10">
              <div className="rounded-2xl bg-blue-50 p-4">
                <h3 className="text-xl font-black text-blue-600">{plano.nome}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plano.descricao}</p>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">R$</span>
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {periodo === 'mensal' ? plano.mensal.toFixed(2).replace('.', ',') : (plano.anual / 12).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/mês</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  <span className="line-through">R$ {(plano.mensal * 2).toFixed(2).replace('.', ',')}</span>{' '}
                  <span className="font-bold text-emerald-600">50% OFF</span>
                </p>
                {periodo === 'anual' && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    💰 Economia de R$ {((plano.mensal * 2 * 12) - plano.anual).toFixed(2)} no ano
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {periodo === 'mensal' ? 'Cobrado mensalmente' : `R$ ${plano.anual.toFixed(2)} cobrado anualmente`}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {plano.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`mt-6 w-full rounded-2xl py-4 text-sm font-black transition ${loading ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-wait' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-2xl'}`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processando…
                  </span>
                ) : 'Assinar Agora'}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
              <span>🔒 Pagamento seguro via LastLink</span>
              <span>·</span>
              <span>Cancelamento grátis</span>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="bg-white dark:bg-slate-900 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">
              Tudo que você precisa para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">crescer</span>
            </h2>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Benefícios exclusivos para parceiros Premium</p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {beneficios.map((b) => (
                <div key={b.titulo} className="group rounded-3xl border border-slate-100 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-3xl transition group-hover:scale-110">
                    {b.icon}
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
