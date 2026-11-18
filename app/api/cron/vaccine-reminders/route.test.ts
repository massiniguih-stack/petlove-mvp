import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const vacinas = vi.fn();
const marcarEnviado = vi.fn();
const tokenSalvo = vi.fn();
const sendEmail = vi.fn();
const sendPush = vi.fn();

vi.mock('@/lib/authz', () => ({ cronAuthorized: () => true }));
vi.mock('@/lib/emailFrom', () => ({ getEmailFrom: () => 'Patinha <oi@patinha.test>' }));
vi.mock('@/lib/appUrl', () => ({ getAppUrl: () => 'https://patinha.test' }));
vi.mock('@/lib/resend', () => ({ getResend: () => ({ emails: { send: sendEmail } }) }));
vi.mock('@/lib/push', () => ({ sendPushNotification: (...a: unknown[]) => sendPush(...a) }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (tabela: string) =>
      tabela === 'momento'
        ? {
            select: () => ({ eq: () => ({ eq: () => ({ is: () => ({ gte: () => ({ lte: vacinas }) }) }) }) }),
            update: () => ({ eq: marcarEnviado }),
          }
        : {
            select: () => ({ eq: () => ({ maybeSingle: tokenSalvo }) }),
            delete: () => ({ eq: vi.fn() }),
          },
  }),
}));

const { GET } = await import('./route');
const rodar = () => GET(new NextRequest('http://localhost/api/cron/vaccine-reminders'));

const vacina = (email: string | null) => ({
  id: 'm1', titulo: 'V10', data_agendada: '2026-11-20',
  pet: { nome: 'Mel', tutor: { id: 'u1', nome: 'Ana', email } },
});

describe('GET /api/cron/vaccine-reminders', () => {
  beforeEach(() => {
    vacinas.mockReset().mockResolvedValue({ data: [vacina('ana@x.com')], error: null });
    marcarEnviado.mockReset().mockResolvedValue({ error: null });
    tokenSalvo.mockReset().mockResolvedValue({ data: { token: 'tok' } });
    sendEmail.mockReset().mockResolvedValue({});
    sendPush.mockReset().mockResolvedValue({ sent: true });
  });

  it('manda e-mail e notificação e marca como enviado', async () => {
    const body = await (await rodar()).json();
    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendPush).toHaveBeenCalledOnce();
    expect(marcarEnviado).toHaveBeenCalledWith('id', 'm1');
    expect(body).toMatchObject({ enviados: 1, notificacoes: 1 });
  });

  it('manda a notificação mesmo se o e-mail falhar', async () => {
    sendEmail.mockRejectedValue(new Error('resend fora'));
    const body = await (await rodar()).json();
    expect(sendPush).toHaveBeenCalledOnce();
    expect(marcarEnviado).toHaveBeenCalled();
    expect(body).toMatchObject({ falhas: 1, notificacoes: 1 });
  });

  it('manda a notificação mesmo para tutor sem e-mail', async () => {
    vacinas.mockResolvedValue({ data: [vacina(null)], error: null });
    await rodar();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sendPush).toHaveBeenCalledOnce();
  });

  it('não marca como enviado se nenhum canal funcionou (tenta amanhã)', async () => {
    sendEmail.mockRejectedValue(new Error('resend fora'));
    sendPush.mockResolvedValue({ sent: false });
    await rodar();
    expect(marcarEnviado).not.toHaveBeenCalled();
  });
});
