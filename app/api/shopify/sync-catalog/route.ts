import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { syncShopifyCatalog } from '@/services/shopifyCatalogSync';

export const maxDuration = 300;

const INTERNAL_SECRET = process.env.INTERNAL_SYNC_SECRET || process.env.SHOPIFY_API_SECRET || '';

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const expected = `Bearer ${INTERNAL_SECRET}`;
  if (!INTERNAL_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { partnerId?: string; shop?: string } = {};
  try { body = await request.json(); } catch {}

  const admin = createAdminClient();
  let partner: any;

  if (body.partnerId) {
    const { data } = await admin
      .from('partners')
      .select('id, shop_domain, shopify_access_token')
      .eq('id', body.partnerId)
      .single();
    partner = data;
  } else if (body.shop) {
    const { data } = await admin
      .from('partners')
      .select('id, shop_domain, shopify_access_token')
      .eq('shop_domain', body.shop)
      .single();
    partner = data;
  }

  if (!partner?.shop_domain || !partner?.shopify_access_token) {
    return NextResponse.json({ error: 'Partner not found or missing access token' }, { status: 404 });
  }

  try {
    const stats = await syncShopifyCatalog(
      partner.id,
      partner.shop_domain,
      partner.shopify_access_token,
    );
    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    console.error('Sync error:', err?.message);
    return NextResponse.json({ error: 'Sync failed', detail: err?.message?.substring(0, 300) }, { status: 500 });
  }
}
