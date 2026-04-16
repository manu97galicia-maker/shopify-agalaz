import { NextRequest, NextResponse } from 'next/server';
import { generateTryOnImage } from '@/services/geminiService';
import { validateApiKey, deductPartnerCredit, checkAndBumpAttempts } from '@/lib/partners';

export const maxDuration = 120;

// Detect actual image MIME type from base64 data (magic bytes)
function detectMimeType(base64: string): string | null {
  const header = base64.substring(0, 20);
  if (header.startsWith('/9j/')) return 'image/jpeg';
  if (header.startsWith('iVBOR')) return 'image/png';
  if (header.startsWith('UklGR')) return 'image/webp';
  if (header.startsWith('R0lG')) return 'image/gif';
  if (header.startsWith('PCFET0NUWVB') || header.startsWith('PGh0bWw') ||
      header.startsWith('eyJ') || header.startsWith('PD94bWw'))
    return null;
  return 'image/jpeg';
}

function corsHeaders(origin?: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing API key. Use Authorization: Bearer agz_live_...' },
        { status: 401, headers }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const requestOrigin = origin || request.headers.get('referer');
    const { valid, partner, error } = await validateApiKey(apiKey, requestOrigin);

    if (!valid || !partner) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401, headers });
    }

    // Rate limit: count ATTEMPTS (not just successes) to prevent cost abuse via failed calls
    const attemptCheck = await checkAndBumpAttempts(
      partner.id,
      partner.credits_remaining,
      (partner as any).attempts_today ?? 0,
      (partner as any).attempts_reset_date ?? null,
    );
    if (!attemptCheck.allowed) {
      return NextResponse.json(
        { error: `Daily attempt limit reached (${attemptCheck.cap}). Try again tomorrow.` },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    let userImage = body.userImage || body.faceImage;
    let { clothingImage, garmentUrl, currentSize, previewSize, lastRenderedImage } = body;

    if (!userImage) {
      return NextResponse.json(
        { error: 'userImage is required (base64)' },
        { status: 400, headers }
      );
    }

    const cleanBase64 = (s: string) => s.replace(/^data:image\/[^;]+;base64,/, '');
    userImage = cleanBase64(userImage);
    if (clothingImage) clothingImage = cleanBase64(clothingImage);

    if (userImage.length < 100) {
      return NextResponse.json(
        { error: 'Image appears to be empty or corrupted.' },
        { status: 400, headers }
      );
    }

    if (userImage.length < 25000) {
      return NextResponse.json(
        { error: 'Photo quality too low. Please upload a higher resolution photo (at least 500x500 pixels).' },
        { status: 400, headers }
      );
    }

    if (userImage.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large (max 10 MB)' },
        { status: 400, headers }
      );
    }

    // Validate clothingImage is actually an image
    let finalClothingImage = clothingImage;
    let garmentMimeType = 'image/jpeg';
    if (finalClothingImage) {
      const detectedType = detectMimeType(finalClothingImage);
      if (!detectedType) {
        finalClothingImage = undefined;
      } else {
        garmentMimeType = detectedType;
      }
    }

    // Fetch garment from URL if not provided as base64
    if (!finalClothingImage && garmentUrl) {
      const fetchHeaders: (Record<string, string> | undefined)[] = [
        {
          'Accept': 'image/jpeg,image/png,image/*;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
          'Referer': new URL(garmentUrl).origin + '/',
        },
        {
          'Accept': 'image/jpeg,image/png',
          'User-Agent': 'Mozilla/5.0 (compatible; Agalaz/1.0)',
        },
        undefined,
      ];

      for (let i = 0; i < fetchHeaders.length; i++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          const garmentRes = await fetch(garmentUrl, {
            redirect: 'follow',
            signal: controller.signal,
            ...(fetchHeaders[i] ? { headers: fetchHeaders[i] } : {}),
          });
          clearTimeout(timeout);

          if (garmentRes.ok) {
            const buffer = await garmentRes.arrayBuffer();
            if (buffer.byteLength > 100) {
              const b64 = Buffer.from(buffer).toString('base64');
              const detectedMime = detectMimeType(b64);
              if (!detectedMime) continue;
              finalClothingImage = b64;
              garmentMimeType = detectedMime;
              break;
            }
          }
        } catch (e: any) {
          console.warn(`Garment fetch strategy ${i + 1} failed:`, e?.message?.substring(0, 100));
        }
      }
    }

    if (!finalClothingImage) {
      return NextResponse.json(
        {
          error: garmentUrl
            ? `Could not load garment image from: ${garmentUrl.substring(0, 100)}. Try uploading the garment image directly.`
            : 'No garment image provided. Please upload a garment or provide a garment URL.',
        },
        { status: 400, headers }
      );
    }

    // Clean lastRenderedImage if provided (for size re-generation)
    let cleanRenderedImage: string | undefined;
    if (lastRenderedImage) {
      cleanRenderedImage = cleanBase64(lastRenderedImage);
      if (cleanRenderedImage.length < 100) cleanRenderedImage = undefined;
    }

    const { image, failReason } = await generateTryOnImage(
      userImage,
      finalClothingImage || undefined,
      undefined,
      cleanRenderedImage,
      garmentMimeType,
      currentSize || undefined,
      previewSize || undefined,
    );

    if (image) {
      await deductPartnerCredit(partner.id, partner.credits_remaining, partner.total_renders);
      return NextResponse.json(
        { success: true, image, credits_remaining: partner.credits_remaining - 1 },
        { headers }
      );
    }

    return NextResponse.json(
      { error: 'Generation failed. Please try again with a clear photo.', debug: { geminiReason: failReason } },
      { status: 500, headers }
    );
  } catch (error: any) {
    console.error('V1 Try-On API error:', error?.message?.substring(0, 500));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
