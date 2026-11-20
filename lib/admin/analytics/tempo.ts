// O Brasil não tem horário de verão desde 2019: Brasília é sempre UTC−3.
// Se o horário de verão voltar, troque este deslocamento fixo por Intl.
const DESLOCAMENTO_MS = 3 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** O relógio de Brasília escrito como se fosse UTC, para usar getUTC*. */
function relogio(d: Date): Date {
  return new Date(d.getTime() - DESLOCAMENTO_MS);
}

function doRelogio(d: Date): Date {
  return new Date(d.getTime() + DESLOCAMENTO_MS);
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function inicioDoDia(d: Date): Date {
  const r = relogio(d);
  return doRelogio(new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate())));
}

export function inicioDaSemana(d: Date): Date {
  const dia = inicioDoDia(d);
  const diasDesdeSegunda = (relogio(dia).getUTCDay() + 6) % 7;
  return somarDias(dia, -diasDesdeSegunda);
}

export function inicioDoMes(d: Date): Date {
  const r = relogio(d);
  return doRelogio(new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), 1)));
}

export function somarDias(d: Date, dias: number): Date {
  return new Date(d.getTime() + dias * DIA_MS);
}

export function somarMeses(d: Date, meses: number): Date {
  const r = relogio(d);
  return doRelogio(
    new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + meses, r.getUTCDate(), r.getUTCHours())),
  );
}

export function rotuloDia(d: Date): string {
  const r = relogio(d);
  return `${doisDigitos(r.getUTCDate())}/${doisDigitos(r.getUTCMonth() + 1)}`;
}

export function rotuloMes(d: Date): string {
  const r = relogio(d);
  return `${MESES[r.getUTCMonth()]}/${String(r.getUTCFullYear()).slice(2)}`;
}

/**
 * Lê um timestamp vindo do Supabase. Colunas `timestamp` (sem fuso), como
 * `pet.created_at`, chegam sem "Z" mas estão em UTC: sem este cuidado, o
 * Node leria como hora local da máquina.
 */
export function lerData(valor: string): Date {
  const comT = valor.includes('T') ? valor : valor.replace(' ', 'T');
  const temFuso = /([zZ]|[+-]\d{2}:?\d{2})$/.test(comT);
  return new Date(temFuso ? comT : `${comT}Z`);
}
