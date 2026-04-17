import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-2.5-flash';

export type PrimaryCategory =
  | 'top' | 'bottom' | 'dress' | 'outerwear'
  | 'shoes' | 'bag' | 'accessory' | 'jewelry'
  | 'headwear' | 'other';

export interface Classification {
  primary_category: PrimaryCategory;
  style: string;
  color_family: string;
}

const CATEGORY_RULES: Array<[RegExp, PrimaryCategory]> = [
  [/\b(t-?shirt|shirt|blouse|top|sweater|hoodie|polo|camiseta|camisa|blusa|jersey|sudadera)\b/i, 'top'],
  [/\b(pant|jean|trouser|short|legging|skirt|pantal[oó]n|falda|vaquero|bermuda)\b/i, 'bottom'],
  [/\b(dress|jumpsuit|romper|vestido|mono|pichi)\b/i, 'dress'],
  [/\b(jacket|coat|blazer|cardigan|vest|chaqueta|abrigo|gabardina|chaleco)\b/i, 'outerwear'],
  [/\b(shoe|sneaker|boot|sandal|heel|loafer|zapato|zapatilla|bota|sandalia|tac[oó]n)\b/i, 'shoes'],
  [/\b(bag|backpack|handbag|clutch|tote|bolso|mochila|cartera)\b/i, 'bag'],
  [/\b(necklace|earring|ring|bracelet|collar|pendiente|anillo|pulsera)\b/i, 'jewelry'],
  [/\b(hat|cap|beanie|headband|sombrero|gorra|gorro)\b/i, 'headwear'],
  [/\b(glasses|sunglasses|scarf|belt|tie|watch|gafas|bufanda|cintur[oó]n|corbata|reloj)\b/i, 'accessory'],
];

const COLOR_RULES: Array<[RegExp, string]> = [
  [/\b(black|negro)\b/i, 'black'],
  [/\b(white|blanco)\b/i, 'white'],
  [/\b(blue|navy|azul|marino)\b/i, 'blue'],
  [/\b(red|rojo|burgundy|granate)\b/i, 'red'],
  [/\b(green|verde|olive|oliva)\b/i, 'green'],
  [/\b(yellow|mustard|amarillo|mostaza)\b/i, 'yellow'],
  [/\b(pink|rosa)\b/i, 'pink'],
  [/\b(purple|violet|morado|lila)\b/i, 'purple'],
  [/\b(brown|tan|beige|marr[oó]n|camel)\b/i, 'brown'],
  [/\b(grey|gray|gris)\b/i, 'grey'],
  [/\b(orange|naranja)\b/i, 'orange'],
];

const STYLE_RULES: Array<[RegExp, string]> = [
  [/\b(formal|dress|business|oficina|elegant|evening|noche)\b/i, 'formal'],
  [/\b(sport|gym|running|training|athletic|deport|active)\b/i, 'sporty'],
  [/\b(bohemian|boho|hippie|festival)\b/i, 'bohemian'],
  [/\b(streetwear|urban|street|oversized)\b/i, 'street'],
  [/\b(vintage|retro|classic)\b/i, 'vintage'],
];

function ruleBasedClassify(p: {
  title: string;
  product_type: string | null;
  tags: string[];
  description?: string | null;
}): Classification | null {
  const haystack = [p.title, p.product_type || '', p.tags.join(' '), p.description || ''].join(' ').toLowerCase();

  let primary: PrimaryCategory | null = null;
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(haystack)) { primary = cat; break; }
  }
  if (!primary) return null;

  let color = 'neutral';
  for (const [re, c] of COLOR_RULES) {
    if (re.test(haystack)) { color = c; break; }
  }

  let style = 'casual';
  for (const [re, s] of STYLE_RULES) {
    if (re.test(haystack)) { style = s; break; }
  }

  return { primary_category: primary, style, color_family: color };
}

const CLASSIFIER_PROMPT = `You classify fashion products by text only. Output strict JSON array, one object per input product.

Categories (pick ONE): top, bottom, dress, outerwear, shoes, bag, accessory, jewelry, headwear, other
Styles: casual, formal, sporty, bohemian, street, vintage, elegant
Color families: black, white, blue, red, green, yellow, pink, purple, brown, grey, orange, neutral

Schema for each product: {"i": <index>, "c": <category>, "s": <style>, "k": <color>}
Output ONLY a JSON array, no markdown. Example: [{"i":0,"c":"top","s":"casual","k":"blue"}]`;

async function geminiBatchClassify(
  items: Array<{ title: string; product_type: string | null; tags: string[]; description?: string | null }>,
): Promise<Classification[]> {
  if (!API_KEY || items.length === 0) return items.map(() => ({ primary_category: 'other', style: 'casual', color_family: 'neutral' }));

  const compact = items.map((p, i) => {
    const desc = (p.description || '').substring(0, 120).replace(/\s+/g, ' ').trim();
    return `${i}|${p.title}|${p.product_type || ''}|${p.tags.slice(0, 6).join(',')}|${desc}`;
  }).join('\n');

  const body = `${CLASSIFIER_PROMPT}\n\nProducts (pipe-delimited: index|title|type|tags|description):\n${compact}`;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: body }] }],
      config: { responseMimeType: 'application/json' },
    });
    const text = res.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('not an array');

    const out: Classification[] = items.map(() => ({ primary_category: 'other', style: 'casual', color_family: 'neutral' }));
    for (const entry of parsed) {
      const idx = entry.i;
      if (typeof idx === 'number' && idx >= 0 && idx < items.length) {
        out[idx] = {
          primary_category: (entry.c || 'other') as PrimaryCategory,
          style: entry.s || 'casual',
          color_family: entry.k || 'neutral',
        };
      }
    }
    return out;
  } catch (err: any) {
    console.warn('[classifier] Gemini batch failed:', err?.message?.substring(0, 200));
    return items.map(() => ({ primary_category: 'other', style: 'casual', color_family: 'neutral' }));
  }
}

export async function classifyProducts(
  items: Array<{ title: string; product_type: string | null; tags: string[]; description?: string | null }>,
): Promise<Classification[]> {
  const results: Classification[] = new Array(items.length);
  const ambiguousIdx: number[] = [];

  for (let i = 0; i < items.length; i++) {
    const rb = ruleBasedClassify(items[i]);
    if (rb) results[i] = rb;
    else ambiguousIdx.push(i);
  }

  if (ambiguousIdx.length === 0) return results;

  const BATCH = 20;
  const MAX_AI_ITEMS = 2000;
  const toClassify = ambiguousIdx.slice(0, MAX_AI_ITEMS);

  for (let i = 0; i < toClassify.length; i += BATCH) {
    const batchIdx = toClassify.slice(i, i + BATCH);
    const batchItems = batchIdx.map((idx) => items[idx]);
    const classified = await geminiBatchClassify(batchItems);
    batchIdx.forEach((origIdx, k) => { results[origIdx] = classified[k]; });
  }

  for (const idx of ambiguousIdx.slice(MAX_AI_ITEMS)) {
    results[idx] = { primary_category: 'other', style: 'casual', color_family: 'neutral' };
  }

  return results;
}
