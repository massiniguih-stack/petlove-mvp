import { differenceInMonths } from 'date-fns';

// Calendário (date-fns), não aproximação por 30 dias — evita errar perto da
// virada do mês. Usado em toda tela que mostra ou calcula a idade do pet.
export function idadeEmMeses(dataNascimento: string, hoje = new Date()) {
  return Math.max(0, differenceInMonths(hoje, new Date(dataNascimento)));
}

export function formatarIdade(meses: number) {
  if (meses < 12) return meses === 1 ? '1 mês' : `${meses} meses`;
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  const anosTxt = anos === 1 ? '1 ano' : `${anos} anos`;
  if (resto === 0) return anosTxt;
  return `${anosTxt} e ${resto === 1 ? '1 mês' : `${resto} meses`}`;
}
