import { formatarIdade, idadeEmMeses } from '@/lib/pet';

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
  return formatarIdade(idadeEmMeses(dataNascimento, hoje));
}

export function rotuloObjetivo(objetivo: string) {
  if (objetivo === 'manutencao') return 'Manutenção';
  if (objetivo === 'pelagem') return 'Pelagem';
  if (objetivo === 'emagrecimento') return 'Emagrecimento';
  return 'Desempenho';
}
