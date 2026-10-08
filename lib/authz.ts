import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/admin';

type GateOk = { ok: true; user: User };
type GateNo = { ok: false; response: NextResponse };

const buckets = new Map<string, { count: number; resetAt: number }>();

export function tokenMatches(provided: string | null, allowed: string[]): boolean {
  if (!provided || allowed.length === 0) return false;
  const incoming = Buffer.from(provided);
  return allowed.some((token) => {
    const expected = Buffer.from(token);
    if (incoming.length !== expected.length) return false;
    return timingSafeEqual(incoming, expected);
  });
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): NextResponse | null {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }
  current.count += 1;
  if (current.count > opts.limit) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Espere um pouco e tente de novo.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)) } }
    );
  }
  return null;
}

export function resetRateLimitForTests() {
  buckets.clear();
}

export function allowedTestEmail(to: string, staff: string[]): boolean {
  const target = to.trim().toLowerCase();
  return staff.some((email) => email.trim().toLowerCase() === target);
}

const MIN_FORM_MS = 2_000;
const MAX_FORM_MS = 24 * 60 * 60 * 1000;

export function inspectHumanForm(input: {
  companyFax?: string | null;
  formStartedAt?: number | null;
  now?: number;
}): 'ok' | 'bot' | 'too_fast' {
  if (typeof input.companyFax === 'string' && input.companyFax.trim() !== '') {
    return 'bot';
  }
  const now = input.now ?? Date.now();
  const started = input.formStartedAt;
  if (typeof started !== 'number' || !Number.isFinite(started)) return 'too_fast';
  const elapsed = now - started;
  if (elapsed < MIN_FORM_MS || elapsed > MAX_FORM_MS) return 'too_fast';
  return 'ok';
}

export function cronAuthorized(req: NextRequest, secret = process.env.CRON_SECRET || ''): boolean {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return tokenMatches(token, secret ? [secret] : []);
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function requireUser(): Promise<GateOk | GateNo> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, user };
}

export async function requireAdmin(): Promise<GateOk | GateNo> {
  const gate = await requireUser();
  if (!gate.ok) return gate;
  if (!isAdmin(gate.user.email)) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return gate;
}
