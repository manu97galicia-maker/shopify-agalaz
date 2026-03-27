# Agalaz Virtual Try-On — Shopify App

AI-powered virtual try-on for Shopify stores. Customers try on clothing, glasses, jewelry & accessories before buying.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Google Gemini (image generation)
- **Database**: Supabase (PostgreSQL)
- **Billing**: Stripe
- **Deployment**: Vercel
- **Shopify**: Theme App Extension + OAuth

## Setup

1. Create app in [Shopify Partners](https://partners.shopify.com)
2. Create a [Supabase](https://supabase.com) project and run `supabase/migration.sql`
3. Get a [Gemini API key](https://ai.google.dev/)
4. Set up [Stripe](https://stripe.com) with monthly price IDs
5. Copy `.env.example` to `.env` and fill in all values
6. `npm install && npm run dev`

## Structure

```
app/
├── page.tsx                    # Landing page
├── dashboard/page.tsx          # Merchant dashboard (Shopify embedded)
├── embed/page.tsx              # Try-on widget iframe
├── api/
│   ├── auth/                   # Shopify OAuth flow
│   ├── v1/tryon/               # Virtual try-on API (Gemini AI)
│   ├── v1/image-proxy/         # Image proxy for CORS
│   ├── partners/               # Partner registration, API keys, profile
│   ├── stripe/webhook/         # Stripe payment webhooks
│   └── health/                 # Health check
lib/
├── supabaseAdmin.ts            # Supabase admin client
├── partners.ts                 # API key generation, validation, credits
├── shopify.ts                  # Shopify OAuth helpers
services/
├── geminiService.ts            # Gemini AI try-on generation
extensions/
└── agalaz-tryon/               # Shopify Theme App Extension
public/
└── widget.js                   # Standalone widget for manual integration
```

## How It Works

1. Merchant installs app → OAuth → auto-registered with 5 free renders
2. Theme extension adds "Try it on with AI" button on product pages
3. Customer clicks → iframe opens → uploads photo → AI generates try-on
4. Credits deducted per render, Stripe billing for paid plans

## Plans

| Plan | Price | Renders/month |
|------|-------|---------------|
| Free Trial | €0 | 5 |
| Starter | €150/mo | 200 |
| Growth | €499/mo | 1,000 |

## Supported Items

Clothing, glasses, jewelry, headwear, shoes, bags, tattoos, nail art — the AI auto-detects the item type.
