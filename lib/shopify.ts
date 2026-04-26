import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_products';
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL || '';

export const OAUTH_NONCE_COOKIE = 'agalaz_oauth_nonce';

export function generateOAuthNonce(): string {
  return randomBytes(16).toString('hex');
}

export interface BuiltAuthUrl {
  url: string;
  nonce: string;
}

export function buildAuthUrl(shop: string): BuiltAuthUrl {
  const redirectUri = `${SHOPIFY_APP_URL}/api/auth/callback`;
  const nonce = generateOAuthNonce();
  const url = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;
  return { url, nonce };
}

export function verifyOAuthState(state: string, expectedNonce: string | undefined): boolean {
  if (!state || !expectedNonce) return false;
  const a = Buffer.from(state);
  const b = Buffer.from(expectedNonce);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

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

export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}
