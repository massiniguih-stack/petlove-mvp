import type { EtapaFunil } from '@/lib/admin/analytics/tipos';
import { COR } from './formato';
import { Legenda } from './Legenda';
import type { Serie } from './GraficoSeries';

export function Funil({ etapas, grupos }: { etapas: EtapaFunil[]; grupos?: Serie[] }) {
  const topo = etapas[0]?.total ?? 0;
  return (
    <div>
      <ol className="space-y-3">
        {etapas.map((etapa, i) => {
          const largura = etapa.total > 0 && topo > 0 ? Math.max(2, (etapa.total / topo) * 100) : 0;
          return (
            <li key={etapa.nome}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-slate-700 dark:text-slate-200">{etapa.nome}</span>
                <span className="shrink-0 tabular-nums">
                  <strong className="font-semibold text-slate-900 dark:text-white">{etapa.total}</strong>
                  {i > 0 && etapa.pctDoAnterior !== null && (
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{etapa.pctDoAnterior}% da etapa anterior</span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="flex h-3 overflow-hidden rounded-full" style={{ width: `${largura}%` }}>
                  {grupos ? (
                    grupos.map((g) => {
                      const n = etapa.porGrupo[g.chave] ?? 0;
                      if (n === 0) return null;
                      return (
                        <div
                          key={g.chave}
                          title={`${g.nome}: ${n}`}
                          style={{ width: `${(n / etapa.total) * 100}%`, backgroundColor: g.cor }}
                        />
                      );
                    })
                  ) : (
                    <div className="w-full" style={{ backgroundColor: COR.pago }} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {grupos && <Legenda itens={grupos} />}
    </div>
  );
}
