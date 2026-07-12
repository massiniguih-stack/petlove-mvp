# Stripe Payment Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate real Stripe payments for tutor and partner plans, with server-side subscription validation and customer portal.

**Architecture:** Stripe Checkout for payment, Supabase for subscription state, webhook for async updates, customer portal for management.

**Tech Stack:** Next.js 14 API Routes, Stripe Node SDK, Supabase (PostgreSQL + RLS), Zustand (client state), Tailwind CSS.

## Global Constraints

- Next.js 14 App Router (no Pages Router)
- Supabase Auth for user identity (already integrated)
- Stripe test mode for development (`sk_test_*`, `pk_test_*`)
- All API routes in `app/api/stripe/` directory
- Dark mode support via Tailwind `dark:` classes (already system-wide)
- Environment variables in `.env.local` (never committed)
- Database migrations in `supabase/migrations/` directory

---

## File Structure

### New Files
- `lib/stripe.ts` — Stripe client singleton (server-side only)
- `app/api/stripe/checkout/route.ts` — Create Checkout Session
- `app/api/stripe/webhook/route.ts` — Handle Stripe events
- `app/api/stripe/portal/route.ts` — Create Customer Portal session
- `app/api/stripe/subscription/route.ts` — Get subscription status
- `app/checkout/sucesso/page.tsx` — Post-payment success page
- `app/conta/assinatura/page.tsx` — Subscription management page
- `supabase/migrations/20260709_add_payment_tables.sql` — Database schema

### Modified Files
- `lib/store.ts` — Add server-side premium check, plan type state
- `app/planos/page.tsx` — Replace fake checkout with Stripe redirect
- `app/parceiros/premium/planos/page.tsx` — Replace raw card inputs with Stripe Checkout
- `.env.example` — Add Stripe environment variables
- `package.json` — Add `stripe` dependency

---

## Tasks

### Task 1: Install Stripe and Create Client

**Files:**
- Modify: `package.json` (via npm install)
- Create: `lib/stripe.ts`

**Interfaces:**
- Consumes: None (first task)
- Produces: `stripe` export (Stripe instance), `STRIPE_*` env vars

- [ ] **Step 1: Install stripe package**

```bash
cd /Users/guilhermemassini/Projetos/petlove-mvp
npm install stripe
```

- [ ] **Step 2: Create Stripe client singleton**

Create `lib/stripe.ts`:

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
```

- [ ] **Step 3: Add environment variables to .env.example**

Add to `.env.example`:

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

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds (stripe is server-only, no client bundle impact).

- [ ] **Step 5: Commit**

```bash
git add lib/stripe.ts package.json package-lock.json .env.example
git commit -m "feat: install stripe and create client singleton"
```

---

### Task 2: Database Migration — Payment Tables

**Files:**
- Create: `supabase/migrations/20260709_add_payment_tables.sql`

**Interfaces:**
- Consumes: None
- Produces: `stripe_customers` table, `subscriptions` table, RLS policies

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/20260709_add_payment_tables.sql`:

```sql
-- Stripe Customers: maps Supabase user to Stripe customer
CREATE TABLE public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE UNIQUE INDEX idx_stripe_customers_stripe_id ON public.stripe_customers(stripe_customer_id);

-- Subscriptions: stores active subscription state
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  plan_type TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

-- RLS Policies
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own stripe customer
CREATE POLICY "Users can view own stripe customer"
  ON public.stripe_customers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role handles all writes (via API routes with service key)
```

- [ ] **Step 2: Apply migration via Supabase CLI or dashboard**

If using Supabase CLI:
```bash
cd /Users/guilhermemassini/Projetos/petlove-mvp
npx supabase db push
```

Or manually run the SQL in Supabase Dashboard > SQL Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260709_add_payment_tables.sql
git commit -m "feat: add stripe_customers and subscriptions tables"
```

---

### Task 3: API Route — Create Checkout Session

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

**Interfaces:**
- Consumes: `stripe` from `lib/stripe.ts`, `createClient` from `lib/supabase/server.ts`
- Produces: `POST /api/stripe/checkout` → `{ url: string }`

- [ ] **Step 1: Create checkout API route**

Create `app/api/stripe/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petlove-mvp.vercel.app';

const PRICE_MAP: Record<string, string> = {
  tutor_monthly: process.env.STRIPE_PRICE_TUTOR_MONTHLY!,
  tutor_annual: process.env.STRIPE_PRICE_TUTOR_ANNUAL!,
  partner_basic: process.env.STRIPE_PRICE_PARTNER_BASIC!,
  partner_pro: process.env.STRIPE_PRICE_PARTNER_PRO!,
  partner_enterprise: process.env.STRIPE_PRICE_PARTNER_ENTERPRISE!,
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planType } = await request.json();

    if (!priceId || !planType || !PRICE_MAP[planType]) {
      return NextResponse.json({ error: 'Invalid price or plan type' }, { status: 400 });
    }

    // Get or create Stripe customer
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = existingCustomer?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/planos`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: planType,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/api/stripe/checkout/route.ts
git commit -m "feat: add Stripe checkout session API route"
```

