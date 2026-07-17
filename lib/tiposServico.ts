export const emojiPorTipo: Record<string, string> = {
  veterinario: '🩺',
  petshop: '🛁',
  creche: '🏫',
  parque: '🌳',
  hotel: '🏨',
  petsitter: '🐾',
  petdriver: '🚗',
};

export function emojiServico(tipo: string): string {
  return emojiPorTipo[tipo] || '🐾';
}
