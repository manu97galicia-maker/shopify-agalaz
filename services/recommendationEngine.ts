import { GoogleGenAI } from '@google/genai';
import { createAdminClient } from '@/lib/supabaseAdmin';
import type { PrimaryCategory } from './productClassifier';

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-2.5-flash';

const COMPLEMENTARY: Record<PrimaryCategory, PrimaryCategory[]> = {
  top:        ['bottom', 'outerwear', 'shoes', 'bag', 'accessory'],
  bottom:     ['top', 'shoes', 'outerwear', 'bag'],
  dress:      ['shoes', 'bag', 'outerwear', 'jewelry', 'accessory'],
  outerwear:  ['top', 'bottom', 'shoes', 'dress'],
  shoes:      ['top', 'bottom', 'dress', 'bag'],
  bag:        ['top', 'bottom', 'dress', 'shoes'],
  accessory:  ['top', 'bottom', 'dress', 'outerwear'],
  jewelry:    ['top', 'dress', 'outerwear'],
  headwear:   ['top', 'dress', 'outerwear'],
  other:      ['top', 'bottom', 'dress', 'shoes'],
};

const COLOR_HARMONY: Record<string, string[]> = {
  black:   ['white', 'grey', 'red', 'blue', 'pink', 'neutral'],
  white:   ['black', 'blue', 'brown', 'grey', 'neutral'],
  blue:    ['white', 'black', 'brown', 'grey', 'neutral'],
  red:     ['black', 'white', 'blue', 'neutral'],
  green:   ['white', 'brown', 'neutral', 'black'],
  yellow:  ['blue', 'white', 'grey', 'neutral'],
  pink:    ['white', 'grey', 'black', 'neutral'],
  purple:  ['white', 'grey', 'black', 'neutral'],
  brown:   ['white', 'blue', 'green', 'neutral'],
  grey:    ['black', 'white', 'blue', 'pink', 'neutral'],
  orange:  ['white', 'blue', 'neutral'],
  neutral: ['black', 'white', 'blue', 'red', 'green', 'pink'],
};

interface Recommendation {
  productId: string;
  variantId: string;
  handle: string;
  title: string;
  image: string | null;
  priceCents: number;
  currency: string;
  category: string;
}

async function rankWithGemini(
  source: { title: string; primary_category: string; style: string; color_family: string },
  candidates: Array<{ id: string; title: string; primary_category: string; style: string; color_family: string }>,
): Promise<string[]> {
  if (!API_KEY || candidates.length <= 3) {
    return candidates.slice(0, 3).map((c) => c.id);
  }

  const promptText = `Given a customer wearing this item:
SOURCE: ${source.title} | ${source.primary_category} | ${source.style} | ${source.color_family}

Pick the 3 best COMPLEMENTARY items from these candidates to complete the outfit. Prioritize color harmony and style coherence.

CANDIDATES:
${candidates.map((c, i) => `${i}|${c.title}|${c.primary_category}|${c.style}|${c.color_family}`).join('\n')}

Output ONLY a JSON array of 3 candidate indices, e.g. [4,1,7]`;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: { responseMimeType: 'application/json' },
    });
    const text = res.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const indices = JSON.parse(text);
    if (!Array.isArray(indices)) throw new Error('not array');
    const picked: string[] = [];
    for (const idx of indices) {
      if (typeof idx === 'number' && candidates[idx]) picked.push(candidates[idx].id);
      if (picked.length >= 3) break;
    }
    return picked.length > 0 ? picked : candidates.slice(0, 3).map((c) => c.id);
  } catch (err: any) {
    console.warn('[rank] gemini error:', err?.message?.substring(0, 200));
    return candidates.slice(0, 3).map((c) => c.id);
  }
}

export async function getRecommendations(
  partnerId: string,
  sourceShopifyProductId: string,
): Promise<Recommendation[]> {
  const admin = createAdminClient();

  const { data: cached } = await admin
    .from('recommendations_cache')
    .select('recommended, created_at')
    .eq('partner_id', partnerId)
    .eq('source_shopify_product_id', sourceShopifyProductId)
    .maybeSingle();

  if (cached?.recommended) {
    const age = Date.now() - new Date(cached.created_at).getTime();
    const THIRTY_DAYS = 30 * 24 * 3600 * 1000;
    if (age < THIRTY_DAYS && Array.isArray(cached.recommended) && cached.recommended.length > 0) {
      return cached.recommended as Recommendation[];
    }
  }

  const { data: source } = await admin
    .from('products')
    .select('id, title, primary_category, style, color_family')
    .eq('partner_id', partnerId)
    .eq('shopify_product_id', sourceShopifyProductId)
    .maybeSingle();

  if (!source || !source.primary_category) return [];

  const compat = COMPLEMENTARY[source.primary_category as PrimaryCategory] || [];
  if (compat.length === 0) return [];

  const harmonious = COLOR_HARMONY[source.color_family] || [];
  const colorPrefs = [source.color_family, ...harmonious, 'neutral'].filter((v, i, a) => a.indexOf(v) === i);

  const { data: candidates } = await admin
    .from('products')
    .select('id, shopify_product_id, handle, title, featured_image_url, primary_category, style, color_family')
    .eq('partner_id', partnerId)
    .eq('status', 'active')
    .in('primary_category', compat)
    .neq('shopify_product_id', sourceShopifyProductId)
    .limit(40);

  if (!candidates || candidates.length === 0) return [];

  const scored = candidates
    .map((c) => {
      let score = 0;
      if (c.style === source.style) score += 3;
      const colorIdx = colorPrefs.indexOf(c.color_family);
      if (colorIdx >= 0) score += Math.max(0, 5 - colorIdx);
      const catIdx = compat.indexOf(c.primary_category as PrimaryCategory);
      if (catIdx >= 0) score += Math.max(0, 3 - catIdx);
      return { ...c, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 15);

  const rankedIds = await rankWithGemini(
    { title: source.title, primary_category: source.primary_category, style: source.style, color_family: source.color_family },
    scored.map((c) => ({ id: c.id, title: c.title, primary_category: c.primary_category, style: c.style, color_family: c.color_family })),
  );

  const pickedIds = rankedIds.length >= 3 ? rankedIds : [...rankedIds, ...scored.map((c) => c.id)].slice(0, 3);

  const { data: variants } = await admin
    .from('product_variants')
    .select('product_id, shopify_variant_id, price_cents, currency, available')
    .in('product_id', pickedIds);

  const recs: Recommendation[] = [];
  for (const pid of pickedIds) {
    const prod = scored.find((c) => c.id === pid);
    if (!prod) continue;
    const firstVariant = (variants || []).find((v) => v.product_id === pid && v.available) ||
                         (variants || []).find((v) => v.product_id === pid);
    if (!firstVariant) continue;
    recs.push({
      productId: prod.shopify_product_id,
      variantId: firstVariant.shopify_variant_id,
      handle: prod.handle,
      title: prod.title,
      image: prod.featured_image_url,
      priceCents: firstVariant.price_cents || 0,
      currency: firstVariant.currency || 'EUR',
      category: prod.primary_category,
    });
    if (recs.length >= 3) break;
  }

  if (recs.length > 0) {
    await admin
      .from('recommendations_cache')
      .upsert({
        partner_id: partnerId,
        source_shopify_product_id: sourceShopifyProductId,
        recommended: recs,
        created_at: new Date().toISOString(),
      }, { onConflict: 'partner_id,source_shopify_product_id' });
  }

  return recs;
}
