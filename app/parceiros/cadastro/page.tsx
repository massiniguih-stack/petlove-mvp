import CadastroClient from './CadastroClient';

export const metadata = {
  title: 'Cadastre seu Negócio Pet — PetLove Parceiros',
  description: 'Leva poucos minutos: coloque seu pet shop, clínica veterinária ou hotel pet no mapa PetLove e comece a receber tutores da sua região.',
  openGraph: {
    title: 'Cadastre seu Negócio Pet — PetLove Parceiros',
    description: 'Leva poucos minutos: coloque seu pet shop, clínica veterinária ou hotel pet no mapa PetLove e comece a receber tutores da sua região.',
  },
};

export default function CadastroParceiroPage() {
  return <CadastroClient />;
}
