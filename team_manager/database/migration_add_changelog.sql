-- Migration: Aggiungi tabella changelog per tracciare versioni e modifiche software
-- Semantic versioning: major.minor.patch

-- Table: changelog
CREATE TABLE changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(20) NOT NULL UNIQUE, -- es. "1.2.0"
  type VARCHAR(10) NOT NULL CHECK (type IN ('major', 'minor', 'patch')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL, -- Markdown con lista modifiche
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_changelog_version ON changelog(version);
CREATE INDEX idx_changelog_release_date ON changelog(release_date DESC);

-- Enable Row Level Security
ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

-- Temporary policy: allow all operations (for development)
CREATE POLICY "Allow all for development" ON changelog FOR ALL USING (true);

COMMENT ON TABLE changelog IS 'Changelog applicazione - tracciamento versioni e modifiche (semantic versioning)';

-- Sample data (versione iniziale)
INSERT INTO changelog (version, type, title, description, release_date) VALUES
  ('1.0.0', 'major', 'Rilascio iniziale', E'**Funzionalità principali:**\n- Timeline allocazioni settimanali\n- Gestione team e ruoli\n- Sprint planning\n- Feature management\n- KTLO tracking\n- Ferie e assenze\n- Vista Gantt\n- Riepilogo capacità', '2024-01-15');
