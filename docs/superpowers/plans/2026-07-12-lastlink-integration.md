# LastLink Integration — Assinaturas Recorrentes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir Stripe por LastLink como processador de pagamentos para assinaturas recorrentes (tutor premium e parceiros premium).

**Architecture:** LastLink é uma plataforma de pagamentos para produtos digitais que funciona via webhooks. Diferente do Stripe, não há API de checkout — os produtos são criados no dashboard da LastLink e o app redireciona o usuário para a URL de checkout. Webhooks recebem eventos de pagamento para atualizar o status da assinatura no banco.

**Tech Stack:** Next.js 14, Supabase (PostgreSQL + Auth), LastLink Webhooks, Resend (emails)

## Global Constraints

- Next.js App Router (not Pages Router)
- All UI text in Portuguese (Brazil)
- TypeScript strict mode
- Mobile-first responsive design
- RLS enabled on all tables
- Webhook payloads must be verified (LastLink não fornece assinatura — usar IP allowlist ou token)

---

## How LastLink Works

1. **Produtos são criados no dashboard da LastLink** (não via API)
2. Cada produto tem um **ID único** (UUID) que identifica o plano
3. O app redireciona o usuário para `https://lastlink.com/p/{PRODUCT_SLUG}` para checkout
4. Após pagamento, LastLink envia webhooks para `POST /api/lastlink/webhook`
5. O app atualiza o status da assinatura no banco baseado nos eventos

### LastLink Webhook Events (relevantes)

| Evento | Quando é enviado | Ação no app |
|--------|------------------|-------------|
| `Purchase_Order_Confirmed` | Primeiro pagamento confirmado | Criar/atualizar assinatura como `active` |
| `Recurrent_Payment` | Renovação confirmada | Manter assinatura `active` |
| `Subscription_Canceled` | Cliente cancelou | Atualizar para `canceled` |
| `Subscription_Expired` | Pagamento falhou/expirou | Atualizar para `expired` |
| `Payment_Refund` | Reembolso | Atualizar para `canceled` |
| `Payment_Chargeback` | Estorno | Atualizar para `canceled` |

### LastLink Webhook Payload Structure

```json
{
  "Id": "uuid-evento",
  "IsTest": false,
  "Event": "Purchase_Order_Confirmed",
  "CreatedAt": "2026-07-12T10:00:00",
  "Data": {
    "Products": [{ "Id": "uuid-produto", "Name": "Plano Premium" }],
    "Buyer": { "Email": "user@email.com", "Name": "Nome", "PhoneNumber": "+55..." },
    "Purchase": {
      "PaymentId": "uuid-pagamento",
      "Recurrency": 1,
      "PaymentDate": "2026-07-12T10:00:00Z",
      "Price": { "Value": 19.90 },
      "Payment": { "NumberOfInstallments": 1, "PaymentMethod": "credit_card" }
    },
    "Subscriptions": [{ "Id": "uuid-assinatura", "ProductId": "uuid-produto" }]
  }
}
```

---

## File Structure

```
petlove-mvp/
├── app/
│   ├── api/
│   │   ├── lastlink/
│   │   │   ├── checkout/route.ts       (new - redirect to LastLink checkout)
│   │   │   └── webhook/route.ts        (new - handle LastLink webhooks)
│   │   └── subscription/route.ts       (new - check subscription status)
│   ├── planos/page.tsx                 (modify - wire checkout button)
│   ├── checkout/sucesso/page.tsx       (modify - remove Stripe references)
│   └── conta/assinatura/page.tsx       (modify - update portal link)
├── lib/
│   └── lastlink.ts                     (new - LastLink config and helpers)
├── supabase/
│   └── migrations/
│       └── 20260712_lastlink_rename.sql (new - rename Stripe columns)
└── .env.local                          (modify - add LastLink env vars)
```

---

### Task 1: Database Migration — Rename Stripe Columns

**Files:**
- Create: `supabase/migrations/20260712_lastlink_rename.sql`

**Interfaces:**
- Consumes: Existing `subscriptions` and `stripe_customers` tables
- Produces: Renamed columns, new `lastlink_product_id` mapping table

- [ ] **Step 1: Create migration**

