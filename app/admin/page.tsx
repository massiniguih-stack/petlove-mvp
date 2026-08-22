'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DashboardStats {
  parceiros: {
    total: number;
    porTipo: Record<string, number>;
    comEmail: number;
    convitesEnviados: number;
    pendentesComEmail: number;
    painelAtivado: number;
    premiumSemPainel: number;
    gratuitos: number;
    pagos: number;
    comDestaque: number;
  };
  tutores: {
    total: number;
    novos7dias: number;
    novos30dias: number;
    free: number;
    premium: number;
  };
  pets: { total: number };
  equipe: { tutores: number; pets: number };
  assinaturas: {
    ativas: number;
    porPlano: Record<string, number>;
    mrrEstimado: number;
    tutorPremium: number;
    partnerPremium: number;
  };
  acesso: {
    mapaViews7dias: number;
    mapaViews30dias: number;
    whatsappCliques7dias: number;
    whatsappCliques30dias: number;
    atendimentos30dias: number;
    pushDevices: number;
  };
  mapa30dias: { visualizacoes: number; whatsappCliques: number };
  servicos30dias: {
    registradosPorParceiros: number;
    confirmadosPorTutores: number;
  };
  feedback: {
    total: number;
    novos7dias: number;
    resumo: { otimo: number; ok: number; ruim: number };
    satisfacaoPct: number;
  };
}

const tipoLabels: Record<string, string> = {
  veterinario: 'Veterinários',
  petshop: 'Pet shops',
  creche: 'Creches',
  parque: 'Parques',
  hotel: 'Hotéis',
  petsitter: 'Pet sitters',
  petdriver: 'Pet drivers',
};

function Kpi({
  href,
  label,
  value,
  hint,
}: {
  href?: string;
  label: string;
  value: string | number;
  hint?: string;
}) {
  const inner = (
    <div
      className={`rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 ${
        href ? 'transition hover:border-amber-300 dark:hover:border-amber-700' : ''
      }`}
    >
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setErro(data.error);
        else setStats(data);
      })
      .catch(() => setErro('Erro ao carregar estatísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4 sm:p-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (erro || !stats) {
    return (
      <div className="p-8">
        <p className="text-sm font-medium text-red-600">{erro || 'Erro ao carregar estatísticas'}</p>
        <p className="mt-2 text-xs text-slate-500">Confira o login de equipe e o banco.</p>
      </div>
    );
  }

  const ranking = Object.entries(stats.parceiros.porTipo)
    .map(([tipo, count]) => ({ nome: tipoLabels[tipo] || tipo, count }))
    .sort((a, b) => b.count - a.count);

  const funil = [
    { label: 'Tutores', value: stats.tutores.total, href: '/admin/usuarios' },
    { label: 'Pets', value: stats.pets.total },
    { label: 'Views no mapa (30d)', value: stats.acesso.mapaViews30dias, href: '/mapa' },
    { label: 'Feedback', value: stats.feedback.total, href: '/admin/feedback' },
  ];
  const funilMax = Math.max(...funil.map((f) => f.value), 1);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Visão geral</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cidade piloto Maringá. Clique num número para abrir a lista.
          {(stats.equipe?.tutores ?? 0) > 0
            ? ` Conta da equipe (${stats.equipe.tutores}) não entra em Tutores/Pets.`
            : ''}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          href="/admin/usuarios"
          label="Tutores"
          value={stats.tutores.total}
          hint={
            stats.tutores.total === 0 && (stats.equipe?.tutores ?? 0) > 0
              ? 'Nenhum tutor cliente ainda (equipe fora da conta)'
              : `${stats.tutores.free} free · ${stats.tutores.premium} premium · +${stats.tutores.novos7dias} em 7d`
          }
        />
        <Kpi
          href="/admin/parceiros"
          label="Parceiros"
          value={stats.parceiros.total}
          hint={`${stats.parceiros.gratuitos} no mapa · ${stats.parceiros.pagos} pagos`}
        />
        <Kpi
          label="Assinaturas ativas"
          value={stats.assinaturas.ativas}
          hint={
            stats.assinaturas.ativas === 0
              ? 'Nenhuma ainda (beta free)'
              : `R$ ${stats.assinaturas.mrrEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês`
          }
        />
        <Kpi
          href="/admin/feedback"
          label="Feedback"
          value={stats.feedback.total}
          hint={`${stats.feedback.satisfacaoPct}% ótimo · +${stats.feedback.novos7dias} em 7d`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Parceiros por tipo</h2>
          <p className="mt-0.5 text-xs text-slate-400">Ranking no mapa</p>
          {ranking.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">Nenhum parceiro ainda.</p>
          ) : (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ranking}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={92}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                    formatter={(value: number) => [value, 'No mapa']}
                  />
                  <Bar dataKey="count" fill="#d97706" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Funil do app</h2>
          <p className="mt-0.5 text-xs text-slate-400">Quem chegou em cada etapa</p>
          <div className="mt-4 space-y-2">
            {funil.map((step) => {
              const widthPct = Math.max(18, Math.round((step.value / funilMax) * 100));
              const bar = (
                <div className="flex items-center gap-3">
                  <div className="w-36 shrink-0 text-xs text-slate-500">{step.label}</div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="flex h-9 items-center rounded-md bg-amber-500 px-3 text-sm font-semibold tabular-nums text-white"
                      style={{ width: `${widthPct}%` }}
                    >
                      {step.value}
                    </div>
                  </div>
                </div>
              );
              if (!step.href) return <div key={step.label}>{bar}</div>;
              return (
                <Link
                  key={step.label}
                  href={step.href}
                  className="block rounded-md transition hover:opacity-90"
                >
                  {bar}
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Uso recente</h2>
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-4">
          {[
            { label: 'Mapa 7d', value: stats.acesso.mapaViews7dias },
            { label: 'WhatsApp 7d', value: stats.acesso.whatsappCliques7dias },
            { label: 'Atendimentos 30d', value: stats.acesso.atendimentos30dias },
            { label: 'Push', value: stats.acesso.pushDevices },
          ].map((item) => (
            <div key={item.label} className="bg-white px-4 py-3 dark:bg-slate-900">
              <p className="text-[11px] text-slate-400">{item.label}</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
