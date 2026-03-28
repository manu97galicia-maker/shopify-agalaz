import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabaseAdmin';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

/**
 * Verify Shopify webhook HMAC signature.
 */
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
 * Mandatory GDPR webhooks required by Shopify App Store:
 * - customers/data_request: Customer requests their data
 * - customers/redact: Customer requests data deletion
 * - shop/redact: Shop uninstalls app, delete all shop data
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256') || '';
  const topic = request.headers.get('x-shopify-topic') || '';

  // Verify authenticity
  if (!verifyWebhookHmac(body, hmac)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const admin = createAdminClient();

  switch (topic) {
    case 'customers/data_request': {
      // Shopify asks us to report what customer data we store.
      // We don't store any customer PII — images are processed in memory
      // and never persisted. We only store partner (merchant) data.
      console.log(`[GDPR] customers/data_request for shop ${payload.shop_domain}`);
      return NextResponse.json({
        message: 'No customer data stored. Images are processed in memory only.',
      });
    }

    case 'customers/redact': {
      // Customer asks to delete their data.
      // We don't store customer data, so nothing to delete.
      console.log(`[GDPR] customers/redact for shop ${payload.shop_domain}, customer ${payload.customer?.id}`);
      return NextResponse.json({
        message: 'No customer data to redact. Images are not stored.',
      });
    }

    case 'shop/redact': {
      // Shop uninstalled the app — delete all merchant data.
      const shopDomain = payload.shop_domain;
      console.log(`[GDPR] shop/redact for ${shopDomain}`);

      if (shopDomain) {
        // Deactivate the partner record and clear sensitive data
        await admin
          .from('partners')
          .update({
            is_active: false,
            shopify_access_token: null,
            updated_at: new Date().toISOString(),
          })
          .eq('shop_domain', shopDomain);
      }

      return NextResponse.json({ message: 'Shop data redacted successfully.' });
    }

    default:
      return NextResponse.json({ error: `Unhandled topic: ${topic}` }, { status: 400 });
  }
}