```sql
-- Rename stripe_customers -> payment_customers
ALTER TABLE IF EXISTS public.stripe_customers RENAME TO payment_customers;
ALTER TABLE IF EXISTS public.payment_customers RENAME COLUMN stripe_customer_id TO provider_customer_id;
ALTER INDEX IF EXISTS idx_stripe_customers_user_id RENAME TO idx_payment_customers_user_id;
ALTER INDEX IF EXISTS idx_stripe_customers_stripe_id RENAME TO idx_payment_customers_provider_id;

-- Rename subscriptions columns
ALTER TABLE IF EXISTS public.subscriptions RENAME COLUMN stripe_subscription_id TO provider_subscription_id;
ALTER TABLE IF EXISTS public.subscriptions RENAME COLUMN stripe_price_id TO provider_price_id;
ALTER INDEX IF EXISTS idx_subscriptions_stripe_id RENAME TO idx_subscriptions_provider_id;

-- Create lastlink_products mapping table
CREATE TABLE public.lastlink_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,  -- LastLink product UUID
  plan_type TEXT NOT NULL UNIQUE,   -- tutor_monthly, partner_basic, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default product mappings (user will fill in actual IDs)
INSERT INTO public.lastlink_products (product_id, plan_type) VALUES
  ('TODO_TUTOR_MONTHLY', 'tutor_monthly'),
  ('TODO_TUTOR_ANNUAL', 'tutor_annual'),
  ('TODO_PARTNER_BASIC', 'partner_basic'),
  ('TODO_PARTNER_PRO', 'partner_pro'),
  ('TODO_PARTNER_ENTERPRISE', 'partner_enterprise')
ON CONFLICT (plan_type) DO NOTHING;

-- RLS for lastlink_products (read-only for authenticated users)
ALTER TABLE public.lastlink_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view products"
  ON public.lastlink_products FOR SELECT
  USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260712_lastlink_rename.sql
git commit -m "feat: add LastLink migration - rename Stripe columns, add product mapping"
```

---

### Task 2: LastLink Config Helper

**Files:**
- Create: `lib/lastlink.ts`
- Delete: `lib/stripe.ts`

**Interfaces:**
- Consumes: Environment variables LASTLINK_CHECKOUT_URL
- Produces: `getLastlinkCheckoutUrl(planType)`, `LASTLINK_WEBHOOK_TOKEN`

- [ ] **Step 1: Create LastLink helper**

```typescript
// lib/lastlink.ts
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

export const LASTLINK_WEBHOOK_TOKEN = process.env.LASTLINK_WEBHOOK_TOKEN || '';
```

- [ ] **Step 2: Remove Stripe helper**

```bash
rm lib/stripe.ts
```

- [ ] **Step 3: Commit**

```bash
git add lib/lastlink.ts
git rm lib/stripe.ts
git commit -m "feat: add LastLink helper, remove Stripe client"
```

---

### Task 3: Checkout Route — Redirect to LastLink

**Files:**
- Create: `app/api/lastlink/checkout/route.ts`
- Delete: `app/api/stripe/checkout/route.ts`
- Delete: `app/api/stripe/portal/route.ts`

**Interfaces:**
- Consumes: `getLastlinkCheckoutUrl()` from `lib/lastlink.ts`, Supabase auth
- Produces: Redirect URL to LastLink checkout

- [ ] **Step 1: Create checkout route**

