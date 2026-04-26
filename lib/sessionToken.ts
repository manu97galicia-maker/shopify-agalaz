import { createHmac, timingSafeEqual } from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

export interface SessionTokenPayload {
  shop: string;
  sub: string;
  iss: string;
  dest: string;
  aud: string;
  exp: number;
  nbf: number;
}

const SHOP_RE = /https?:\/\/([^/]+\.myshopify\.com)/;

export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const data = `${headerB64}.${payloadB64}`;
    const expected = createHmac('sha256', SHOPIFY_API_SECRET)
      .update(data)
      .digest('base64url');

    const sigBuf = Buffer.from(signatureB64);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString()
    ) as Record<string, any>;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now - 5) return null;
    if (typeof payload.nbf !== 'number' || payload.nbf > now + 5) return null;

    if (payload.aud !== SHOPIFY_API_KEY) return null;

    const issMatch = String(payload.iss || '').match(SHOP_RE);
    const destMatch = String(payload.dest || '').match(SHOP_RE);
    if (!issMatch || !destMatch) return null;
    if (issMatch[1] !== destMatch[1]) return null;

    return {
      shop: destMatch[1],
      sub: String(payload.sub || ''),
      iss: String(payload.iss),
      dest: String(payload.dest),
      aud: String(payload.aud),
      exp: payload.exp,
      nbf: payload.nbf,
    };
  } catch {
    return null;
  }
}
