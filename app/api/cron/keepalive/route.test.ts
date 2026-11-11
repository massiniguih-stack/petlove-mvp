import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const selectMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  isAdmin: () => false,
  getSupabaseAdmin: () => ({ from: () => ({ select: selectMock }) }),
}));

const { GET } = await import('./route');
const { resetRateLimitForTests } = await import('@/lib/authz');

function call(headers: Record<string, string> = {}, ip = '9.9.9.9') {
  return GET(
    new NextRequest('http://localhost/api/cron/keepalive', {
      headers: { 'x-forwarded-for': ip, ...headers },
    })
  );
}

describe('GET /api/cron/keepalive', () => {
  beforeEach(() => {
    selectMock.mockReset().mockResolvedValue({ error: null, count: 5 });
    resetRateLimitForTests();
    delete process.env.CRON_SECRET;
  });

  it('touches the database and answers ok', async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(selectMock).toHaveBeenCalledWith('id', { count: 'exact', head: true });
  });

  it('returns 503 when Supabase does not answer', async () => {
    selectMock.mockResolvedValue({ error: { message: '521' } });
    const res = await call();
    expect(res.status).toBe(503);
  });

  it('requires the cron token when CRON_SECRET is configured', async () => {
    process.env.CRON_SECRET = 'segredo';
    expect((await call()).status).toBe(401);
    expect((await call({ authorization: 'Bearer segredo' })).status).toBe(200);
  });

  it('limits repeated calls per IP when there is no CRON_SECRET', async () => {
    for (let i = 0; i < 5; i++) expect((await call()).status).toBe(200);
    expect((await call()).status).toBe(429);
    expect(selectMock).toHaveBeenCalledTimes(5);
  });
});
