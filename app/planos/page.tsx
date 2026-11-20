import PlanosClient from './PlanosClient';

// EXP-02A: metadata sem vender alertas de vacina como exclusivo Premium
export const metadata = {
  title: 'Planos Patinha — Cuidados Premium para seu Pet',
  description: 'Assine o Patinha Premium: pets ilimitados, histórico completo e comparação entre pets por R$ 17,90/mês ou R$ 9,90/mês no plano anual. Grátis para começar.',
  openGraph: {
    title: 'Planos Patinha — Cuidados Premium para seu Pet',
    description: 'Assine o Patinha Premium: pets ilimitados, histórico completo e comparação entre pets a partir de R$ 9,90/mês.',
  },
};

export default function PlanosPage() {
  return <PlanosClient />;
}
