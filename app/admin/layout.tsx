'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ChartBar, ChatCircle, Handshake, List, SignOut, Users } from '@phosphor-icons/react';
import { useAuth } from '@/hooks/useAuth';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { PawIcon3D } from '@/components/Icons3D';
import { isOpenAccess } from '@/lib/openAccess';

const menuItems = [
  { href: '/admin', label: 'Visão geral', Icon: ChartBar },
  { href: '/admin/parceiros', label: 'Parceiros', Icon: Handshake },
  { href: '/admin/usuarios', label: 'Usuários', Icon: Users },
  { href: '/admin/feedback', label: 'Feedback', Icon: ChatCircle },
];

const pageNames: Record<string, string> = {
  '/admin': 'Visão geral',
  '/admin/parceiros': 'Parceiros',
  '/admin/usuarios': 'Usuários',
  '/admin/feedback': 'Feedback',
};

function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const email = user?.email || '';
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{email}</p>
          <p className="text-[11px] text-slate-400">Equipe</p>
        </div>
      </div>
      <DarkModeToggle variant="sidebar" />
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <SignOut size={16} />
        Sair
      </button>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const openAccess = isOpenAccess();

  if (loading && !openAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!user && !openAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-slate-500">Redirecionando para login...</p>
      </div>
    );
  }

  const currentPage = pageNames[pathname] || 'Admin';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-4 dark:border-slate-800">
          <PawIcon3D size={28} />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Patinha</p>
            <p className="text-[11px] text-slate-400">Painel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-amber-50 font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 lg:ml-56">
        <div className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Abrir menu"
          >
            <List size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/admin" className="transition hover:text-slate-700 dark:hover:text-slate-200">
              Painel
            </Link>
            {pathname !== '/admin' && (
              <>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{currentPage}</span>
              </>
            )}
          </div>
        </div>
        <Suspense fallback={<div className="p-8 text-slate-500">Carregando...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
