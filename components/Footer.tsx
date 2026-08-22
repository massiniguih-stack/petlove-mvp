import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Patinha MVP — projeto em teste (beta)</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link href="/politica-de-privacidade" className="text-slate-500 underline transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400">
            Política de Privacidade
          </Link>
          <Link href="/termos-de-uso" className="text-slate-500 underline transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400">
            Termos de Uso
          </Link>
          <a
            href="mailto:contato@patinha.app.br"
            className="text-slate-500 underline transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
          >
            Fale conosco
          </a>
        </div>
        <p className="mt-2">
          Dúvidas: {' '}
          <a
            href="mailto:contato@patinha.app.br"
            className="underline transition hover:text-amber-600 dark:hover:text-amber-400"
          >
            contato@patinha.app.br
          </a>
        </p>
        <p className="mt-2">
          Ícones 3D:{' '}
          <a
            href="https://www.thiings.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition hover:text-amber-600 dark:hover:text-amber-400"
          >
            Thiings
          </a>
          {' '}— usados neste web app em fase de teste.
        </p>
        <p className="mt-2">Em caso de emergência, procure um veterinário.</p>
      </div>
    </footer>
  );
}
