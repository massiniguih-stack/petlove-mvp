import CadastroClient from './CadastroClient';

export const metadata = {
  title: 'Cadastre seu Negócio Pet — Patinha Parceiros',
  description: 'Leva poucos minutos: coloque seu pet shop, clínica veterinária ou hotel pet no mapa Patinha e comece a receber tutores da sua região.',
  openGraph: {
    title: 'Cadastre seu Negócio Pet — Patinha Parceiros',
    description: 'Leva poucos minutos: coloque seu pet shop, clínica veterinária ou hotel pet no mapa Patinha e comece a receber tutores da sua região.',
  },
};

export default function CadastroParceiroPage() {
  return <CadastroClient />;
}
