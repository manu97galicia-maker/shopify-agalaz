import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Get all Shopify partners (those with a shopify_access_token)
const { data: partners } = await admin
  .from('partners')
  .select('id, store_name, shop_domain, shopify_access_token, last_catalog_sync_at')
  .not('shopify_access_token', 'is', null)
  .like('shop_domain', '%.myshopify.com');

console.log(`\nFound ${partners?.length || 0} Shopify-connected partners with tokens:\n`);
for (const p of partners || []) {
  console.log(`- ${p.store_name} (${p.shop_domain})`);
  console.log(`  id=${p.id}`);
  console.log(`  token=${p.shopify_access_token ? 'YES' : 'NO'}`);
  console.log(`  last_sync=${p.last_catalog_sync_at || 'NEVER'}`);

  // Hit public partners/sync-catalog endpoint
  const res = await fetch('https://agalaz-virtual-tryon.vercel.app/api/partners/sync-catalog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partner_id: p.id, shop: p.shop_domain }),
  });
  const json = await res.json();
  console.log(`  trigger: ${res.status} ${JSON.stringify(json)}`);
  console.log('');
}
