// Cross-sell recommendation engine
// Fetches products from a Shopify store via the public /products.json endpoint
// and recommends complementary items from a different category.

export interface RecommendedProduct {
  id: number;
  title: string;
  image: string;
  url: string;
  price: string;
  productType: string;
}

// Category mapping: what to recommend after trying on X
const CROSS_SELL_MAP: Record<string, string[]> = {
  // Clothing cross-sells
  'shirt': ['pants', 'jeans', 'trousers', 'skirt', 'shorts'],
  'top': ['pants', 'jeans', 'trousers', 'skirt', 'shorts'],
  't-shirt': ['pants', 'jeans', 'trousers', 'shorts'],
  'blouse': ['pants', 'skirt', 'trousers', 'jeans'],
  'sweater': ['pants', 'jeans', 'trousers', 'skirt'],
  'hoodie': ['pants', 'jeans', 'joggers', 'shorts'],
  'jacket': ['pants', 'jeans', 'trousers', 'shirt'],
  'coat': ['pants', 'boots', 'scarf', 'gloves'],
  'dress': ['shoes', 'bag', 'jewelry', 'earrings', 'necklace'],
  'pants': ['shirt', 'top', 'blouse', 't-shirt', 'sweater'],
  'jeans': ['shirt', 'top', 'blouse', 't-shirt', 'jacket'],
  'trousers': ['shirt', 'blouse', 'top', 'sweater'],
  'skirt': ['top', 'blouse', 'shirt', 'sweater'],
  'shorts': ['t-shirt', 'top', 'shirt', 'tank'],
  // Jewelry cross-sells
  'ring': ['earrings', 'necklace', 'bracelet'],
  'earrings': ['necklace', 'ring', 'bracelet'],
  'necklace': ['earrings', 'ring', 'bracelet'],
  'bracelet': ['ring', 'necklace', 'earrings'],
  'watch': ['bracelet', 'ring', 'necklace'],
  // Accessories
  'sunglasses': ['hat', 'bag', 'watch'],
  'glasses': ['earrings', 'necklace'],
  'hat': ['sunglasses', 'scarf', 'bag'],
  'bag': ['shoes', 'sunglasses', 'watch'],
  'shoes': ['bag', 'socks', 'belt'],
  'boots': ['jacket', 'coat', 'jeans'],
  'sneakers': ['t-shirt', 'hoodie', 'jeans', 'shorts'],
};

function normalizeType(type: string): string {
  return type.toLowerCase().trim()
    .replace(/s$/, '') // remove trailing 's' (pants→pant, etc.)
    .replace(/^(camiseta|camisa|pantalón|pantalon|vestido|falda|chaqueta|abrigo|zapato|bota|bolso|gafa|sombrero|anillo|pendiente|collar|pulsera|reloj).*/, (m) => {
      const map: Record<string, string> = {
        camiseta: 't-shirt', camisa: 'shirt', pantalón: 'pants', pantalon: 'pants',
        vestido: 'dress', falda: 'skirt', chaqueta: 'jacket', abrigo: 'coat',
        zapato: 'shoes', bota: 'boots', bolso: 'bag', gafa: 'glasses',
        sombrero: 'hat', anillo: 'ring', pendiente: 'earrings', collar: 'necklace',
        pulsera: 'bracelet', reloj: 'watch',
      };
      return map[m] || m;
    });
}

function getComplementaryTypes(productType: string): string[] {
  const normalized = normalizeType(productType);
  for (const [key, values] of Object.entries(CROSS_SELL_MAP)) {
    if (normalized.includes(key)) return values;
  }
  // Default: recommend anything from a different type
  return [];
}

