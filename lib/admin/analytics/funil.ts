import type { EtapaFunil } from './tipos';

export function montarFunil(
  nomes: string[],
  entradas: Array<{ id: string; grupo?: string }>,
  etapas: Array<Set<string>>,
): EtapaFunil[] {
  const nivel = new Map<string, number>();
  for (const entrada of entradas) {
    let n = 0;
    etapas.forEach((quem, i) => {
      if (quem.has(entrada.id)) n = i + 1;
    });
    nivel.set(entrada.id, n);
  }

  const totais = nomes.map((nome, k) => {
    const chegaram = entradas.filter((e) => (nivel.get(e.id) ?? 0) >= k);
    const porGrupo: Record<string, number> = {};
    for (const e of chegaram) {
      if (e.grupo) porGrupo[e.grupo] = (porGrupo[e.grupo] || 0) + 1;
    }
    return { nome, total: chegaram.length, porGrupo };
  });

  return totais.map((etapa, k) => {
    const anterior = k === 0 ? 0 : totais[k - 1].total;
    return {
      ...etapa,
      pctDoAnterior: k === 0 || anterior === 0 ? null : Math.round((etapa.total / anterior) * 100),
    };
  });
}

export function conversaoDoFunil(funil: EtapaFunil[]): number | null {
  if (funil.length < 2 || funil[0].total === 0) return null;
  return Math.round((funil[funil.length - 1].total / funil[0].total) * 1000) / 10;
}
