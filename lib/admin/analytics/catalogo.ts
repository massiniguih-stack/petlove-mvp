// Preços mensais (BRL) para estimar a receita mensal: só planos com valor estável.
export const PRECO_MENSAL: Record<string, number> = {
  tutor_monthly: 29.49,
  tutor_annual: 238.8 / 12,
  // Parceiro virou 100% anual a partir de 2026-09: o valor é o preço à vista
  // dividido por 12 (receita reconhecida por mês), não a parcela com juros.
  partner_basic: 239.8 / 12,
  partner_annual: 238.8 / 12,
  partner_pro: 596.9 / 12,
  partner_enterprise: 826.8 / 12,
};

export const ROTULO_TIPO: Record<string, string> = {
  veterinario: 'Veterinários',
  petshop: 'Pet shops',
  creche: 'Creches',
  parque: 'Parques',
  hotel: 'Hotéis',
  petsitter: 'Pet sitters',
  petdriver: 'Pet drivers',
};

export function categoriaDoPlano(planType: string, planCategory: string | null): 'tutor' | 'partner' {
  if (planCategory === 'partner' || planCategory === 'tutor') return planCategory;
  return planType.startsWith('partner_') ? 'partner' : 'tutor';
}

export function receitaMensal(planos: string[]): number {
  const total = planos.reduce((soma, plano) => soma + (PRECO_MENSAL[plano] ?? 0), 0);
  return Math.round(total * 100) / 100;
}
