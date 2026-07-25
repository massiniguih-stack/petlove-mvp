'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePetStore } from '@/lib/store';

const links = [
  { href: '/', label: 'Home', group: 'Público' },
  { href: '/login', label: 'Login', group: 'Auth' },
  { href: '/cadastro', label: 'Cadastro', group: 'Auth' },
  { href: '/recuperar-senha', label: 'Recuperar senha', group: 'Auth' },
  { href: '/planos', label: 'Planos Premium', group: 'Venda' },
  { href: '/comparar', label: 'Comparar pets', group: 'Venda' },
  { href: '/parceiros/premium', label: 'Parceiro Premium', group: 'Venda' },
  { href: '/parceiros/cadastro', label: 'Cadastro parceiro', group: 'Venda' },
  { href: '/checkout/sucesso', label: 'Checkout sucesso', group: 'Venda' },
  { href: '/dashboard', label: 'Dashboard', group: 'App tutor' },
  { href: '/onboarding', label: 'Onboarding pet', group: 'App tutor' },
  { href: '/vida', label: 'Linha do tempo', group: 'App tutor' },
  { href: '/racao', label: 'Ração', group: 'App tutor' },
  { href: '/atividades', label: 'Atividades', group: 'App tutor' },
  { href: '/mapa', label: 'Mapa', group: 'App tutor' },
  { href: '/desempenho', label: 'Desempenho', group: 'App tutor' },
  { href: '/conta/assinatura', label: 'Assinatura', group: 'App tutor' },
  { href: '/parceiro/dashboard', label: 'Painel parceiro', group: 'Parceiro' },
  { href: '/admin', label: 'Admin', group: 'Admin' },
  { href: '/admin/parceiros', label: 'Admin parceiros', group: 'Admin' },
  { href: '/admin/usuarios', label: 'Admin usuários', group: 'Admin' },
  { href: '/admin/feedback', label: 'Admin feedback', group: 'Admin' },
  { href: '/preview-icones', label: 'Preview ícones 3D', group: 'Design' },
  { href: '/politica-de-privacidade', label: 'Privacidade', group: 'Legal' },
  { href: '/termos-de-uso', label: 'Termos', group: 'Legal' },
];

const groups = Array.from(new Set(links.map((l) => l.group)));

export default function ConferirPage() {
  const hydrate = usePetStore((s) => s.hydrate);
  const pet = usePetStore((s) => s.pet);
  const isPremium = usePetStore((s) => s.isPremium);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-900">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Modo revisão · OPEN_ACCESS
          </p>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            Acesso liberado para conferir
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Login desligado no middleware. Pet demo: <strong>{pet?.nome || 'carregando…'}</strong>
            {isPremium ? ' · Premium ativo' : ''}.
            Desligue <code className="rounded bg-white px-1 dark:bg-slate-900">OPEN_ACCESS</code> no{' '}
            <code className="rounded bg-white px-1 dark:bg-slate-900">.env.local</code> antes de deploy.
          </p>
        </div>

        {groups.map((group) => (
          <section key={group} className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{group}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {links
                .filter((l) => l.group === group)
                .map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-amber-50 hover:ring-amber-300 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
                    >
                      <span>{l.label}</span>
                      <span className="font-mono text-xs text-slate-400">{l.href}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
