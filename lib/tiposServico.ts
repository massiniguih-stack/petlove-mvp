export const emojiPorTipo: Record<string, string> = {
  veterinario: '🩺',
  petshop: '🛁',
  creche: '🏫',
  parque: '🌳',
  hotel: '🏨',
  petsitter: '🐾',
  petdriver: '🚗',
};

/** Ícones 3D do set Patinha (mapeamento por tipo de serviço) */
export const icon3dPorTipo: Record<string, string> = {
  veterinario: '/icons/3d/saude.png',
  petshop: '/icons/3d/racao.png',
  creche: '/icons/3d/dog.png',
  parque: '/icons/3d/atividades.png',
  hotel: '/icons/3d/servicos.png',
  petsitter: '/icons/3d/patinha.png',
  petdriver: '/icons/3d/target.png',
};

export function emojiServico(tipo: string): string {
  return emojiPorTipo[tipo] || '🐾';
}

export function icon3dServico(tipo: string): string {
  return icon3dPorTipo[tipo] || '/icons/3d/patinha.png';
}
