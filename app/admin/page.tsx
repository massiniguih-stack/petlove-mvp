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
  };
  tutores: {
    total: number;
    novos7dias: number;
    novos30dias: number;
  };
  pets: {
    total: number;
  };
  assinaturas: {
    ativas: number;
    porPlano: Record<string, number>;
    mrrEstimado: number;
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
};

function Card({ href, label, value, sub, color }: { href?: string; label: string; value: string | number; sub?: string; color: string }) {
  const content = (
    <div className={`group rounded-2xl border p-5 shadow-sm transition hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${color}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
      {href && <span className="mt-3 inline-block text-xs font-bold opacity-0 transition group-hover:opacity-100">Ver detalhes →</span>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErro(data.error);
        } else {
          setStats(data);
        }
      })
      .catch(() => setErro('Erro ao carregar estatísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (erro || !stats) {
    return (
      <div className="p-8">
        <p className="text-sm font-semibold text-red-500">{erro || 'Erro ao carregar estatísticas'}</p>
      </div>
    );
  }

  const tiposOrdenados = Object.entries(stats.parceiros.porTipo).sort((a, b) => b[1] - a[1]);
  const planosOrdenados = Object.entries(stats.assinaturas.porPlano).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Visão geral do sistema Patinha — dados reais do banco</p>
      </div>

      {/* Visão geral */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          href="/admin/usuarios"
          label="Tutores cadastrados"
          value={stats.tutores.total}
          sub={`+${stats.tutores.novos7dias} nos últimos 7 dias`}
          color="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
        <Card
          href="/admin/parceiros"
          label="Parceiros no banco"
          value={stats.parceiros.total}
          sub={`${stats.parceiros.comEmail} com email cadastrado`}
          color="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
        />
        <Card
          label="Assinantes Premium ativos"
          value={stats.assinaturas.ativas}
          sub="Tutores + parceiros"
          color="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"
        />
        <Card
          label="MRR estimado"
          value={`R$ ${stats.assinaturas.mrrEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          sub="Receita mensal recorrente"
          color="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
        />
      </div>

      {/* Crescimento */}
      <h2 className="mb-3 mt-8 text-lg font-black text-slate-900 dark:text-white">Crescimento</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card href="/admin/usuarios" label="Novos tutores (7 dias)" value={stats.tutores.novos7dias} color="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
        <Card href="/admin/usuarios" label="Novos tutores (30 dias)" value={stats.tutores.novos30dias} color="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
        <Card label="Pets cadastrados" value={stats.pets.total} color="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
      </div>

      {/* Convites a parceiros */}
      <h2 className="mb-3 mt-8 text-lg font-black text-slate-900 dark:text-white">Convites a parceiros</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card href="/admin/parceiros" label="Convites enviados" value={stats.parceiros.convitesEnviados} color="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300" />
        <Card href="/admin/parceiros" label="Pendentes com email" value={stats.parceiros.pendentesComEmail} color="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300" />
        <Card href="/admin/parceiros" label="Sem email cadastrado" value={stats.parceiros.total - stats.parceiros.comEmail} color="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
      </div>

      {/* Parceiros por tipo */}
      <h2 className="mb-3 mt-8 text-lg font-black text-slate-900 dark:text-white">Parceiros por tipo</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiposOrdenados.map(([tipo, count]) => (
          <Card
            key={tipo}
            href="/admin/parceiros"
            label={tipoLabels[tipo] || tipo}
            value={count}
            color="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        ))}
        {tiposOrdenados.length === 0 && (
          <p className="text-sm text-slate-400">Nenhum parceiro no banco ainda — importe em /admin/parceiros.</p>
        )}
      </div>

      {/* Assinaturas por plano */}
      <h2 className="mb-3 mt-8 text-lg font-black text-slate-900 dark:text-white">Assinaturas ativas por plano</h2>
      {planosOrdenados.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhuma assinatura ativa ainda.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {planosOrdenados.map(([plano, count], i) => (
            <div
              key={plano}
              className={`flex items-center justify-between px-5 py-3 text-sm ${i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
            >
              <span className="font-semibold text-slate-700 dark:text-slate-300">{planoLabels[plano] || plano}</span>
              <span className="font-black text-slate-900 dark:text-white">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
