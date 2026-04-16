import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { triggerCatalogSync } from '@/lib/triggerCatalogSync';

export async function POST(req: NextRequest) {
  try {
    const { partner_id } = await req.json();
    if (!partner_id) {
      return NextResponse.json({ error: 'partner_id is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: partner } = await admin
      .from('partners')
      .select('id, shop_domain, shopify_access_token')
      .eq('id', partner_id)
      .single();

    if (!partner?.shopify_access_token) {
      return NextResponse.json({ error: 'No Shopify token — reinstall the app' }, { status: 400 });
    }

    triggerCatalogSync(partner.id);

    return NextResponse.json({ success: true, message: 'Sync started in background' });
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
