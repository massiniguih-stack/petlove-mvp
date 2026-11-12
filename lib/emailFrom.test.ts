import { afterEach, describe, expect, it } from 'vitest';
import { FALLBACK_EMAIL_FROM, getEmailFrom } from './emailFrom';

describe('getEmailFrom', () => {
  afterEach(() => {
    delete process.env.EMAIL_FROM;
  });

  it('falls back to the Resend test sender when unset', () => {
    expect(getEmailFrom()).toBe(FALLBACK_EMAIL_FROM);
  });

  it('uses a configured named sender', () => {
    process.env.EMAIL_FROM = 'Patinha <nao-responda@patinha.app.br>';
    expect(getEmailFrom()).toBe('Patinha <nao-responda@patinha.app.br>');
  });

  it('accepts a bare address and strips surrounding quotes', () => {
    process.env.EMAIL_FROM = '"contato@patinha.app.br"';
    expect(getEmailFrom()).toBe('contato@patinha.app.br');
  });

  it('ignores malformed values', () => {
    process.env.EMAIL_FROM = 'Patinha sem email';
    expect(getEmailFrom()).toBe(FALLBACK_EMAIL_FROM);
  });
});
