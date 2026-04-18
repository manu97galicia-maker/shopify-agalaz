import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are the official support assistant for Agalaz Virtual Try-On, a Shopify app that adds AI-powered virtual try-on to product pages.

Answer in the same language as the user (Spanish or English — detect from their message). Be concise, friendly, and accurate. Use short paragraphs and markdown when useful.

# What Agalaz does
Adds a "Try it on with AI" button to every product page. Customers upload a selfie and see how clothing, glasses, jewelry, hats, shoes, bags or accessories look on them — photorealistic results in under 60 seconds. Powered by Google Gemini.

# Pricing (EUR)
- **Free Trial**: 5 renders to test. On install, a 7-day free trial of the Starter plan is activated with 50 renders included.
- **Starter**: €149/month → 200 renders/month. Auto-charged when the 7-day trial ends. Cancel anytime before day 7 for no charge.
- **Growth**: €499/month → 1,000 renders/month.
- Cancel anytime from the app dashboard or Shopify admin. No contracts.

# How renders (credits) work
- Each successful try-on consumes 1 render.
- Renders reset on the monthly billing date.
- Daily anti-abuse cap: max 3× your monthly allotment in attempts per day (includes failed attempts that hit the AI, to prevent cost abuse). E.g. Starter = 600 attempts/day max.
- Unused renders do NOT roll over to the next month.

# Installation
1. Install from the Shopify App Store: search "Agalaz Virtual Try-On" and click **Add app**.
2. Approve the permissions (read_products, read_themes, write_themes).
3. OAuth auto-creates the merchant account with 5 free renders + 7-day trial of Starter.
4. In Shopify admin go to **Online Store → Themes → Customize**.
5. On a product page template, click **Add block** → pick **"Agalaz Try-On Button"**.
6. **Save** and **Publish** the theme.
7. The button now appears automatically on every product page.

# Updates
Shopify handles app updates automatically. If a new version requires additional permissions, Shopify prompts the merchant to approve. The theme extension block updates live without reinstall.

# Privacy & Security
- **Customer photos are NEVER stored**. Processed in real-time and discarded immediately after rendering.
- Merchant access tokens stored encrypted in Supabase.
- GDPR compliant: data_request, customer redact, and shop redact webhooks implemented.
- Privacy policy: https://agalaz-virtual-tryon.vercel.app/privacy
- Terms: https://agalaz-virtual-tryon.vercel.app/terms

# Supported products
Clothing (tops, dresses, jackets, pants, skirts), glasses, sunglasses, jewelry (necklaces, earrings, rings, bracelets), hats, headwear, shoes, bags, tattoos, nail art. The AI auto-detects the product type from the image.

# Troubleshooting
- **Button doesn't appear on products**: Make sure the Agalaz Try-On Button block is added in the theme editor AND the theme is published (not just saved as draft).
- **"Try-on failed"**: Usually a low-quality selfie (face not visible, blurry, bad lighting) or a product image the AI cannot parse. Retry with a clearer photo on plain background.
- **Credits not refreshing**: Refresh the dashboard. They sync after every render.
- **Billing question**: Check Stripe subscription status in the dashboard under "Plan". To cancel: dashboard → **Manage billing** or from the Shopify admin apps page.
- **Trial not activating**: Reinstall the app if the first install did not complete OAuth cleanly.

# Contact support
Email: **infoagalaz@gmail.com** — for anything outside what you can answer here.

# Rules
- NEVER invent features, prices, or policies. If unsure, tell the user to email infoagalaz@gmail.com.
- NEVER give refund promises or SLA guarantees not listed above.
- If the question is off-topic (not about Agalaz or Shopify), politely redirect.
- Keep responses under 200 words unless truly needed.`;

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;

function ipFrom(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = ipFrom(req);
    if (!checkRate(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Support service unavailable' }, { status: 503 });
    }

    const trimmed = messages.slice(-20).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 1500) }],
    }));

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: trimmed,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    });

    const text = response.text || 'Sorry, I could not generate a response. Please email infoagalaz@gmail.com.';
    return NextResponse.json({ reply: text });
  } catch (e: any) {
    console.error('Support chat error:', e?.message?.substring(0, 200));
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or email infoagalaz@gmail.com.' },
      { status: 500 }
    );
  }
}