---

### Task 4: API Route — Stripe Webhook

**Files:**
- Create: `app/api/stripe/webhook/route.ts`

**Interfaces:**
- Consumes: `stripe` from `lib/stripe.ts`, Supabase service client
- Produces: `POST /api/stripe/webhook` → handles events, updates DB

- [ ] **Step 1: Create webhook API route**

Create `app/api/stripe/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type;
        const subscriptionId = session.subscription as string;

        if (!userId || !planType || !subscriptionId) break;

        // Fetch subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        if (!priceId) break;

        // Upsert subscription
        await supabaseAdmin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: subscription.status,
            plan_type: planType,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: 'stripe_subscription_id' }
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_price_id: subscription.items.data[0]?.price.id,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }
}

// Disable body parsing for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat: add Stripe webhook handler"
```

---

### Task 5: API Routes — Subscription Status & Customer Portal

**Files:**
- Create: `app/api/stripe/subscription/route.ts`
- Create: `app/api/stripe/portal/route.ts`

**Interfaces:**
- Consumes: `stripe` from `lib/stripe.ts`, `createClient` from `lib/supabase/server.ts`
- Produces: `GET /api/stripe/subscription`, `POST /api/stripe/portal`

- [ ] **Step 1: Create subscription status route**

Create `app/api/stripe/subscription/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ isPremium: false, plan: null, status: null });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ isPremium: false, plan: null, status: null });
    }

    return NextResponse.json({
      isPremium: subscription.status === 'active',
      plan: subscription.plan_type,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json({ isPremium: false, plan: null, status: null });
  }
}
```

- [ ] **Step 2: Create customer portal route**

Create `app/api/stripe/portal/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petlove-mvp.vercel.app';

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${APP_URL}/conta/assinatura`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/api/stripe/subscription/route.ts app/api/stripe/portal/route.ts
git commit -m "feat: add subscription status and customer portal API routes"
```

---

### Task 6: Update Zustand Store — Server-Side Premium Check

**Files:**
- Modify: `lib/store.ts`

**Interfaces:**
- Consumes: `GET /api/stripe/subscription`
- Produces: Updated `isPremium` and new `plan` field in store

- [ ] **Step 1: Update store with plan type and server check**

Replace the contents of `lib/store.ts` with:

```typescript
import { create } from 'zustand';

export interface Tutor {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface Pet {
  id: string;
  nome: string;
  raca: string;
  dataNascimento: string;
  peso: number;
  sexo: 'macho' | 'femea';
  objetivo: 'manutencao' | 'pelagem' | 'desempenho' | 'emagrecimento';
  fotoUrl: string | null;
  tutor: Tutor;
}

interface PetState {
  pets: Pet[];
  selectedPetId: string | null;
  isPremium: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  addPet: (pet: Pet) => void;
  removePet: (id: string) => void;
  selectPet: (id: string) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  setPremium: (value: boolean) => void;
  setPlan: (plan: string | null, status: string | null, periodEnd: string | null, cancel: boolean) => void;
  fetchSubscription: () => Promise<void>;
  clearAll: () => void;
  pet: Pet | null;
}

const PETS_KEY = 'petlove_pets';
const SELECTED_KEY = 'petlove_selected_pet';
const PREMIUM_KEY = 'petlove_premium';
const PLAN_KEY = 'petlove_plan';
const PLAN_CACHE_KEY = 'petlove_plan_cache';
const PLAN_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function loadPets(): Pet[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PETS_KEY);
    if (data) return JSON.parse(data);
    const oldData = localStorage.getItem('petlove_pet');
    if (oldData) {
      const pet = JSON.parse(oldData);
      localStorage.removeItem('petlove_pet');
      return [pet];
    }
    return [];
  } catch {
    return [];
  }
}

function loadSelectedId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_KEY);
}

function loadPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PREMIUM_KEY) === 'true';
}

