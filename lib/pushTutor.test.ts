import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendPush = vi.fn();
vi.mock('@/lib/push', () => ({ sendPushNotification: (...a: unknown[]) => sendPush(...a) }));

const { enviarParaTutor } = await import('./pushTutor');

let tokens: { token: string }[] = [];
const apagados: string[] = [];
const admin = {
  from: () => ({
    select: () => ({ eq: async () => ({ data: tokens }) }),
    delete: () => ({ eq: async (_c: string, token: string) => void apagados.push(token) }),
  }),
} as never;

describe('enviarParaTutor', () => {
  beforeEach(() => {
    sendPush.mockReset().mockResolvedValue({ sent: true });
    tokens = [{ token: 'celular' }, { token: 'computador' }];
    apagados.length = 0;
  });

  it('manda para todos os aparelhos da pessoa', async () => {
    const r = await enviarParaTutor(admin, 'u1', 'Oi', 'Corpo', 'https://x/a');
    expect(sendPush).toHaveBeenCalledTimes(2);
    expect(sendPush.mock.calls.map((c) => c[0])).toEqual(['celular', 'computador']);
    expect(r).toEqual({ aparelhos: 2, enviados: 2, vencidos: 0 });
  });

  it('apaga só o aparelho vencido e entrega nos outros', async () => {
    sendPush.mockImplementation(async (token: string) =>
      token === 'computador' ? { sent: false, tokenInvalido: true } : { sent: true }
    );
    const r = await enviarParaTutor(admin, 'u1', 'Oi', 'Corpo');
    expect(apagados).toEqual(['computador']);
    expect(r).toEqual({ aparelhos: 2, enviados: 1, vencidos: 1 });
  });

  it('não faz nada quando a pessoa não tem aparelho', async () => {
    tokens = [];
    const r = await enviarParaTutor(admin, 'u1', 'Oi', 'Corpo');
    expect(sendPush).not.toHaveBeenCalled();
    expect(r).toEqual({ aparelhos: 0, enviados: 0, vencidos: 0 });
  });
});
