'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icone: '📊' },
  { href: '/admin/parceiros', label: 'Parceiros', icone: '🤝' },
  { href: '/admin/servicos', label: 'Servi\u00e7os', icone: '🏪' },
  { href: '/admin/usuarios', label: 'Usu\u00e1rios', icone: '👥' },
  { href: '/admin/dispatch', label: 'Dispatch', icone: '📨' },
];

const pageNames: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/parceiros': 'Parceiros',
  '/admin/servicos': 'Servi\u00e7os',
  '/admin/usuarios': 'Usu\u00e1rios',
  '/admin/dispatch': 'Dispatch',
};

function DarkModeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      title={dark ? 'Modo claro' : 'Modo escuro'}
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
      {dark ? 'Modo claro' : 'Modo escuro'}
    </button>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { dark, toggle, mounted } = useDarkMode();

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
      {mounted && <DarkModeToggle dark={dark} toggle={toggle} />}
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
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
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
              <ellipse cx="20" cy="18" rx="6" ry="7" fill="white" />
              <ellipse cx="44" cy="18" rx="6" ry="7" fill="white" />
              <ellipse cx="12" cy="32" rx="5" ry="6" fill="white" />
              <ellipse cx="52" cy="32" rx="5" ry="6" fill="white" />
              <ellipse cx="32" cy="44" rx="14" ry="12" fill="white" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white">Painel Admin</h1>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">PetLove</p>
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

      <main className="ml-64 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3 dark:border-slate-800 dark:bg-slate-900">
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
