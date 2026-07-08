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

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal');
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const handleSelect = (planoId: string) => {
    setSelecionado(planoId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
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
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
                Escolha o plano ideal para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">seu negócio</span>
              </h1>
              <p className="mt-3 text-slate-500">Invista na visibilidade do seu estabelecimento</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                🎉 50% OFF para membros PetLove — Desconto aplicado automaticamente
              </div>
            </div>
          </div>

          {/* Seletor Mensal/Anual */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button
                onClick={() => setPeriodo('mensal')}
                className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                  periodo === 'mensal'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPeriodo('anual')}
                className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                  periodo === 'anual'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Anual
                <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Planos */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className={`relative rounded-3xl border-2 bg-white p-6 transition-all ${
                  selecionado === plano.id
                    ? `${plano.corBorder} shadow-xl`
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                } ${plano.popular ? 'md:-translate-y-2' : ''}`}
              >
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-black text-white shadow-md">
                    ⭐ MAIS POPULAR
                  </div>
                )}

                <div className={`rounded-2xl ${plano.corBg} p-4`}>
                  <h3 className={`text-xl font-black ${plano.corText}`}>{plano.nome}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plano.descricao}</p>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">R$</span>
                    <span className="text-4xl font-black text-slate-900">
                      {periodo === 'mensal'
                        ? plano.mensal.toFixed(0)
                        : Math.floor(plano.anual / 12).toFixed(0)
                      }
                    </span>
                    <span className="text-sm text-slate-500">/mês</span>
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
                  <p className="mt-2 text-xs text-slate-400">
                    {periodo === 'mensal' ? 'Cobrado mensalmente' : `R$ ${plano.anual.toFixed(2)} cobrado anualmente`}
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {plano.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${plano.corBg} text-xs ${plano.corText}`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Fotos</p>
                      <p className="text-lg font-black text-slate-900">{plano.limites.fotos}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Destaque</p>
                      <p className="text-lg font-black text-slate-900">{plano.limites.destaque}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(plano.id)}
                  className={`mt-6 w-full rounded-2xl py-4 text-sm font-black transition ${
                    selecionado === plano.id
                      ? `bg-gradient-to-r ${plano.cor} text-white shadow-lg`
                      : `border-2 ${plano.corBorder} ${plano.corText} hover:bg-gradient-to-r hover:${plano.cor} hover:text-white hover:border-transparent hover:shadow-lg`
                  }`}
                >
                  {selecionado === plano.id ? '✓ Selecionado' : 'Escolher Plano'}
                </button>
              </div>
            ))}
          </div>

          {/* Checkout */}
          {selecionado && (
            <div className="mt-12 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl ring-1 ring-slate-100">
              <h2 className="text-2xl font-black text-slate-900">Finalizar Assinatura</h2>
              <p className="mt-1 text-sm text-slate-500">
                Plano {planos.find(p => p.id === selecionado)?.nome} · {periodo === 'mensal' ? 'Mensal' : 'Anual'}
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">Nome Completo *</label>
                    <input
                      type="text" required
                      placeholder="Seu nome"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">E-mail *</label>
                    <input
                      type="email" required
                      placeholder="seu@email.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">CPF/CNPJ *</label>
                    <input
                      type="text" required
                      placeholder="000.000.000-00"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">Telefone *</label>
                    <input
                      type="tel" required
                      placeholder="(00) 00000-0000"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">Número do Cartão *</label>
                    <input
                      type="text" required
                      placeholder="0000 0000 0000 0000"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-700">Validade *</label>
                      <input
                        type="text" required
                        placeholder="MM/AA"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700">CVV *</label>
                      <input
                        type="text" required
                        placeholder="000"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">Nome no Cartão *</label>
                    <input
                      type="text" required
                      placeholder="Como está no cartão"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total a pagar</span>
                      <span className="text-2xl font-black text-slate-900">
                        R$ {periodo === 'mensal'
                          ? planos.find(p => p.id === selecionado)?.mensal.toFixed(2)
                          : planos.find(p => p.id === selecionado)?.anual.toFixed(2)
                        }
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {periodo === 'mensal' ? 'Cobrado todo mês' : 'Cobrado uma vez no ano'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-600">
                  Li e aceito os{' '}
                  <a href="#" className="font-semibold text-amber-600 hover:underline">Termos de Uso</a>
                  {' '}e{' '}
                  <a href="#" className="font-semibold text-amber-600 hover:underline">Política de Assinatura</a>.
                  Cancele a qualquer momento sem multa.
                </span>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-lg font-black text-white shadow-xl shadow-amber-500/25 transition hover:shadow-2xl hover:shadow-amber-500/35">
                💳 Assinar Agora
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                <span>🔒 Pagamento seguro</span>
                <span>·</span>
                <span>Cancelamento grátis</span>
                <span>·</span>
                <span>Suporte 24h</span>
              </div>
            </div>
          )}

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="text-center text-2xl font-black text-slate-900">Perguntas Frequentes</h2>
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
                <details key={faq.pergunta} className="group rounded-2xl border border-slate-200 bg-white">
                  <summary className="flex cursor-pointer items-center justify-between p-5 font-bold text-slate-900">
                    {faq.pergunta}
                    <span className="ml-2 text-slate-400 transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm text-slate-600">
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
