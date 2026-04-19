import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: partners } = await admin
  .from('partners')
  .select('id, store_name, store_url, shop_domain, shopify_access_token, total_renders, last_catalog_sync_at')
  .order('total_renders', { ascending: false });

for (const p of partners) {
  const storeUrl = p.store_url || '(empty)';
  console.log(`\n${p.store_name} (${p.total_renders} renders)`);
  console.log(`  store_url:   ${storeUrl}`);
  console.log(`  shop_domain: ${p.shop_domain || '(null)'}`);
  console.log(`  token:       ${p.shopify_access_token ? 'yes' : 'no'}`);
  console.log(`  last_sync:   ${p.last_catalog_sync_at || 'never'}`);

  // Probe: does /products.json respond?
  if (p.store_url) {
    try {
      const u = new URL(p.store_url.startsWith('http') ? p.store_url : `https://${p.store_url}`);
      const probeUrl = `https://${u.hostname}/products.json?limit=1`;
      const res = await fetch(probeUrl, { signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (!res) { console.log(`  products.json: TIMEOUT`); continue; }
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('json')) {
        const data = await res.json().catch(() => null);
        const count = data?.products?.length ?? 'invalid';
        console.log(`  products.json: ✅ ${res.status} (${count} products in sample)`);
      } else {
        console.log(`  products.json: ❌ ${res.status} ${contentType.substring(0, 50)}`);
      }
    } catch (e) {
      console.log(`  products.json: error ${e.message?.substring(0, 60)}`);
    }
  }
}
