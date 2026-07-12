import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        if (!priceId) break;

        await supabaseAdmin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: subscription.status,
            plan_type: planType,
            current_period_start: new Date(subscription.items.data[0]?.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.items.data[0]?.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: 'stripe_subscription_id' }
        );

        // Send premium confirmation email
        try {
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
          if (user?.email) {
            const planName = planType === 'tutor_annual' ? 'Premium Anual' : 'Premium Mensal';
            await resend.emails.send({
              from: 'PetLove <onboarding@resend.dev>',
              to: user.email,
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
                  <h3 style="color: #333; font-size: 16px;">Agora voce tem acesso a:</h3>
                  <ul style="color: #555; line-height: 1.8;">
                    <li>Cadastro ilimitado de pets</li>
                    <li>Controle de peso avancado</li>
                    <li>Linha do tempo completa</li>
                    <li>Mapa de servicos premium</li>
                    <li>Relatorios de desempenho</li>
                    <li>Suporte prioritario</li>
                  </ul>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://petlove-mvp.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                      Acessar Dashboard
                    </a>
                  </div>
                  <p style="color: #999; font-size: 13px; text-align: center; margin-top: 30px;">
                    Para gerenciar sua assinatura, acesse Configuracoes > Assinatura.
                  </p>
                </div>
              `,
            });
          }
        } catch (emailErr) {
          console.error('Failed to send premium email:', emailErr);
        }

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
            current_period_start: new Date(subscription.items.data[0]?.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.items.data[0]?.current_period_end * 1000).toISOString(),
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
        const subscriptionId = invoice.parent?.subscription_details?.subscription as string | undefined;

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
