-- Migration: Aggiungi tabella NRT (Non-Regression Testing)
-- Allocazioni NRT per membri QA/QAA con default 2 giorni sulla prima settimana sprint

-- Table: nrt_allocations
CREATE TABLE nrt_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  days NUMERIC(4, 2) NOT NULL DEFAULT 2.0, -- 0-5 days, step 0.01, default 2
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT nrt_days_range CHECK (days >= 0 AND days <= 5),
  CONSTRAINT unique_nrt_allocation UNIQUE (member_id, week_start)
);

-- Index for performance
CREATE INDEX idx_nrt_allocations_member ON nrt_allocations(member_id);
CREATE INDEX idx_nrt_allocations_week ON nrt_allocations(week_start);

-- Enable Row Level Security (disabled for v1)
ALTER TABLE nrt_allocations ENABLE ROW LEVEL SECURITY;

-- Temporary policy: allow all operations (for development)
CREATE POLICY "Allow all for development" ON nrt_allocations FOR ALL USING (true);

COMMENT ON TABLE nrt_allocations IS 'NRT (Non-Regression Testing) - Allocazioni per membri QA/QAA con default 2 giorni prima settimana sprint';
