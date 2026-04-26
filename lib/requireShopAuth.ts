import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SessionTokenPayload } from './sessionToken';

export type ShopAuth =
  | { ok: true; shop: string; sub: string; payload: SessionTokenPayload }
  | { ok: false; response: NextResponse };

export function requireShopAuth(req: NextRequest): ShopAuth {
  const auth = req.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing session token' },
        { status: 401 }
      ),
    };
  }
  const payload = verifySessionToken(match[1]);
  if (!payload || !payload.shop) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      ),
    };
  }
  return { ok: true, shop: payload.shop, sub: payload.sub, payload };
}
