import { createHmac, timingSafeEqual } from 'crypto';

const API_VERSION = '2024-10';
const APP_URL = process.env.SHOPIFY_APP_URL || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

const PRODUCT_TOPICS: Array<{ topic: string; path: string }> = [
  { topic: 'products/create', path: '/api/webhooks/products-create' },
  { topic: 'products/update', path: '/api/webhooks/products-update' },
  { topic: 'products/delete', path: '/api/webhooks/products-delete' },
];

export async function registerProductWebhooks(shop: string, accessToken: string): Promise<void> {
  if (!APP_URL) return;
  for (const { topic, path } of PRODUCT_TOPICS) {
    try {
      const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          webhook: {
            topic,
            address: `${APP_URL}${path}`,
            format: 'json',
          },
        }),
      });
      if (!res.ok && res.status !== 422) {
        const body = await res.text();
        console.warn(`[webhook-register] ${topic} failed (${res.status}):`, body.substring(0, 200));
      }
    } catch (err: any) {
      console.warn(`[webhook-register] ${topic} error:`, err?.message);
    }
  }
}

export function verifyWebhookHmac(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader || !SHOPIFY_API_SECRET) return false;
  const computed = createHmac('sha256', SHOPIFY_API_SECRET).update(rawBody, 'utf8').digest('base64');
  try {
    return timingSafeEqual(Buffer.from(hmacHeader), Buffer.from(computed));
  } catch {
    return false;
  }
}
