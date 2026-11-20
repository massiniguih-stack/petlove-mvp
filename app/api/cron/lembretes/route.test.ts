import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const cronAuth = vi.fn();
const sendPush = vi.fn();
const updates: { tabela: string; valores: unknown }[] = [];
const deletes: string[] = [];

let lembretes: unknown[] = [];
let feitos: unknown[] = [];
let subs: unknown[] = [];
let segredo: string | null = 'segredo-do-banco';
let reservaOk = true;

// Imitação simples do cliente do Supabase: qualquer filtro devolve a própria
// consulta, e o resultado depende da tabela e de ser leitura ou escrita.
function consulta(tabela: string) {
  let modo: 'ler' | 'atualizar' | 'apagar' = 'ler';
  const resultado = () => {
    if (modo === 'apagar') return { data: null, error: null };
    if (tabela === 'lembrete_rotina') {
      if (modo === 'atualizar') return { data: reservaOk ? [{ id: 'x' }] : [], error: null };
      return { data: lembretes, error: null };
    }
    if (tabela === 'checklist_item') return { data: feitos, error: null };
    if (tabela === 'push_subscriptions') return { data: subs, error: null };
    return { data: null, error: null };
  };
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'or', 'in', 'is']) q[m] = () => q;
  q.update = (valores: unknown) => {
    modo = 'atualizar';
    updates.push({ tabela, valores });
    return q;
  };
  q.delete = () => {
    modo = 'apagar';
    deletes.push(tabela);
    return q;
  };
  q.maybeSingle = async () => (tabela === 'app_segredo' ? { data: segredo ? { valor: segredo } : null } : resultado());
  q.then = (ok: (v: unknown) => unknown, erro: (e: unknown) => unknown) => Promise.resolve(resultado()).then(ok, erro);
  return q;
}

vi.mock('@/lib/authz', () => ({ cronAuthorized: (...a: unknown[]) => cronAuth(...a) }));
vi.mock('@/lib/appUrl', () => ({ getAppUrl: () => 'https://patinha.test' }));
vi.mock('@/lib/push', () => ({ sendPushNotification: (...a: unknown[]) => sendPush(...a) }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({ from: consulta }) }));

const { GET } = await import('./route');
const rodar = (auth = 'Bearer x') =>
  GET(new NextRequest('http://localhost/api/cron/lembretes', { headers: auth ? { authorization: auth } : {} }));

const passeio = (extra: Record<string, unknown> = {}) => ({
  id: 'l1', pet_id: 'p1', lista: 'atividade', nome: 'Passeio matinal', hora: '07:00',
  ultimo_envio_dia: '2026-11-18', pet: { nome: 'Mel', tutor_id: 'u1' }, ...extra,
});

describe('GET /api/cron/lembretes', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-19T09:50:00Z')); // 06:50 em Brasília
    cronAuth.mockReset().mockReturnValue(true);
    sendPush.mockReset().mockResolvedValue({ sent: true });
    updates.length = 0;
    deletes.length = 0;
    lembretes = [passeio()];
    feitos = [];
    subs = [{ user_id: 'u1', token: 'tok-1' }];
    segredo = 'segredo-do-banco';
    reservaOk = true;
  });
  afterEach(() => vi.useRealTimers());

  it('avisa 10 min antes e marca como avisado hoje', async () => {
    const res = await rodar();
    const body = await res.json();
    expect(body.enviados).toBe(1);
    expect(sendPush).toHaveBeenCalledWith(
      'tok-1',
      'Passeio matinal de Mel em 10 min 🐾',
      'Compromisso das 07:00 na rotina de Mel.',
      'https://patinha.test/atividades'
    );
    expect(updates).toEqual([{ tabela: 'lembrete_rotina', valores: { ultimo_envio_dia: '2026-11-19' } }]);
  });

  it('não avisa compromisso fora da janela', async () => {
    lembretes = [passeio({ hora: '09:00' })];
    const body = await (await rodar()).json();
    expect(body.total).toBe(0);
    expect(sendPush).not.toHaveBeenCalled();
  });

  it('não avisa o que já foi feito hoje', async () => {
    feitos = [{ pet_id: 'p1', lista: 'atividade', nome: 'Passeio matinal', hora: '07:00' }];
    const body = await (await rodar()).json();
    expect(body.pulados).toBe(1);
    expect(sendPush).not.toHaveBeenCalled();
  });

  it('não manda repetido se outra execução já reservou', async () => {
    reservaOk = false;
    await rodar();
    expect(sendPush).not.toHaveBeenCalled();
  });

  it('libera para tentar de novo se o envio falhar', async () => {
    sendPush.mockResolvedValue({ sent: false });
    const body = await (await rodar()).json();
    expect(body.falhas).toBe(1);
    expect(updates.at(-1)).toEqual({ tabela: 'lembrete_rotina', valores: { ultimo_envio_dia: '2026-11-18' } });
  });

  it('apaga o aparelho quando o token venceu', async () => {
    sendPush.mockResolvedValue({ sent: false, tokenInvalido: true });
    await rodar();
    expect(deletes).toEqual(['push_subscriptions']);
  });

  it('aceita o token guardado no banco (chamada do pg_cron)', async () => {
    cronAuth.mockImplementation((_req: unknown, secret?: string) => secret === 'segredo-do-banco');
    const res = await rodar('Bearer segredo-do-banco');
    expect(res.status).toBe(200);
  });

  it('recusa quem não tem token', async () => {
    cronAuth.mockReturnValue(false);
    const res = await rodar('');
    expect(res.status).toBe(401);
    expect(sendPush).not.toHaveBeenCalled();
  });
});