```typescript
// app/api/lastlink/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLastlinkCheckoutUrl, isValidPlanType } from '@/lib/lastlink';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await request.json();

    if (!planType || !isValidPlanType(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const checkoutUrl = getLastlinkCheckoutUrl(planType);

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Checkout URL not configured' }, { status: 500 });
    }

    // Store pending checkout in metadata (webhook will confirm)
    await supabase.from('subscriptions').upsert(
      {
        user_id: user.id,
        provider_subscription_id: `pending_${user.id}_${Date.now()}`,
        provider_price_id: planType,
        status: 'pending',
        plan_type: planType,
      },
      { onConflict: 'user_id' }
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Delete Stripe routes**

```bash
rm app/api/stripe/checkout/route.ts
rm app/api/stripe/portal/route.ts
rm -rf app/api/stripe/
```

- [ ] **Step 3: Commit**

```bash
git add app/api/lastlink/checkout/route.ts
git rm app/api/stripe/checkout/route.ts app/api/stripe/portal/route.ts
git rm -rf app/api/stripe/
git commit -m "feat: add LastLink checkout route, remove Stripe routes"
```

---

### Task 4: Webhook Route — Handle LastLink Events

**Files:**
- Create: `app/api/lastlink/webhook/route.ts`
- Delete: `app/api/stripe/webhook/route.ts`

**Interfaces:**
- Consumes: LastLink webhook payload, Supabase admin client
- Produces: Updated subscription status in database

- [ ] **Step 1: Create webhook handler**

```typescript
// app/api/lastlink/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface LastlinkEvent {
  Id: string;
  IsTest: boolean;
  Event: string;
  CreatedAt: string;
  Data: {
    Products?: Array<{ Id: string; Name: string; Price?: { Value: number } }>;
    Buyer?: {
      Id?: string;
      Email: string;
      Name: string;
      PhoneNumber?: string;
      Document?: string;
    };
    Purchase?: {
      PaymentId?: string;
      Recurrency?: number;
      PaymentDate?: string;
      Price?: { Value: number };
      Payment?: { NumberOfInstallments: number; PaymentMethod: string };
    };
    Subscriptions?: Array<{
      Id: string;
      ProductId: string;
      CanceledDate?: string;
      ExpiredDate?: string;
    }>;
  };
}

// Map LastLink product IDs to plan types
// This will be populated from the lastlink_products table
async function getPlanTypeFromProductId(
  supabase: ReturnType<typeof createClient>,
  productId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('lastlink_products')
    .select('plan_type')
    .eq('product_id', productId)
    .single();
  return data?.plan_type || null;
}

