// Resumo do dia do pet para o mini painel do dashboard.
//
// Lê as mesmas linhas de `checklist_item` que as telas de Ração
// (lista 'refeicao') e Atividades (lista 'atividade') gravam. Aqui é só
// conta e ordenação: quem busca no banco é a página.

export type ItemDoDia = {
  id: string;
  lista: string;
  hora: string | null;
  nome: string;
  detalhe: string | null;
  concluida: boolean;
};

export type ProgressoLista = {
  feitas: number;
  total: number;
  /** 0 a 100, já arredondado. */
  percentual: number;
  /** Próximo item ainda não marcado, pelo horário. */
  proxima: { nome: string; hora: string | null } | null;
};

export type FeitoHoje = {
  id: string;
  tipo: 'refeicao' | 'atividade';
  hora: string | null;
  nome: string;
  /** Quantidade da refeição (ex.: "120g"). Atividades não têm. */
  detalhe: string | null;
};

export type ResumoDia = {
  refeicoes: ProgressoLista;
  atividades: ProgressoLista;
  feitos: FeitoHoje[];
};

function porHora(a: { hora: string | null }, b: { hora: string | null }) {
  return (a.hora || '99:99').localeCompare(b.hora || '99:99');
}

function progresso(itens: ItemDoDia[]): ProgressoLista {
  const ordenados = [...itens].sort(porHora);
  const feitas = ordenados.filter((i) => i.concluida).length;
  const pendente = ordenados.find((i) => !i.concluida);
  return {
    feitas,
    total: ordenados.length,
    percentual: ordenados.length === 0 ? 0 : Math.round((feitas / ordenados.length) * 100),
    proxima: pendente ? { nome: pendente.nome, hora: pendente.hora } : null,
  };
}

export function resumoDoDia(itens: ItemDoDia[]): ResumoDia {
  const refeicoes = itens.filter((i) => i.lista === 'refeicao');
  const atividades = itens.filter((i) => i.lista === 'atividade');

  const feitos: FeitoHoje[] = [...refeicoes, ...atividades]
    .filter((i) => i.concluida)
    .sort(porHora)
    .map((i) => ({
      id: i.id,
      tipo: i.lista === 'refeicao' ? 'refeicao' : 'atividade',
      hora: i.hora,
      nome: i.nome,
      // Em atividades a coluna `detalhe` guarda o emoji do ícone, não um texto.
      detalhe: i.lista === 'refeicao' ? i.detalhe || null : null,
    }));

  return { refeicoes: progresso(refeicoes), atividades: progresso(atividades), feitos };
}

/** Frase curta embaixo do número de cada cartão do painel. */
export function legendaProgresso(p: ProgressoLista): string {
  if (p.total === 0) return 'Toque para começar o dia';
  if (!p.proxima) return 'Tudo feito por hoje';
  return p.proxima.hora ? `Falta: ${p.proxima.nome} · ${p.proxima.hora}` : `Falta: ${p.proxima.nome}`;
}
