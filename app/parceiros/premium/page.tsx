import PremiumClient from './PremiumClient';

// EXP-15: sem claim numérico inventado; singular “plano”
export const metadata = {
  title: 'Seja um Parceiro Patinha — Destaque no mapa para tutores da sua região',
  description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha e ganhe visibilidade na sua região. Plano a partir de R$ 39,80/mês.',
  openGraph: {
    title: 'Seja um Parceiro Patinha — Destaque no mapa para tutores da sua região',
    description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha e ganhe visibilidade na sua região. Plano a partir de R$ 39,80/mês.',
  },
};

export default function ParceiroPremiumPage() {
  return <PremiumClient />;
}
