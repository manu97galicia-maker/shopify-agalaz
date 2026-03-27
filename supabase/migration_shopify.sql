-- ══════════════════════════════════════════════════════════════
-- Migración para soporte Shopify
-- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard
-- La tabla "partners" ya existe — solo añadimos las columnas de Shopify
-- ══════════════════════════════════════════════════════════════

-- Añadir columna para el dominio de Shopify (ej: mi-tienda.myshopify.com)
ALTER TABLE partners ADD COLUMN IF NOT EXISTS shop_domain TEXT UNIQUE;

-- Añadir columna para el access token de Shopify OAuth
ALTER TABLE partners ADD COLUMN IF NOT EXISTS shopify_access_token TEXT;

-- Índice para búsquedas por shop_domain
CREATE INDEX IF NOT EXISTS idx_partners_shop_domain ON partners(shop_domain);
