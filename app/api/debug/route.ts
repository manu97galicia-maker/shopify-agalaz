import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const admin = createAdminClient();

    // Test 1: Check connection
    const { data: testData, error: testError } = await admin
      .from('partners')
      .select('id, shop_domain')
      .limit(3);

    // Test 2: Check specific shop
    const { data: shopData, error: shopError } = await admin
      .from('partners')
      .select('id, email, store_name, shop_domain, api_key_prefix, is_active, plan, credits_remaining')
      .eq('shop_domain', 'agalaz-test-store.myshopify.com')
      .single();

    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      test_query: { data: testData, error: testError?.message },
      shop_query: { data: shopData, error: shopError?.message },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.slice(0, 500) }, { status: 500 });
  }
}
