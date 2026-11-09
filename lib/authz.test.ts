import { afterEach, describe, expect, it, vi } from 'vitest';

const rpcMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({ rpc: rpcMock }),
  isAdmin: () => false,
}));
import { NextRequest } from 'next/server';
import {
  allowedTestEmail,
  clientIp,
  cronAuthorized,
  inspectHumanForm,
  rateLimit,
  rateLimitShared,
  resetRateLimitForTests,
  tokenMatches,
} from './authz';

describe('tokenMatches', () => {
  it('accepts a token that is in the allowed list', () => {
    expect(tokenMatches('secret-a', ['secret-a', 'secret-b'])).toBe(true);
  });

  it('rejects a wrong token even if the length matches', () => {
    expect(tokenMatches('secret-x', ['secret-a'])).toBe(false);
  });

  it('rejects when no token was sent or the list is empty', () => {
    expect(tokenMatches(null, ['secret-a'])).toBe(false);
    expect(tokenMatches('secret-a', [])).toBe(false);
    expect(tokenMatches('', ['secret-a'])).toBe(false);
  });
});

describe('rateLimit', () => {
  afterEach(() => {
    resetRateLimitForTests();
  });

  it('allows the first N hits and blocks the next with 429', () => {
    const opts = { limit: 2, windowMs: 60_000 };
    expect(rateLimit('ip:1', opts)).toBeNull();
    expect(rateLimit('ip:1', opts)).toBeNull();
    const blocked = rateLimit('ip:1', opts);
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
  });

  it('does not share the bucket across different keys', () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit('ip:a', opts)).toBeNull();
    expect(rateLimit('ip:b', opts)).toBeNull();
  });
});

describe('clientIp', () => {
  it('uses the first x-forwarded-for hop', () => {
    const req = new NextRequest('http://localhost/api/x', {
      headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
    });
    expect(clientIp(req)).toBe('203.0.113.9');
  });
});

describe('allowedTestEmail', () => {
  it('only allows addresses in the staff list', () => {
    expect(allowedTestEmail('massini.guih@gmail.com', ['massini.guih@gmail.com'])).toBe(true);
    expect(allowedTestEmail('stranger@example.com', ['massini.guih@gmail.com'])).toBe(false);
  });
});

describe('inspectHumanForm', () => {
  const now = 1_000_000;

  it('rejects a filled honeypot as a bot', () => {
    expect(inspectHumanForm({ companyFax: 'http://spam', formStartedAt: now - 5000, now })).toBe('bot');
  });

  it('rejects a form submitted in under two seconds', () => {
    expect(inspectHumanForm({ companyFax: '', formStartedAt: now - 200, now })).toBe('too_fast');
  });

  it('accepts a slow empty-honeypot submit', () => {
    expect(inspectHumanForm({ companyFax: '', formStartedAt: now - 5000, now })).toBe('ok');
  });
});

describe('cronAuthorized', () => {
  it('rejects when the secret is missing or the bearer does not match', () => {
    const req = new NextRequest('http://localhost/api/cron/vaccine-reminders', {
      headers: { authorization: 'Bearer nope' },
    });
    expect(cronAuthorized(req, '')).toBe(false);
    expect(cronAuthorized(req, 'good-secret')).toBe(false);
  });

  it('accepts the matching bearer token', () => {
    const req = new NextRequest('http://localhost/api/cron/vaccine-reminders', {
      headers: { authorization: 'Bearer good-secret' },
    });
    expect(cronAuthorized(req, 'good-secret')).toBe(true);
  });
});

describe('rateLimitShared', () => {
  afterEach(() => {
    rpcMock.mockReset();
    resetRateLimitForTests();
  });

  const opts = { limit: 2, windowMs: 60_000 };

  it('lets the request through when the shared counter says 0', async () => {
    rpcMock.mockResolvedValue({ data: 0, error: null });
    expect(await rateLimitShared('k', opts)).toBeNull();
    expect(rpcMock).toHaveBeenCalledWith('rate_limit_hit', { p_key: 'k', p_limit: 2, p_window_seconds: 60 });
  });

  it('blocks with 429 and Retry-After when the shared counter is over the limit', async () => {
    rpcMock.mockResolvedValue({ data: 42, error: null });
    const res = await rateLimitShared('k', opts);
    expect(res?.status).toBe(429);
    expect(res?.headers.get('Retry-After')).toBe('42');
  });

  it('falls back to the in-memory limit when the database call fails', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'function rate_limit_hit does not exist' } });
    expect(await rateLimitShared('fb', opts)).toBeNull();
    expect(await rateLimitShared('fb', opts)).toBeNull();
    expect((await rateLimitShared('fb', opts))?.status).toBe(429);
  });
});
