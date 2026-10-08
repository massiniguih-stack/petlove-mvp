const HUMAN_UNREACHABLE =
  'O mapa está temporariamente indisponível. Tente de novo em alguns minutos.';

function rawMessage(raw: unknown): string {
  if (raw instanceof Error) return raw.message;
  if (typeof raw === 'string') return raw;
  if (raw == null) return '';
  return String(raw);
}

function looksUnreachable(message: string): boolean {
  const text = message.toLowerCase();
  return (
    !message.trim() ||
    text.includes('<!doctype') ||
    text.includes('<html') ||
    text.includes('error code 521') ||
    text.includes('web server is down') ||
    text.includes('fetch failed') ||
    text.includes('econnrefused') ||
    text.includes('enotfound') ||
    message.length > 180
  );
}

export function publicSupabaseFailure(raw: unknown): {
  error: string;
  code: string;
  status: number;
} {
  const message = rawMessage(raw);

  if (looksUnreachable(message)) {
    return {
      error: HUMAN_UNREACHABLE,
      code: 'SUPABASE_UNREACHABLE',
      status: 503,
    };
  }

  return {
    error: message,
    code: 'SUPABASE_ERROR',
    status: 500,
  };
}

export async function withOneRetry<T>(
  fn: () => Promise<T>,
  shouldRetry: (value: T) => boolean
): Promise<T> {
  const first = await fn();
  if (!shouldRetry(first)) return first;
  return fn();
}
