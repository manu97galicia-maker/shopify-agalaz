-- ══════════════════════════════════════════════════════════════
-- Migración: Límites anti-abuso de sync catálogo
-- Ejecutar en Supabase SQL Editor DESPUÉS de migration_crosssell.sql
-- ══════════════════════════════════════════════════════════════

-- Timestamp del último sync disparado (para cooldown)
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_catalog_sync_at TIMESTAMPTZ;

-- Contador total de clasificaciones IA (para límites de coste)
ALTER TABLE partners ADD COLUMN IF NOT EXISTS ai_classifications_total INTEGER DEFAULT 0;
