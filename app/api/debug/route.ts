import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

/**
 * Debug endpoint — temporarily open for setup verification.
 * TODO: Re-add authentication before App Store submission.
 */
export async function GET() {
  try {
    const admin = createAdminClient();

    const { data: testData, error: testError } = await admin
      .from('partners')
      .select('id, shop_domain')
      .limit(3);

    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      shopify_key: process.env.SHOPIFY_API_KEY ? 'SET' : 'MISSING',
      shopify_secret: process.env.SHOPIFY_API_SECRET ? 'SET' : 'MISSING',
      gemini: process.env.GEMINI_API_KEY ? 'SET' : 'MISSING',
      stripe: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
      stripe_webhook: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'MISSING',
      app_url: process.env.NEXT_PUBLIC_APP_URL || process.env.SHOPIFY_APP_URL || 'MISSING',
      test_query: { data: testData, error: testError?.message },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
