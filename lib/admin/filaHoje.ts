// Fila da visão geral da equipe. A mesma regra de telefone da tela de
// Parceiros: 10 dígitos ou mais, e ainda sem marca de contato. Aqui a conta
// é da cidade inteira; a tela de Parceiros ainda respeita o filtro da lista.

export type FilaItem = {
  id: 'compras-sem-conta' | 'premium-sem-painel' | 'email' | 'whatsapp' | 'feedback-ruim';
  href: string;
  titulo: string;
  detalhe: string;
  atencao: boolean;
};

type PartnerContato = {
  telefone: string | null;
  whatsapp_contatado_em: string | null;
};

type FilaEntrada = {
  comprasSemConta?: number;
  premiumSemPainel: number;
  pendentesComEmail: number;
  whatsappPendentes: number;
  feedbackRuim: number;
};

export function telefoneValido(telefone: string | null | undefined) {
  return (telefone || '').replace(/\D/g, '').length >= 10;
}

export function contarWhatsappPendentes(partners: PartnerContato[]) {
  return partners.filter(
    (p) => telefoneValido(p.telefone) && !p.whatsapp_contatado_em,
  ).length;
}

function frase(count: number, um: string, varios: string) {
  return `${count} ${count === 1 ? um : varios}`;
}

export function montarFilaHoje(entrada: FilaEntrada): FilaItem[] {
  const itens: FilaItem[] = [];

  if ((entrada.comprasSemConta ?? 0) > 0) {
    itens.push({
      id: 'compras-sem-conta',
      href: '/admin/usuarios',
      titulo: frase(
        entrada.comprasSemConta ?? 0,
        'compra sem conta no app',
        'compras sem conta no app',
      ),
      detalhe:
        'Pagou na LastLink com um e-mail que não tem conta. O Premium liga quando a pessoa entrar com esse e-mail (tabela compras_sem_conta no Supabase).',
      atencao: true,
    });
  }

  if (entrada.premiumSemPainel > 0) {
    itens.push({
      id: 'premium-sem-painel',
      href: '/admin/parceiros',
      titulo: frase(
        entrada.premiumSemPainel,
        'pago ainda sem painel',
        'pagos ainda sem painel',
      ),
      detalhe: 'Já pagou e ainda não entrou no painel.',
      atencao: true,
    });
  }

  if (entrada.pendentesComEmail > 0) {
    itens.push({
      id: 'email',
      href: '/admin/parceiros',
      titulo: frase(
        entrada.pendentesComEmail,
        'convite de e-mail parado',
        'convites de e-mail parados',
      ),
      detalhe: 'Tem e-mail e o convite ainda não saiu.',
      atencao: false,
    });
  }

  if (entrada.whatsappPendentes > 0) {
    itens.push({
      id: 'whatsapp',
      href: '/admin/parceiros',
      titulo: frase(
        entrada.whatsappPendentes,
        'WhatsApp ainda sem contato',
        'WhatsApp ainda sem contato',
      ),
      detalhe: 'Telefone válido e ninguém marcou o contato.',
      atencao: false,
    });
  }

  if (entrada.feedbackRuim > 0) {
    itens.push({
      id: 'feedback-ruim',
      href: '/admin/feedback?humor=ruim',
      titulo: frase(entrada.feedbackRuim, 'resposta ruim', 'respostas ruins'),
      detalhe: 'Alguém marcou a experiência como ruim.',
      atencao: true,
    });
  }

  return itens;
}
