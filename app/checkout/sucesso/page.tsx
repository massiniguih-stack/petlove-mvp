'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePetStore } from '@/lib/store';
import { CheckIcon3D, PremiumIcon3D } from '@/components/Icons3D';

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(true);
  const { fetchSubscription, plan: planTutor } = usePetStore();
  const [isPremium, setIsPremium] = useState(false);
  const [planParceiro, setPlanParceiro] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      await new Promise((r) => setTimeout(r, 2000));
      // Essa mesma tela recebe tutores E parceiros vindos do checkout —
      // /api/subscription só enxerga plano de tutor (ver
      // app/api/subscription/route.ts), então checamos os dois pra não
      // mostrar "ainda confirmando" pra sempre num pagamento de parceiro.
      const [, parceiroRes] = await Promise.all([
        fetchSubscription(),
        fetch('/api/parceiro/subscription').then((r) => r.json()).catch(() => ({ isPremium: false })),
      ]);
      setIsPremium(usePetStore.getState().isPremium || !!parceiroRes.isPremium);
      setPlanParceiro(parceiroRes.plan || null);
      setLoading(false);
    };
    verify();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Verificando pagamento...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md text-center">
            <div className="mx-auto flex items-center justify-center">
              <PremiumIcon3D size={80} />
            </div>
            <h1 className="mt-6 text-3xl font-black text-slate-900 dark:text-white">
              Ainda confirmando seu pagamento
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Isso pode levar alguns minutos. Assim que o pagamento for confirmado, seu plano é ativado automaticamente — não precisa fazer nada.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 py-4 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl"
              >
                Verificar de novo
              </button>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Ir para o Dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="mx-auto flex items-center justify-center">
            <CheckIcon3D size={88} />
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-900 dark:text-white">
            Pagamento confirmado!
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Seu plano premium está ativo. Aproveite todos os recursos!
          </p>
          {(planTutor || planParceiro) && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <PremiumIcon3D size={28} />
              Plano: {(planTutor || planParceiro || '').replace('_', ' ')}
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 py-4 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl"
            >
              Ir para o Dashboard
            </Link>
            <Link
              href="/conta/assinatura"
              className="rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Gerenciar assinatura
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
