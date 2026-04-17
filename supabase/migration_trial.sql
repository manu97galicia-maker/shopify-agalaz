-- ══════════════════════════════════════════════════════════════
-- Migración: Trial de 7 días con auto-cobro Starter
-- ══════════════════════════════════════════════════════════════

ALTER TABLE partners ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