// Find user by email
async function getUserByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<{ id: string } | null> {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  return users.find(u => u.email === email) || null;
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const event: LastlinkEvent = await request.json();

    // Skip test events
    if (event.IsTest) {
      return NextResponse.json({ received: true, test: true });
    }

    const buyerEmail = event.Data.Buyer?.Email;
    if (!buyerEmail) {
      return NextResponse.json({ error: 'No buyer email' }, { status: 400 });
    }

    // Find user
    const user = await getUserByEmail(supabaseAdmin, buyerEmail);
    if (!user) {
      console.error('User not found for email:', buyerEmail);
      return NextResponse.json({ received: true });
    }

    // Get product ID from event
    const productId = event.Data.Subscriptions?.[0]?.ProductId ||
                      event.Data.Products?.[0]?.Id;

    let planType: string | null = null;
    if (productId) {
      planType = await getPlanTypeFromProductId(supabaseAdmin, productId);
    }

    // Determine status from event
    let status: string;
    let cancelAtPeriodEnd = false;

    switch (event.Event) {
      case 'Purchase_Order_Confirmed':
      case 'Recurrent_Payment':
        status = 'active';
        break;
      case 'Subscription_Canceled':
        status = 'canceled';
        cancelAtPeriodEnd = false;
        break;
      case 'Subscription_Expired':
        status = 'expired';
        break;
      case 'Payment_Refund':
      case 'Payment_Chargeback':
        status = 'canceled';
        break;
      case 'Subscription_Renewal_Pending':
        status = 'active'; // Still active, waiting for payment
        break;
      default:
        // Unknown event, just acknowledge
        return NextResponse.json({ received: true, event: event.Event });
    }

    // Get subscription ID from LastLink
    const lastlinkSubscriptionId = event.Data.Subscriptions?.[0]?.Id;

    // Upsert subscription
    const subscriptionData = {
      user_id: user.id,
      provider_subscription_id: lastlinkSubscriptionId || `lastlink_${event.Id}`,
      provider_price_id: planType || 'unknown',
      status,
      plan_type: planType || 'unknown',
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_end: event.Data.Purchase?.PaymentDate
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Estimate 30 days
        : null,
      updated_at: new Date().toISOString(),
    };

    await supabaseAdmin.from('subscriptions').upsert(
      subscriptionData,
      { onConflict: 'user_id' }
    );

    // Send email for first payment
    if (event.Event === 'Purchase_Order_Confirmed' && buyerEmail) {
      try {
        const planName = planType?.replace('_', ' ') || 'Premium';
        await resend.emails.send({
          from: 'PetLove <onboarding@resend.dev>',
          to: buyerEmail,
          subject: 'Parabens! Voce agora e Premium! 🎉',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; padding: 30px 0;">
                <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">Parabens! 🎉</h1>
                <p style="color: #666; font-size: 16px; margin-top: 8px;">Voce agora e membro Premium do PetLove</p>
              </div>
              <div style="background: linear-gradient(135deg, #fdf2f8, #f3e8ff); border-radius: 16px; padding: 24px; margin: 20px 0;">
                <h2 style="color: #7c3aed; font-size: 18px; margin: 0 0 12px 0;">Seu plano ativo:</h2>
                <p style="color: #333; font-size: 16px; font-weight: bold; margin: 0;">${planName}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://petlove-mvp.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Acessar Dashboard
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Delete Stripe webhook**

```bash
rm app/api/stripe/webhook/route.ts
```

- [ ] **Step 3: Commit**

```bash
git add app/api/lastlink/webhook/route.ts
git rm app/api/stripe/webhook/route.ts
git commit -m "feat: add LastLink webhook handler"
```

---

### Task 5: Subscription Status Route

**Files:**
- Create: `app/api/subscription/route.ts`
- Delete: `app/api/stripe/subscription/route.ts`

**Interfaces:**
- Consumes: Supabase auth, `subscriptions` table
- Produces: `{ isPremium, plan, status, currentPeriodEnd, cancelAtPeriodEnd }`

- [ ] **Step 1: Create subscription status route**

```typescript
// app/api/subscription/route.ts
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

- [ ] **Step 2: Delete Stripe subscription route**

```bash
rm app/api/stripe/subscription/route.ts
```

- [ ] **Step 3: Update store.ts to use new endpoint**

```typescript
// In lib/store.ts, change the fetchSubscription function:
fetchSubscription: async () => {
  try {
    const res = await fetch('/api/subscription');
    const data = await res.json();
    const { setPlan } = get();
    setPlan(data.plan, data.status, data.currentPeriodEnd, data.cancelAtPeriodEnd);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
  }
},
```

- [ ] **Step 4: Commit**

```bash
git add app/api/subscription/route.ts lib/store.ts
git rm app/api/stripe/subscription/route.ts
git commit -m "feat: add subscription status route, update store"
```

---

### Task 6: Update Pages — Remove Stripe References

**Files:**
- Modify: `app/parceiros/premium/page.tsx`
- Modify: `app/checkout/sucesso/page.tsx`
- Modify: `app/conta/assinatura/page.tsx`
- Modify: `app/planos/page.tsx`

**Interfaces:**
- Consumes: `/api/lastlink/checkout`, `/api/subscription`
- Produces: Updated UI with LastLink references

- [ ] **Step 1: Update parceiros/premium page**

In `app/parceiros/premium/page.tsx`, change the `handleCheckout` function:

```typescript
const handleCheckout = async (plano: typeof planos[number]) => {
  setLoading(plano.id);
  setError(null);
  try {
    const res = await fetch('/api/lastlink/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType: planTypeMap[plano.id] }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao criar sessao de checkout');
    }
    const { url } = await res.json();
    window.location.href = url;
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Erro inesperado');
  } finally {
    setLoading(null);
  }
};
```

- [ ] **Step 2: Update conta/assinatura page**

In `app/conta/assinatura/page.tsx`, change the `handleManage` function:

```typescript
const handleManage = async () => {
  // LastLink doesn't have a portal API - redirect to LastLink member area
  window.location.href = process.env.NEXT_PUBLIC_LASTLINK_MEMBER_URL || 'https://lastlink.com/app/member';
};
```

Also update the button text from "Gerenciar assinatura (Stripe)" to "Gerenciar assinatura".

- [ ] **Step 3: Update planos page**

In `app/planos/page.tsx`, replace the "Disponivel em breve" button with a real checkout button:

```typescript
// Add state and handler
const [loading, setLoading] = useState(false);

const handleCheckout = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/lastlink/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType: 'tutor_monthly' }),
    });
    if (!res.ok) throw new Error('Erro ao criar checkout');
    const { url } = await res.json();
    window.location.href = url;
  } catch (err) {
    console.error(err);
  }
  setLoading(false);
};

// Replace the "Disponivel em breve" div with:
<button
  onClick={handleCheckout}
  disabled={loading}
  className="mt-8 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 p-4 text-center text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
>
  {loading ? 'Carregando...' : 'Assinar Premium'}
