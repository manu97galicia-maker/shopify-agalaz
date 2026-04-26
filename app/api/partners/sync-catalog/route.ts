import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { triggerCatalogSync } from '@/lib/triggerCatalogSync';
import { requireShopAuth } from '@/lib/requireShopAuth';

const COOLDOWN_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const auth = requireShopAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const admin = createAdminClient();
    const { data: partner } = await admin
      .from('partners')
      .select('id, shop_domain, shopify_access_token, last_catalog_sync_at, plan')
      .eq('shop_domain', auth.shop)
      .single();

    if (!partner?.shopify_access_token) {
      return NextResponse.json({ error: 'No Shopify token — reinstall the app' }, { status: 400 });
    }

    if (partner.last_catalog_sync_at) {
      const { count: productsCount } = await admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('partner_id', partner.id);

      if ((productsCount || 0) > 0) {
        const elapsed = Date.now() - new Date(partner.last_catalog_sync_at).getTime();
        if (elapsed < COOLDOWN_MS) {
          const waitMins = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
          return NextResponse.json({
            error: `Sync cooldown — try again in ${waitMins} minute${waitMins > 1 ? 's' : ''}`,
            retry_in_seconds: Math.ceil((COOLDOWN_MS - elapsed) / 1000),
          }, { status: 429 });
        }
      }
    }

    await admin
      .from('partners')
      .update({ last_catalog_sync_at: new Date().toISOString() })
      .eq('id', partner.id);

    triggerCatalogSync(partner.id);

    return NextResponse.json({
      success: true,
      message: 'Sync started in background',
      plan: partner.plan,
    });
  } catch (err: any) {
    console.error('Sync trigger error:', err?.message);
    return NextResponse.json({ error: 'Failed to trigger sync' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireShopAuth(req);
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data: partner } = await admin
    .from('partners')
    .select('id')
    .eq('shop_domain', auth.shop)
    .single();

  if (!partner) {
    return NextResponse.json({ total: 0, classified: 0, last_synced: null });
  }

  const { count: total } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partner.id);

  const { count: classified } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partner.id)
    .not('classified_at', 'is', null);

  const { data: latest } = await admin
    .from('products')
    .select('synced_at')
    .eq('partner_id', partner.id)
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    total: total || 0,
    classified: classified || 0,
    last_synced: latest?.synced_at || null,
  });
}
