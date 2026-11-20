import type { ReactNode } from 'react';
import { MINIMO_DADOS } from './formato';

export function BlocoGrafico({
  titulo,
  subtitulo,
  total,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  total: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{titulo}</h2>
      {subtitulo && <p className="mt-0.5 text-xs text-slate-400">{subtitulo}</p>}
      {total < MINIMO_DADOS ? (
        <p className="mt-6 pb-2 text-sm text-slate-500 dark:text-slate-400">Poucos dados no período ({total}).</p>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </section>
  );
}
