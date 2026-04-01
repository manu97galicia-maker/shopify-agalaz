import { createHmac } from 'crypto';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

/**
 * Verify a Shopify session token (JWT) from App Bridge.
 * Returns the decoded payload if valid, null otherwise.
 */
export function verifySessionToken(token: string): { shop: string; sub: string } | null {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    // Verify signature
    const data = `${headerB64}.${payloadB64}`;
    const expected = createHmac('sha256', SHOPIFY_API_SECRET)
      .update(data)
      .digest('base64url');

    if (expected !== signatureB64) return null;

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    // Check expiry
    if (payload.exp && payload.exp < Date.now() / 1000) return null;

    // Extract shop domain from dest
    const dest = payload.dest || '';
    const match = dest.match(/https?:\/\/([^/]+\.myshopify\.com)/);
    const shop = match ? match[1] : '';

    return { shop, sub: payload.sub || '' };
  } catch {
    return null;
  }
}
