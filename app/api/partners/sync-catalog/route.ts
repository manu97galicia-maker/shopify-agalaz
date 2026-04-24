import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { triggerCatalogSync } from '@/lib/triggerCatalogSync';

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const { partner_id, shop } = await req.json();
    if (!partner_id) {
      return NextResponse.json({ error: 'partner_id is required' }, { status: 400 });
    }
    if (!shop) {
      return NextResponse.json({ error: 'shop is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: partner } = await admin
      .from('partners')
      .select('id, shop_domain, shopify_access_token, last_catalog_sync_at, plan')
      .eq('id', partner_id)
      .single();

    if (!partner?.shopify_access_token) {
      return NextResponse.json({ error: 'No Shopify token — reinstall the app' }, { status: 400 });
    }

    // Prevent UUID probing — caller must know the shop domain too
    if (partner.shop_domain !== shop) {
      return NextResponse.json({ error: 'Shop mismatch' }, { status: 403 });
    }

    // Cooldown to prevent abuse — but waive it if the merchant still has
    // zero products synced (first-time setup where the auto-sync ran too
    // early, before the merchant added products).
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
  const partnerId = req.nextUrl.searchParams.get('partner_id');
  if (!partnerId) {
    return NextResponse.json({ error: 'partner_id is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { count: total } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partnerId);

  const { count: classified } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partnerId)
    .not('classified_at', 'is', null);

  const { data: latest } = await admin
    .from('products')
    .select('synced_at')
    .eq('partner_id', partnerId)
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    total: total || 0,
    classified: classified || 0,
    last_synced: latest?.synced_at || null,
  });
}
