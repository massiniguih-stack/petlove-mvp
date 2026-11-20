import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const cronAuth = vi.fn();
const enviar = vi.fn();
const updates: { tabela: string; valores: unknown }[] = [];

let lembretes: unknown[] = [];
let feitos: unknown[] = [];
let segredo: string | null = 'segredo-do-banco';
let reservaOk = true;

// Imitação simples do cliente do Supabase: qualquer filtro devolve a própria
// consulta, e o resultado depende da tabela e de ser leitura ou escrita.
function consulta(tabela: string) {
  let modo: 'ler' | 'atualizar' = 'ler';
  const resultado = () => {
    if (tabela === 'lembrete_rotina') {
      if (modo === 'atualizar') return { data: reservaOk ? [{ id: 'x' }] : [], error: null };
      return { data: lembretes, error: null };
    }
    if (tabela === 'checklist_item') return { data: feitos, error: null };
    return { data: null, error: null };
  };
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'or', 'in', 'is']) q[m] = () => q;
  q.update = (valores: unknown) => {
    modo = 'atualizar';
    updates.push({ tabela, valores });
    return q;
  };
  q.maybeSingle = async () => (tabela === 'app_segredo' ? { data: segredo ? { valor: segredo } : null } : resultado());
  q.then = (ok: (v: unknown) => unknown, erro: (e: unknown) => unknown) => Promise.resolve(resultado()).then(ok, erro);
  return q;
}

vi.mock('@/lib/authz', () => ({ cronAuthorized: (...a: unknown[]) => cronAuth(...a) }));
vi.mock('@/lib/appUrl', () => ({ getAppUrl: () => 'https://patinha.test' }));
vi.mock('@/lib/pushTutor', () => ({ enviarParaTutor: (...a: unknown[]) => enviar(...a) }));
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
    enviar.mockReset().mockResolvedValue({ aparelhos: 2, enviados: 2, vencidos: 0 });
    updates.length = 0;
    lembretes = [passeio()];
    feitos = [];
    segredo = 'segredo-do-banco';
    reservaOk = true;
  });
  afterEach(() => vi.useRealTimers());

  it('avisa 10 min antes, em todos os aparelhos do tutor, e marca como avisado hoje', async () => {
    const res = await rodar();
    const body = await res.json();
    expect(body.enviados).toBe(1);
    expect(enviar).toHaveBeenCalledWith(
      expect.anything(),
      'u1',
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
    expect(enviar).not.toHaveBeenCalled();
  });

  it('não avisa o que já foi feito hoje', async () => {
    feitos = [{ pet_id: 'p1', lista: 'atividade', nome: 'Passeio matinal', hora: '07:00' }];
    const body = await (await rodar()).json();
    expect(body.pulados).toBe(1);
    expect(enviar).not.toHaveBeenCalled();
  });

  it('não manda repetido se outra execução já reservou', async () => {
    reservaOk = false;
    await rodar();
    expect(enviar).not.toHaveBeenCalled();
  });

  it('libera para tentar de novo se o envio falhar', async () => {
    enviar.mockResolvedValue({ aparelhos: 1, enviados: 0, vencidos: 0 });
    const body = await (await rodar()).json();
    expect(body.falhas).toBe(1);
    expect(updates.at(-1)).toEqual({ tabela: 'lembrete_rotina', valores: { ultimo_envio_dia: '2026-11-18' } });
  });

  it('não tenta de novo quando o tutor não tem aparelho válido', async () => {
    enviar.mockResolvedValue({ aparelhos: 1, enviados: 0, vencidos: 1 });
    const body = await (await rodar()).json();
    expect(body.pulados).toBe(1);
    expect(updates).toHaveLength(1);
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
    expect(enviar).not.toHaveBeenCalled();
  });
});
