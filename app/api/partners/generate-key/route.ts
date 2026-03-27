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

    if (partner.is_active && partner.api_key_hash !== 'pending') {
      return NextResponse.json({ error: 'API key already generated' }, { status: 409 });
    }

    const { raw, hash, prefix } = generateApiKey();

    await admin.from('partners').update({
      api_key_hash: hash,
      api_key_prefix: prefix,
      is_active: true,
      credits_remaining: 5,
      setup_paid: true,
      updated_at: new Date().toISOString(),
    }).eq('id', partner_id);

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
