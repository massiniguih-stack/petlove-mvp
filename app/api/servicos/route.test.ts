import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://npqrhqivzaeprkpdhglu.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const eqMock = vi.fn();
const neqMock = vi.fn();
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
    neqMock.mockReset();
    selectMock.mockReset();
    fromMock.mockReset();
    fromMock.mockReturnValue({ select: selectMock });
    selectMock.mockReturnValue({ neq: neqMock });
    neqMock.mockReturnValue({ eq: eqMock });
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

  it('sends free-plan shops with location only (no contact, hours, services or rating)', async () => {
    const completo = {
      tipo: 'petshop',
      endereco: 'Av. Brasil, 100',
      bairro: 'Zona 01',
      cidade: 'Maringá',
      lat: -23.42,
      lng: -51.93,
      telefone: '(44) 3000-0000',
      instagram: 'loja',
      website: 'https://loja.com',
      horario: '8h-18h',
      servicos: ['banho'],
      avaliacao: 4.8,
      plantao24h: true,
    };
    eqMock.mockResolvedValue({
      data: [
        { ...completo, id: '1', nome: 'Grátis', premium: false, destaque: false },
        { ...completo, id: '2', nome: 'Pago', premium: true, destaque: false },
        { ...completo, id: '3', nome: 'Destaque', premium: false, destaque: true },
      ],
      error: null,
    });

    const res = await GET(request('Maringá'));
    const body = await res.json();

    expect(body.servicos[0]).toEqual({
      id: '1',
      tipo: 'petshop',
      nome: 'Grátis',
      endereco: 'Av. Brasil, 100',
      bairro: 'Zona 01',
      cidade: 'Maringá',
      lat: -23.42,
      lng: -51.93,
    });
    expect(body.servicos[1].telefone).toBe('(44) 3000-0000');
    expect(body.servicos[1].instagram).toBe('loja');
    expect(body.servicos[2].horario).toBe('8h-18h');
    expect(selectMock.mock.calls[0][0]).not.toMatch(/whatsapp/);
  });

  it('keeps parks complete: they are public places, not shops with a plan', async () => {
    eqMock.mockResolvedValue({
      data: [{ id: '1', tipo: 'parque', nome: 'Parque do Ingá', premium: false, horario: '6h-22h', avaliacao: 4.9 }],
      error: null,
    });

    const res = await GET(request('Maringá'));
    const body = await res.json();

    expect(body.servicos[0].horario).toBe('6h-22h');
    expect(body.servicos[0].avaliacao).toBe(4.9);
  });

  it('hides self-registered partners that are still awaiting review', async () => {
    eqMock.mockResolvedValue({ data: [], error: null });

    await GET(request('Manaus'));

    expect(neqMock).toHaveBeenCalledWith('status', 'new_signup');
    expect(eqMock).toHaveBeenCalledWith('cidade', 'Manaus');
  });
});
