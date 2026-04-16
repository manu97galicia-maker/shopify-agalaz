-- ══════════════════════════════════════════════════════════════
-- Migración: Cap diario de intentos (incluye fallos)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE partners ADD COLUMN IF NOT EXISTS attempts_today INTEGER DEFAULT 0;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS attempts_reset_date DATE;
