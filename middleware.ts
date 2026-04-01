import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();

  // Remove X-Frame-Options (Vercel sets DENY by default)
  // and set CSP to allow Shopify admin embedding
  response.headers.delete('X-Frame-Options');
  response.headers.set('X-Frame-Options', 'ALLOWALL');
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com *;"
  );

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
