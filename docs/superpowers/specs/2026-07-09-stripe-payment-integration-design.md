# Stripe Payment Integration — Design Spec

## Overview

Integrate real Stripe payments for both tutor (pet owner) and partner (establishment) plans. Replace the current fake premium system (localStorage) with server-side validated subscriptions.

## Goals

- Real payment processing via Stripe Checkout (external page)
- Subscription status stored in Supabase (server-side validation)
- Customer portal for managing subscriptions (cancel, change plan, view invoices)
- Support 5 plans: Tutor Monthly, Tutor Annual, Partner Basic, Partner Pro, Partner Enterprise

## Architecture

```
User clicks "Subscribe" → POST /api/stripe/checkout
→ Stripe Checkout Session created
→ User redirected to Stripe hosted page
→ User completes payment
→ Stripe fires webhook → POST /api/stripe/webhook
→ Webhook updates Supabase subscriptions table
→ User redirected to /checkout/sucesso
→ Premium features unlocked via server-side check
```

## Database Schema

### Table: `stripe_customers`

```sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE UNIQUE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
```

### Table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing, incomplete
  plan_type TEXT NOT NULL, -- tutor_monthly, tutor_annual, partner_basic, partner_pro, partner_enterprise
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

### RLS Policies

```sql
-- Users can read their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own stripe customer
CREATE POLICY "Users can view own stripe customer" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

-- Service role handles all writes (via API routes)
```

## API Routes

### POST `/api/stripe/checkout`

Creates a Stripe Checkout Session.

**Request body:**
```json
{
  "priceId": "price_xxx",
  "planType": "tutor_monthly"
}
```

**Logic:**
1. Authenticate user (Supabase auth)
2. Get or create Stripe customer (`stripe_customers` table)
3. Create Stripe Checkout Session with:
   - `customer`: stripe_customer_id
   - `mode`: 'subscription'
   - `success_url`: `${APP_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url`: `${APP_URL}/planos`
   - `metadata`: `{ user_id, plan_type }`
4. Return `{ url: session.url }`

### POST `/api/stripe/webhook`

Handles Stripe events.

**Events handled:**
- `checkout.session.completed` — subscription created
- `customer.subscription.updated` — plan changed, renewal, etc.
- `customer.subscription.deleted` — subscription canceled
- `invoice.payment_failed` — payment failed

**Logic:**
1. Verify webhook signature with `STRIPE_WEBHOOK_SECRET`
2. On `checkout.session.completed`:
   - Extract `user_id` and `plan_type` from metadata
   - Upsert `stripe_customers` if not exists
   - Create record in `subscriptions` table
3. On `customer.subscription.updated`:
   - Update subscription status, dates, price_id
4. On `customer.subscription.deleted`:
   - Set subscription status to 'canceled'
5. On `invoice.payment_failed`:
   - Set subscription status to 'past_due'

### POST `/api/stripe/portal`

Creates a Stripe Customer Portal session.

**Logic:**
1. Authenticate user
2. Get `stripe_customer_id` from `stripe_customers`
3. Create portal session with return URL `${APP_URL}/conta/assinatura`
4. Return `{ url: portal.url }`

### GET `/api/stripe/subscription`

Returns current subscription status.

**Response:**
```json
{
  "isPremium": true,
  "plan": "tutor_monthly",
  "status": "active",
  "currentPeriodEnd": "2026-08-09T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

## Pages

### Updated: `/planos`

- Replace `handleAssinar()` fake logic with real Stripe Checkout redirect
- Button calls `POST /api/stripe/checkout` with appropriate price ID
- Show loading state while session is created
- Display premium badge if already subscribed

### Updated: `/parceiros/premium/planos`

- Remove raw card input fields (PCI violation)
- Replace with Stripe Checkout redirect
- Each plan tier calls checkout with its price ID

### New: `/checkout/sucesso`

- Displayed after successful payment
- Shows confirmation message and plan details
- Links to dashboard and account settings
- Fetches subscription status to confirm activation

### New: `/conta/assinatura`

- Shows current plan, status, renewal date
- "Gerenciar assinatura" button → opens Stripe Customer Portal
- Shows billing history (invoices)
- Cancel subscription option (with confirmation)

## Environment Variables

```
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_TUTOR_MONTHLY=price_xxx
STRIPE_PRICE_TUTOR_ANNUAL=price_xxx
STRIPE_PRICE_PARTNER_BASIC=price_xxx
STRIPE_PRICE_PARTNER_PRO=price_xxx
STRIPE_PRICE_PARTNER_ENTERPRISE=price_xxx
```

## Updated Premium Logic

### Store (`lib/store.ts`)

Replace localStorage-only premium check:

```typescript
// Server-side check via API
const checkPremium = async () => {
  const res = await fetch('/api/stripe/subscription');
  const data = await res.json();
  set({ isPremium: data.isPremium, plan: data.plan });
};

// On app load, check server
useEffect(() => {
  if (user) checkPremium();
}, [user]);
```

### Fallback

Keep localStorage as cache with 1-hour TTL for performance. Always validate with server on critical actions.

## Packages to Install

```bash
npm install stripe
```

## Files to Create/Modify

### New Files
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/stripe/portal/route.ts`
- `app/api/stripe/subscription/route.ts`
- `app/checkout/sucesso/page.tsx`
- `app/conta/assinatura/page.tsx`
- `lib/stripe.ts` (Stripe client singleton)
- `supabase/migrations/xxx_add_payment_tables.sql`

### Modified Files
- `app/planos/page.tsx` — real checkout
- `app/parceiros/premium/planos/page.tsx` — real checkout
- `lib/store.ts` — server-side premium check
- `.env.example` — add Stripe vars
- `package.json` — add stripe dependency

## Security Considerations

- Never handle raw card data (Stripe Checkout only)
- Webhook signature verification required
- RLS policies on all tables
- Server-side premium validation for feature gating
- Stripe test mode for development