function loadPlanCache(): { plan: string | null; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(PLAN_CACHE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (Date.now() - parsed.timestamp > PLAN_CACHE_TTL) {
      localStorage.removeItem(PLAN_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePets(pets: Pet[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PETS_KEY, JSON.stringify(pets));
}

function saveSelectedId(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(SELECTED_KEY, id);
  } else {
    localStorage.removeItem(SELECTED_KEY);
  }
}

function savePremium(value: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREMIUM_KEY, String(value));
}

export const usePetStore = create<PetState>((set, get) => {
  const pets = loadPets();
  const selectedId = loadSelectedId();
  const isPremium = loadPremium();
  const planCache = loadPlanCache();

  const currentPet = pets.find((p) => p.id === selectedId) || pets[0] || null;

  return {
    pets,
    selectedPetId: currentPet?.id || null,
    isPremium,
    plan: planCache?.plan || null,
    subscriptionStatus: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    pet: currentPet,

    addPet: (pet) => {
      const { pets, isPremium } = get();
      if (!isPremium && pets.length >= 1) return;
      const newPets = [...pets, pet];
      savePets(newPets);
      set({ pets: newPets, pet, selectedPetId: pet.id });
      saveSelectedId(pet.id);
    },

    removePet: (id) => {
      const { pets, selectedPetId } = get();
      const newPets = pets.filter((p) => p.id !== id);
      savePets(newPets);
      const newSelected = selectedPetId === id ? newPets[0]?.id || null : selectedPetId;
      saveSelectedId(newSelected);
      set({
        pets: newPets,
        selectedPetId: newSelected,
        pet: newPets.find((p) => p.id === newSelected) || null,
      });
    },

    selectPet: (id) => {
      const { pets } = get();
      const pet = pets.find((p) => p.id === id);
      saveSelectedId(id);
      set({ selectedPetId: id, pet: pet || null });
    },

    updatePet: (id, updates) => {
      const { pets, selectedPetId } = get();
      const newPets = pets.map((p) => (p.id === id ? { ...p, ...updates } : p));
      savePets(newPets);
      const selectedPet = newPets.find((p) => p.id === selectedPetId);
      set({ pets: newPets, pet: selectedPet || null });
    },

    setPremium: (value) => {
      savePremium(value);
      set({ isPremium: value });
    },

    setPlan: (plan, status, periodEnd, cancel) => {
      savePremium(!!plan);
      localStorage.setItem(PLAN_KEY, plan || '');
      localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({ plan, timestamp: Date.now() }));
      set({
        isPremium: !!plan,
        plan,
        subscriptionStatus: status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: cancel,
      });
    },

    fetchSubscription: async () => {
      try {
        const res = await fetch('/api/stripe/subscription');
        const data = await res.json();
        const { setPlan } = get();
        setPlan(data.plan, data.status, data.currentPeriodEnd, data.cancelAtPeriodEnd);
      } catch {
        // Keep cached value on network error
      }
    },

    clearAll: () => {
      localStorage.removeItem(PETS_KEY);
      localStorage.removeItem(SELECTED_KEY);
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem(PLAN_KEY);
      localStorage.removeItem(PLAN_CACHE_KEY);
      localStorage.removeItem('petlove_pet');
      set({
        pets: [],
        selectedPetId: null,
        pet: null,
        isPremium: false,
        plan: null,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    },
  };
});
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add lib/store.ts
git commit -m "feat: add server-side subscription check to store"
```

---

### Task 7: Update Planos Page — Real Stripe Checkout

**Files:**
- Modify: `app/planos/page.tsx`

**Interfaces:**
- Consumes: `POST /api/stripe/checkout`, store `fetchSubscription`
- Produces: Real checkout redirect on "Assinar" click

- [ ] **Step 1: Update handleAssinar in planos/page.tsx**

Replace the `handleAssinar` function in `app/planos/page.tsx`:

```typescript
const handleAssinar = async () => {
  setProcessing(true);

  try {
    const priceId = periodo === 'mensal'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_TUTOR_MONTHLY
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_TUTOR_ANNUAL;

    const planType = periodo === 'mensal' ? 'tutor_monthly' : 'tutor_annual';

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, planType }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error('Checkout error:', data.error);
      setProcessing(false);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    setProcessing(false);
  }
};
```

Also add `fetchSubscription` import and call on mount:

```typescript
import { usePetStore } from '@/lib/store';

// Inside component:
const { setPremium, isPremium, fetchSubscription } = usePetStore();

useEffect(() => {
  fetchSubscription();
}, []);
```

- [ ] **Step 2: Remove the fake confirmation modal logic**

Remove `showConfirm` state and `handleConcluir` function. The success page handles this now.

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/planos/page.tsx
git commit -m "feat: integrate real Stripe checkout on planos page"
```

---

### Task 8: Update Partner Planos Page — Real Stripe Checkout

**Files:**
- Modify: `app/parceiros/premium/planos/page.tsx`

**Interfaces:**
- Consumes: `POST /api/stripe/checkout`
- Produces: Real checkout redirect (removes raw card inputs)

- [ ] **Step 1: Read current file and replace checkout form**

Replace the card input form section with a button that redirects to Stripe Checkout. The plan selection buttons should call `/api/stripe/checkout` with the appropriate `partner_basic`, `partner_pro`, or `partner_enterprise` plan type.

The key change: remove all `<input>` fields for card number, expiry, CVV. Replace the form with a single "Assinar com Stripe" button per plan tier.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/parceiros/premium/planos/page.tsx
git commit -m "feat: integrate real Stripe checkout on partner planos"
```

---

### Task 9: Success Page — Post-Payment Confirmation

**Files:**
- Create: `app/checkout/sucesso/page.tsx`

**Interfaces:**
- Consumes: `fetchSubscription` from store
- Produces: `/checkout/sucesso` page

- [ ] **Step 1: Create success page**

Create `app/checkout/sucesso/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePetStore } from '@/lib/store';

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(true);
  const { fetchSubscription, isPremium, plan } = usePetStore();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      // Wait a moment for webhook to process
      await new Promise((r) => setTimeout(r, 2000));
      await fetchSubscription();
      setLoading(false);
    };
    verify();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Verificando pagamento...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-900 dark:text-white">
            Pagamento confirmado!
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Seu plano premium está ativo. Aproveite todos os recursos!
          </p>
          {plan && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <span>⭐</span>
              Plano: {plan.replace('_', ' ')}
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 py-4 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl"
            >
              Ir para o Dashboard
            </Link>
            <Link
              href="/conta/assinatura"
              className="rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Gerenciar assinatura
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/checkout/sucesso/page.tsx
git commit -m "feat: add checkout success page"
```

---

### Task 10: Subscription Management Page

**Files:**
- Create: `app/conta/assinatura/page.tsx`

**Interfaces:**
- Consumes: `fetchSubscription` from store, `POST /api/stripe/portal`
- Produces: `/conta/assinatura` page

- [ ] **Step 1: Create subscription management page**

Create `app/conta/assinatura/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { usePetStore } from '@/lib/store';

export default function AssinaturaPage() {
  const { isPremium, plan, subscriptionStatus, currentPeriodEnd, cancelAtPeriodEnd, fetchSubscription } = usePetStore();
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleManage = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
    setLoadingPortal(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const planNames: Record<string, string> = {
    tutor_monthly: 'Premium Mensal',
    tutor_annual: 'Premium Anual',
    partner_basic: 'Parceiro Básico',
    partner_pro: 'Parceiro Profissional',
    partner_enterprise: 'Parceiro Empresarial',
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <BackButton href="/dashboard" label="Voltar ao dashboard" />

          <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
            Minha Assinatura
          </h1>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            {isPremium ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {planNames[plan || ''] || 'Premium'}
                    </h2>
                    <p className="text-sm font-medium text-emerald-600">Ativo</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{subscriptionStatus}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Próxima cobrança</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(currentPeriodEnd)}</span>
                  </div>
                  {cancelAtPeriodEnd && (
                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Sua assinatura será cancelada ao final do período.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleManage}
                  disabled={loadingPortal}
                  className="mt-6 w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {loadingPortal ? 'Carregando...' : 'Gerenciar assinatura (Stripe)'}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <span className="text-5xl">📋</span>
                <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                  Sem assinatura ativa
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Assine um plano premium para desbloquear todos os recursos.
                </p>
                <a
                  href="/planos"
                  className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:shadow-xl"
                >
                  Ver planos
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/conta/assinatura/page.tsx
git commit -m "feat: add subscription management page"
```

---

### Task 11: Add Subscription Fetch on App Load

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `fetchSubscription` from store
- Produces: Subscription checked on app initialization

- [ ] **Step 1: Add fetchSubscription to root layout provider**

In `app/layout.tsx`, add a client component wrapper that calls `fetchSubscription` on mount. This ensures premium status is always up-to-date when the app loads.

Create a small wrapper component or add to existing provider:

```tsx
// In app/layout.tsx, inside the DarkModeProvider/AuthProvider wrapper:
'use client';

import { useEffect } from 'react';
import { usePetStore } from '@/lib/store';

function SubscriptionLoader({ children }: { children: React.ReactNode }) {
  const fetchSubscription = usePetStore((s) => s.fetchSubscription);

  useEffect(() => {
    fetchSubscription();
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: fetch subscription status on app load"
```

---

### Task 12: Final Verification & Deploy

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified, deployed application

- [ ] **Step 1: Run full build**

```bash
cd /Users/guilhermemassini/Projetos/petlove-mvp
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 2: Verify all pages load**

Check these routes don't crash:
- `/planos`
- `/checkout/sucesso`
- `/conta/assinatura`
- `/parceiros/premium/planos`

- [ ] **Step 3: Deploy to Vercel**

```bash
vercel --prod --yes
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final verification and deploy"
```
