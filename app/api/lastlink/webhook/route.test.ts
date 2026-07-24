import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

process.env.LASTLINK_WEBHOOK_TOKEN = 'test-token';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

const listUsersMock = vi.fn();
const fromMock = vi.fn();
const upsertMock = vi.fn();
const partnersUpdateMock = vi.fn();
const partnersEqMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { admin: { listUsers: listUsersMock } },
    from: fromMock,
  })),
}));

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const { POST } = await import('./route');

interface SupabaseMockOptions {
  users?: Array<{ id: string; email: string }>;
  products?: Array<{ plan_type: string; price: number | null }>;
  upsertError?: unknown;
  partnerCount?: number | null;
  partnerError?: unknown;
}

function setupSupabaseMock({
  users = [],
  products = [],
  upsertError = null,
  partnerCount = 1,
  partnerError = null,
}: SupabaseMockOptions = {}) {
  listUsersMock.mockResolvedValue({ data: { users } });
  upsertMock.mockResolvedValue({ error: upsertError });
  partnersEqMock.mockResolvedValue({ error: partnerError, count: partnerCount });
  partnersUpdateMock.mockImplementation(() => ({ eq: partnersEqMock }));

  fromMock.mockImplementation((table: string) => {
    if (table === 'lastlink_products') {
      return { select: () => ({ eq: () => Promise.resolve({ data: products }) }) };
    }
    if (table === 'subscriptions') {
      return { upsert: upsertMock };
    }
    if (table === 'partners') {
      return { update: partnersUpdateMock };
    }
    throw new Error(`Unexpected table: ${table}`);
  });
}

function buildRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/lastlink/webhook', {
    method: 'POST',
    headers: { 'x-webhook-token': 'test-token', 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function baseEvent(overrides: { Event?: string; IsTest?: boolean; Data?: Record<string, unknown> } = {}) {
  const { Data: dataOverrides, ...rest } = overrides;
  return {
    Id: 'evt_1',
    IsTest: false,
    Event: 'Purchase_Order_Confirmed',
    CreatedAt: '2026-07-22T00:00:00Z',
    Data: {
      Products: [{ Id: 'prod_1', Name: 'Tutor mensal', Price: { Value: 29.9 } }],
      Buyer: { Email: 'tutor@example.com', Name: 'Tutor' },
      Purchase: { PaymentDate: '2026-07-22T00:00:00Z', Price: { Value: 29.9 } },
      ...dataOverrides,
    },
    ...rest,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/lastlink/webhook', () => {
  it('rejects requests with a missing or wrong webhook token', async () => {
    setupSupabaseMock();
    const res = await POST(buildRequest(baseEvent(), { 'x-webhook-token': 'wrong' }));
    expect(res.status).toBe(401);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('acknowledges test events without touching the database', async () => {
    setupSupabaseMock();
    const res = await POST(buildRequest(baseEvent({ IsTest: true })));
    const json = await res.json();
    expect(json).toEqual({ received: true, test: true });
    expect(listUsersMock).not.toHaveBeenCalled();
  });

  it('rejects events with no buyer email', async () => {
    setupSupabaseMock();
    const res = await POST(buildRequest(baseEvent({ Data: { Buyer: undefined } })));
    expect(res.status).toBe(400);
  });

  it('acknowledges but does not upsert when no matching user is found', async () => {
    setupSupabaseMock({ users: [] });
    const res = await POST(buildRequest(baseEvent()));
    const json = await res.json();
    expect(json).toEqual({ received: true });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('activates a tutor subscription on Purchase_Order_Confirmed and sends the welcome email', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'tutor@example.com' }],
      products: [{ plan_type: 'tutor_monthly', price: 29.9 }],
    });

    const res = await POST(buildRequest(baseEvent()));
    expect(res.status).toBe(200);

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        status: 'active',
        plan_type: 'tutor_monthly',
        plan_category: 'tutor',
      }),
      { onConflict: 'user_id,plan_category' }
    );
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toMatchObject({ to: 'tutor@example.com' });
  });

  it('disambiguates same product_id by price when multiple plans match', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'tutor@example.com' }],
      products: [
        { plan_type: 'tutor_monthly', price: 29.9 },
        { plan_type: 'tutor_annual', price: 299 },
      ],
    });

    const res = await POST(buildRequest(baseEvent({
      Data: { Purchase: { Price: { Value: 300 } } },
    })));
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ plan_type: 'tutor_annual' }),
      { onConflict: 'user_id,plan_category' }
    );
  });

  it('marks the subscription canceled on Subscription_Canceled without sending an email', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'tutor@example.com' }],
      products: [{ plan_type: 'tutor_monthly', price: 29.9 }],
    });

    const res = await POST(buildRequest(baseEvent({ Event: 'Subscription_Canceled' })));
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'canceled', cancel_at_period_end: false }),
      { onConflict: 'user_id,plan_category' }
    );
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('treats refunds and chargebacks as cancellations', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'tutor@example.com' }],
      products: [{ plan_type: 'tutor_monthly', price: 29.9 }],
    });

    const res = await POST(buildRequest(baseEvent({ Event: 'Payment_Chargeback' })));
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'canceled' }),
      { onConflict: 'user_id,plan_category' }
    );
  });

  it('activates partner premium+destaque for pro plan and links user_id', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'parceiro@example.com' }],
      products: [{ plan_type: 'partner_pro', price: 99 }],
    });

    const res = await POST(buildRequest(baseEvent({
      Data: { Buyer: { Email: 'parceiro@example.com', Name: 'Parceiro' } },
    })));
    expect(res.status).toBe(200);
    expect(partnersUpdateMock).toHaveBeenCalledWith(
      { premium: true, destaque: true, user_id: 'user-1' },
      { count: 'exact' }
    );
    expect(partnersEqMock).toHaveBeenCalledWith('email', 'parceiro@example.com');
  });

  it('activates partner premium without destaque for basic plan', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'basico@example.com' }],
      products: [{ plan_type: 'partner_basic', price: 39.8 }],
    });

    const res = await POST(buildRequest(baseEvent({
      Data: { Buyer: { Email: 'basico@example.com', Name: 'Basico' } },
    })));
    expect(res.status).toBe(200);
    expect(partnersUpdateMock).toHaveBeenCalledWith(
      { premium: true, destaque: false, user_id: 'user-1' },
      { count: 'exact' }
    );
  });

  it('returns 500 when the subscription upsert fails, without throwing', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'tutor@example.com' }],
      products: [{ plan_type: 'tutor_monthly', price: 29.9 }],
      upsertError: { message: 'db is down' },
    });

    const res = await POST(buildRequest(baseEvent()));
    expect(res.status).toBe(500);
  });

  it('acknowledges unknown event types without upserting', async () => {
    setupSupabaseMock({
      users: [{ id: 'user-1', email: 'tutor@example.com' }],
    });

    const res = await POST(buildRequest(baseEvent({ Event: 'Something_New' })));
    const json = await res.json();
    expect(json).toEqual({ received: true, event: 'Something_New' });
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
