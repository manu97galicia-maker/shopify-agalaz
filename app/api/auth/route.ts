import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl, isValidShopDomain, OAUTH_NONCE_COOKIE } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');

  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json(
      { error: 'Missing or invalid shop parameter. Expected: store-name.myshopify.com' },
      { status: 400 }
    );
  }

  const { url, nonce } = buildAuthUrl(shop);
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
