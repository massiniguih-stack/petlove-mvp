export interface MetaDiaria {
  caloriasDiarias: number;
  racaoDiaria: number;
  exercicioMinutos: number;
}

export function calcularMeta(idadeEmMeses: number, pesoAtual: number, objetivo: string): MetaDiaria {
  const caloriasDiarias = pesoAtual * 30 + (objetivo === 'desempenho' ? 50 : objetivo === 'emagrecimento' ? -50 : 0);
  const racaoDiaria = (pesoAtual * 30) / 3.5;
  const exercicioMinutos = idadeEmMeses < 12 ? 30 : idadeEmMeses < 36 ? 45 : 60;
  return { caloriasDiarias, racaoDiaria, exercicioMinutos };
}
