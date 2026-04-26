import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { generateApiKey } from '@/lib/partners';
import { requireShopAuth } from '@/lib/requireShopAuth';

export async function POST(req: NextRequest) {
  const auth = requireShopAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const admin = createAdminClient();

    const { data: partner, error } = await admin
      .from('partners')
      .select('id, setup_paid, is_active, api_key_hash')
      .eq('shop_domain', auth.shop)
      .single();

    if (error || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const { raw, hash, prefix } = generateApiKey();
    const isFirstKey = !partner.api_key_hash || partner.api_key_hash === 'pending';

    const updateData: Record<string, any> = {
      api_key_hash: hash,
      api_key_prefix: prefix,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (isFirstKey) {
      updateData.setup_paid = true;
    }

    await admin.from('partners').update(updateData).eq('id', partner.id);

    return NextResponse.json({
      success: true,
      api_key: raw,
      warning: 'Save this API key now — it cannot be retrieved again.',
    });
  } catch (error: any) {
    console.error('Generate key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
