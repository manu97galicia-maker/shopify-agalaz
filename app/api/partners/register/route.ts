import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shop_domain, email, store_name, store_url, plan } = body;

    if (!shop_domain || !email || !store_name || !store_url) {
      return NextResponse.json(
        { error: 'shop_domain, email, store_name, and store_url are required' },
        { status: 400 }
      );
    }

    // Parse store_url to extract domain for allowed_domains
    let storeDomain: string;
    try {
      storeDomain = new URL(store_url.startsWith('http') ? store_url : `https://${store_url}`).hostname;
    } catch {
      return NextResponse.json({ error: 'Invalid store_url' }, { status: 400 });
    }

    const domains = [storeDomain, shop_domain].filter(Boolean);

    const admin = createAdminClient();

    // Check if shop already has a partner account
    const { data: existing } = await admin
      .from('partners')
      .select('id')
      .eq('shop_domain', shop_domain)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A partner account already exists for this store' },
        { status: 409 }
      );
    }

    const selectedPlan = plan === 'growth' ? 'growth' : plan === 'starter' ? 'starter' : 'trial';
    const { data: partner, error } = await admin
      .from('partners')
      .insert({
        email,
        store_name,
        store_url: store_url.startsWith('http') ? store_url : `https://${store_url}`,
        shop_domain,
        api_key_hash: 'pending',
        api_key_prefix: 'pending',
        allowed_domains: domains,
        plan: selectedPlan,
        price_eur: selectedPlan === 'growth' ? 499 : selectedPlan === 'starter' ? 150 : 0,
        setup_fee_eur: 0,
        credits_remaining: 0,
        credits_monthly_limit: selectedPlan === 'growth' ? 1000 : selectedPlan === 'starter' ? 200 : 5,
        is_active: selectedPlan === 'trial',
        setup_paid: true,
      })
      .select('id, store_name, plan')
      .single();

    if (error) {
      console.error('Partner creation error:', error);
      return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      partner: { id: partner.id, store_name: partner.store_name, plan: partner.plan },
    });
  } catch (error: any) {
    console.error('Partner registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
