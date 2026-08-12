export const emojiPorTipo: Record<string, string> = {
  veterinario: '🩺',
  petshop: '🛁',
  creche: '🏫',
  parque: '🌳',
  hotel: '🏨',
  petsitter: '🐾',
  petdriver: '🚗',
  adestrador: '🎓',
};

/**
 * Ícones 3D por tipo de serviço (mapa / cadastro parceiro).
 * Fonte: Thiings (mesmo estilo do Dog Trainer) — arquivos dedicados
 * em public/icons/3d/{tipo}.png para não misturar com ícones de UI
 * (saúde, ração, patinha, etc.).
 */
export const icon3dPorTipo: Record<string, string> = {
  veterinario: '/icons/3d/veterinario.png', // thiings.co/things/veterinarian
  petshop: '/icons/3d/petshop.png', // thiings.co/things/pet-store
  creche: '/icons/3d/creche.png', // thiings.co/things/dog-house
  parque: '/icons/3d/parque.png', // thiings.co/things/park
  hotel: '/icons/3d/hotel.png', // thiings.co/things/hotel
  petsitter: '/icons/3d/petsitter.png', // thiings.co/things/dog-walking
  petdriver: '/icons/3d/petdriver.png', // thiings.co/things/pet-carrier
  adestrador: '/icons/3d/adestrador.png', // thiings.co/things/dog-trainer
};

/** Tipos que o tutor vê no mapa e o parceiro pode escolher no cadastro */
export const TIPOS_SERVICO_MAPA = [
  'veterinario',
  'petshop',
  'creche',
  'hotel',
  'petsitter',
  'adestrador',
  'parque',
] as const;

export type TipoServicoMapa = (typeof TIPOS_SERVICO_MAPA)[number];

export const labelPorTipo: Record<string, string> = {
  veterinario: 'Veterinários',
  petshop: 'Pet Shop',
  creche: 'Creche',
  hotel: 'Hotel',
  petsitter: 'Pet Sitter',
  adestrador: 'Adestrador',
  parque: 'Parques',
  petdriver: 'Pet Driver',
};

export function emojiServico(tipo: string): string {
  return emojiPorTipo[tipo] || '🐾';
}

export function icon3dServico(tipo: string): string {
  return icon3dPorTipo[tipo] || '/icons/3d/patinha.png';
}
