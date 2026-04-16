import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/partners';
import { getRecommendations } from '@/services/recommendationEngine';

export const maxDuration = 30;

function corsHeaders(origin?: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401, headers });
  }

  const apiKey = authHeader.replace('Bearer ', '');
  const requestOrigin = origin || request.headers.get('referer');
  const { valid, partner, error } = await validateApiKey(apiKey, requestOrigin);
  if (!valid || !partner) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401, headers });
  }

  let body: { productId?: string } = {};
  try { body = await request.json(); } catch {}

  const productId = String(body.productId || '').replace(/[^0-9]/g, '');
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400, headers });
  }

  try {
    const recommendations = await getRecommendations(partner.id, productId);
    return NextResponse.json({ recommendations }, { headers });
  } catch (err: any) {
    console.error('Recommendations error:', err?.message);
    return NextResponse.json({ recommendations: [] }, { headers });
  }
}
