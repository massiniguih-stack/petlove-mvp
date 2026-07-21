'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';

interface PartnerProfile {
  id: string;
  nome: string;
  descricao: string | null;
  telefone: string | null;
  instagram: string | null;
  website: string | null;
  email: string | null;
  horario: string | null;
  servicos: string[] | null;
  plantao24h: boolean;
  premium: boolean;
  cidade: string | null;
}

interface Metrics {
  views: number;
  whatsappClicks: number;
  periodoDias: number;
}

interface SubscriptionInfo {
  isPremium: boolean;
  plan: string | null;
  status: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

const planNames: Record<string, string> = {
  partner_basic: 'Parceiro Premium',
  partner_pro: 'Parceiro Profissional',
  partner_enterprise: 'Parceiro Empresarial',
};

export default function ParceiroDashboardPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [naoEhParceiro, setNaoEhParceiro] = useState(false);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [form, setForm] = useState({
    descricao: '', telefone: '', instagram: '', website: '', horario: '', plantao24h: false,
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/parceiro/profile');
        const data = await res.json();
        if (!data.partner) {
          setNaoEhParceiro(true);
          setCarregando(false);
          return;
        }
        setPartner(data.partner);
        setForm({
          descricao: data.partner.descricao || '',
          telefone: data.partner.telefone || '',
          instagram: data.partner.instagram || '',
          website: data.partner.website || '',
          horario: data.partner.horario || '',
          plantao24h: !!data.partner.plantao24h,
        });

        const [metricsRes, subRes] = await Promise.all([
          fetch('/api/parceiro/metrics'),
          fetch('/api/parceiro/subscription'),
        ]);
        setMetrics(await metricsRes.json());
        setSubscription(await subRes.json());
      } catch {
        setErro('Erro ao carregar seu painel');
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const handleSalvar = async () => {
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      const res = await fetch('/api/parceiro/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao salvar');
      }
      const { partner: atualizado } = await res.json();
      setPartner(atualizado);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setSalvando(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (!carregando && naoEhParceiro) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <BackButton href="/dashboard" label="Voltar ao app" />

          {carregando ? (
            <div className="mt-10 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : partner ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-2xl">🏪</div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">{partner.nome}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Painel do parceiro · {partner.cidade || '—'}</p>
                </div>
              </div>

              {/* Assinatura */}
              <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Assinatura</h2>
                {subscription?.isPremium ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Plano</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{planNames[subscription.plan || ''] || 'Premium'}</span>
                    </div>
                    <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Próxima cobrança</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(subscription.currentPeriodEnd)}</span>
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Sua assinatura será cancelada ao final do período.
                      </div>
                    )}
                    <a
                      href={process.env.NEXT_PUBLIC_LASTLINK_MEMBER_URL || 'https://lastlink.com/app/member'}
                      className="mt-2 block w-full rounded-2xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Gerenciar assinatura
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-slate-50 p-5 text-center dark:bg-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Sem assinatura Premium ativa — seu negócio não aparece em destaque no mapa.</p>
                    <a href="/parceiros/premium" className="mt-3 inline-flex rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-md">
                      Assinar Premium
                    </a>
                  </div>
                )}
              </div>

              {/* Métricas */}
              <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Últimos {metrics?.periodoDias || 30} dias</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-center dark:from-blue-950 dark:to-indigo-950">
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{metrics?.views ?? 0}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Visualizações no mapa</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center dark:from-emerald-950 dark:to-teal-950">
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{metrics?.whatsappClicks ?? 0}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Cliques no WhatsApp</p>
                  </div>
                </div>
              </div>

              {/* Perfil */}
              <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Perfil no mapa</h2>
                <p className="mt-1 text-xs text-slate-400">Nome e endereço são fixos por ora — fale com o suporte pra mudar.</p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Descrição</label>
                    <textarea
                      value={form.descricao}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Telefone / WhatsApp</label>
                      <input
                        value={form.telefone}
                        onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Instagram</label>
                      <input
                        value={form.instagram}
                        onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Website</label>
                      <input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Horário</label>
                      <input
                        value={form.horario}
                        onChange={(e) => setForm({ ...form, horario: e.target.value })}
                        placeholder="Seg-Sex 8h-18h"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.plantao24h}
                      onChange={(e) => setForm({ ...form, plantao24h: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Atendimento 24h
                  </label>
                </div>

                {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
                {salvo && <p className="mt-4 text-sm text-emerald-600">Perfil atualizado!</p>}

                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-black text-white shadow-md transition disabled:opacity-60"
                >
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </>
          ) : (
            <p className="mt-10 text-center text-slate-500">{erro || 'Erro ao carregar seu painel'}</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
