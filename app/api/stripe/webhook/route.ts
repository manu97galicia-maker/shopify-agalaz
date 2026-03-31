import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim());
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!.trim();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Credits pack purchase (one-time payment)
      const clientRefId = session.client_reference_id;
      if (clientRefId && session.mode === 'payment') {
        const { data: partner } = await admin
          .from('partners')
          .select('id, credits_remaining')
          .eq('id', clientRefId)
          .single();

        if (partner) {
          await admin.from('partners').update({
            credits_remaining: partner.credits_remaining + 20,
            updated_at: new Date().toISOString(),
          }).eq('id', partner.id);

          console.log(`Credits pack purchased: +20 credits for partner ${partner.id} (now ${partner.credits_remaining + 20})`);
        }
        break;
      }

      // Partner subscription activated
      if (session.metadata?.type === 'partner_subscription') {
        const partnerId = session.metadata.partner_id;
        const partnerPlan = session.metadata.partner_plan;
        const subscriptionId = session.subscription as string;

        if (partnerId && subscriptionId) {
          const credits = partnerPlan === 'growth' ? 1000 : 200;
          await admin.from('partners').update({
            plan: partnerPlan,
            credits_remaining: credits,
            credits_monthly_limit: credits,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          }).eq('id', partnerId);

          console.log(`Partner subscription activated: ${partnerId} (${partnerPlan}, ${credits} credits/month)`);
        }
        break;
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = ((invoice as any).parent?.subscription_details?.subscription || (invoice as any).subscription) as string || '';
      if (!subscriptionId) break;

      // Check if partner subscription
      const { data: partner } = await admin
        .from('partners')
        .select('id, plan')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (partner) {
        // Skip first invoice
        if (invoice.billing_reason === 'subscription_create') break;

        // Monthly renewal — recharge credits
        const credits = partner.plan === 'growth' ? 1000 : 200;
        await admin.from('partners').update({
          credits_remaining: credits,
          is_active: true,
          updated_at: new Date().toISOString(),
        }).eq('id', partner.id);

        console.log(`Partner credits recharged: ${partner.id} (${partner.plan}, ${credits} credits)`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      const { data: cancelledPartner } = await admin
        .from('partners')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (cancelledPartner) {
        await admin.from('partners').update({
          is_active: false,
          credits_remaining: 0,
          updated_at: new Date().toISOString(),
        }).eq('id', cancelledPartner.id);

        console.log('Partner subscription cancelled:', cancelledPartner.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
