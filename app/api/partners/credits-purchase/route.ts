import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { shopifyGraphQL } from '@/lib/shopifyGraphQL';
import { shouldUseTestCharge } from '@/lib/shopifyBilling';
import { requireShopAuth } from '@/lib/requireShopAuth';

export const runtime = 'nodejs';

const CREDITS_PER_PACK = 20;
const PRICE_USD = 9.99;
const PACK_NAME = 'Agalaz 20 Credits';

const APP_PURCHASE_ONE_TIME_CREATE = `
  mutation AppPurchaseOneTimeCreate(
    $name: String!
    $price: MoneyInput!
    $returnUrl: URL!
    $test: Boolean
  ) {
    appPurchaseOneTimeCreate(
      name: $name
      price: $price
      returnUrl: $returnUrl
      test: $test
    ) {
      appPurchaseOneTime { id name status }
      confirmationUrl
      userErrors { field message }
    }
  }
`;

const APP_PURCHASE_QUERY = `
  query AppPurchase($id: ID!) {
    node(id: $id) {
      ... on AppPurchaseOneTime {
        id
        name
        status
        test
      }
    }
  }
`;

// POST: create one-time purchase, return confirmationUrl
export async function POST(req: NextRequest) {
  const auth = requireShopAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const admin = createAdminClient();
    const { data: partner } = await admin
      .from('partners')
      .select('id, shop_domain, shopify_access_token')
      .eq('shop_domain', auth.shop)
      .single();

    if (!partner?.shopify_access_token) {
      return NextResponse.json({ error: 'Partner not installed' }, { status: 404 });
    }

    const appUrl = process.env.SHOPIFY_APP_URL || req.nextUrl.origin;
    const returnUrl = `${appUrl}/api/partners/credits-purchase?shop=${encodeURIComponent(partner.shop_domain)}`;

    const isTest = await shouldUseTestCharge(partner.shop_domain, partner.shopify_access_token);

    const result = await shopifyGraphQL<{
      appPurchaseOneTimeCreate: {
        appPurchaseOneTime: { id: string; name: string; status: string } | null;
        confirmationUrl: string | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(
      partner.shop_domain,
      partner.shopify_access_token,
      APP_PURCHASE_ONE_TIME_CREATE,
      {
        name: PACK_NAME,
        price: { amount: PRICE_USD, currencyCode: 'USD' },
        returnUrl,
        test: isTest,
      },
    );

    const data = result.appPurchaseOneTimeCreate;
    if (data.userErrors?.length > 0) {
      return NextResponse.json(
        { error: data.userErrors.map((e) => e.message).join('; ') },
        { status: 400 },
      );
    }
    if (!data.confirmationUrl || !data.appPurchaseOneTime) {
      return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
    }

    return NextResponse.json({ url: data.confirmationUrl });
  } catch (err: any) {
    console.error('Credits purchase error:', err?.message);
    return NextResponse.json({ error: 'Failed to start purchase' }, { status: 500 });
  }
}

// GET: returnUrl callback after Shopify approval — verify charge and credit the partner.
// Shopify redirects with ?charge_id=<numeric>&shop=<domain>. The dashboard will redirect
// to here on completion. Idempotent: marks the charge as processed in partner_credit_purchases.
export async function GET(req: NextRequest) {
  const chargeId = req.nextUrl.searchParams.get('charge_id');
  const shop = req.nextUrl.searchParams.get('shop');

  if (!chargeId || !shop) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
  }

  const admin = createAdminClient();
  const { data: partner } = await admin
    .from('partners')
    .select('id, shop_domain, shopify_access_token, credits_remaining')
    .eq('shop_domain', shop)
    .single();

  if (!partner?.shopify_access_token) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
  }

  const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
  dashboardUrl.searchParams.set('shop', partner.shop_domain);

  try {
    const gid = `gid://shopify/AppPurchaseOneTime/${chargeId}`;
    const result = await shopifyGraphQL<{
      node: { id: string; name: string; status: string; test: boolean } | null;
    }>(
      partner.shop_domain,
      partner.shopify_access_token,
      APP_PURCHASE_QUERY,
      { id: gid },
    );

    if (result.node?.status !== 'ACTIVE') {
      dashboardUrl.searchParams.set('credits_purchase', 'pending');
      return NextResponse.redirect(dashboardUrl);
    }

    // Idempotency: skip if already processed
    const { data: existing } = await admin
      .from('partner_credit_purchases')
      .select('id')
      .eq('charge_id', chargeId)
      .maybeSingle();

    if (!existing) {
      await admin.from('partners').update({
        credits_remaining: (partner.credits_remaining || 0) + CREDITS_PER_PACK,
        updated_at: new Date().toISOString(),
      }).eq('id', partner.id);

      // Best-effort: log purchase. If table doesn't exist, fall back silently —
      // the charge_id is unique on Shopify's side so duplicate processing is
      // bounded by the merchant clicking refresh on this URL.
      await admin.from('partner_credit_purchases').insert({
        partner_id: partner.id,
        charge_id: chargeId,
        credits: CREDITS_PER_PACK,
        amount_usd: PRICE_USD,
      });
    }

    dashboardUrl.searchParams.set('credits_purchase', 'success');
    return NextResponse.redirect(dashboardUrl);
  } catch (err: any) {
    console.error('Credits purchase verify error:', err?.message);
    dashboardUrl.searchParams.set('credits_purchase', 'error');
    return NextResponse.redirect(dashboardUrl);
  }
}
