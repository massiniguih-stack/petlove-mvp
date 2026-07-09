'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

const planos = [
  {
    id: 'basico',
    nome: 'Básico',
    descricao: 'Para quem está começando',
    mensal: 24.90,
    anual: 239.90,
    cor: 'from-blue-500 to-indigo-500',
    corBg: 'bg-blue-50',
    corText: 'text-blue-600',
    corBorder: 'border-blue-200',
    priceEnvKey: 'NEXT_PUBLIC_STRIPE_PRICE_PARTNER_BASIC' as const,
    features: [
      'Listagem no mapa',
      'Selo de destaque',
      'Até 5 fotos',
      'Informações de contato',
      'Avaliação de clientes',
    ],
    limites: {
      fotos: 5,
      destaque: 'Cidade',
      posicao: 'Top 3',
    },
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    descricao: 'Para negócios em crescimento',
    mensal: 49.90,
    anual: 479.90,
    popular: true,
    cor: 'from-amber-500 to-orange-500',
    corBg: 'bg-amber-50',
    corText: 'text-amber-600',
    corBorder: 'border-amber-400',
    priceEnvKey: 'NEXT_PUBLIC_STRIPE_PRICE_PARTNER_PRO' as const,
    features: [
      'Listagem no mapa',
      'Selo Premium',
      'Até 15 fotos',
      'WhatsApp direto',
      'Painel de métricas',
      'Destaque na região',
    ],
    limites: {
      fotos: 15,
      destaque: 'Região',
      posicao: 'Top 1',
    },
  },
  {
    id: 'empresarial',
    nome: 'Empresarial',
    descricao: 'Para redes e franquias',
    mensal: 97.90,
    anual: 939.90,
    cor: 'from-purple-500 to-pink-500',
    corBg: 'bg-purple-50',
    corText: 'text-purple-600',
    corBorder: 'border-purple-200',
    priceEnvKey: 'NEXT_PUBLIC_STRIPE_PRICE_PARTNER_ENTERPRISE' as const,
    features: [
      'Tudo do Profissional',
      'Até 20 fotos',
      'Múltiplas unidades',
      'Suporte dedicado',
      'Relatórios avançados',
      'Prioridade máxima',
      'API de integração',
    ],
    limites: {
      fotos: 20,
      destaque: 'Nacional',
      posicao: 'Top 1',
    },
  },
];

const planTypeMap: Record<string, string> = {
  basico: 'partner_basic',
  profissional: 'partner_pro',
  empresarial: 'partner_enterprise',
};

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (plano: typeof planos[number]) => {
    setLoading(plano.id);
    setError(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planTypeMap[plano.id],
        }),
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
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">

          {/* Header */}
          <div className="mb-8">
            <BackButton href="/parceiros/premium" label="Voltar" />
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                <span>🏆</span> Planos Premium
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Escolha o plano ideal para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">seu negócio</span>
              </h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Invista na visibilidade do seu estabelecimento</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                🎉 50% OFF para membros PetLove — Desconto aplicado automaticamente
              </div>
            </div>
          </div>

          {/* Seletor Mensal/Anual */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setPeriodo('mensal')}
                className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                  periodo === 'mensal'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPeriodo('anual')}
                className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                  periodo === 'anual'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Anual
                <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Planos */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {planos.map((plano) => {
              const isLoading = loading === plano.id;
              return (
                <div
                  key={plano.id}
                  className={`relative rounded-3xl border-2 bg-white dark:bg-slate-900 p-6 transition-all ${
                    plano.popular ? 'md:-translate-y-2 border-slate-200 dark:border-slate-700 shadow-lg' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg'
                  }`}
                >
                  {plano.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-black text-white shadow-md">
                      ⭐ MAIS POPULAR
                    </div>
                  )}

                  <div className={`rounded-2xl ${plano.corBg} p-4`}>
                    <h3 className={`text-xl font-black ${plano.corText}`}>{plano.nome}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plano.descricao}</p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500">R$</span>
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {periodo === 'mensal'
                          ? plano.mensal.toFixed(2).replace('.', ',')
                          : Math.floor(plano.anual / 12).toFixed(2).replace('.', ',')
                        }
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">/mês</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      <span className="line-through">
                        R$ {(plano.mensal * 2).toFixed(2).replace('.', ',')}
                      </span>{' '}
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
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${plano.corBg} text-xs ${plano.corText}`}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800 p-4">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fotos</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{plano.limites.fotos}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Destaque</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{plano.limites.destaque}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckout(plano)}
                    disabled={loading !== null}
                    className={`mt-6 w-full rounded-2xl py-4 text-sm font-black transition ${
                      isLoading
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-wait'
                        : `bg-gradient-to-r ${plano.cor} text-white shadow-lg hover:shadow-2xl`
                    }`}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processando…
                      </span>
                    ) : (
                      '💳 Assinar com Stripe'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span>🔒 Pagamento seguro via Stripe</span>
            <span>·</span>
            <span>Cancelamento grátis</span>
            <span>·</span>
            <span>Suporte 24h</span>
          </div>

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white">Perguntas Frequentes</h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-4">
              {[
                {
                  pergunta: 'Posso cancelar a qualquer momento?',
                  resposta: 'Sim! Não há multa ou taxa de cancelamento. Você pode cancelar direto pelo painel ou entrando em contato com nosso suporte.',
                },
                {
                  pergunta: 'Como funciona o destaque no mapa?',
                  resposta: 'Parceiros Premium aparecem no topo da lista quando alguém busca na sua cidade ou região. O nível de destaque depende do plano escolhido.',
                },
                {
                  pergunta: 'Posso trocar de plano depois?',
                  resposta: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. A diferença de valor é proporcional ao período restante.',
                },
                {
                  pergunta: 'O pagamento é seguro?',
                  resposta: 'Utilizamos criptografia SSL e processamos pagamentos via Stripe, uma das maiores plataformas de pagamento do mundo.',
                },
              ].map((faq) => (
                <details key={faq.pergunta} className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <summary className="flex cursor-pointer items-center justify-between p-5 font-bold text-slate-900 dark:text-white">
                    {faq.pergunta}
                    <span className="ml-2 text-slate-400 dark:text-slate-500 transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5 pt-3 text-sm text-slate-600 dark:text-slate-400">
                    {faq.resposta}
                  </div>
                </details>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
