'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  petshop: 'Pet Shops',
  creche: 'Creches',
  parque: 'Parques',
  hotel: 'Hotéis',
  petsitter: 'Pet Sitters',
  petdriver: 'Pet Drivers',
};

const planoLabels: Record<string, string> = {
  tutor_monthly: 'Tutor Premium (mensal)',
  tutor_annual: 'Tutor Premium (anual)',
  partner_basic: 'Parceiro Básico',
  partner_pro: 'Parceiro Profissional',
  partner_enterprise: 'Parceiro Empresarial',
  partner_annual: 'Parceiro Anual',
};

function StatCard({
  href,
  label,
  value,
  sub,
  tone = 'slate',
  external,
}: {
  href?: string;
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'slate' | 'amber' | 'violet' | 'emerald' | 'blue' | 'rose' | 'sky';
  external?: boolean;
}) {
  const tones: Record<string, string> = {
    slate:
      'border-slate-200 bg-white text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
    amber:
      'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
    violet:
      'border-violet-200 bg-violet-50 text-violet-900 hover:border-violet-300 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-100',
    emerald:
      'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
    blue:
      'border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100',
    rose:
      'border-rose-200 bg-rose-50 text-rose-900 hover:border-rose-300 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100',
    sky:
      'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100',
  };

  const body = (
    <div
      className={`group rounded-2xl border p-5 shadow-sm transition ${tones[tone]} ${
        href ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]' : ''
      }`}
    >
      <p className="text-sm font-semibold opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
      {href && (
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold opacity-0 transition group-hover:opacity-100">
          Abrir {external ? '↗' : '→'}
        </span>
      )}
    </div>
  );

  if (!href) return body;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }
  return <Link href={href}>{body}</Link>;
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-sm font-bold text-violet-600 hover:underline dark:text-violet-400"
          >
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

