-- ══════════════════════════════════════════════════════════════
-- Agalaz Shopify App — Database Schema
-- Run this in your Supabase SQL editor to set up the tables.
-- ══════════════════════════════════════════════════════════════

-- Partners table (one per Shopify store)
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_url TEXT NOT NULL,
  shop_domain TEXT UNIQUE,
  shopify_access_token TEXT,
  api_key_hash TEXT UNIQUE NOT NULL,
  api_key_prefix TEXT NOT NULL,
  allowed_domains TEXT[] DEFAULT '{}',
  plan TEXT NOT NULL DEFAULT 'trial',
  price_eur INTEGER DEFAULT 0,
  setup_fee_eur INTEGER DEFAULT 0,
  credits_remaining INTEGER DEFAULT 0,
  credits_monthly_limit INTEGER DEFAULT 5,
  total_renders INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  setup_paid BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partner daily usage tracking
CREATE TABLE IF NOT EXISTS partner_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  renders_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_shop_domain ON partners(shop_domain);
CREATE INDEX IF NOT EXISTS idx_partners_api_key_hash ON partners(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_partners_stripe_sub ON partners(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_partner_usage_partner_date ON partner_usage(partner_id, date);

-- RLS: Only service role can access partners (all API access is server-side)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_usage ENABLE ROW LEVEL SECURITY;

-- No client-side policies needed — all access goes through API routes using service role key
