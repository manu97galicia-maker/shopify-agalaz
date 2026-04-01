import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dashboard: ensure it can be embedded in Shopify admin iframe
  if (pathname.startsWith('/dashboard')) {
    const response = NextResponse.next();
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
    );
    // Remove X-Frame-Options to allow Shopify iframe embedding
    response.headers.delete('X-Frame-Options');
    return response;
  }

  // Embed page: allow embedding from any origin (partner stores)
  if (pathname.startsWith('/embed')) {
    const response = NextResponse.next();
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors *;"
    );
    response.headers.delete('X-Frame-Options');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/embed/:path*'],
};
