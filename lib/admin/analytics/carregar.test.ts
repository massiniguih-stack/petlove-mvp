import { describe, expect, it, vi } from 'vitest';
import { buscarEmLotes } from './carregar';

describe('buscarEmLotes', () => {
  it('pede lotes de 1000 até vir um lote menor', async () => {
    const consulta = vi.fn(async (de: number) => ({
      data: Array.from({ length: de === 0 ? 1000 : 250 }, (_, i) => ({ n: de + i })),
      error: null,
    }));
    const linhas = await buscarEmLotes<{ n: number }>(consulta);
    expect(linhas).toHaveLength(1250);
    expect(consulta).toHaveBeenNthCalledWith(1, 0, 999);
    expect(consulta).toHaveBeenNthCalledWith(2, 1000, 1999);
  });

  it('repassa o erro do Supabase', async () => {
    const erro = { code: '42P01', message: 'relation does not exist' };
    await expect(buscarEmLotes(async () => ({ data: null, error: erro }))).rejects.toBe(erro);
  });
});
