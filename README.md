# Agalaz Virtual Try-On — Shopify App

Let your customers try on clothes with AI before buying.

## Setup

1. Create app in [Shopify Partners](https://partners.shopify.com)
2. Copy `.env.example` to `.env` and fill in values
3. `npm install`
4. `npm run dev`

## Structure

- `server.js` — Express backend (auth, billing, proxy to Agalaz API)
- `extensions/agalaz-tryon/` — Theme App Extension (button + modal widget)
- `shopify.app.toml` — Shopify app config

## Plans

| Plan | Price | Renders/month |
|------|-------|---------------|
| Free trial | $0 | 10 |
| Starter | $49/mo | 500 |
| Growth | $149/mo | 2,000 |
| Enterprise | $399/mo | 10,000 |
