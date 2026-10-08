import { describe, expect, it } from 'vitest';
import { buildCspHeader } from './csp';

describe('buildCspHeader', () => {
  const csp = buildCspHeader('abc123');

  it('drops the unused jsdelivr host and adds a nonce', () => {
    expect(csp).not.toMatch(/jsdelivr/i);
    expect(csp).toContain("'nonce-abc123'");
  });

  it('locks plugins, base URL and form target', () => {
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('allows Firebase, Facebook pixel and Turnstile that the app already uses', () => {
    expect(csp).toMatch(/gstatic\.com/);
    expect(csp).toMatch(/facebook\.com/);
    expect(csp).toMatch(/challenges\.cloudflare\.com/);
  });
});
