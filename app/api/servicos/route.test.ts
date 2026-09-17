import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://npqrhqivzaeprkpdhglu.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const eqMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: fromMock,
  }),
}));

const { GET } = await import('./route');

function request(cidade?: string) {
  const url = cidade
    ? `http://localhost:3000/api/servicos?cidade=${encodeURIComponent(cidade)}`
    : 'http://localhost:3000/api/servicos';
  return new NextRequest(url);
}

describe('GET /api/servicos', () => {
  beforeEach(() => {
    eqMock.mockReset();
    selectMock.mockReset();
    fromMock.mockReset();
    fromMock.mockReturnValue({ select: selectMock });
    selectMock.mockReturnValue({ eq: eqMock });
  });

  it('returns 503 with a human message when Supabase answers with Cloudflare HTML', async () => {
    eqMock.mockResolvedValue({
      data: null,
      error: {
        message:
          '<!DOCTYPE html><html><title>supabase.co | 521: Web server is down</title></html>',
      },
    });

    const res = await GET(request('Maringá'));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.code).toBe('SUPABASE_UNREACHABLE');
    expect(body.error).toBe(
      'O mapa está temporariamente indisponível. Tente de novo em alguns minutos.'
    );
    expect(body.error).not.toMatch(/DOCTYPE|521/i);
  });

  it('retries once when the first query fails with a network error', async () => {
    eqMock
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'TypeError: fetch failed' },
      })
      .mockResolvedValueOnce({
        data: [{ id: '1', nome: 'Amor Por Patas', cidade: 'Maringá' }],
        error: null,
      });

    const res = await GET(request('Maringá'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.servicos[0].nome).toBe('Amor Por Patas');
    expect(eqMock).toHaveBeenCalledTimes(2);
  });

  it('returns partners when the query succeeds', async () => {
    eqMock.mockResolvedValue({
      data: [{ id: '1', nome: 'Amor Por Patas', cidade: 'Maringá' }],
      error: null,
    });

    const res = await GET(request('Maringá'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.servicos).toHaveLength(1);
    expect(body.servicos[0].nome).toBe('Amor Por Patas');
  });
});
