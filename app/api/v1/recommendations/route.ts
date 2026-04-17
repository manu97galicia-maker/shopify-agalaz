import { NextRequest, NextResponse } from 'next/server';
import { fetchRecommendations, getCompliment, getCrossSellMessage } from '@/services/crossSell';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop') || '';
  const productType = searchParams.get('ptype') || '';
  const lang = searchParams.get('lang') || 'en';

  if (!shop) {
    return NextResponse.json({ recommendations: [], compliment: '', crossSellMessage: '' });
  }

  const recommendations = await fetchRecommendations(shop, productType, 3);
  const compliment = getCompliment(productType, lang);
  const crossSellMessage = recommendations.length > 0
    ? getCrossSellMessage(productType, recommendations[0]?.productType || '', lang)
    : '';

  return NextResponse.json(
    { recommendations, compliment, crossSellMessage },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
}
