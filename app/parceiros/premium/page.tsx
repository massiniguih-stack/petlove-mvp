import PremiumClient from './PremiumClient';

// EXP-15: sem claim numérico inventado
export const metadata = {
  title: 'Seja um Parceiro Patinha — Grátis, Básico, Profissional ou Empresarial',
  description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha. Planos Grátis, Básico (R$ 39,80), Profissional (R$ 69,80) e Empresarial (R$ 129,80).',
  openGraph: {
    title: 'Seja um Parceiro Patinha — Grátis, Básico, Profissional ou Empresarial',
    description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha. Planos Grátis, Básico, Profissional e Empresarial.',
  },
};

export default function ParceiroPremiumPage() {
  return <PremiumClient />;
}
