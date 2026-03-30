import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-3.1-flash-image-preview';

function trimBase64(data: string, maxBytes: number = 2_000_000): string {
  if (data.length * 0.75 > maxBytes) {
    console.warn(`Image large (${Math.round(data.length * 0.75 / 1024)}KB)`);
  }
  return data;
}

/**
 * Generate a try-on image from a single user photo + optional garment.
 */
export async function generateTryOnImage(
  userImage: string,
  clothingImage?: string,
  modificationPrompt?: string,
  lastRenderedImage?: string,
  clothingMimeType?: string,
  currentSize?: string,
  previewSize?: string,
  category?: string,
): Promise<{ image: string | null; failReason?: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const cleanBase64 = (s: string) => s.replace(/^data:image\/[^;]+;base64,/, '');

    const detectMime = (b64: string): string => {
      if (b64.startsWith('/9j/')) return 'image/jpeg';
      if (b64.startsWith('iVBOR')) return 'image/png';
      if (b64.startsWith('UklGR')) return 'image/webp';
      if (b64.startsWith('R0lG')) return 'image/gif';
      return 'image/jpeg';
    };

    const cleanUser = trimBase64(cleanBase64(userImage));
    const userMime = detectMime(cleanUser);

    const parts: any[] = [
      { inlineData: { mimeType: userMime, data: cleanUser } },
    ];

    if (clothingImage) {
      parts.push({ inlineData: { mimeType: clothingMimeType || 'image/jpeg', data: trimBase64(cleanBase64(clothingImage)) } });
    }

    if (lastRenderedImage) {
      parts.push({ inlineData: { mimeType: 'image/png', data: cleanBase64(lastRenderedImage) } });
    }

    const hasGarment = !!clothingImage;
    const hasSize = !!(currentSize || previewSize);

    // Build detailed size instruction for Gemini
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    function getSizeDiff(from: string, to: string): number {
      const a = sizeOrder.indexOf(from), b = sizeOrder.indexOf(to);
      if (a === -1 || b === -1) return 0;
      return b - a;
    }

    let sizeNote = '';
    if (hasSize && previewSize && currentSize && previewSize !== currentSize) {
      const diff = getSizeDiff(currentSize, previewSize);
      const absDiff = Math.abs(diff);
      if (diff > 0) {
        // Going bigger — realistic and proportional
        const intensity = absDiff === 1 ? 'slightly' : absDiff === 2 ? 'noticeably' : 'significantly';
        sizeNote = `\n\nSIZE PREVIEW: Person normally wears ${currentSize}, showing how ${previewSize} would fit (${absDiff} size${absDiff > 1 ? 's' : ''} larger).
Make the fit look REALISTICALLY ${intensity} looser:
${absDiff === 1 ? `- Just a bit more relaxed than perfect fit — slightly more room in the torso and sleeves
- Shoulders sit about 0.5-1cm wider than ideal
- Hem drops about 1-2cm lower
- Subtle extra fabric but still looks intentional, like a "relaxed fit"` :
absDiff === 2 ? `- Clearly roomier — visible extra space around torso
- Shoulders drop 1-2cm past natural shoulder line
- Sleeves a bit longer than ideal, some fabric gathering
- Hem noticeably lower, garment looks borrowed from someone a bit bigger` :
`- Obviously too large — garment hangs loosely on the body
- Shoulders drop well past natural line, sleeves extend past wrists
- Significant extra fabric, visible draping and bunching
- Looks like wearing someone much larger's clothing`}
Keep it realistic — this is how real clothing in size ${previewSize} looks on a ${currentSize} body.`;
      } else {
        // Going smaller — realistic and proportional
        const intensity = absDiff === 1 ? 'slightly' : absDiff === 2 ? 'noticeably' : 'significantly';
        sizeNote = `\n\nSIZE PREVIEW: Person normally wears ${currentSize}, showing how ${previewSize} would fit (${absDiff} size${absDiff > 1 ? 's' : ''} smaller).
Make the fit look REALISTICALLY ${intensity} tighter:
${absDiff === 1 ? `- Just a bit snugger than perfect fit — fabric sits closer to the body
- Slight tension across chest/shoulders, nothing extreme
- Sleeves end about 1cm shorter than ideal
- Hem sits slightly higher, shows a tiny bit more waist
- Still wearable, just clearly fitted/snug` :
absDiff === 2 ? `- Clearly too tight — visible pulling at seams and across chest
- Fabric stretched, outline of body more visible
- Sleeves noticeably short, ending well above wrists
- Hem rides up, restricted movement visible` :
`- Obviously too small — extreme tightness, fabric straining
- Very restricted, garment barely fits
- Sleeves much too short, hem way too high`}
Keep it realistic — this is how real clothing in size ${previewSize} looks on a ${currentSize} body.`;
      }
    } else if (hasSize && currentSize) {
      sizeNote = ` Size ${currentSize}, natural fit.`;
    }
    const categoryHint = category && category !== 'auto'
      ? `\nUSER SELECTED CATEGORY: ${category.toUpperCase()}. IMG2 is a ${category} item — apply it as such.`
      : '';

    let promptText: string;

    if (modificationPrompt && lastRenderedImage) {
      promptText = `Modify the previous render (IMG ${hasGarment ? '3' : '2'}): "${modificationPrompt}". Keep the same person, change ONLY what was requested. Output one photorealistic image.`;
    } else if (hasGarment) {
      promptText = `VIRTUAL TRY-ON ENGINE. IMG1=person photo. IMG2=product to apply.${sizeNote}${categoryHint}

TASK: Generate ONE photorealistic image of the person from IMG1 wearing/using the product from IMG2.

IDENTITY PRESERVATION (critical):
- Face, skin tone, hair, body shape, pose = IDENTICAL to IMG1
- Background, lighting, camera angle = IDENTICAL to IMG1
- Only modify the specific body area where the product belongs

PRODUCT DETECTION & APPLICATION${category && category !== 'auto' ? ` (user confirmed: ${category.toUpperCase()})` : '' } — detect what IMG2 shows and apply accordingly:
- TOPS (shirt, t-shirt, blouse, sweater, hoodie, polo) → replace upper body clothing only, keep pants/skirt/jacket if visible
- BOTTOMS (pants, jeans, trousers, skirt, shorts, leggings) → replace lower body clothing only, keep top unchanged
- FULL BODY (dress, jumpsuit, romper, overalls) → replace both top and bottom clothing
- OUTERWEAR (jacket, coat, blazer, cardigan, vest) → layer OVER existing top, do not remove the shirt underneath
- GLASSES (sunglasses, prescription frames, goggles, reading glasses) → place on face bridge naturally, adjust to face width, add realistic reflections/shadows
- JEWELRY:
  • Necklace/pendant/choker → drape around neck naturally, show chain following collarbone
  • Earrings → attach to earlobes, match ear position and angle
  • Bracelet/bangle/watch → place on wrist with correct perspective
  • Ring → place on finger naturally
- HEADWEAR (hat, cap, beanie, headband, turban, crown) → place on head, adjust hair visibility naturally
- SHOES (sneakers, heels, boots, sandals, loafers, flats) → replace footwear, match ground plane and shadows
- BAGS (handbag, backpack, clutch, tote, crossbody) → add as held/worn accessory with natural arm position
- TATTOO (any body art design) → apply to visible skin as if permanently inked, follow skin contours and muscle definition
- NAIL ART (manicure, nail polish, nail design) → apply to fingernails with correct perspective, show on all visible fingers

QUALITY RULES:
1. Result must look like a real photograph — proper shadows, wrinkles, fabric texture, light interaction
2. Fabric must follow body contours naturally — no floating or flat-looking garments
3. Keep ALL items that are NOT being replaced (other clothing, accessories, background objects)
4. Colors and patterns from IMG2 must be preserved exactly${previewSize && currentSize && previewSize !== currentSize ? '\n5. SIZE FIT IS THE #1 PRIORITY — the garment MUST look visibly different from a normal fit' : ''}

You MUST output exactly one photorealistic image.`;
    } else {
      promptText = `Enhance this fashion photo. Keep person, clothing, pose identical. Improve lighting and quality. You MUST generate an image.`;
    }

    parts.push({ text: promptText });

    let lastFailReason = '';

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const currentParts = attempt === 1 ? parts : [
          ...parts.slice(0, -1),
          { text: hasGarment
            ? `Virtual try-on: detect what the product in IMG2 is (clothing, glasses, jewelry, hat, shoes, bag, tattoo, or nails) and apply it to the person in IMG1. Keep the person identical — same face, body, pose, background. Photorealistic result. You MUST generate an image.`
            : `Enhance this photo. Keep person identical. You MUST generate an image.`
          },
        ];

        console.log(`${MODEL} attempt ${attempt}...`);

        const response = await ai.models.generateContent({
          model: MODEL,
          contents: [{ role: 'user', parts: currentParts }],
          config: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        });

        const candidate = response.candidates?.[0];
        const responseParts = candidate?.content?.parts || [];

        for (const part of responseParts) {
          if ((part as any).inlineData?.data) {
            console.log(`Image generated (attempt ${attempt}), size:`, (part as any).inlineData.data.length);
            return { image: `data:image/png;base64,${(part as any).inlineData.data}` };
          }
        }
        lastFailReason = `no image returned (${candidate?.finishReason})`;
      } catch (err: any) {
        const msg = err?.message?.substring(0, 200) || 'unknown';
        console.warn(`Attempt ${attempt} error:`, msg);
        lastFailReason = msg;
      }
      if (attempt < 2) await new Promise(r => setTimeout(r, 200));
    }

    console.error("All attempts failed:", lastFailReason);
    return { image: null, failReason: lastFailReason };
  } catch (error: any) {
    const status = error?.status || error?.code;
    const message = error?.message || '';
    console.error("Gemini error:", status, message?.substring(0, 500));
    return { image: null, failReason: `${status}: ${message?.substring(0, 200)}` };
  }
}
