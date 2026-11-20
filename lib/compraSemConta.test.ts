import { describe, expect, it, vi } from 'vitest';
import { resgatarComprasSemConta } from './compraSemConta';

type Compra = {
  id: string;
  plan_type: string;
  plan_category: 'tutor' | 'partner';
  status: string;
  provider_subscription_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

function compra(parcial: Partial<Compra> = {}): Compra {
  return {
    id: 'c1',
    plan_type: 'tutor_monthly',
    plan_category: 'tutor',
    status: 'active',
    provider_subscription_id: 'sub_123',
    current_period_end: '2026-12-20T00:00:00Z',
    cancel_at_period_end: false,
    ...parcial,
  };
}

function supabaseFalso({
  compras = [] as Compra[],
  assinaturaAtual = null as { status: string } | null,
  erroUpsert = null as unknown,
} = {}) {
  const upsert = vi.fn(async () => ({ error: erroUpsert }));
  const apagar = vi.fn(async () => ({ error: null }));
  const emailConsultado = vi.fn();
  const supabase = {
    from: (tabela: string) => {
      if (tabela === 'compras_sem_conta') {
        return {
          select: () => ({
            eq: async (_coluna: string, valor: string) => {
              emailConsultado(valor);
              return { data: compras, error: null };
            },
          }),
          delete: () => ({ eq: apagar }),
        };
      }
      if (tabela === 'subscriptions') {
        return {
          select: () => ({
            eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: assinaturaAtual }) }) }),
          }),
          upsert,
        };
      }
      throw new Error(`tabela inesperada: ${tabela}`);
    },
  };
  return { supabase, upsert, apagar, emailConsultado };
}

describe('resgatarComprasSemConta', () => {
  it('passa a compra guardada para a conta e apaga da fila', async () => {
    const { supabase, upsert, apagar, emailConsultado } = supabaseFalso({ compras: [compra()] });
    const n = await resgatarComprasSemConta(supabase, { id: 'u1', email: '  Ana@Gmail.COM ' });
    expect(n).toBe(1);
    expect(emailConsultado).toHaveBeenCalledWith('ana@gmail.com');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        status: 'active',
        plan_type: 'tutor_monthly',
        plan_category: 'tutor',
        provider_subscription_id: 'sub_123',
      }),
      { onConflict: 'user_id,plan_category' },
    );
    expect(apagar).toHaveBeenCalledWith('id', 'c1');
  });

  it('não faz nada quando não há compra guardada', async () => {
    const { supabase, upsert } = supabaseFalso();
    expect(await resgatarComprasSemConta(supabase, { id: 'u1', email: 'a@b.com' })).toBe(0);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('não derruba uma assinatura ativa com uma compra estornada antiga', async () => {
    const { supabase, upsert, apagar } = supabaseFalso({
      compras: [compra({ status: 'canceled' })],
      assinaturaAtual: { status: 'active' },
    });
    expect(await resgatarComprasSemConta(supabase, { id: 'u1', email: 'a@b.com' })).toBe(0);
    expect(upsert).not.toHaveBeenCalled();
    expect(apagar).toHaveBeenCalledWith('id', 'c1');
  });

  it('mantém a compra guardada se não conseguir gravar (tenta de novo depois)', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { supabase, apagar } = supabaseFalso({ compras: [compra()], erroUpsert: { message: 'x' } });
    expect(await resgatarComprasSemConta(supabase, { id: 'u1', email: 'a@b.com' })).toBe(0);
    expect(apagar).not.toHaveBeenCalled();
    erro.mockRestore();
  });

  it('ignora conta sem e-mail', async () => {
    const { supabase, emailConsultado } = supabaseFalso({ compras: [compra()] });
    expect(await resgatarComprasSemConta(supabase, { id: 'u1', email: null })).toBe(0);
    expect(emailConsultado).not.toHaveBeenCalled();
  });
});
