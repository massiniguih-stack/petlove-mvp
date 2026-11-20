import { PERIODOS, type PeriodoChave } from '@/lib/admin/analytics/tipos';
import { ROTULO_PERIODO } from './formato';

export function PeriodoFiltro({ valor, aoMudar }: { valor: PeriodoChave; aoMudar: (p: PeriodoChave) => void }) {
  return (
    <div
      role="group"
      aria-label="Período"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900"
    >
      {PERIODOS.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={p === valor}
          onClick={() => aoMudar(p)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 ${
            p === valor
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {ROTULO_PERIODO[p]}
        </button>
      ))}
    </div>
  );
}
