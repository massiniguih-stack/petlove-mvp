import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getUser = vi.fn();
const upsertMock = vi.fn();
const assinaturaAtual = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      upsert: upsertMock,
      select: () => ({
        eq: () => ({ eq: () => ({ in: () => ({ limit: () => ({ maybeSingle: assinaturaAtual }) }) }) }),
      }),
    }),
  }),
}));

vi.mock('@/lib/lastlink', () => ({
  isValidPlanType: (p: string) => ['tutor_monthly', 'tutor_annual', 'partner_basic'].includes(p),
  planCategory: (p: string) => (p.startsWith('tutor') ? 'tutor' : 'partner'),
  getLastlinkCheckoutUrl: () => 'https://lastlink.com/p/teste',
}));

const { POST } = await import('./route');

function checkout(planType: string) {
  return POST(
    new NextRequest('http://localhost/api/lastlink/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planType }),
    }),
  );
}

describe('POST /api/lastlink/checkout', () => {
  beforeEach(() => {
    getUser.mockReset().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    upsertMock.mockReset().mockResolvedValue({ error: null });
    assinaturaAtual.mockReset().mockResolvedValue({ data: null, error: null });
  });

  it('abre o checkout para quem ainda não é assinante', async () => {
    const res = await checkout('tutor_monthly');
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe('https://lastlink.com/p/teste');
    expect(upsertMock).toHaveBeenCalledOnce();
  });

  it('recusa e NÃO sobrescreve a assinatura de quem já é Premium', async () => {
    assinaturaAtual.mockResolvedValue({ data: { status: 'active' }, error: null });
    const res = await checkout('tutor_annual');
    expect(res.status).toBe(409);
    expect((await res.json()).jaAssinante).toBe(true);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('recusa quem não está logado', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await checkout('tutor_monthly')).status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
