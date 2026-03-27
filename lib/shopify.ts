import { createHmac, timingSafeEqual } from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_products,read_themes,write_themes';
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL || '';

/**
 * Build the Shopify OAuth authorization URL.
 */
export function buildAuthUrl(shop: string): string {
  const redirectUri = `${SHOPIFY_APP_URL}/api/auth/callback`;
  const nonce = Date.now().toString(36);
  return `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;
}

/**
 * Exchange the authorization code for an access token.
 */
export async function exchangeToken(shop: string, code: string): Promise<string> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Verify Shopify HMAC signature for OAuth callbacks and webhooks.
 */
export function verifyHmac(queryParams: Record<string, string>): boolean {
  const { hmac, ...rest } = queryParams;
  if (!hmac) return false;

  const sorted = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');
  const computed = createHmac('sha256', SHOPIFY_API_SECRET).update(sorted).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(computed));
  } catch {
    return false;
  }
}

/**
 * Verify the Shopify app proxy signature.
 */
export function verifyProxySignature(queryParams: Record<string, string>): boolean {
  const { signature, ...rest } = queryParams;
  if (!signature) return false;

  const sorted = Object.keys(rest).sort().map(k => `${k}=${Array.isArray(rest[k]) ? rest[k] : rest[k]}`).join('');
  const computed = createHmac('sha256', SHOPIFY_API_SECRET).update(sorted).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
  } catch {
    return false;
  }
}

/**
 * Validate that a shop domain is a valid myshopify.com domain.
 */
export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}
