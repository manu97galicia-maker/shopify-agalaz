import { createAdminClient } from '@/lib/supabaseAdmin';
import { iterateAllProducts, shopifyGidToId, fetchProduct, ShopifyProduct } from '@/lib/shopifyGraphQL';
import { classifyProducts } from './productClassifier';

interface SyncStats {
  total: number;
  inserted: number;
  updated: number;
  classified: number;
  skippedAlreadyClassified: number;
  cappedByPlan: number;
  errors: number;
}

const TRIAL_MAX_PRODUCTS = 500;
const CLASSIFY_MAX_PER_SYNC = 800;

function parsePriceCents(price: string): number {
  const n = parseFloat(price);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function pickOption(options: { name: string; value: string }[], re: RegExp): string | null {
  const found = options.find((o) => re.test(o.name));
  return found?.value || null;
}

async function upsertProduct(
  partnerId: string,
  p: ShopifyProduct,
): Promise<{ productRowId: string; isNew: boolean; alreadyClassified: boolean; contentChanged: boolean } | null> {
  const admin = createAdminClient();
  const shopifyId = shopifyGidToId(p.id);

  const { data: existing } = await admin
    .from('products')
    .select('id, title, product_type, tags, primary_category')
    .eq('partner_id', partnerId)
    .eq('shopify_product_id', shopifyId)
    .maybeSingle();

  const newTitle = p.title;
  const newType = p.productType || null;
  const newTags = (p.tags || []).slice().sort();
  const oldTags = (existing?.tags || []).slice().sort();

  const contentChanged = !existing
    || existing.title !== newTitle
    || existing.product_type !== newType
    || JSON.stringify(oldTags) !== JSON.stringify(newTags);

  const payload: Record<string, any> = {
    partner_id: partnerId,
    shopify_product_id: shopifyId,
    handle: p.handle,
    title: p.title,
    description: p.description?.substring(0, 4000) || null,
    vendor: p.vendor || null,
    product_type: p.productType || null,
    tags: p.tags || [],
    featured_image_url: p.featuredImage?.url || null,
    status: p.status?.toLowerCase() || 'active',
    synced_at: new Date().toISOString(),
  };

  if (contentChanged && existing) {
    payload.primary_category = null;
    payload.style = null;
    payload.color_family = null;
    payload.classified_at = null;
  }

  let productRowId: string;
  let isNew = false;
  const alreadyClassified = !!existing?.primary_category && !contentChanged;

  if (existing) {
    await admin.from('products').update(payload).eq('id', existing.id);
    productRowId = existing.id;
  } else {
    const { data: inserted, error } = await admin
      .from('products')
      .insert(payload)
      .select('id')
      .single();
    if (error || !inserted) {
      console.warn(`[sync] insert failed for ${shopifyId}:`, error?.message);
      return null;
    }
    productRowId = inserted.id;
    isNew = true;
  }

  const variants = p.variants?.edges?.map((e) => e.node) || [];
  if (variants.length > 0) {
    await admin.from('product_variants').delete().eq('product_id', productRowId);
    const rows = variants.map((v) => ({
      product_id: productRowId,
      shopify_variant_id: shopifyGidToId(v.id),
      title: v.title || null,
      price_cents: parsePriceCents(v.price),
      currency: 'EUR',
      available: !!v.availableForSale,
      size: pickOption(v.selectedOptions || [], /size|talla/i),
      color: pickOption(v.selectedOptions || [], /color|colour/i),
    }));
    await admin.from('product_variants').insert(rows);
  }

  return { productRowId, isNew, alreadyClassified, contentChanged };
}

export async function syncShopifyCatalog(
  partnerId: string,
  shopDomain: string,
  accessToken: string,
): Promise<SyncStats> {
  const stats: SyncStats = {
    total: 0, inserted: 0, updated: 0, classified: 0,
    skippedAlreadyClassified: 0, cappedByPlan: 0, errors: 0,
  };
  const admin = createAdminClient();

  const { data: partner } = await admin
    .from('partners')
    .select('plan')
    .eq('id', partnerId)
    .single();

  const isTrial = !partner || partner.plan === 'trial';
  const maxProducts = isTrial ? TRIAL_MAX_PRODUCTS : Infinity;

  const pendingClassification: Array<{
    rowId: string;
    title: string;
    product_type: string | null;
    tags: string[];
    description: string | null;
  }> = [];

  let processedCount = 0;

  try {
    outer: for await (const batch of iterateAllProducts(shopDomain, accessToken, 100)) {
      for (const product of batch) {
        if (processedCount >= maxProducts) {
          stats.cappedByPlan = stats.total - processedCount;
          break outer;
        }
        stats.total++;
        processedCount++;
        try {
          const result = await upsertProduct(partnerId, product);
          if (!result) { stats.errors++; continue; }
          if (result.isNew) stats.inserted++; else stats.updated++;

          if (result.alreadyClassified) {
            stats.skippedAlreadyClassified++;
            continue;
          }

          if (pendingClassification.length < CLASSIFY_MAX_PER_SYNC) {
            pendingClassification.push({
              rowId: result.productRowId,
              title: product.title,
              product_type: product.productType || null,
              tags: product.tags || [],
              description: product.description?.substring(0, 500) || null,
            });
          }
        } catch (err: any) {
          console.warn(`[sync] product error:`, err?.message?.substring(0, 200));
          stats.errors++;
        }
      }
    }
  } catch (err: any) {
    console.error('[sync] iteration error:', err?.message?.substring(0, 300));
    stats.errors++;
  }

  if (pendingClassification.length > 0) {
    try {
      const classifications = await classifyProducts(pendingClassification);
      const nowIso = new Date().toISOString();
      for (let i = 0; i < pendingClassification.length; i++) {
        const c = classifications[i];
        await admin
          .from('products')
          .update({
            primary_category: c.primary_category,
            style: c.style,
            color_family: c.color_family,
            classified_at: nowIso,
          })
          .eq('id', pendingClassification[i].rowId);
        stats.classified++;
      }

      await admin.rpc('increment_ai_classifications', {
        p_partner_id: partnerId,
        p_delta: stats.classified,
      }).then(() => null, async () => {
        const { data: current } = await admin
          .from('partners')
          .select('ai_classifications_total')
          .eq('id', partnerId)
          .single();
        await admin
          .from('partners')
          .update({ ai_classifications_total: (current?.ai_classifications_total || 0) + stats.classified })
          .eq('id', partnerId);
      });
    } catch (err: any) {
      console.warn('[sync] classification error:', err?.message?.substring(0, 200));
    }
  }

  return stats;
}

export async function syncSingleProduct(
  partnerId: string,
  shopDomain: string,
  accessToken: string,
  shopifyProductGid: string,
): Promise<void> {
  const admin = createAdminClient();
  const product = await fetchProduct(shopDomain, accessToken, shopifyProductGid);
  if (!product) return;

  const result = await upsertProduct(partnerId, product);
  if (!result) return;

  const [c] = await classifyProducts([{
    title: product.title,
    product_type: product.productType || null,
    tags: product.tags || [],
    description: product.description?.substring(0, 500) || null,
  }]);

  await admin
    .from('products')
    .update({
      primary_category: c.primary_category,
      style: c.style,
      color_family: c.color_family,
      classified_at: new Date().toISOString(),
    })
    .eq('id', result.productRowId);

  await admin
    .from('recommendations_cache')
    .delete()
    .eq('partner_id', partnerId)
    .eq('source_shopify_product_id', shopifyGidToId(shopifyProductGid));
}

export async function deleteProduct(
  partnerId: string,
  shopifyProductId: string,
): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('products')
    .delete()
    .eq('partner_id', partnerId)
    .eq('shopify_product_id', shopifyProductId);
  await admin
    .from('recommendations_cache')
    .delete()
    .eq('partner_id', partnerId)
    .eq('source_shopify_product_id', shopifyProductId);
}