const appLinks = [
  { href: '/', label: 'Home do app', desc: 'Hub do tutor' },
  { href: '/dashboard', label: 'Dashboard tutor', desc: 'Peso e atalhos' },
  { href: '/mapa', label: 'Mapa', desc: 'Serviços e parceiros' },
  { href: '/planos', label: 'Planos tutor', desc: 'Premium B2C' },
  { href: '/parceiros/premium', label: 'Planos parceiro', desc: 'Premium B2B' },
  { href: '/parceiros/cadastro', label: 'Cadastro parceiro', desc: 'Lead B2B' },
];

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
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (erro || !stats) {
    return (
      <div className="p-8">
        <p className="text-sm font-semibold text-red-500">
          {erro || 'Erro ao carregar estatísticas'}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Confira ADMIN_EMAILS / login admin e se o Supabase está configurado.
        </p>
      </div>
    );
  }

  const tiposOrdenados = Object.entries(stats.parceiros.porTipo).sort((a, b) => b[1] - a[1]);
  const planosOrdenados = Object.entries(stats.assinaturas.porPlano).sort(
    (a, b) => b[1] - a[1]
  );
  const f = stats.feedback;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Painel staff
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Visão clicável do negócio — dados reais do banco, ligada às telas do app
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/parceiros"
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-500"
          >
            Gerir parceiros
          </Link>
          <Link
            href="/admin/feedback"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Ver feedback
          </Link>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/usuarios"
          label="Tutores"
          value={stats.tutores.total}
          sub={`${stats.tutores.free} free · ${stats.tutores.premium} premium · +${stats.tutores.novos7dias} em 7d`}
          tone="slate"
        />
        <StatCard
          href="/admin/parceiros"
          label="Parceiros"
          value={stats.parceiros.total}
          sub={`${stats.parceiros.gratuitos} grátis · ${stats.parceiros.pagos} pagos · ${stats.parceiros.comDestaque} destaque`}
          tone="blue"
        />
        <StatCard
          label="Assinaturas ativas"
          value={stats.assinaturas.ativas}
          sub={`${stats.assinaturas.tutorPremium} tutor · ${stats.assinaturas.partnerPremium} parceiro`}
          tone="violet"
        />
        <StatCard
          label="MRR estimado"
          value={`R$ ${stats.assinaturas.mrrEstimado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          })}`}
          sub="Receita mensal recorrente (planos conhecidos)"
          tone="emerald"
        />
      </div>

      {/* Acesso / uso do app */}
      <Section
        title="Quanto o app é usado"
        subtitle="Sinais de uso reais (mapa, WhatsApp, atendimentos, push) — não é Google Analytics"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            href="/mapa"
            external
            label="Views no mapa (7 dias)"
            value={stats.acesso.mapaViews7dias}
            sub={`${stats.acesso.mapaViews30dias} nos últimos 30 dias`}
            tone="sky"
          />
          <StatCard
            href="/mapa"
            external
            label="Cliques WhatsApp (7 dias)"
            value={stats.acesso.whatsappCliques7dias}
            sub={`${stats.acesso.whatsappCliques30dias} em 30 dias · tutores pedindo contato`}
            tone="emerald"
          />
          <StatCard
            label="Atendimentos (30 dias)"
            value={stats.acesso.atendimentos30dias}
            sub={`${stats.servicos30dias.registradosPorParceiros} pelo parceiro · ${stats.servicos30dias.confirmadosPorTutores} pelo tutor`}
            tone="amber"
          />
          <StatCard
            href="/admin/usuarios"
            label="Novos tutores (7d / 30d)"
            value={`${stats.tutores.novos7dias} / ${stats.tutores.novos30dias}`}
            sub={`${stats.pets.total} pets no total`}
            tone="slate"
          />
          <StatCard
            label="Dispositivos com push"
            value={stats.acesso.pushDevices}
            sub="Inscritos em notificação (FCM)"
            tone="violet"
          />
          <StatCard
            href="/admin/feedback"
            label="Feedback (7 dias)"
            value={stats.feedback.novos7dias}
            sub={`${stats.feedback.total} no total · ${stats.feedback.satisfacaoPct}% “ótimo”`}
            tone="rose"
          />
        </div>
      </Section>

      {/* Tutores free vs pago */}
      <Section
        title="Tutores — free vs Premium"
        subtitle="Quem usa o app grátis e quem assina"
        action={{ href: '/admin/usuarios', label: 'Ver usuários' }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            href="/admin/usuarios"
            label="Free"
            value={stats.tutores.free}
            sub="Sem assinatura tutor ativa"
            tone="slate"
          />
          <StatCard
            href="/planos"
            external
            label="Premium (tutor)"
            value={stats.tutores.premium}
            sub="Assinatura tutor ativa"
            tone="violet"
          />
          <StatCard
            label="Pets cadastrados"
            value={stats.pets.total}
            sub="Todos os tutores (sem contas admin)"
            tone="amber"
          />
        </div>
      </Section>

      {/* Parceiros free vs pago */}
      <Section
        title="Parceiros — grátis vs pago"
        subtitle="Listagem no mapa: free, premium e destaque"
        action={{ href: '/admin/parceiros', label: 'Gerir parceiros' }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            href="/admin/parceiros"
            label="Grátis (no mapa)"
            value={stats.parceiros.gratuitos}
            sub="Sem flag premium"
            tone="slate"
          />
          <StatCard
            href="/admin/parceiros"
            label="Pagos (Premium)"
            value={stats.parceiros.pagos}
            sub={`${stats.parceiros.premiumSemPainel} premium sem ativar painel`}
            tone="violet"
          />
          <StatCard
            href="/admin/parceiros"
            label="Com destaque"
            value={stats.parceiros.comDestaque}
            sub="Topo / prioridade no mapa"
            tone="amber"
          />
          <StatCard
            href="/admin/parceiros"
            label="Painel ativado"
            value={stats.parceiros.painelAtivado}
            sub="Já vincularam user_id"
            tone="blue"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard
            href="/admin/parceiros"
            label="Convites enviados"
            value={stats.parceiros.convitesEnviados}
            tone="emerald"
          />
          <StatCard
            href="/admin/parceiros"
            label="Pendentes com e-mail"
            value={stats.parceiros.pendentesComEmail}
            tone="amber"
          />
          <StatCard
            href="/admin/parceiros"
            label="Sem e-mail"
            value={stats.parceiros.total - stats.parceiros.comEmail}
            tone="slate"
          />
        </div>

        {tiposOrdenados.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tiposOrdenados.map(([tipo, count]) => (
              <StatCard
                key={tipo}
                href="/admin/parceiros"
                label={tipoLabels[tipo] || tipo}
                value={count}
                tone="slate"
              />
            ))}
          </div>
        )}
      </Section>

      {/* Feedback */}
      <Section
        title="Feedback dos tutores"
        subtitle="Satisfação e comentários recentes"
        action={{ href: '/admin/feedback', label: 'Ver todos' }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            href="/admin/feedback"
            label="Total de respostas"
            value={f.total}
            sub={`+${f.novos7dias} nos últimos 7 dias`}
            tone="slate"
          />
          <StatCard
            href="/admin/feedback"
            label="% “Ótimo”"
            value={`${f.satisfacaoPct}%`}
            tone="emerald"
          />
          <StatCard
            href="/admin/feedback"
            label="😊 Ótimo"
            value={f.resumo.otimo}
            tone="emerald"
          />
          <StatCard href="/admin/feedback" label="😐 Ok" value={f.resumo.ok} tone="amber" />
          <StatCard href="/admin/feedback" label="😞 Ruim" value={f.resumo.ruim} tone="rose" />
        </div>
      </Section>

      {/* Assinaturas por plano */}
      <Section title="Assinaturas ativas por plano" subtitle="Tutores + parceiros">
        {planosOrdenados.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma assinatura ativa ainda.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {planosOrdenados.map(([plano, count], i) => (
              <div
                key={plano}
                className={`flex items-center justify-between px-5 py-3 text-sm ${
                  i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''
                }`}
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {planoLabels[plano] || plano}
                </span>
                <span className="font-black text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Atalhos pro app */}
      <Section
        title="Abrir no app"
        subtitle="Atalhos clicáveis para as telas que o cliente vê"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {appLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700 dark:hover:bg-violet-950/40"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{l.label}</p>
                <p className="text-xs text-slate-500">{l.desc}</p>
              </div>
              <span className="font-mono text-xs text-slate-400">{l.href} ↗</span>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
