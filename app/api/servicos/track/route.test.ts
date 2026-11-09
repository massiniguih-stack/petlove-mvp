import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const insertMock = vi.fn();
const partnerLookup = vi.fn();
const rpcMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  isAdmin: () => false,
  getSupabaseAdmin: () => ({
    rpc: rpcMock,
    from: (table: string) => {
      if (table === 'partners') {
        return { select: () => ({ eq: () => ({ maybeSingle: partnerLookup }) }) };
      }
      return { insert: insertMock };
    },
  }),
}));

const { POST } = await import('./route');
const { resetRateLimitForTests } = await import('@/lib/authz');

const PARTNER = '3f2c1a9e-8b7d-4c6e-9f10-1a2b3c4d5e6f';

function track(body: unknown, ip = '1.1.1.1') {
  return POST(
    new NextRequest('http://localhost/api/servicos/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    })
  );
}

describe('POST /api/servicos/track', () => {
  beforeEach(() => {
    insertMock.mockReset().mockResolvedValue({ error: null });
    partnerLookup.mockReset().mockResolvedValue({ data: { id: PARTNER, status: 'pending' } });
    // Força o fallback em memória (como se a migração não existisse).
    rpcMock.mockReset().mockResolvedValue({ data: null, error: { message: 'missing' } });
    resetRateLimitForTests();
  });

  it('rejects ids that are not UUIDs', async () => {
    const res = await track({ partnerId: 'nao-e-uuid', eventType: 'view' });
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('records a view for a visible partner', async () => {
    const res = await track({ partnerId: PARTNER, eventType: 'view' });
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledWith({ partner_id: PARTNER, event_type: 'view' });
  });

  it('counts the same person viewing the same partner only once per window', async () => {
    await track({ partnerId: PARTNER, eventType: 'view' });
    await track({ partnerId: PARTNER, eventType: 'view' });
    await track({ partnerId: PARTNER, eventType: 'view' });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it('ignores partners that do not exist or are awaiting review', async () => {
    partnerLookup.mockResolvedValueOnce({ data: null });
    await track({ partnerId: PARTNER, eventType: 'view' }, '2.2.2.2');
    partnerLookup.mockResolvedValueOnce({ data: { id: PARTNER, status: 'new_signup' } });
    await track({ partnerId: PARTNER, eventType: 'whatsapp_click' }, '3.3.3.3');
    expect(insertMock).not.toHaveBeenCalled();
  });
});
