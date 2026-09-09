import PremiumClient from './PremiumClient';

// EXP-15: sem claim numérico inventado
export const metadata = {
  title: 'Seja um Parceiro Patinha — Grátis, Básico, Profissional ou Empresarial',
  description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha. Planos Grátis, Básico (R$ 239,80/ano), Profissional (R$ 596,90/ano) e Empresarial (R$ 826,80/ano).',
  openGraph: {
    title: 'Seja um Parceiro Patinha — Grátis, Básico, Profissional ou Empresarial',
    description: 'Cadastre seu pet shop, clínica ou hotel na rede Patinha. Planos Grátis, Básico, Profissional e Empresarial.',
  },
};

export default function ParceiroPremiumPage() {
  return <PremiumClient />;
}
