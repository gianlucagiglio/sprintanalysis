-- Migration: Aumenta precisione decimale da 0.5 a 0.01
-- Da NUMERIC(3,1) a NUMERIC(4,2) per supportare 2 decimali
-- Esegui questo script nel SQL Editor di Supabase Dashboard

-- 1. Aggiorna colonna weekly_capacity in team_members
ALTER TABLE team_members
  ALTER COLUMN weekly_capacity TYPE NUMERIC(4, 2);

COMMENT ON COLUMN team_members.weekly_capacity IS '0-5 giorni, step 0.01';

-- 2. Aggiorna colonna days in allocations
ALTER TABLE allocations
  ALTER COLUMN days TYPE NUMERIC(4, 2);

COMMENT ON COLUMN allocations.days IS '0-5 giorni, step 0.01';

-- 3. Aggiorna colonna days in time_offs
ALTER TABLE time_offs
  ALTER COLUMN days TYPE NUMERIC(4, 2);

COMMENT ON COLUMN time_offs.days IS '0-5 giorni, step 0.01';

-- Verifica le modifiche
SELECT
  table_name,
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name IN ('team_members', 'allocations', 'time_offs')
  AND column_name IN ('weekly_capacity', 'days')
ORDER BY table_name, column_name;
