'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { PremiumIcon3D, PinIcon3D, MedalIcon3D, StarIcon3D } from '@/components/Icons3D';
import type { ComponentType } from 'react';

type PaidPlanType = 'partner_basic' | 'partner_pro' | 'partner_enterprise';

// Preços alinhados a app/api/admin/dashboard-stats (MRR). Ajuste se LastLink divergir.
const planos: {
  id: 'free' | PaidPlanType;
  nome: string;
  descricao: string;
  mensal: number | null;
  planType: PaidPlanType | null;
  cta: string;
  destaque?: boolean;
  features: string[];
}[] = [
  {
    id: 'free',
    nome: 'Grátis',
    descricao: 'Entre no mapa e comece a aparecer',
    mensal: null,
    planType: null,
    cta: 'Cadastrar grátis',
    features: [
      'Cadastro do negócio no app',
      'Listagem no mapa (após análise)',
      'Perfil com contato e serviços',
      'Sem destaque nem selo Premium',
    ],
  },
  {
    id: 'partner_basic',
    nome: 'Básico',
    descricao: 'Destaque essencial na sua cidade',
    mensal: 39.8,
    planType: 'partner_basic',
    cta: 'Assinar Básico',
    features: [
      'Tudo do Grátis',
      'Selo Premium no mapa',
      'Destaque na busca da cidade',
      'Botão de WhatsApp no perfil',
      'Ativação após pagamento',
    ],
  },
  {
    id: 'partner_pro',
    nome: 'Profissional',
    descricao: 'Para quem quer crescer com o app',
    mensal: 69.8,
    planType: 'partner_pro',
    cta: 'Assinar Profissional',
    destaque: true,
    features: [
      'Tudo do Básico',
      'Prioridade comercial no mapa',
      'Painel do parceiro (métricas)',
      'Registro de serviços realizados',
      'Melhor custo-benefício',
    ],
  },
  {
    id: 'partner_enterprise',
    nome: 'Empresarial',
    descricao: 'Redes, franquias e multi-unidade',
    mensal: 129.8,
    planType: 'partner_enterprise',
    cta: 'Assinar Empresarial',
    features: [
      'Tudo do Profissional',
      'Ideal para redes e filiais',
      'Visibilidade máxima na região',
      'Canal preferencial com o time Patinha',
      'Plano para operação maior',
    ],
  },
];

const beneficios: {
  Icon: ComponentType<{ size?: number; className?: string }>;
  titulo: string;
  descricao: string;
}[] = [
  {
    Icon: StarIcon3D,
    titulo: 'Destaque no Mapa',
    descricao: 'Planos pagos aparecem com selo e prioridade na lista da sua cidade.',
  },
  {
    Icon: PinIcon3D,
    titulo: 'Prioridade na Busca',
    descricao: 'Quando o tutor busca perto, negócios Premium sobem na fila.',
  },
  {
    Icon: MedalIcon3D,
    titulo: 'Selo Premium',
    descricao: 'Badge de confiança no card e no perfil do estabelecimento.',
  },
  {
    Icon: PremiumIcon3D,
    titulo: 'WhatsApp Direto',
    descricao: 'Nos planos pagos, o tutor chama você em um toque pelo app.',
  },
];

function formatBRL(valor: number) {
  return valor.toFixed(2).replace('.', ',');
}

export default function PremiumClient() {
  const [loadingPlan, setLoadingPlan] = useState<PaidPlanType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCheckout = async (planType: PaidPlanType) => {
    setLoadingPlan(planType);
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
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <Navbar />
      <main className="flex-1">

        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-4 py-20 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white" />
          </div>
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
              <PremiumIcon3D size={28} /> Planos para parceiros
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Do grátis ao <span className="text-yellow-200">destaque</span> na cidade
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-orange-100">
              Escolha o plano certo pro tamanho do seu negócio: listagem gratuita ou Premium com selo, WhatsApp e prioridade no mapa.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#planos"
                className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-orange-600 shadow-lg transition hover:bg-orange-50"
              >
                Ver planos
              </a>
              <a href="#beneficios" className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10">
                Conhecer benefícios
              </a>
            </div>
          </div>
        </section>

        <section id="planos" className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                <PremiumIcon3D size={28} /> Grátis · Básico · Profissional · Empresarial
              </div>
              <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                Um plano para cada <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">momento</span>
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Comece grátis ou assine Premium com pagamento via LastLink
              </p>
            </div>

            {error && (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {planos.map((plano) => {
                const isPaid = plano.planType != null;
                const loading = isPaid && loadingPlan === plano.planType;
                return (
                  <div
                    key={plano.id}
                    className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 shadow-sm dark:bg-slate-900 ${
                      plano.destaque
                        ? 'border-amber-400 shadow-lg shadow-amber-500/15 xl:-translate-y-1'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {plano.destaque && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
                        Recomendado
                      </span>
                    )}

                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{plano.nome}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plano.descricao}</p>

                    <div className="mt-5">
                      {plano.mensal == null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 0</span>
                          <span className="text-sm text-slate-500">/mês</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-400">R$</span>
                          <span className="text-4xl font-black text-slate-900 dark:text-white">
                            {formatBRL(plano.mensal)}
                          </span>
                          <span className="text-sm text-slate-500">/mês</span>
                        </div>
                      )}
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {isPaid ? 'Cobrado mensalmente · LastLink' : 'Sem cartão · análise em até 48h'}
                      </p>
                    </div>

                    <ul className="mt-6 flex-1 space-y-2.5">
                      {plano.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                            plano.id === 'free'
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {isPaid && plano.planType ? (
                      <button
                        type="button"
                        onClick={() => handleCheckout(plano.planType!)}
                        disabled={loadingPlan != null}
                        className={`mt-6 w-full rounded-2xl py-3.5 text-sm font-black transition ${
                          loading
                            ? 'cursor-wait bg-slate-200 text-slate-500 dark:bg-slate-700'
                            : plano.destaque
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        {loading ? 'Processando…' : plano.cta}
                      </button>
                    ) : (
                      <Link
                        href="/parceiros/cadastro"
                        className="mt-6 block w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {plano.cta}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>Pagamento seguro via LastLink</span>
              <span>·</span>
              <span>Cancele quando quiser na área de membros</span>
              <span>·</span>
              <span>Planos pagos ativam selo e destaque no mapa</span>
            </div>
          </div>
        </section>

        <section id="beneficios" className="bg-white px-4 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">
              Por que assinar um plano <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">pago</span>
            </h2>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400">Benefícios dos planos Básico, Profissional e Empresarial</p>

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
