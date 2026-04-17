import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key);
}

const MONTHLY_PRICES = {
  starter: process.env.STRIPE_PARTNER_STARTER_MONTHLY || '',
  growth: process.env.STRIPE_PARTNER_GROWTH_MONTHLY || '',
};

export async function POST(req: NextRequest) {
  try {
    const { plan, partnerId, email } = await req.json();
    const planKey = plan as keyof typeof MONTHLY_PRICES;

    if (!plan || !MONTHLY_PRICES[planKey]) {
      return NextResponse.json({ error: 'Invalid plan. Use "starter" or "growth"' }, { status: 400 });
    }

    if (!partnerId || !email) {
      return NextResponse.json({ error: 'partnerId and email are required' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.SHOPIFY_APP_URL || '';
    const stripe = getStripe();

    // Check if partner already has a subscription (upgrade, no trial)
    const { createAdminClient } = await import('@/lib/supabaseAdmin');
    const admin = createAdminClient();
    const { data: partnerData } = await admin
      .from('partners')
      .select('stripe_subscription_id, plan')
      .eq('id', partnerId)
      .single();

    const isNewTrial = !partnerData?.stripe_subscription_id && (!partnerData?.plan || partnerData.plan === 'trial');

    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: MONTHLY_PRICES[planKey], quantity: 1 }],
      success_url: `${origin}/dashboard?shop=${req.nextUrl.searchParams.get('shop') || ''}&subscribed=true`,
      cancel_url: `${origin}/dashboard?shop=${req.nextUrl.searchParams.get('shop') || ''}&cancelled=true`,
      customer_email: email,
      client_reference_id: partnerId,
      metadata: {
        type: 'partner_subscription',
        partner_id: partnerId,
        partner_plan: plan,
        is_trial: isNewTrial ? 'true' : 'false',
      },
    };

    // 7-day free trial for new merchants subscribing to Starter
    if (isNewTrial) {
      sessionParams.subscription_data = {
        trial_period_days: 7,
        metadata: {
          partner_id: partnerId,
          partner_plan: plan,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Partner checkout error:', error?.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
