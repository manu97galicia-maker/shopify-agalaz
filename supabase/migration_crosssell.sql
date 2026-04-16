-- ══════════════════════════════════════════════════════════════
-- Migración: Cross-selling + Catálogo sincronizado
-- Ejecutar en Supabase SQL Editor después de migration_shopify.sql
-- ══════════════════════════════════════════════════════════════

-- Productos sincronizados desde Shopify por cada partner
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  vendor TEXT,
  product_type TEXT,
  tags TEXT[] DEFAULT '{}',
  featured_image_url TEXT,
  status TEXT DEFAULT 'active',
  primary_category TEXT,
  style TEXT,
  color_family TEXT,
  classified_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_id, shopify_product_id)
);

-- Variantes para add-to-cart con talla/color correctos
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shopify_variant_id TEXT NOT NULL,
  title TEXT,
  price_cents INTEGER,
  currency TEXT,
  available BOOLEAN DEFAULT true,
  size TEXT,
  color TEXT,
  UNIQUE(product_id, shopify_variant_id)
);

-- Caché de recomendaciones (evita recalcular con IA cada vez)
CREATE TABLE IF NOT EXISTS recommendations_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  source_shopify_product_id TEXT NOT NULL,
  recommended JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_id, source_shopify_product_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_partner ON products(partner_id);
CREATE INDEX IF NOT EXISTS idx_products_partner_category ON products(partner_id, primary_category);
CREATE INDEX IF NOT EXISTS idx_products_shopify_id ON products(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_recs_lookup ON recommendations_cache(partner_id, source_shopify_product_id);

-- RLS — acceso solo vía service role
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations_cache ENABLE ROW LEVEL SECURITY;
