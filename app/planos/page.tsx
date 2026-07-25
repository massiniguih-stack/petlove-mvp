import PlanosClient from './PlanosClient';

// EXP-02A: metadata sem vender alertas de vacina como exclusivo Premium
export const metadata = {
  title: 'Planos Patinha — Cuidados Premium para seu Pet',
  description: 'Assine o Patinha Premium: pets ilimitados, histórico completo e comparação entre pets a partir de R$ 29,49/mês (anual a partir de R$ 19,90/mês). Grátis para começar.',
  openGraph: {
    title: 'Planos Patinha — Cuidados Premium para seu Pet',
    description: 'Assine o Patinha Premium: pets ilimitados, histórico completo e comparação entre pets a partir de R$ 29,49/mês.',
  },
};

export default function PlanosPage() {
  return <PlanosClient />;
}
