/**
 * Ícones Soft 3D por raça (top BR) + fallback por porte.
 *
 * - Raça conhecida no mapa → ícone da raça
 * - Senão → cão do porte (pelo peso do pet)
 * - Sem peso → mascote genérico
 */

export type PorteKey = 'pequeno' | 'medio' | 'grande';

export function getPorteFromPeso(peso: number): PorteKey {
  if (peso < 10) return 'pequeno';
  if (peso < 25) return 'medio';
  return 'grande';
}

export function labelPorte(porte: PorteKey): string {
  if (porte === 'pequeno') return 'Pequeno';
  if (porte === 'medio') return 'Médio';
  return 'Grande';
}

/** Arquivos em /public/icons/3d/breeds/ */
const FALLBACK: Record<PorteKey, string> = {
  pequeno: '/icons/3d/breeds/fallback-pequeno.png',
  medio: '/icons/3d/breeds/fallback-medio.png',
  grande: '/icons/3d/breeds/fallback-grande.png',
};

const GENERIC = '/icons/3d/dog.png';

/**
 * Chave normalizada (minúsculas, sem acento extra, espaços colapsados)
 * → arquivo em public/icons/3d/breeds/
 */
const BREED_FILE: Record<string, string> = {
  // Vira-lata
  'mutt (vira-lata)': 'mutt.png',
  'mutt': 'mutt.png',
  'vira-lata': 'mutt.png',
  'vira lata': 'mutt.png',
  'srd': 'mutt.png',

  // Top BR
  'shih tzu': 'shih-tzu.png',
  'yorkshire terrier': 'yorkshire.png',
  'poodle (toy)': 'poodle-toy.png',
  'poodle (miniatura)': 'poodle-mini.png',
  'poodle (standard)': 'poodle-standard.png',
  'poodle': 'poodle-mini.png',
  'bulldog frances': 'french-bulldog.png',
  'bulldog francês': 'french-bulldog.png',
  'labrador retriever': 'labrador.png',
  'labrador': 'labrador.png',
  'golden retriever': 'golden.png',
  'golden': 'golden.png',
  'pinscher miniatura': 'pinscher.png',
  'miniature pinscher': 'pinscher.png',
  'maltes': 'maltese.png',
  'maltês': 'maltese.png',
  'pug': 'pug.png',
  'lhasa apso': 'lhasa.png',
  'pomerania (spitz alemao)': 'pomeranian.png',
  'pomerânia (spitz alemão)': 'pomeranian.png',
  'pomerania': 'pomeranian.png',
  'pomerânia': 'pomeranian.png',
  'spitz alemao': 'pomeranian.png',
  'spitz alemão': 'pomeranian.png',
  'border collie': 'border-collie.png',
  'rottweiler': 'rottweiler.png',
  'beagle': 'beagle.png',
  'dachshund (salsicha)': 'dachshund.png',
  'dachshund': 'dachshund.png',
  'salsicha': 'dachshund.png',
  'chihuahua': 'chihuahua.png',
  'husky siberiano': 'husky.png',
  'pit bull': 'pitbull.png',
  'boxer': 'boxer.png',
  'schnauzer (miniatura)': 'schnauzer-mini.png',
  'schnauzer miniatura': 'schnauzer-mini.png',
  'samoieda': 'samoyed.png',
  'bulldog ingles': 'english-bulldog.png',
  'bulldog inglês': 'english-bulldog.png',
  'cocker spaniel ingles': 'cocker.png',
  'cocker spaniel inglês': 'cocker.png',
  'cocker spaniel americano': 'cocker.png',
  'welsh corgi pembroke': 'corgi.png',
  'welsh corgi cardigan': 'corgi.png',
  'akita inu': 'akita.png',
  'shiba inu': 'shiba.png',
};

function normalizeBreed(raca: string): string {
  return raca
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos para match flexível
    .replace(/\s+/g, ' ');
}

/** Mapa com chaves já sem acento (montado 1x). */
const BREED_FILE_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(BREED_FILE).map(([k, v]) => [normalizeBreed(k), v])
);

function resolveBreedFile(raca: string): string | null {
  const noAccent = normalizeBreed(raca);
  if (!noAccent) return null;

  if (BREED_FILE_NORM[noAccent]) return BREED_FILE_NORM[noAccent];

  // match parcial: chave contida na raça (ex.: "poodle" em "poodle toy")
  // prioriza chaves mais longas para acertar "poodle (toy)" antes de "poodle"
  const keys = Object.keys(BREED_FILE_NORM).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (noAccent.includes(k) || k.includes(noAccent)) return BREED_FILE_NORM[k];
  }
  return null;
}

/**
 * Ícone do card Raça / avatar: prioriza raça top; senão porte; senão genérico.
 */
export function getBreedDogSrc(raca: string | null | undefined, peso?: number | null): string {
  if (raca) {
    const file = resolveBreedFile(raca);
    if (file) return `/icons/3d/breeds/${file}`;
  }
  if (peso != null && Number.isFinite(peso)) {
    return FALLBACK[getPorteFromPeso(peso)];
  }
  return GENERIC;
}

/**
 * Ícone do card Porte: sempre pelo peso (P/M/G).
 */
export function getPorteDogSrc(peso: number): string {
  return FALLBACK[getPorteFromPeso(peso)];
}

/** Lista das raças com arte dedicada (para preview / docs). */
export const TOP_BREED_ICON_KEYS = [
  'Mutt (Vira-lata)',
  'Shih Tzu',
  'Yorkshire Terrier',
  'Poodle (Toy)',
  'Poodle (Miniatura)',
  'Poodle (Standard)',
  'Bulldog Francês',
  'Labrador Retriever',
  'Golden Retriever',
  'Pinscher Miniatura',
  'Maltes',
  'Pug',
  'Lhasa Apso',
  'Pomerânia (Spitz Alemão)',
  'Border Collie',
  'Rottweiler',
  'Beagle',
  'Dachshund (Salsicha)',
  'Chihuahua',
  'Husky Siberiano',
  'Pit Bull',
  'Boxer',
  'Schnauzer (Miniatura)',
  'Samoieda',
  'Bulldog Inglês',
  'Cocker Spaniel Inglês',
  'Welsh Corgi Pembroke',
  'Akita Inu',
  'Shiba Inu',
] as const;
