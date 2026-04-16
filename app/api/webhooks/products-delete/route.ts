import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookHmac } from '@/lib/shopifyWebhooks';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { deleteProduct } from '@/services/shopifyCatalogSync';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256');
  if (!verifyWebhookHmac(raw, hmac)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const shop = request.headers.get('x-shopify-shop-domain');
  if (!shop) return NextResponse.json({ ok: true });

  let payload: any;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }

  const productId = String(payload?.id || '');
  if (!productId) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  const { data: partner } = await admin
    .from('partners')
    .select('id')
    .eq('shop_domain', shop)
    .single();

  if (!partner) return NextResponse.json({ ok: true });

  try {
    await deleteProduct(partner.id, productId);
  } catch (err: any) {
    console.warn('[webhook products/delete] error:', err?.message?.substring(0, 200));
  }

  return NextResponse.json({ ok: true });
}
