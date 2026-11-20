import Link from 'next/link';
import type { FilaItem } from '@/lib/admin/filaHoje';

export function FaixaFila({ itens }: { itens: FilaItem[] }) {
  if (itens.length === 0) return null;
  const atencao = itens.some((i) => i.atencao);
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-4 py-2.5 text-sm ${
        atencao
          ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <span className="font-semibold text-slate-900 dark:text-white">Fila de hoje</span>
      {itens.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          title={item.detalhe}
          className="text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
        >
          {item.titulo}
        </Link>
      ))}
    </div>
  );
}
