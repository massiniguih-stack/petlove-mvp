import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(),
}));

const { updateSession } = await import('@/lib/supabase/middleware');
const { middleware } = await import('./middleware');

const KEYS = [
  'OPEN_ACCESS',
  'NEXT_PUBLIC_OPEN_ACCESS',
  'VERCEL_ENV',
  'NEXT_PUBLIC_VERCEL_ENV',
] as const;

function req(path: string) {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

describe('middleware OPEN_ACCESS lock', () => {
  const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const key of KEYS) snapshot[key] = process.env[key];
    for (const key of KEYS) delete process.env[key];
    vi.mocked(updateSession).mockResolvedValue({
      response: NextResponse.next(),
      isLoggedIn: false,
      email: null,
    });
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (snapshot[key] === undefined) delete process.env[key];
      else process.env[key] = snapshot[key];
    }
  });

  it('redirects /dashboard to login when the bypass is off', async () => {
    const res = await middleware(req('/dashboard'));
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirects /comparar to login when the bypass is off', async () => {
    const res = await middleware(req('/comparar'));
    expect(res.headers.get('location')).toContain('/login');
  });

  it('does not redirect /dashboard when OPEN_ACCESS=true locally', async () => {
    process.env.OPEN_ACCESS = 'true';
    const res = await middleware(req('/dashboard'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects /dashboard when OPEN_ACCESS=true on Vercel production', async () => {
    process.env.OPEN_ACCESS = 'true';
    process.env.VERCEL_ENV = 'production';
    const res = await middleware(req('/dashboard'));
    expect(res.headers.get('location')).toContain('/login');
  });
});
