// Centralized test-mode gating for Shopify AppSubscriptionCreate.
//
// Three-layer defense:
//   1. Explicit whitelist by shop_domain (works in any environment).
//   2. In Preview/Development only: env flag SHOPIFY_BILLING_TEST=true
//      AND the shop's Shopify plan must be a partner/development store.
//   3. Anything else → test=false (real charge in production).
//
// Production deploys must NOT have SHOPIFY_BILLING_TEST set. The whitelist
// is the only path to test-mode in prod and is explicit in git.

const TEST_SHOP_WHITELIST = new Set<string>([
  'agalaaz-fake-store.myshopify.com',
  'agalaz-test-store.myshopify.com',
]);

interface ShopifyShopInfo {
  plan_name?: string;
  plan_display_name?: string;
}

async function fetchShopifyShop(
  shopDomain: string,
  accessToken: string,
): Promise<ShopifyShopInfo | null> {
  try {
    const res = await fetch(
      `https://${shopDomain}/admin/api/2024-10/shop.json`,
      { headers: { 'X-Shopify-Access-Token': accessToken } },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body?.shop || null;
  } catch {
    return null;
  }
}

export async function shouldUseTestCharge(
  shopDomain: string,
  accessToken: string,
): Promise<boolean> {
  // Gate 1: explicit whitelist (works in every environment)
  if (TEST_SHOP_WHITELIST.has(shopDomain)) {
    return true;
  }

  // Gate 2 (Preview / Development only): env flag + partner plan
  if (process.env.SHOPIFY_BILLING_TEST !== 'true') {
    return false;
  }

  const shop = await fetchShopifyShop(shopDomain, accessToken);
  if (!shop) return false;

  const planHint = `${shop.plan_name || ''} ${shop.plan_display_name || ''}`.toLowerCase();
  return planHint.includes('partner') || planHint.includes('dev');
}
