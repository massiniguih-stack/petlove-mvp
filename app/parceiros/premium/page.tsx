import PremiumClient from './PremiumClient';

// EXP-15: sem claim numérico inventado; singular “plano”
export const metadata = {
  title: 'Seja um Parceiro Patinha — Destaque no mapa para tutores da sua região',
  description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha. Mensal R$ 39,80 ou anual R$ 238,80 com desconto.',
  openGraph: {
    title: 'Seja um Parceiro Patinha — Destaque no mapa para tutores da sua região',
    description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha. Mensal R$ 39,80 ou anual R$ 238,80 com desconto.',
  },
};

export default function ParceiroPremiumPage() {
  return <PremiumClient />;
}
