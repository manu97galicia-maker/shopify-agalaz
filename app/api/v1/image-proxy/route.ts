import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  /\.shopify\.com$/,
  /\.shopifycdn\.com$/,
  /\.myshopify\.com$/,
  /cdn\.shopify\.com$/,
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

function isAllowedUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  // Block private/internal IPs
  if (/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|169\.254\.|localhost|::1|\[::1\])/.test(host)) return false;
  if (host === 'metadata.google.internal') return false;
  // Allow known CDN hosts
  if (ALLOWED_HOSTS.some((re) => re.test(host))) return true;
  // Also allow common image CDNs
  if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(parsed.pathname)) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'Accept': 'image/jpeg,image/png,image/webp,image/*',
        'User-Agent': 'Mozilla/5.0 (compatible; Agalaz/1.0)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Not an image' }, { status: 400 });
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Image proxy error' }, { status: 500 });
  }
}
