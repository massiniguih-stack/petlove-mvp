'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

const funcionalidades = [
  { nome: 'Perfil do pet', gratis: true, premium: true },
  { nome: 'Cadastro de 1 pet', gratis: true, premium: true },
  { nome: 'Controle de peso basico', gratis: true, premium: true },
  { nome: 'Linha do tempo', gratis: true, premium: true },
  { nome: 'Mapa de servicos', gratis: true, premium: true },
  { nome: 'Cadastro ilimitado de pets', gratis: false, premium: true },
  { nome: 'Controle de peso avancado com graficos', gratis: false, premium: true },
  { nome: 'Plano alimentar personalizado', gratis: false, premium: true },
  { nome: 'Plano de exercicios completo', gratis: false, premium: true },
  { nome: 'Alertas de vacinas e consultas', gratis: false, premium: true },
  { nome: 'Relatorios de saude', gratis: false, premium: true },
  { nome: 'Comparacao entre pets', gratis: false, premium: true },
];

export default function PlanosClient() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lastlink/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'tutor_monthly' }),
      });
      if (!res.ok) throw new Error('Erro ao criar checkout');
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10">

          {/* Header */}
          <div className="mb-10">
            <BackButton href="/dashboard" label="Voltar ao dashboard" />
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                <span>⭐</span> PetLove Premium
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Cuide do seu pet com <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-500">tudo que ele merece</span>
              </h1>
              <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">Escolha o plano ideal para voce e seu pet</p>
            </div>
          </div>

          {/* Planos */}
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Plano Gratuito */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <span className="text-3xl">🐾</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Gratuito</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Para sempre</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">R$ 0</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/mes</span>
                </div>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Sempre gratuito</p>
              </div>

              <ul className="mt-8 space-y-4">
                {funcionalidades.filter(f => f.gratis).map((f) => (
                  <li key={f.nome} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">✓</span>
                    {f.nome}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Incluso para sempre</p>
              </div>
            </div>

            {/* Plano Premium */}
            <div className="relative rounded-3xl border-2 border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 p-8 shadow-lg shadow-violet-500/10 md:-translate-y-2">
              <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-1 text-xs font-black text-white shadow-md">
                ⭐ RECOMENDADO
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
                  <span className="text-3xl">👑</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Premium</h3>
                  <p className="text-sm font-bold text-violet-600 dark:text-violet-400">Acesso total</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">R$</span>
                  <span className="text-5xl font-black text-slate-900 dark:text-white">19,90</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/mes</span>
                </div>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Cobrado mensalmente</p>
              </div>

              <ul className="mt-8 space-y-4">
                {funcionalidades.map((f) => (
                  <li key={f.nome} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      f.premium ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400 dark:text-slate-500'
                    }`}>
                      {f.premium ? '✓' : '✕'}
                    </span>
                    {f.nome}
                    {!f.gratis && f.premium && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">PRO</span>
                    )}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-center text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Assinar Premium'}
              </button>
            </div>
          </div>

          {/* Comparativo */}
          <section className="mt-16">
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white">Comparacao completa</h2>
            <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 dark:text-slate-400">Funcionalidade</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 dark:text-slate-400">Gratuito</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-violet-600 dark:text-violet-400">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionalidades.map((f, i) => (
                    <tr key={f.nome} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'}>
                      <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{f.nome}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          f.gratis ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 dark:text-slate-500'
                        }`}>
                          {f.gratis ? '✓' : '✕'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs text-violet-600">
                          ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white">Perguntas Frequentes</h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-4">
              {[
                {
                  pergunta: 'Posso cancelar a qualquer momento?',
                  resposta: 'Sim! Nao ha multa ou taxa de cancelamento. Voce pode cancelar a qualquer momento.',
                },
                {
                  pergunta: 'O que acontece com meus dados se eu cancelar?',
                  resposta: 'Seus dados permanecem seguros. Voce volta a ter acesso ao plano gratuito.',
                },
                {
                  pergunta: 'Posso usar em varios dispositivos?',
                  resposta: 'Sim! Sua conta e sincronizada na nuvem. Use no celular, tablet ou computador.',
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
