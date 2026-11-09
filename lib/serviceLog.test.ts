import { describe, expect, it } from 'vitest';
import { isReasonableServiceDate, partnerServiceLogSchema, tutorServiceLogSchema } from './serviceLog';

const now = new Date('2026-11-09T15:00:00Z');

describe('isReasonableServiceDate', () => {
  it('accepts today, yesterday and tomorrow (timezone slack)', () => {
    expect(isReasonableServiceDate('2026-11-09', now)).toBe(true);
    expect(isReasonableServiceDate('2026-11-08', now)).toBe(true);
    expect(isReasonableServiceDate('2026-11-10', now)).toBe(true);
  });

  it('rejects dates far in the future or more than a year ago', () => {
    expect(isReasonableServiceDate('2026-12-25', now)).toBe(false);
    expect(isReasonableServiceDate('2024-01-01', now)).toBe(false);
  });

  it('rejects malformed or impossible dates', () => {
    expect(isReasonableServiceDate('09/11/2026', now)).toBe(false);
    expect(isReasonableServiceDate('2026-02-30', now)).toBe(false);
    expect(isReasonableServiceDate('', now)).toBe(false);
  });
});

describe('service log schemas', () => {
  const today = new Date().toISOString().slice(0, 10);
  const uuid = '3f2c1a9e-8b7d-4c6e-9f10-1a2b3c4d5e6f';

  it('tutor confirmation needs real ids', () => {
    expect(tutorServiceLogSchema.safeParse({ partnerId: uuid, petId: uuid, tipoServico: 'banho', data: today }).success).toBe(true);
    expect(tutorServiceLogSchema.safeParse({ partnerId: 'abc', petId: uuid, tipoServico: 'banho', data: today }).success).toBe(false);
  });

  it('partner log caps text sizes', () => {
    expect(partnerServiceLogSchema.safeParse({ tipoServico: 'banho', data: today }).success).toBe(true);
    expect(partnerServiceLogSchema.safeParse({ tipoServico: 'x'.repeat(61), data: today }).success).toBe(false);
    expect(partnerServiceLogSchema.safeParse({ tipoServico: 'banho', data: today, observacao: 'y'.repeat(501) }).success).toBe(false);
  });
});
