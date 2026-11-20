import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getUser = vi.fn();
const upsertMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser } }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ upsert: upsertMock }) }),
}));

const { POST } = await import('./route');

const salvar = (body: unknown) =>
  POST(new NextRequest('http://localhost/api/notifications/subscribe', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  }));

describe('POST /api/notifications/subscribe', () => {
  beforeEach(() => {
    getUser.mockReset().mockResolvedValue({ data: { user: { id: 'u1' } } });
    upsertMock.mockReset().mockResolvedValue({ error: null });
  });

  it('salva o token do aparelho da pessoa logada', async () => {
    const res = await salvar({ token: 'abc123' });
    expect(res.status).toBe(200);
    expect(upsertMock.mock.calls[0][0]).toMatchObject({ user_id: 'u1', token: 'abc123' });
  });

  it('guarda um registro por aparelho (celular e computador recebem)', async () => {
    await salvar({ token: 'abc123' });
    expect(upsertMock.mock.calls[0][1]).toEqual({ onConflict: 'token' });
  });

  it('recusa token vazio, que não é texto ou gigante', async () => {
    for (const token of ['', 42, 'x'.repeat(5000)]) {
      expect((await salvar({ token })).status).toBe(400);
    }
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('avisa o app quando o banco não salvou (antes respondia sucesso)', async () => {
    upsertMock.mockResolvedValue({ error: { message: 'relation does not exist' } });
    expect((await salvar({ token: 'abc123' })).status).toBe(500);
  });

  it('recusa quem não está logado', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await salvar({ token: 'abc123' })).status).toBe(401);
  });
});
