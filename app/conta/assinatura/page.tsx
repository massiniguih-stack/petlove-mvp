'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { FileTextIcon3D } from '@/components/Icons3D';
import { usePetStore } from '@/lib/store';

export default function AssinaturaPage() {
  const { isPremium, plan, subscriptionStatus, currentPeriodEnd, cancelAtPeriodEnd, fetchSubscription } = usePetStore();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleManage = async () => {
    window.location.href = process.env.NEXT_PUBLIC_LASTLINK_MEMBER_URL || 'https://lastlink.com/app/member';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const planNames: Record<string, string> = {
    tutor_monthly: 'Premium Mensal',
    tutor_annual: 'Premium Anual',
    partner_basic: 'Parceiro Básico',
    partner_pro: 'Parceiro Profissional',
    partner_enterprise: 'Parceiro Empresarial',
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <BackButton href="/dashboard" label="Voltar ao dashboard" />

          <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
            Minha Assinatura
          </h1>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            {isPremium ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {planNames[plan || ''] || 'Premium'}
                    </h2>
                    <p className="text-sm font-medium text-emerald-600">Ativo</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{subscriptionStatus}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Próxima cobrança</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(currentPeriodEnd)}</span>
                  </div>
                  {cancelAtPeriodEnd && (
                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Sua assinatura será cancelada ao final do período.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleManage}
                  className="mt-6 w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Gerenciar assinatura
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <FileTextIcon3D size={56} className="mx-auto" />
                <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                  Sem assinatura ativa
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Assine um plano premium para desbloquear todos os recursos.
                </p>
                <a
                  href="/planos"
                  className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:shadow-xl"
                >
                  Ver planos
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
