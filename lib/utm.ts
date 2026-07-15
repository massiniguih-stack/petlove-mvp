const UTM_KEY = 'petlove_utm';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const UTM_FIELDS: (keyof UtmParams)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

// Primeiro toque: só grava se ainda não houver UTM salvo, para atribuir o
// cadastro ao canal que realmente trouxe a pessoa pela primeira vez, mesmo
// que ela volte depois por outro link (ex: digitando a URL direto).
export function captureUtmParams(search: string) {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(UTM_KEY)) return;

  const params = new URLSearchParams(search);
  const utm: UtmParams = {};
  let hasAny = false;
  for (const field of UTM_FIELDS) {
    const value = params.get(field);
    if (value) {
      utm[field] = value;
      hasAny = true;
    }
  }
  if (!hasAny) return;

  localStorage.setItem(UTM_KEY, JSON.stringify(utm));
}

export function getUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
