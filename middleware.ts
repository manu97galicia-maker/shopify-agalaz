import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SHOP_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

function frameAncestors(shop: string | null): string {
  if (shop && SHOP_RE.test(shop)) {
    return `frame-ancestors https://${shop} https://admin.shopify.com;`;
  }
  return `frame-ancestors https://*.myshopify.com https://admin.shopify.com;`;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const shop = searchParams.get('shop');

  if (pathname === '/' && (searchParams.get('embedded') === '1' || shop)) {
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.search = request.nextUrl.search;
    const response = NextResponse.rewrite(dashboardUrl);
    response.headers.delete('X-Frame-Options');
    response.headers.set('Content-Security-Policy', frameAncestors(shop));
    return response;
  }

  const response = NextResponse.next();
  response.headers.delete('X-Frame-Options');
  response.headers.set('Content-Security-Policy', frameAncestors(shop));
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
