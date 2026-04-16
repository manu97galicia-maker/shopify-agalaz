const APP_URL = process.env.SHOPIFY_APP_URL || '';
const SECRET = process.env.INTERNAL_SYNC_SECRET || process.env.SHOPIFY_API_SECRET || '';

export function triggerCatalogSync(partnerId: string): void {
  if (!APP_URL || !SECRET) {
    console.warn('[trigger-sync] missing APP_URL or secret');
    return;
  }
  fetch(`${APP_URL}/api/shopify/sync-catalog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET}`,
    },
    body: JSON.stringify({ partnerId }),
  }).catch((err) => {
    console.warn('[trigger-sync] request failed:', err?.message);
  });
}
