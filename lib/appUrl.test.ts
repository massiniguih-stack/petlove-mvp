import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getAppUrl } from './appUrl';

describe('getAppUrl', () => {
  let snapshot: string | undefined;

  beforeEach(() => {
    snapshot = process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterEach(() => {
    if (snapshot === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = snapshot;
  });

  it('falls back to the Vercel production origin', () => {
    expect(getAppUrl()).toBe('https://patinha-mvp.vercel.app');
  });

  it('uses NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://patinha.app';
    expect(getAppUrl()).toBe('https://patinha.app');
  });

  it('strips a trailing slash', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://patinha.app/';
    expect(getAppUrl()).toBe('https://patinha.app');
  });

  it('ignores blank values', () => {
    process.env.NEXT_PUBLIC_APP_URL = '   ';
    expect(getAppUrl()).toBe('https://patinha-mvp.vercel.app');
  });
});
