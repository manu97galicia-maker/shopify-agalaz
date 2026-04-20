import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { shopifyGraphQL } from '@/lib/shopifyGraphQL';
import { shouldUseTestCharge } from '@/lib/shopifyBilling';

export const runtime = 'nodejs';

const PLANS = {
  starter: { name: 'Agalaz Starter', amount: 149, credits: 200, trialDays: 7 },
  growth: { name: 'Agalaz Growth', amount: 499, credits: 1000, trialDays: 0 },
} as const;

const APP_SUBSCRIPTION_CREATE = `
  mutation AppSubscriptionCreate(
    $name: String!
    $returnUrl: URL!
    $trialDays: Int
    $test: Boolean
    $lineItems: [AppSubscriptionLineItemInput!]!
  ) {
    appSubscriptionCreate(
      name: $name
      returnUrl: $returnUrl
      trialDays: $trialDays
      test: $test
      lineItems: $lineItems
    ) {
      appSubscription { id name status }
      confirmationUrl
      userErrors { field message }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const { plan, partnerId } = await req.json();
    const planKey = plan as keyof typeof PLANS;

    if (!plan || !PLANS[planKey]) {
      return NextResponse.json({ error: 'Invalid plan. Use "starter" or "growth"' }, { status: 400 });
    }
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: partner } = await admin
      .from('partners')
      .select('id, shop_domain, shopify_access_token, shopify_subscription_id, plan')
      .eq('id', partnerId)
      .single();

    if (!partner || !partner.shop_domain || !partner.shopify_access_token) {
      return NextResponse.json({ error: 'Partner not installed or missing access token' }, { status: 404 });
    }

    const config = PLANS[planKey];
    const isNewTrial = !partner.shopify_subscription_id && (!partner.plan || partner.plan === 'trial');
    const trialDays = planKey === 'starter' && isNewTrial ? config.trialDays : 0;

    const appUrl = process.env.SHOPIFY_APP_URL || req.nextUrl.origin;
    const shop = req.nextUrl.searchParams.get('shop') || partner.shop_domain;
    const returnUrl = `${appUrl}/dashboard?shop=${encodeURIComponent(shop)}&subscribed=true`;

    const isTestStore = await shouldUseTestCharge(
      partner.shop_domain,
      partner.shopify_access_token,
    );

    const result = await shopifyGraphQL<{
      appSubscriptionCreate: {
        appSubscription: { id: string; name: string; status: string } | null;
        confirmationUrl: string | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(
      partner.shop_domain,
      partner.shopify_access_token,
      APP_SUBSCRIPTION_CREATE,
      {
        name: config.name,
        returnUrl,
        trialDays,
        test: isTestStore,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: config.amount, currencyCode: 'USD' },
                interval: 'EVERY_30_DAYS',
              },
            },
          },
        ],
      },
    );

    const data = result.appSubscriptionCreate;
    if (data.userErrors && data.userErrors.length > 0) {
      const msg = data.userErrors.map((e) => e.message).join('; ');
      console.error('AppSubscriptionCreate errors:', msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (!data.confirmationUrl || !data.appSubscription) {
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    // Persist the pending subscription id so the webhook can reconcile on activation
    await admin
      .from('partners')
      .update({
        shopify_subscription_id: data.appSubscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', partnerId);

    return NextResponse.json({ url: data.confirmationUrl });
  } catch (err: any) {
    console.error('Partner checkout error:', err?.message);
    return NextResponse.json(
      { error: err.message?.substring(0, 300) || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
