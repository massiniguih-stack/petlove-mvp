import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireUser = vi.fn();
const tokenSalvo = vi.fn();
const deleteMock = vi.fn();
const sendPush = vi.fn();

vi.mock('@/lib/authz', () => ({
  requireUser: () => requireUser(),
  rateLimitShared: async () => null,
}));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: tokenSalvo }) }),
      delete: () => ({ eq: deleteMock }),
    }),
  }),
}));
vi.mock('@/lib/push', () => ({ sendPushNotification: (...a: unknown[]) => sendPush(...a) }));
vi.mock('@/lib/appUrl', () => ({ getAppUrl: () => 'https://patinha.test' }));

const { POST } = await import('./route');

describe('POST /api/notifications/teste', () => {
  beforeEach(() => {
    requireUser.mockReset().mockResolvedValue({ ok: true, user: { id: 'u1' } });
    tokenSalvo.mockReset().mockResolvedValue({ data: { token: 'tok' } });
    deleteMock.mockReset().mockResolvedValue({ error: null });
    sendPush.mockReset().mockResolvedValue({ sent: true });
  });

  it('manda uma notificação de teste só para o aparelho da própria pessoa', async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(sendPush).toHaveBeenCalledWith('tok', expect.any(String), expect.any(String), 'https://patinha.test/dashboard');
  });

  it('explica quando o aparelho ainda não ativou', async () => {
    tokenSalvo.mockResolvedValue({ data: null });
    const res = await POST();
    expect(res.status).toBe(404);
    expect(sendPush).not.toHaveBeenCalled();
  });

  it('apaga o endereço vencido e pede para ativar de novo', async () => {
    sendPush.mockResolvedValue({ sent: false, tokenInvalido: true });
    const res = await POST();
    expect(res.status).toBe(410);
    expect(deleteMock).toHaveBeenCalledWith('user_id', 'u1');
  });

  it('avisa quando o servidor não consegue enviar', async () => {
    sendPush.mockResolvedValue({ sent: false });
    expect((await POST()).status).toBe(503);
  });

  it('recusa quem não está logado', async () => {
    requireUser.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) });
    expect((await POST()).status).toBe(401);
  });
});
