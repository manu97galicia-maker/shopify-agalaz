import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl, isValidShopDomain } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');

  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json(
      { error: 'Missing or invalid shop parameter. Expected: store-name.myshopify.com' },
      { status: 400 }
    );
  }

  const authUrl = buildAuthUrl(shop);
  return NextResponse.redirect(authUrl);
}
