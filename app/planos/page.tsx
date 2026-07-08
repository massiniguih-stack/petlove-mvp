'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { usePetStore } from '@/lib/store';

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
  { nome: 'Suporte prioritario', gratis: false, premium: true },
  { nome: 'Sem anuncios', gratis: false, premium: true },
];

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal');
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { setPremium, isPremium } = usePetStore();
  const router = useRouter();

  const handleAssinar = () => {
    setProcessing(true);
    setTimeout(() => {
      setPremium(true);
      setProcessing(false);
      setShowConfirm(true);
    }, 1500);
  };

  const handleConcluir = () => {
    setShowConfirm(false);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/30">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">

          {/* Header */}
          <div className="mb-8">
            <BackButton href="/dashboard" label="Voltar ao dashboard" />
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                <span>⭐</span> PetLove Premium
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Desbloqueie <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-500">todo o potencial</span>
              </h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Cuide melhor do seu pet com todas as funcionalidades</p>
            </div>
          </div>

          {/* Seletor Mensal/Anual */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setPeriodo('mensal')}
                className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                  periodo === 'mensal'
                    ? 'bg-white text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPeriodo('anual')}
                className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                  periodo === 'anual'
                    ? 'bg-white text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
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
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Plano Gratuito */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <svg width="24" height="24" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="78" rx="16" ry="12" fill="#94a3b8"/>
                    <ellipse cx="30" cy="55" rx="9" ry="9" fill="#94a3b8"/>
                    <ellipse cx="50" cy="48" rx="9" ry="9" fill="#94a3b8"/>
                    <ellipse cx="70" cy="55" rx="9" ry="9" fill="#94a3b8"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Gratuito</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Para sempre</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 0</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/mes</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {funcionalidades.filter(f => f.gratis).map((f) => (
                  <li key={f.nome} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">✓</span>
                    {f.nome}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Seu plano atual</p>
              </div>
            </div>

            {/* Plano Premium */}
            <div className="relative rounded-3xl border-2 border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 p-6 shadow-lg shadow-violet-500/10">
              <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-1 text-xs font-black text-white shadow-md">
                ⭐ RECOMENDADO
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Premium</h3>
                  <p className="text-sm font-bold text-violet-600">Acesso total</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">R$</span>
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {periodo === 'mensal' ? '19,90' : '15,90'}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/mes</span>
                </div>
                {periodo === 'anual' && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    Economia de R$ 48,00 no ano
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {periodo === 'mensal' ? 'Cobrado mensalmente' : 'R$ 190,80 cobrado anualmente'}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {funcionalidades.map((f) => (
                  <li key={f.nome} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      f.premium ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400 dark:text-slate-500'
                    }`}>
                      ✓
                    </span>
                    {f.nome}
                    {!f.gratis && f.premium && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">PRO</span>
                    )}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleAssinar}
                disabled={isPremium || processing}
                className={`mt-6 w-full rounded-2xl py-4 text-sm font-black text-white shadow-lg transition ${
                  isPremium
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500 shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35'
                }`}
              >
                {isPremium ? '✓ Voce ja e Premium' : processing ? 'Processando...' : '⭐ Assinar Premium'}
              </button>
            </div>
          </div>

          {/* Comparativo */}
          <section className="mt-16">
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white">Comparacao completa</h2>
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 dark:text-slate-400">Funcionalidade</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 dark:text-slate-400">Gratuito</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-violet-600">Premium</th>
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

          {/* Depoimentos */}
          <section className="mt-16">
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white">O que dizem nossos usuarios</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { nome: 'Ana Clara', pet: 'Luna, Golden', texto: 'O plano alimentar personalizado mudou a vida da minha Luna. Ela esta mais saudevel e feliz!', avatar: 'A' },
                { nome: 'Pedro Santos', pet: 'Max, Labrador', texto: 'Os alertas de vacinas sao incriveis. Nunca mais esqueco de uma consulta importante.', avatar: 'P' },
                { nome: 'Maria Oliveira', pet: 'Thor e Mel', texto: 'Ter dois pets e poder comparar o desenvolvimento de cada um e fantastico!', avatar: 'M' },
              ].map((d) => (
                <div key={d.nome} className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center gap-0.5 text-violet-500">
                    {'★★★★★'.split('').map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">&ldquo;{d.texto}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-sm font-bold text-violet-600">
                      {d.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{d.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{d.pet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white">Perguntas Frequentes</h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-4">
              {[
                {
                  pergunta: 'Posso cancelar a qualquer momento?',
                  resposta: 'Sim! Nao ha multa ou taxa de cancelamento. Voce pode cancelar a qualquer momento e continuar usando o Premium ate o final do periodo pago.',
                },
                {
                  pergunta: 'O que acontece com meus dados se eu cancelar?',
                  resposta: 'Seus dados permanecem seguros. Voce volta a ter acesso ao plano gratuito e pode assinar o Premium novamente quando quiser.',
                },
                {
                  pergunta: 'Posso usar em varios dispositivos?',
                  resposta: 'Sim! Sua conta e sincronizada na nuvem. Use no celular, tablet ou computador, seus dados sempre estarao atualizados.',
                },
                {
                  pergunta: 'Tem periodo de teste gratuito?',
                  resposta: 'Sim! Oferecemos 7 dias de teste gratuito do Premium. Cancele antes e nao sera cobrado nada.',
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

      {/* Modal de confirmacao */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-3xl text-white shadow-lg shadow-violet-500/30">
              🎉
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Parabens!</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Voce agora e <strong className="text-violet-600">Premium</strong>! Cadastre quantos pets quiser.</p>
            <button
              onClick={handleConcluir}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 py-3.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
