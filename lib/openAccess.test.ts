import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isOpenAccess } from './openAccess';

const KEYS = [
  'OPEN_ACCESS',
  'NEXT_PUBLIC_OPEN_ACCESS',
  'VERCEL_ENV',
  'NEXT_PUBLIC_VERCEL_ENV',
] as const;

type EnvKey = (typeof KEYS)[number];

function setEnv(partial: Partial<Record<EnvKey, string | undefined>>) {
  for (const key of KEYS) {
    if (partial[key] === undefined) delete process.env[key];
    else process.env[key] = partial[key];
  }
}

describe('isOpenAccess', () => {
  const snapshot: Partial<Record<EnvKey, string | undefined>> = {};

  beforeEach(() => {
    for (const key of KEYS) snapshot[key] = process.env[key];
    setEnv({
      OPEN_ACCESS: undefined,
      NEXT_PUBLIC_OPEN_ACCESS: undefined,
      VERCEL_ENV: undefined,
      NEXT_PUBLIC_VERCEL_ENV: undefined,
    });
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (snapshot[key] === undefined) delete process.env[key];
      else process.env[key] = snapshot[key];
    }
  });

  it('returns false when no flags are set', () => {
    expect(isOpenAccess()).toBe(false);
  });

  it('returns true when OPEN_ACCESS=true off Vercel production', () => {
    setEnv({ OPEN_ACCESS: 'true' });
    expect(isOpenAccess()).toBe(true);
  });

  it('returns true when NEXT_PUBLIC_OPEN_ACCESS=true off Vercel production', () => {
    setEnv({ NEXT_PUBLIC_OPEN_ACCESS: 'true' });
    expect(isOpenAccess()).toBe(true);
  });

  it('returns false when OPEN_ACCESS is the string false', () => {
    setEnv({ OPEN_ACCESS: 'false' });
    expect(isOpenAccess()).toBe(false);
  });

  it('returns false when OPEN_ACCESS=true on Vercel production', () => {
    setEnv({ OPEN_ACCESS: 'true', VERCEL_ENV: 'production' });
    expect(isOpenAccess()).toBe(false);
  });

  it('returns false when NEXT_PUBLIC_OPEN_ACCESS=true and NEXT_PUBLIC_VERCEL_ENV=production', () => {
    setEnv({
      NEXT_PUBLIC_OPEN_ACCESS: 'true',
      NEXT_PUBLIC_VERCEL_ENV: 'production',
    });
    expect(isOpenAccess()).toBe(false);
  });

  it('returns true on Vercel preview with OPEN_ACCESS=true', () => {
    setEnv({ OPEN_ACCESS: 'true', VERCEL_ENV: 'preview' });
    expect(isOpenAccess()).toBe(true);
  });
});
