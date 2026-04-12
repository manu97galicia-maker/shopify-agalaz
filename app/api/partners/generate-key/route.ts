import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { generateApiKey } from '@/lib/partners';

export async function POST(req: NextRequest) {
  try {
    const { partner_id } = await req.json();

    if (!partner_id) {
      return NextResponse.json({ error: 'partner_id is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: partner, error } = await admin
      .from('partners')
      .select('id, setup_paid, is_active, api_key_hash')
      .eq('id', partner_id)
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

    // Only set initial credits on first key generation
    if (isFirstKey) {
      updateData.credits_remaining = 5;
      updateData.setup_paid = true;
    }

    await admin.from('partners').update(updateData).eq('id', partner_id);

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