</button>
```

- [ ] **Step 4: Commit**

```bash
git add app/parceiros/premium/page.tsx app/checkout/sucesso/page.tsx app/conta/assinatura/page.tsx app/planos/page.tsx
git commit -m "feat: update pages to use LastLink checkout"
```

---

### Task 7: Environment Variables

**Files:**
- Modify: `.env.local`
- Modify: `.env.example`

**Interfaces:**
- Consumes: None
- Produces: Updated env vars

- [ ] **Step 1: Update .env.example**

```env
# LastLink Configuration
NEXT_PUBLIC_LASTLINK_MEMBER_URL=https://lastlink.com/app/member
LASTLINK_CHECKOUT_URL=https://lastlink.com/p
LASTLINK_WEBHOOK_TOKEN=your_webhook_token_here

# LastLink Product Slugs (from your LastLink dashboard)
LASTLINK_TUTOR_MONTHLY_SLUG=ABC123AB
LASTLINK_TUTOR_ANNUAL_SLUG=DEF456CD
LASTLINK_PARTNER_BASIC_SLUG=GHI789EF
LASTLINK_PARTNER_PRO_SLUG=JKL012GH
LASTLINK_PARTNER_ENTERPRISE_SLUG=MNO345IJ

# Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (keep existing)
RESEND_API_KEY=your_resend_key
```

- [ ] **Step 2: Update .env.local with actual values**

User must fill in their LastLink product slugs from their dashboard.

- [ ] **Step 3: Commit**

```bash
git add .env.example .env.local
git commit -m "feat: add LastLink environment variables"
```

---

### Task 8: Clean Up Stripe Dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: None
- Produces: Removed stripe dependency

- [ ] **Step 1: Remove stripe package**

```bash
npm uninstall stripe
```

- [ ] **Step 2: Remove any remaining Stripe imports**

Search for any remaining `import.*stripe` or `from.*stripe` references and remove them.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove stripe dependency"
```

---

### Task 9: Test the Integration

**Files:**
- None (testing only)

**Interfaces:**
- Consumes: Running dev server
- Produces: Verified integration

- [ ] **Step 1: Run development server**

```bash
npm run dev
```

- [ ] **Step 2: Test checkout flow**

1. Go to `/parceiros/premium`
2. Click "Assinar" on any plan
3. Verify redirect to LastLink checkout URL
4. Complete test payment in LastLink sandbox

- [ ] **Step 3: Test webhook**

1. In LastLink dashboard, configure webhook URL to `http://localhost:3000/api/lastlink/webhook`
2. Send test event from LastLink
3. Verify subscription status updates in database

- [ ] **Step 4: Test subscription status**

1. After successful payment, go to `/conta/assinatura`
2. Verify plan shows as active
3. Verify "Gerenciar assinatura" redirects to LastLink

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete LastLink integration"
```

---

## Checklist de Implementação

- [ ] Task 1: Database migration
- [ ] Task 2: LastLink config helper
- [ ] Task 3: Checkout route
- [ ] Task 4: Webhook handler
- [ ] Task 5: Subscription status route
- [ ] Task 6: Update pages
- [ ] Task 7: Environment variables
- [ ] Task 8: Clean up Stripe
- [ ] Task 9: Test integration

## Critérios de Aceite

- [ ] Usuário consegue assinar plano premium via LastLink
- [ ] Webhook confirma pagamento e atualiza status no banco
- [ ] Renovações recorrentes são processadas corretamente
- [ ] Cancelamento de assinatura atualiza status
- [ ] Página de assinatura mostra plano ativo
- [ ] "Gerenciar assinatura" redireciona para LastLink
- [ ] Emails de confirmação são enviados
- [ ] Todos os testes passam

## Notes for Implementation

1. **LastLink Product IDs**: O usuário precisa criar os produtos no dashboard da LastLink e preencher os product slugs no `.env.local`

2. **Webhook Security**: LastLink não fornece assinatura de webhook. Opções:
   - Usar IP allowlist (se LastLink fornecer IPs fixos)
   - Usar token de webhook customizado
   - Validar payload básico (event type, buyer email)

3. **Subscription Management**: LastLink não tem API de portal como Stripe. O usuário gerencia assinatura pelo member portal do LastLink.

4. **Testing**: Usar o modo sandbox/test do LastLink para testar webhooks antes de ir para produção.
