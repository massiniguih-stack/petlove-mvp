'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { servicosMock } from '@/data/servicos';

export default function AdminDashboardPage() {
  const stats = useMemo(() => {
    const total = servicosMock.length;
    const porTipo = {
      veterinario: servicosMock.filter((s) => s.tipo === 'veterinario').length,
      petshop: servicosMock.filter((s) => s.tipo === 'petshop').length,
      creche: servicosMock.filter((s) => s.tipo === 'creche').length,
      parque: servicosMock.filter((s) => s.tipo === 'parque').length,
      hotel: servicosMock.filter((s) => s.tipo === 'hotel').length,
      outro: servicosMock.filter((s) => !['veterinario', 'petshop', 'creche', 'parque', 'hotel'].includes(s.tipo)).length,
    };
    const comInstagram = servicosMock.filter((s) => s.instagram).length;
    const comTelefone = servicosMock.filter((s) => s.telefone).length;
    const comWebsite = servicosMock.filter((s) => s.website).length;
    const cidades = new Set(servicosMock.map((s) => s.cidade)).size;
    return { total, porTipo, comInstagram, comTelefone, comWebsite, cidades };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Visão geral do sistema PetLove</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/servicos" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total de Serviços</p>
          <p className="mt-2 text-4xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{stats.cidades} cidades</p>
          <span className="mt-3 inline-block text-xs font-bold text-blue-500 opacity-0 transition group-hover:opacity-100">Ver serviços →</span>
        </Link>
        <Link href="/admin/servicos?tipo=veterinario" className="group rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-blue-900 dark:bg-blue-950 dark:hover:border-blue-800">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Veterinários</p>
          <p className="mt-2 text-4xl font-black text-blue-700 dark:text-blue-300">{stats.porTipo.veterinario}</p>
          <span className="mt-3 inline-block text-xs font-bold text-blue-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
        <Link href="/admin/servicos?tipo=petshop" className="group rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-purple-900 dark:bg-purple-950 dark:hover:border-purple-800">
          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Pet Shops</p>
          <p className="mt-2 text-4xl font-black text-purple-700 dark:text-purple-300">{stats.porTipo.petshop}</p>
          <span className="mt-3 inline-block text-xs font-bold text-purple-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
        <Link href="/admin/servicos?tipo=creche" className="group rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-amber-900 dark:bg-amber-950 dark:hover:border-amber-800">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Creches</p>
          <p className="mt-2 text-4xl font-black text-amber-700 dark:text-amber-300">{stats.porTipo.creche}</p>
          <span className="mt-3 inline-block text-xs font-bold text-amber-500 opacity-0 transition group-hover:opacity-100">Ver todas →</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/servicos?tipo=parque" className="group rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm transition hover:border-green-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-green-900 dark:bg-green-950 dark:hover:border-green-800">
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">Parques</p>
          <p className="mt-2 text-4xl font-black text-green-700 dark:text-green-300">{stats.porTipo.parque}</p>
          <span className="mt-3 inline-block text-xs font-bold text-green-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
        <Link href="/admin/servicos?tipo=hotel" className="group rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm transition hover:border-rose-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-rose-900 dark:bg-rose-950 dark:hover:border-rose-800">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Hotéis</p>
          <p className="mt-2 text-4xl font-black text-rose-700 dark:text-rose-300">{stats.porTipo.hotel}</p>
          <span className="mt-3 inline-block text-xs font-bold text-rose-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
        <Link href="/admin/servicos" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Outros</p>
          <p className="mt-2 text-4xl font-black text-slate-900 dark:text-white">{stats.porTipo.outro}</p>
          <span className="mt-3 inline-block text-xs font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
        <Link href="/admin/servicos" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Com Instagram</p>
          <p className="mt-2 text-4xl font-black text-slate-900 dark:text-white">{stats.comInstagram}</p>
          <span className="mt-3 inline-block text-xs font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/servicos" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Com Telefone</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{stats.comTelefone}</p>
          <span className="mt-3 inline-block text-xs font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
        <Link href="/admin/servicos" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Com Website</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{stats.comWebsite}</p>
          <span className="mt-3 inline-block text-xs font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
        <Link href="/admin/servicos" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Com Instagram</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{stats.comInstagram}</p>
          <span className="mt-3 inline-block text-xs font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">Ver todos →</span>
        </Link>
      </div>
    </div>
  );
}
