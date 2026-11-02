import { differenceInMonths } from 'date-fns';

export type RecadoVacina = {
  titulo: string;
  detalhe: string;
  href: '/vida';
};

export function recadoVacina(
  vacina: { titulo: string; data: Date } | null,
  formatarData: (data: Date) => string,
): RecadoVacina {
  if (!vacina) {
    return {
      titulo: 'Marcar a vacina',
      detalhe: 'Nenhuma vacina agendada',
      href: '/vida',
    };
  }

  return {
    titulo: `Próxima vacina: ${vacina.titulo} · ${formatarData(vacina.data)}`,
    detalhe: 'Abre a linha do tempo',
    href: '/vida',
  };
}

export function recadoVacinaIndisponivel(): RecadoVacina {
  return {
    titulo: 'Abrir a linha do tempo',
    detalhe: 'Não consegui ver a vacina agora.',
    href: '/vida',
  };
}

export function idadeDoPet(dataNascimento: string, hoje = new Date()) {
  const meses = Math.max(0, differenceInMonths(hoje, new Date(dataNascimento)));
  if (meses < 12) return meses === 1 ? '1 mês' : `${meses} meses`;
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  const anosTxt = anos === 1 ? '1 ano' : `${anos} anos`;
  if (resto === 0) return anosTxt;
  return `${anosTxt} e ${resto === 1 ? '1 mês' : `${resto} meses`}`;
}

export function rotuloObjetivo(objetivo: string) {
  if (objetivo === 'manutencao') return 'Manutenção';
  if (objetivo === 'pelagem') return 'Pelagem';
  if (objetivo === 'emagrecimento') return 'Emagrecimento';
  return 'Desempenho';
}
