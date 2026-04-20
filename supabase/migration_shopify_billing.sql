-- ══════════════════════════════════════════════════════════════
-- Migración: Shopify Billing API (AppSubscriptionCreate)
-- Añade columna para guardar el ID de la suscripción en Shopify
-- ══════════════════════════════════════════════════════════════

ALTER TABLE partners ADD COLUMN IF NOT EXISTS shopify_subscription_id TEXT;
CREATE INDEX IF NOT EXISTS idx_partners_shopify_sub ON partners(shopify_subscription_id);
