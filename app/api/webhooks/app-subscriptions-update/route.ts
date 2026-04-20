import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabaseAdmin';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

function verifyWebhookHmac(body: string, hmacHeader: string): boolean {
  const computed = createHmac('sha256', SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');
  try {
    return timingSafeEqual(Buffer.from(hmacHeader), Buffer.from(computed));
  } catch {
    return false;
  }
}

const PLAN_CONFIG: Record<string, { key: 'starter' | 'growth'; monthlyLimit: number }> = {
  'Agalaz Starter': { key: 'starter', monthlyLimit: 200 },
  'Agalaz Growth': { key: 'growth', monthlyLimit: 1000 },
};

/**
 * Shopify fires app_subscriptions/update when a merchant accepts, cancels,
 * frozens or renews a subscription. Payload shape:
 *   { app_subscription: { id, name, status, admin_graphql_api_id, trial_ends_on, ... } }
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256') || '';

  if (!verifyWebhookHmac(body, hmac)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(body); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sub = payload.app_subscription;
  if (!sub) return NextResponse.json({ success: true });

  const shopDomain = request.headers.get('x-shopify-shop-domain') || '';
  if (!shopDomain) return NextResponse.json({ error: 'Missing shop header' }, { status: 400 });

  const admin = createAdminClient();
  const { data: partner } = await admin
    .from('partners')
    .select('id, credits_remaining')
    .eq('shop_domain', shopDomain)
    .single();
  if (!partner) return NextResponse.json({ success: true });

  const status = String(sub.status || '').toUpperCase();
  const config = PLAN_CONFIG[sub.name];
  const subId = sub.admin_graphql_api_id || sub.id;

  const updateData: Record<string, any> = {
    shopify_subscription_id: subId,
    updated_at: new Date().toISOString(),
  };

  if (status === 'ACTIVE' && config) {
    const trialEndsOn = sub.trial_ends_on ? new Date(sub.trial_ends_on) : null;
    const isInTrial = trialEndsOn && trialEndsOn > new Date();

    // Trial = 50 renders to taste; full allotment when trial ends / no trial
    const credits = isInTrial ? 50 : config.monthlyLimit;

    updateData.plan = config.key;
    updateData.credits_remaining = credits;
    updateData.credits_monthly_limit = config.monthlyLimit;
    updateData.is_active = true;
    updateData.trial_ends_at = trialEndsOn ? trialEndsOn.toISOString() : null;

    console.log(`[app_subscriptions/update] ${shopDomain} → ${config.key} ACTIVE (trial=${!!isInTrial}, credits=${credits})`);
  } else if (['CANCELLED', 'EXPIRED', 'DECLINED', 'FROZEN'].includes(status)) {
    updateData.plan = 'trial';
    updateData.credits_remaining = 0;
    updateData.credits_monthly_limit = 0;
    updateData.shopify_subscription_id = null;
    updateData.trial_ends_at = null;

    console.log(`[app_subscriptions/update] ${shopDomain} → subscription ${status}`);
  } else if (status === 'PENDING' || status === 'ACCEPTED') {
    console.log(`[app_subscriptions/update] ${shopDomain} → ${status} (awaiting activation)`);
  }

  await admin.from('partners').update(updateData).eq('id', partner.id);
  return NextResponse.json({ success: true });
}
