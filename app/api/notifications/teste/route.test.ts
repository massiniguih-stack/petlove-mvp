import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireUser = vi.fn();
const enviar = vi.fn();

vi.mock('@/lib/authz', () => ({
  requireUser: () => requireUser(),
  rateLimitShared: async () => null,
}));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/lib/pushTutor', () => ({ enviarParaTutor: (...a: unknown[]) => enviar(...a) }));
vi.mock('@/lib/appUrl', () => ({ getAppUrl: () => 'https://patinha.test' }));

const { POST } = await import('./route');

describe('POST /api/notifications/teste', () => {
  beforeEach(() => {
    requireUser.mockReset().mockResolvedValue({ ok: true, user: { id: 'u1' } });
    enviar.mockReset().mockResolvedValue({ aparelhos: 2, enviados: 2, vencidos: 0 });
  });

  it('manda o teste para todos os aparelhos da própria pessoa', async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ enviado: true, aparelhos: 2 });
    expect(enviar).toHaveBeenCalledWith({}, 'u1', expect.any(String), expect.any(String), 'https://patinha.test/dashboard');
  });

  it('explica quando nenhum aparelho ativou', async () => {
    enviar.mockResolvedValue({ aparelhos: 0, enviados: 0, vencidos: 0 });
    expect((await POST()).status).toBe(404);
  });

  it('pede para ativar de novo quando todos os endereços venceram', async () => {
    enviar.mockResolvedValue({ aparelhos: 1, enviados: 0, vencidos: 1 });
    expect((await POST()).status).toBe(410);
  });

  it('avisa quando o servidor não consegue enviar', async () => {
    enviar.mockResolvedValue({ aparelhos: 1, enviados: 0, vencidos: 0 });
    expect((await POST()).status).toBe(503);
  });

  it('recusa quem não está logado', async () => {
    requireUser.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) });
    expect((await POST()).status).toBe(401);
  });
});
