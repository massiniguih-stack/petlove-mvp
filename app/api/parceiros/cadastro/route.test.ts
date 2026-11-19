import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const insertMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ insert: insertMock }) }),
}));
vi.mock('@/lib/resend', () => ({
  getResend: () => ({ emails: { send: vi.fn().mockResolvedValue({}) } }),
}));
vi.mock('@/lib/authz', () => ({
  clientIp: () => '127.0.0.1',
  rateLimitShared: vi.fn().mockResolvedValue(null),
  inspectHumanForm: () => 'human',
  verifyTurnstile: vi.fn().mockResolvedValue(true),
}));

const { POST } = await import('./route');

function request(body: unknown) {
  return new NextRequest('http://localhost:3000/api/parceiros/cadastro', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/parceiros/cadastro', () => {
  beforeEach(() => {
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
  });

  it('always enters new shops on the free plan, even if the form asks for premium', async () => {
    const res = await POST(
      request({
        nome: 'Pet Shop Teste',
        tipo: ['petshop'],
        email: 'loja@example.com',
        cidade: 'Maringá',
        aceiteTermos: true,
        premium: true,
        destaque: true,
      })
    );

    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledTimes(1);
    const row = insertMock.mock.calls[0][0];
    expect(row.premium).toBe(false);
    expect(row.destaque).toBe(false);
  });
});