export async function fetchRecommendations(
  shopDomain: string,
  currentProductType: string,
  limit: number = 3,
): Promise<RecommendedProduct[]> {
  if (!shopDomain) return [];

  try {
    const url = `https://${shopDomain}/products.json?limit=50`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const products = data.products || [];

    const complementaryTypes = getComplementaryTypes(currentProductType);

    // Score products by how well they match complementary types
    const scored = products
      .filter((p: any) => p.images?.length > 0)
      .map((p: any) => {
        const pType = normalizeType(p.product_type || '');
        const pTitle = (p.title || '').toLowerCase();
        const pTags = (p.tags || '').toLowerCase();

        let score = 0;
        for (const ct of complementaryTypes) {
          if (pType.includes(ct)) score += 10;
          if (pTitle.includes(ct)) score += 5;
          if (pTags.includes(ct)) score += 3;
        }

        // Penalize same type
        if (pType === normalizeType(currentProductType)) score -= 20;

        return {
          id: p.id,
          title: p.title,
          image: p.images[0]?.src || '',
          url: `https://${shopDomain}/products/${p.handle}`,
          price: p.variants?.[0]?.price || '0.00',
          productType: p.product_type || '',
          score,
        };
      })
      .filter((p: any) => p.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);

    // If no scored results, return random products of different type
    if (scored.length === 0) {
      const currentNorm = normalizeType(currentProductType);
      return products
        .filter((p: any) =>
          p.images?.length > 0 &&
          normalizeType(p.product_type || '') !== currentNorm
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          image: p.images[0]?.src || '',
          url: `https://${shopDomain}/products/${p.handle}`,
          price: p.variants?.[0]?.price || '0.00',
          productType: p.product_type || '',
        }));
    }

    return scored;
  } catch {
    return [];
  }
}

// Personalized compliments based on what was tried on
const COMPLIMENTS = {
  en: {
    clothing: [
      'Great choice! This style really suits your body shape.',
      'This looks amazing on you! The fit is perfect.',
      'Wow, this really complements your complexion.',
      'You have a great eye for style! This piece works beautifully.',
    ],
    jewelry: [
      'This jewelry really enhances your features!',
      'Beautiful choice! This piece adds the perfect touch.',
      'Stunning! This really catches the light on you.',
    ],
    general: [
      'Looks great on you!',
      'Nice choice! This really suits you.',
      'Perfect fit! You have great taste.',
    ],
  },
  es: {
    clothing: [
      '¡Qué bien te queda! Este estilo favorece tu silueta.',
      '¡Te queda increíble! El corte es perfecto para ti.',
      '¡Wow! Este color complementa muy bien tu tono de piel.',
      '¡Tienes buen ojo! Esta prenda te sienta de maravilla.',
    ],
    jewelry: [
      '¡Esta joya realza tus rasgos!',
      '¡Preciosa elección! Aporta el toque perfecto.',
      '¡Impresionante! La luz le queda genial en ti.',
    ],
    general: [
      '¡Te queda genial!',
      '¡Buena elección! Te sienta muy bien.',
      '¡Perfecto! Tienes muy buen gusto.',
    ],
  },
};

export function getCompliment(productType: string, lang: string): string {
  const l = lang === 'es' ? 'es' : 'en';
  const norm = normalizeType(productType);

  let pool: string[];
  if (['ring', 'earring', 'necklace', 'bracelet', 'watch'].some(j => norm.includes(j))) {
    pool = COMPLIMENTS[l].jewelry;
  } else if (norm) {
    pool = COMPLIMENTS[l].clothing;
  } else {
    pool = COMPLIMENTS[l].general;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCrossSellMessage(productType: string, recommendedType: string, lang: string): string {
  const es = lang === 'es';
  const norm = normalizeType(productType);
  const recNorm = normalizeType(recommendedType);

  if (['ring', 'earring', 'necklace', 'bracelet'].some(j => norm.includes(j))) {
    return es
      ? `Completa tu look con estos accesorios que combinan perfecto:`
      : `Complete your look with these matching accessories:`;
  }

  return es
    ? `También te podría interesar combinar con:`
    : `You might also like to pair it with:`;
}
