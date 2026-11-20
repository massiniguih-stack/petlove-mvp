import type { Variacao } from '@/lib/admin/analytics/tipos';

function SeloVariacao({ variacao }: { variacao: NonNullable<Variacao> }) {
  if (variacao.tipo === 'novo') {
    return <span className="text-xs font-medium text-sky-700 dark:text-sky-400">novo</span>;
  }
  const { valor } = variacao;
  const cor =
    valor > 0
      ? 'text-emerald-700 dark:text-emerald-400'
      : valor < 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-400';
  const seta = valor > 0 ? '▲ ' : valor < 0 ? '▼ ' : '';
  return (
    <span className={`text-xs font-medium tabular-nums ${cor}`} title="Comparado ao período anterior">
      {seta}
      {Math.abs(valor)}%
    </span>
  );
}

export function CartaoNumero({
  rotulo,
  valor,
  variacao,
  dica,
}: {
  rotulo: string;
  valor: string | number;
  variacao?: Variacao;
  dica?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{rotulo}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">{valor}</p>
        {variacao && <SeloVariacao variacao={variacao} />}
      </div>
      {dica && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{dica}</p>}
    </div>
  );
}
