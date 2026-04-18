import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { generateApiKey } from '@/lib/partners';

// Auto-setup a Shopify store as a partner when first opening the dashboard
export async function POST(req: NextRequest) {
  try {
    const { shop } = await req.json();

    if (!shop || !shop.endsWith('.myshopify.com')) {
      return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check if already exists
    const { data: existing } = await admin
      .from('partners')
      .select('id, api_key_hash, api_key_prefix, is_active, credits_remaining')
      .eq('shop_domain', shop)
      .single();

    if (existing && existing.api_key_hash !== 'pending') {
      return NextResponse.json({
        success: true,
        already_exists: true,
        partner_id: existing.id,
      });
    }

    // Generate API key
    const { raw, hash, prefix } = generateApiKey();
    const storeName = shop.replace('.myshopify.com', '');

    if (existing) {
      // Update existing record with API key
      await admin.from('partners').update({
        api_key_hash: hash,
        api_key_prefix: prefix,
        is_active: true,
        credits_remaining: 0,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);

      return NextResponse.json({
        success: true,
        partner_id: existing.id,
        api_key: raw,
        warning: 'Save this API key now — it cannot be retrieved again.',
      });
    }

    // Create new partner
    const { data: partner, error } = await admin
      .from('partners')
      .insert({
        email: `${storeName}@shopify.com`,
        store_name: storeName,
        store_url: `https://${shop}`,
        shop_domain: shop,
        api_key_hash: hash,
        api_key_prefix: prefix,
        allowed_domains: [shop],
        plan: 'trial',
        price_eur: 0,
        setup_fee_eur: 0,
        credits_remaining: 0,
        credits_monthly_limit: 0,
        total_renders: 0,
        is_active: true,
        setup_paid: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Shop setup error:', error);
      return NextResponse.json({ error: 'Failed to setup store' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      partner_id: partner.id,
      api_key: raw,
      warning: 'Save this API key now — it cannot be retrieved again.',
    });
  } catch (error: any) {
    console.error('Shop setup error:', error?.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
