import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { buscarEmLotes, carregarAnalise, TabelaAusenteError } from './carregar';

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

describe('carregarAnalise', () => {
  type Resp = { data?: unknown[] | null; error?: unknown; count?: number | null };

  function fakeSupabase(tabelas: Record<string, Resp>): SupabaseClient {
    return {
      from(tabela: string) {
        const resp = { data: [], error: null, count: 0, ...tabelas[tabela] };
        const cadeia: Record<string, unknown> = {
          then: (ok: (v: Resp) => unknown, ruim?: (e: unknown) => unknown) =>
            Promise.resolve(resp).then(ok, ruim),
        };
        for (const m of ['select', 'order', 'range', 'gte', 'in', 'eq']) cadeia[m] = () => cadeia;
        return cadeia;
      },
    } as unknown as SupabaseClient;
  }

  const agora = new Date('2026-11-20T15:00:00Z');
  const ev = (tipo: string, publico: string, id: string, quando = '2026-11-19T12:00:00Z') => ({
    ocorrido_em: quando,
    publico,
    tipo,
    entidade_id: id,
    detalhe: {},
    estimado: false,
  });

  it('tabela admin_eventos ausente vira TabelaAusenteError', async () => {
    const supabase = fakeSupabase({ admin_eventos: { data: null, error: { code: '42P01' } } });
    await expect(carregarAnalise(supabase, '7d', agora, [])).rejects.toBeInstanceOf(TabelaAusenteError);
  });

  it('compras sem conta entram na fila, e a tabela ausente não derruba a análise', async () => {
    const comCompras = await carregarAnalise(
      fakeSupabase({ compras_sem_conta: { count: 2 } }),
      '7d',
      agora,
      [],
    );
    expect(comCompras.fila.find((i) => i.id === 'compras-sem-conta')?.titulo).toBe('2 compras sem conta no app');

    const semTabela = await carregarAnalise(
      fakeSupabase({ compras_sem_conta: { count: null, error: { code: '42P01' } } }),
      '7d',
      agora,
      [],
    );
    expect(semTabela.fila.some((i) => i.id === 'compras-sem-conta')).toBe(false);
  });

  it('tira a equipe dos números, mas a fila ainda conta a empresa da equipe', async () => {
    const supabase = fakeSupabase({
      admin_eventos: {
        data: [
          ev('tutor_entrou', 'tutor', 't-equipe'),
          ev('tutor_entrou', 'tutor', 't-comum'),
          ev('empresa_entrou_mapa', 'empresa', 'p-equipe'),
          ev('empresa_entrou_mapa', 'empresa', 'p-comum'),
        ],
      },
      tutor: { data: [{ id: 't-equipe' }] },
      partners: {
        data: [
          { id: 'p-equipe', tipo: 'petshop', premium: false, user_id: 't-equipe', email: 'equipe@x.com', status: 'pending', telefone: null, whatsapp_contatado_em: null },
          { id: 'p-comum', tipo: 'petshop', premium: false, user_id: null, email: 'a@x.com', status: 'pending', telefone: null, whatsapp_contatado_em: null },
        ],
      },
    });
    const r = await carregarAnalise(supabase, '7d', agora, ['equipe@x.com']);
    expect(r.tutores.numeros.novos.valor).toBe(1);
    expect(r.empresas.numeros.entraram.valor).toBe(1);
    expect(r.empresas.porTipo.reduce((s, t) => s + t.total, 0)).toBe(1);
    const email = r.fila.find((f) => f.id === 'email');
    expect(email).toBeDefined();
    expect(email?.titulo).toContain('2');
  });

  it('tutor com dois pets conta uma vez no funil', async () => {
    const supabase = fakeSupabase({
      admin_eventos: { data: [ev('tutor_entrou', 'tutor', 't1')] },
      pet: {
        data: [
          { tutor_id: 't1', created_at: '2026-11-19T10:00:00' },
          { tutor_id: 't1', created_at: '2026-11-18T09:00:00' },
        ],
      },
    });
    const r = await carregarAnalise(supabase, '7d', agora, []);
    const etapa = r.tutores.funil.find((e) => e.nome === 'Cadastrou o 1º pet');
    expect(etapa?.total).toBe(1);
  });
});
