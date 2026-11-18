// Tamanhos padrão dos ícones 3D do app, em pixels.
//
// A referência é a tela de Saúde (/vida): todo ícone do app usa um destes
// quatro degraus, escolhido pelo PAPEL do ícone na tela, nunca um número solto.
// Isso mantém os alvos de toque e o ritmo visual iguais no celular.
//
// Fora da escala, de propósito: selos minúsculos dentro de etiquetas de texto
// (14–24px), a foto/avatar do pet e os ícones de linha do painel admin.
export const ICONE = {
  /** Ao lado de um título de seção ou dentro de um botão/etiqueta grande. */
  titulo: 28,
  /** Atalhos, cartões de métrica e a marca na barra do topo. */
  atalho: 36,
  /** Item de lista ou cartão com ícone em destaque. */
  item: 48,
  /** Ícone principal da tela: estado vazio, sucesso, login, capa. */
  destaque: 72,
} as const;

export type PapelIcone = keyof typeof ICONE;

/** Degrau da escala mais adequado para um tamanho antigo em pixels. */
export function papelParaTamanho(px: number): PapelIcone {
  if (px <= 32) return 'titulo';
  if (px <= 44) return 'atalho';
  if (px <= 56) return 'item';
  return 'destaque';
}
