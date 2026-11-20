import { COR } from './formato';
import { Legenda } from './Legenda';

export function RankingBarras({
  itens,
  nomeTotal,
  nomeDestaque,
}: {
  itens: Array<{ rotulo: string; total: number; destaque: number }>;
  nomeTotal: string;
  nomeDestaque: string;
}) {
  const maior = Math.max(1, ...itens.map((i) => i.total));
  return (
    <div>
      <ul className="space-y-2.5">
        {itens.map((item) => (
          <li key={item.rotulo}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-slate-700 dark:text-slate-200">{item.rotulo}</span>
              <span className="shrink-0 tabular-nums text-slate-900 dark:text-white">
                {item.total}
                <span className="ml-1.5 text-xs text-amber-700 dark:text-amber-400">
                  · {item.destaque} {nomeDestaque.toLowerCase()}
                </span>
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="relative h-2 overflow-hidden rounded-full"
                style={{ width: `${(item.total / maior) * 100}%`, backgroundColor: COR.gratis }}
              >
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: item.total > 0 ? `${(item.destaque / item.total) * 100}%` : '0%',
                    backgroundColor: COR.pago,
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Legenda
        itens={[
          { nome: nomeTotal, cor: COR.gratis },
          { nome: nomeDestaque, cor: COR.pago },
        ]}
      />
    </div>
  );
}
