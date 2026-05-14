-- Tabella per effort stimati per ruolo su ogni feature
CREATE TABLE IF NOT EXISTS feature_estimated_efforts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  estimated_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, role_id)
);

-- Index per query veloci
CREATE INDEX IF NOT EXISTS idx_feature_estimated_efforts_feature_id
  ON feature_estimated_efforts(feature_id);

CREATE INDEX IF NOT EXISTS idx_feature_estimated_efforts_role_id
  ON feature_estimated_efforts(role_id);

-- RLS Policies
ALTER TABLE feature_estimated_efforts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on feature_estimated_efforts"
  ON feature_estimated_efforts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_feature_estimated_efforts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feature_estimated_efforts_updated_at
  BEFORE UPDATE ON feature_estimated_efforts
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_estimated_efforts_updated_at();

COMMENT ON TABLE feature_estimated_efforts IS 'Effort stimati per famiglia professionale (ruolo) per ogni feature - serve per confrontare pianificato vs stimato';
COMMENT ON COLUMN feature_estimated_efforts.estimated_days IS 'Giorni stimati per questo ruolo su questa feature';
