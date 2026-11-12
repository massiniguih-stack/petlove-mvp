import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('resend', () => ({
  Resend: class {
    constructor(public key: string) {}
  },
}));

import { getResend } from './resend';

describe('getResend', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('não quebra ao importar sem a chave; só reclama na hora de enviar', () => {
    vi.stubEnv('RESEND_API_KEY', '');
    expect(() => getResend()).toThrow('RESEND_API_KEY não configurada');
  });

  it('cria o cliente com a chave e reaproveita o mesmo', () => {
    vi.stubEnv('RESEND_API_KEY', 're_abc');
    const first = getResend();
    expect((first as unknown as { key: string }).key).toBe('re_abc');
    expect(getResend()).toBe(first);
  });
});
