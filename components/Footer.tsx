import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Patinha MVP - Projeto em construção</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/politica-de-privacidade" className="text-slate-500 underline transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400">
            Política de Privacidade
          </Link>
        </div>
        <p className="mt-2">Em caso de emergência, procure um veterinário.</p>
      </div>
    </footer>
  );
}
