'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { PremiumIcon3D, PinIcon3D, MedalIcon3D, StarIcon3D } from '@/components/Icons3D';
import { trackMetaEvent } from '@/components/MetaPixel';
import type { ComponentType } from 'react';

type PaidPlanType = 'partner_basic' | 'partner_pro' | 'partner_enterprise';

// Preços alinhados a app/api/admin/dashboard-stats (MRR) e ao que está
// configurado de verdade no LastLink (Produto → Ofertas → Planos).
// Parceiro virou 100% anual a partir de 2026-09: `anual` é o valor à vista
// (pagamento único) e `parcela` é o valor de cada uma das 12x SE o tutor
// optar por parcelar no cartão — o LastLink aplica juros nesse caso, então
// parcela*12 é sempre maior que `anual`. Confira os dois valores direto em
// cada oferta no LastLink antes de mudar aqui.
const planos: {
  id: 'free' | PaidPlanType;
  nome: string;
  descricao: string;
  anual: number | null;
  parcela: number | null;
  planType: PaidPlanType | null;
  cta: string;
  destaque?: boolean;
  features: string[];
}[] = [
  // EXP-19: bullets alinhados ao produto real (mapa: premium/destaque; WhatsApp se premium; painel se user_id)
  {
    id: 'free',
    nome: 'Grátis',
    descricao: 'Entre no mapa e comece a aparecer',
    anual: null,
    parcela: null,
    planType: null,
    cta: 'Cadastrar grátis',
    features: [
      'Cadastro do negócio no app',
      'Listagem no mapa (após análise)',
      'Perfil com contato e serviços',
      'Sem selo Premium, destaque nem WhatsApp no app',
    ],
  },
  {
    id: 'partner_basic',
    nome: 'Básico',
    descricao: 'Selo e WhatsApp na sua cidade',
    anual: 239.8,
    parcela: 25.54,
    planType: 'partner_basic',
    cta: 'Assinar Básico',
    features: [
      'Tudo do Grátis',
      'Selo Premium no card e no perfil',
      'Sobe na lista da cidade (acima do grátis)',
      'Botão de WhatsApp no perfil do mapa',
      'Ativação após pagamento confirmado',
    ],
  },
  {
    id: 'partner_pro',
    nome: 'Profissional',
    descricao: 'Destaque no topo + painel',
    anual: 596.9,
    parcela: 63.56,
    planType: 'partner_pro',
    cta: 'Assinar Profissional',
    destaque: true,
    features: [
      'Tudo do Básico',
      'Badge Destaque no mapa (prioridade extra)',
      'Painel do parceiro com métricas',
      'Registro de serviços realizados',
      'Melhor custo-benefício para operação ativa',
    ],
  },
  {
    id: 'partner_enterprise',
    nome: 'Empresarial',
    descricao: 'Máxima prioridade e canal com o time',
    anual: 826.8,
    parcela: 88.05,
    planType: 'partner_enterprise',
    cta: 'Assinar Empresarial',
    features: [
      'Tudo do Profissional',
      'Mesmos benefícios de destaque no mapa',
      'Plano para quem investe mais em visibilidade',
      'Suporte pelo e-mail contato@patinha.app.br',
      'Ativação após pagamento confirmado',
    ],
  },
];

const beneficios: {
  Icon: ComponentType<{ size?: number; className?: string }>;
  titulo: string;
  descricao: string;
}[] = [
  {
    Icon: MedalIcon3D,
    titulo: 'Selo Premium',
    descricao: 'Nos planos pagos, o card ganha selo de confiança no mapa.',
  },
  {
    Icon: StarIcon3D,
    titulo: 'Badge Destaque',
    descricao: 'No Pro e Empresarial, o negócio sobe ainda mais na lista da cidade.',
  },
  {
    Icon: PinIcon3D,
    titulo: 'Ordem na busca',
    descricao: 'Premium e Destaque entram na frente do grátis quando o tutor filtra perto.',
  },
  {
    Icon: PremiumIcon3D,
    titulo: 'WhatsApp no app',
    descricao: 'Planos pagos liberam o botão de WhatsApp no perfil do mapa.',
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
      trackMetaEvent('InitiateCheckout', { content_name: planType });
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
                      {plano.anual == null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 0</span>
                          <span className="text-sm text-slate-500">/mês</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-400">12x de R$</span>
                          <span className="text-4xl font-black text-slate-900 dark:text-white">
                            {formatBRL(plano.parcela ?? plano.anual)}
                          </span>
                        </div>
                      )}
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {isPaid && plano.anual != null
                          ? `com juros · ou R$ ${formatBRL(plano.anual)} à vista/ano · LastLink`
                          : 'Sem cartão · análise em até 48h'}
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
              <span>Planos anuais em até 12x no cartão, ou à vista com desconto</span>
              <span>·</span>
              <span>Básico: selo e WhatsApp · Pro e Empresarial: também destaque no mapa</span>
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
