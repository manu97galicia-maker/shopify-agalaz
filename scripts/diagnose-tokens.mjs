import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: all, error } = await admin
  .from('partners')
  .select('id, store_name, shop_domain, shopify_access_token, last_catalog_sync_at, setup_paid, is_active, created_at')
  .order('created_at', { ascending: false });

if (error) { console.error(error); process.exit(1); }

console.log(`\n=== ALL ${all.length} PARTNERS ===\n`);
for (const p of all) {
  const tokenState = p.shopify_access_token === null ? 'NULL'
    : p.shopify_access_token === '' ? 'EMPTY'
    : `SET (${p.shopify_access_token.substring(0, 8)}...)`;
  console.log(`${p.store_name}`);
  console.log(`  id=${p.id}`);
  console.log(`  shop_domain=${p.shop_domain}`);
  console.log(`  shopify_access_token=${tokenState}`);
  console.log(`  last_catalog_sync_at=${p.last_catalog_sync_at || 'NEVER'}`);
  console.log(`  created_at=${p.created_at}`);
  console.log('');
}
