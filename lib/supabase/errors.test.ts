import { describe, expect, it } from 'vitest';
import { publicSupabaseFailure } from './errors';

describe('publicSupabaseFailure', () => {
  it('hides Cloudflare 521 HTML instead of leaking it to the client', () => {
    const html =
      '<!DOCTYPE html><html><title>supabase.co | 521: Web server is down</title><h1>Error code 521</h1></html>';

    const result = publicSupabaseFailure(html);

    expect(result.status).toBe(503);
    expect(result.code).toBe('SUPABASE_UNREACHABLE');
    expect(result.error).toBe(
      'O mapa está temporariamente indisponível. Tente de novo em alguns minutos.'
    );
    expect(result.error).not.toMatch(/DOCTYPE|521|Cloudflare/i);
  });

  it('treats fetch failed as unreachable, not as a 500 bug', () => {
    const result = publicSupabaseFailure(new Error('TypeError: fetch failed'));

    expect(result.status).toBe(503);
    expect(result.code).toBe('SUPABASE_UNREACHABLE');
    expect(result.error).not.toMatch(/TypeError|fetch failed/i);
  });

  it('keeps a short real database error', () => {
    const result = publicSupabaseFailure('column partners.foo does not exist');

    expect(result.status).toBe(500);
    expect(result.code).toBe('SUPABASE_ERROR');
    expect(result.error).toBe('column partners.foo does not exist');
  });
});
