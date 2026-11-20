// Regras puras dos lembretes da rotina (sino nos compromissos de Atividades
// e Ração). Sem banco nem navegador, para dar pra testar.
//
// Como funciona: o tutor liga o sino num compromisso ("Passeio 07:00"). Isso
// vira uma linha em lembrete_rotina, que vale para TODOS os dias. Um
// "despertador" no Supabase (pg_cron) chama /api/cron/lembretes a cada
// 5 minutos, e a rota manda o aviso ~15 minutos antes do horário.

export type ListaRotina = 'atividade' | 'refeicao';

/** Quantos minutos antes do horário o aviso chega. */
export const ANTECEDENCIA_MIN = 15;

/**
 * Depois do horário, ainda avisa por mais alguns minutos — cobre atrasos do
 * despertador (ele roda a cada 5 min e pode demorar um pouco).
 */
export const FOLGA_MIN = 10;

/** Os horários do app são de Brasília. */
export const FUSO = 'America/Sao_Paulo';

export function chaveLembrete(nome: string, hora: string): string {
  return `${nome.trim().toLowerCase()}|${hora}`;
}

/** "07:30" → 450. Retorna null se o texto não for um horário válido. */
export function horaParaMinutos(hora: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Dia (AAAA-MM-DD) e minutos desde a meia-noite, no horário de Brasília. */
export function agoraNoFuso(data: Date, fuso = FUSO): { dia: string; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(data);
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? '00';
  return { dia: `${v('year')}-${v('month')}-${v('day')}`, minutos: Number(v('hour')) * 60 + Number(v('minute')) };
}

/**
 * Minutos que faltam para o compromisso, se AGORA é hora de avisar; senão
 * null. Avisa uma vez por dia, de 15 min antes até 10 min depois do horário.
 */
export function minutosParaAvisar(opts: {
  hora: string;
  minutosAgora: number;
  hoje: string;
  ultimoEnvioDia: string | null;
}): number | null {
  if (opts.ultimoEnvioDia === opts.hoje) return null;
  const alvo = horaParaMinutos(opts.hora);
  if (alvo === null) return null;
  const faltam = alvo - opts.minutosAgora;
  if (faltam > ANTECEDENCIA_MIN || faltam < -FOLGA_MIN) return null;
  return faltam;
}

/** O horário de hoje já passou do ponto de aviso? (Ao ligar o sino tarde.) */
export function jaPassouDoAviso(hora: string, minutosAgora: number): boolean {
  const alvo = horaParaMinutos(hora);
  return alvo !== null && minutosAgora > alvo;
}

export function textoLembrete(opts: { lista: ListaRotina; nome: string; hora: string; petNome: string; faltam: number }) {
  const quando = opts.faltam > 1 ? `em ${opts.faltam} min` : 'agora';
  const emoji = opts.lista === 'refeicao' ? '🍽️' : '🐾';
  return {
    titulo: `${opts.nome} de ${opts.petNome} ${quando} ${emoji}`,
    corpo: `Compromisso das ${opts.hora} na rotina de ${opts.petNome}.`,
    caminho: opts.lista === 'refeicao' ? '/racao' : '/atividades',
  };
}

/**
 * Ao montar o checklist de hoje: compromissos com sino ligado que não estão
 * na lista padrão também entram, para a rotina continuar igual todo dia.
 */
export function extrasDaRotina<T extends { nome: string; hora: string }>(
  padrao: { nome: string; hora: string }[],
  lembretes: T[]
): T[] {
  const noPadrao = new Set(padrao.map((p) => chaveLembrete(p.nome, p.hora)));
  return lembretes.filter((l) => !noPadrao.has(chaveLembrete(l.nome, l.hora)));
}
