import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSupabaseAdmin } from './admin';

describe('getSupabaseAdmin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('nunca deixa o Next guardar a resposta do banco (cache no-store)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'chave-de-teste');
    const fetchFalso = vi.fn(async () =>
      new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchFalso);

    await getSupabaseAdmin().from('partners').select('id').eq('cidade', 'Maringá');

    expect(fetchFalso).toHaveBeenCalled();
    const init = fetchFalso.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.cache).toBe('no-store');
  });
});
