import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // If Shopify embeds the root URL with embedded=1, rewrite to dashboard (not redirect)
  // Rewrite preserves the URL and lets App Bridge detect properly
  if (pathname === '/' && (searchParams.get('embedded') === '1' || searchParams.get('shop'))) {
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(dashboardUrl);
  }

  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', '');
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com *;"
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
