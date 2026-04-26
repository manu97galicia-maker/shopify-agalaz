import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { requireShopAuth } from '@/lib/requireShopAuth';

export async function GET(req: NextRequest) {
  const auth = requireShopAuth(req);
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data: partner, error } = await admin
    .from('partners')
    .select('id, store_name, store_url, plan, setup_paid, is_active, credits_remaining, api_key_prefix, stripe_subscription_id, shopify_subscription_id, credits_monthly_limit, total_renders, trial_ends_at')
    .eq('shop_domain', auth.shop)
    .single();

  if (error || !partner) {
    return NextResponse.json({ error: 'Partner not found', detail: error?.message }, { status: 404 });
  }

  return NextResponse.json({
    partner: {
      id: partner.id,
      store_name: partner.store_name,
      store_url: partner.store_url,
      plan: partner.plan,
      is_active: partner.is_active,
      credits_remaining: partner.credits_remaining,
      credits_monthly_limit: partner.credits_monthly_limit,
      total_renders: partner.total_renders,
      api_key_prefix: partner.api_key_prefix,
      has_api_key: partner.is_active && partner.api_key_prefix !== 'pending',
      has_subscription: !!(partner.shopify_subscription_id || partner.stripe_subscription_id),
      trial_ends_at: partner.trial_ends_at || null,
    },
  });
}
