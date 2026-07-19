import PlanosClient from './PlanosClient';

export const metadata = {
  title: 'Planos Patinha — Cuidados Premium para seu Pet',
  description: 'Assine o Patinha Premium e tenha pets ilimitados, histórico completo, alertas de vacina e muito mais a partir de R$ 19,90/mês.',
  openGraph: {
    title: 'Planos Patinha — Cuidados Premium para seu Pet',
    description: 'Assine o Patinha Premium e tenha pets ilimitados, histórico completo, alertas de vacina e muito mais a partir de R$ 19,90/mês.',
  },
};

export default function PlanosPage() {
  return <PlanosClient />;
}
