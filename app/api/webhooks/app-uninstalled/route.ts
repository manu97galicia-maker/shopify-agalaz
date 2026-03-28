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

/**
 * Handle app/uninstalled webhook — clean up merchant data.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256') || '';

  if (!verifyWebhookHmac(body, hmac)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const shopDomain = payload.myshopify_domain || payload.domain;

  if (shopDomain) {
    const admin = createAdminClient();
    await admin
      .from('partners')
      .update({
        is_active: false,
        shopify_access_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('shop_domain', shopDomain);

    console.log(`[WEBHOOK] app/uninstalled: deactivated ${shopDomain}`);
  }

  return NextResponse.json({ success: true });
}
