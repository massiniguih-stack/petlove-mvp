import type { Granularidade, Intervalo } from './tipos';
import {
  inicioDaSemana,
  inicioDoDia,
  inicioDoMes,
  rotuloDia,
  rotuloMes,
  somarDias,
  somarMeses,
} from './tempo';

export interface Balde {
  inicio: Date;
  fim: Date;
  rotulo: string;
}

function inicioDoBalde(d: Date, granularidade: Granularidade): Date {
  if (granularidade === 'dia') return inicioDoDia(d);
  if (granularidade === 'semana') return inicioDaSemana(d);
  return inicioDoMes(d);
}

function proximo(d: Date, granularidade: Granularidade): Date {
  if (granularidade === 'dia') return somarDias(d, 1);
  if (granularidade === 'semana') return somarDias(d, 7);
  return somarMeses(d, 1);
}

export function criarBaldes(intervalo: Intervalo, granularidade: Granularidade): Balde[] {
  const baldes: Balde[] = [];
  let inicio = inicioDoBalde(intervalo.inicio, granularidade);
  while (inicio < intervalo.fim) {
    const fim = proximo(inicio, granularidade);
    baldes.push({ inicio, fim, rotulo: granularidade === 'mes' ? rotuloMes(inicio) : rotuloDia(inicio) });
    inicio = fim;
  }
  return baldes;
}

export function contarPorBalde(baldes: Balde[], datas: Date[]): number[] {
  const contagem = baldes.map(() => 0);
  for (const d of datas) {
    const i = baldes.findIndex((b) => d >= b.inicio && d < b.fim);
    if (i >= 0) contagem[i] += 1;
  }
  return contagem;
}

export function acumuladoAte(baldes: Balde[], datas: Date[]): number[] {
  return baldes.map((b) => datas.filter((d) => d < b.fim).length);
}
