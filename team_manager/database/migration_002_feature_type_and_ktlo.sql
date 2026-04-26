-- Migration 002: Tipologia Feature e KTLO Allocations

-- 1. Aggiungi campo "type" alla tabella features
ALTER TABLE features
  ADD COLUMN type VARCHAR(50) DEFAULT 'strategic';

-- 2. Aggiungi constraint per validare i valori
ALTER TABLE features
  ADD CONSTRAINT feature_type_check CHECK (type IN ('small_change', 'strategic'));

-- 3. Crea tabella per allocazioni KTLO (Keep The Lights On)
-- KTLO rappresenta il tempo dedicato a mantenimento, bug fix, supporto
CREATE TABLE ktlo_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  days NUMERIC(3, 1) NOT NULL DEFAULT 0, -- 0-5 days, step 0.5
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ktlo_days_range CHECK (days >= 0 AND days <= 5),
  CONSTRAINT unique_ktlo_allocation UNIQUE (member_id, week_start)
);

-- 4. Indici per performance
CREATE INDEX idx_ktlo_allocations_member ON ktlo_allocations(member_id);
CREATE INDEX idx_ktlo_allocations_week ON ktlo_allocations(week_start);

-- 5. Abilita RLS
ALTER TABLE ktlo_allocations ENABLE ROW LEVEL SECURITY;

-- 6. Policy temporanea (per development)
CREATE POLICY "Allow all for development" ON ktlo_allocations FOR ALL USING (true);

-- 7. Commento
COMMENT ON TABLE ktlo_allocations IS 'Allocazioni KTLO (Keep The Lights On) - tempo dedicato a mantenimento e supporto';
COMMENT ON COLUMN features.type IS 'Tipologia feature: small_change o strategic';
