const FALLBACK = 'https://patinha-mvp.vercel.app';

/** Public origin of the app. Production: set NEXT_PUBLIC_APP_URL on Vercel. */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const url = raw && raw.length > 0 ? raw : FALLBACK;
  return url.replace(/\/$/, '');
}
