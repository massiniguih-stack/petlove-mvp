'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { PawIcon3D } from '@/components/Icons3D';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icone: '📊' },
  { href: '/admin/parceiros', label: 'Parceiros', icone: '🤝' },
  { href: '/admin/usuarios', label: 'Usu\u00e1rios', icone: '👥' },
  { href: '/admin/feedback', label: 'Feedback', icone: '💬' },
];

const pageNames: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/parceiros': 'Parceiros',
  '/admin/usuarios': 'Usu\u00e1rios',
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
      <div className="flex items-center gap-3 rounded-xl px-3 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{email}</p>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Admin</p>
        </div>
      </div>
      <DarkModeToggle variant="sidebar" />
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <span>🚪</span>
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

  const openAccess = process.env.NEXT_PUBLIC_OPEN_ACCESS === 'true';

  if (loading && !openAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user && !openAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  const currentPage = pageNames[pathname] || 'Admin';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center">
            <PawIcon3D size={36} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white">Painel Admin</h1>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Patinha</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <span className="text-lg">{item.icone}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Abrir menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/admin" className="font-medium text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              Admin
            </Link>
            {pathname !== '/admin' && (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-600">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{currentPage}</span>
              </>
            )}
          </div>
        </div>
        <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400">Carregando...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
