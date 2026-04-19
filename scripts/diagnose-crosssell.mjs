import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: partners } = await admin
  .from('partners')
  .select('id, store_name, shop_domain, plan, is_active, credits_remaining, total_renders')
  .order('created_at', { ascending: false });

console.log(`\n=== ${partners.length} partners ===\n`);

for (const p of partners) {
  const { count: total } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', p.id);

  const { count: classified } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', p.id)
    .not('primary_category', 'is', null);

  const { count: withCategory } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', p.id)
    .eq('status', 'active')
    .not('primary_category', 'is', null);

  const status = p.is_active ? '✅' : '⛔';
  console.log(`${status} ${p.store_name} (${p.shop_domain})`);
  console.log(`   plan=${p.plan} credits=${p.credits_remaining} renders=${p.total_renders}`);
  console.log(`   products total=${total} classified=${classified} active+classified=${withCategory}`);

  if (withCategory > 0) {
    const { data: sample } = await admin
      .from('products')
      .select('shopify_product_id, title, primary_category, style, color_family')
      .eq('partner_id', p.id)
      .not('primary_category', 'is', null)
      .limit(3);
    console.log(`   sample:`, sample.map(s => `${s.primary_category}/${s.color_family}`).join(', '));
  }
  console.log('');
}
