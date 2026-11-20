import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const { requireAdminMock, carregarMock, TabelaAusenteErrorMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  carregarMock: vi.fn(),
  TabelaAusenteErrorMock: class extends Error {},
}));

vi.mock('@/lib/authz', () => ({ requireAdmin: requireAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}), ADMIN_EMAILS: [] }));
vi.mock('@/lib/admin/analytics/carregar', () => ({
  carregarAnalise: carregarMock,
  TabelaAusenteError: TabelaAusenteErrorMock,
}));

const { GET } = await import('./route');

function pedir(query = '') {
  return GET(new NextRequest(`http://localhost/api/admin/analytics${query}`));
}

describe('GET /api/admin/analytics', () => {
  beforeEach(() => {
    requireAdminMock.mockReset();
    carregarMock.mockReset();
    delete process.env.ANALISE_EXEMPLO;
    requireAdminMock.mockResolvedValue({ ok: true, user: { email: 'equipe@example.com' } });
  });

  it('repassa o bloqueio de quem não é admin', async () => {
    requireAdminMock.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await pedir('?periodo=30d');
    expect(res.status).toBe(401);
    expect(carregarMock).not.toHaveBeenCalled();
  });

  it('recusa período inválido', async () => {
    const res = await pedir('?periodo=1a');
    expect(res.status).toBe(400);
    expect(carregarMock).not.toHaveBeenCalled();
  });

  it('usa 30 dias quando não vem período', async () => {
    carregarMock.mockResolvedValue({ ok: 'analise' });
    const res = await pedir();
    expect(res.status).toBe(200);
    expect(carregarMock).toHaveBeenCalledWith({}, '30d');
    expect(await res.json()).toEqual({ ok: 'analise' });
  });

  it('avisa quando a migração não foi rodada', async () => {
    carregarMock.mockRejectedValue(new TabelaAusenteErrorMock());
    const res = await pedir('?periodo=7d');
    expect(res.status).toBe(503);
    expect((await res.json()).error).toContain('20261120_admin_eventos.sql');
  });

  it('erro qualquer vira 500', async () => {
    carregarMock.mockRejectedValue(new Error('boom'));
    const res = await pedir('?periodo=7d');
    expect(res.status).toBe(500);
  });

  it('modo exemplo desligado exige admin mesmo com ANALISE_EXEMPLO sem OPEN_ACCESS', async () => {
    process.env.ANALISE_EXEMPLO = '1';
    requireAdminMock.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await pedir('?periodo=7d');
    expect(res.status).toBe(401);
  });
});
