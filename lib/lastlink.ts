const LASTLINK_BASE_URL = process.env.LASTLINK_CHECKOUT_URL || 'https://lastlink.com/p';

// Map plan types to LastLink product slugs
// These are the short codes from LastLink checkout URLs
// e.g., https://lastlink.com/p/ABC123AB
const PLAN_SLUGS: Record<string, string> = {
  tutor_monthly: process.env.LASTLINK_TUTOR_MONTHLY_SLUG || '',
  tutor_annual: process.env.LASTLINK_TUTOR_ANNUAL_SLUG || '',
  partner_basic: process.env.LASTLINK_PARTNER_BASIC_SLUG || '',
  partner_pro: process.env.LASTLINK_PARTNER_PRO_SLUG || '',
  partner_enterprise: process.env.LASTLINK_PARTNER_ENTERPRISE_SLUG || '',
};

export function getLastlinkCheckoutUrl(planType: string): string | null {
  const slug = PLAN_SLUGS[planType];
  if (!slug) return null;
  return `${LASTLINK_BASE_URL}/${slug}`;
}

export function isValidPlanType(planType: string): boolean {
  return planType in PLAN_SLUGS;
}

// Uma conta pode ser tutora e dona de negócio parceiro ao mesmo tempo — cada
// categoria tem sua própria linha em `subscriptions` (ver migration
// 20260724_subscriptions_allow_tutor_and_partner.sql), pra uma não
// sobrescrever a outra.
export function planCategory(planType: string): 'tutor' | 'partner' {
  return planType.startsWith('partner_') ? 'partner' : 'tutor';
}

export const LASTLINK_WEBHOOK_TOKEN = process.env.LASTLINK_WEBHOOK_TOKEN || '';
