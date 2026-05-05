-- ============================================
-- MIGRATION COMPLETA - Team Resource Manager
-- Include: decimali, NRT, changelog + popolamento automatico
-- ============================================

-- ============================================
-- 1. PRECISIONE DECIMALE (0.01 step)
-- ============================================

ALTER TABLE team_members
  ALTER COLUMN weekly_capacity TYPE NUMERIC(4, 2);

ALTER TABLE allocations
  ALTER COLUMN days TYPE NUMERIC(4, 2);

ALTER TABLE time_offs
  ALTER COLUMN days TYPE NUMERIC(4, 2);

COMMENT ON COLUMN team_members.weekly_capacity IS '0-5 giorni, step 0.01';
COMMENT ON COLUMN allocations.days IS '0-5 giorni, step 0.01';
COMMENT ON COLUMN time_offs.days IS '0-5 giorni, step 0.01';


-- ============================================
-- 2. TABELLA NRT (Non-Regression Testing)
-- ============================================

CREATE TABLE IF NOT EXISTS nrt_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  days NUMERIC(4, 2) NOT NULL DEFAULT 2.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT nrt_days_range CHECK (days >= 0 AND days <= 5),
  CONSTRAINT unique_nrt_allocation UNIQUE (member_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_nrt_allocations_member ON nrt_allocations(member_id);
CREATE INDEX IF NOT EXISTS idx_nrt_allocations_week ON nrt_allocations(week_start);

ALTER TABLE nrt_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON nrt_allocations;
CREATE POLICY "Allow all for development" ON nrt_allocations FOR ALL USING (true);

COMMENT ON TABLE nrt_allocations IS 'NRT (Non-Regression Testing) - Allocazioni per membri QA/QAA con default 2 giorni prima settimana sprint';


-- ============================================
-- 3. TABELLA CHANGELOG
-- ============================================

CREATE TABLE IF NOT EXISTS changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('major', 'minor', 'patch')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_changelog_version ON changelog(version);
CREATE INDEX IF NOT EXISTS idx_changelog_release_date ON changelog(release_date DESC);

ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for development" ON changelog;
CREATE POLICY "Allow all for development" ON changelog FOR ALL USING (true);

COMMENT ON TABLE changelog IS 'Changelog applicazione - tracciamento versioni e modifiche (semantic versioning: major.minor.patch)';


-- ============================================
-- 4. POPOLAMENTO CHANGELOG (automatico)
-- ============================================

-- Pulisci eventuali dati esistenti
DELETE FROM changelog;

-- v1.0.0 - Rilascio iniziale
INSERT INTO changelog (version, type, title, description, release_date) VALUES
(
  '1.0.0',
  'major',
  'Rilascio iniziale Team Resource Manager',
  E'**Funzionalità principali:**\n- Timeline allocazioni settimanali con sprint\n- Gestione team e ruoli professionali\n- Sprint planning con date inizio/fine\n- Feature management con assegnazione membri\n- KTLO (Keep The Lights On) tracking\n- Gestione ferie e assenze\n- Filtri avanzati (feature, membri, ruoli, tipi)\n- Dark/Light mode\n\n**Tecnologie:**\n- React 18 + TypeScript + Vite\n- Tailwind CSS\n- Supabase (PostgreSQL)\n- Zustand per state management',
  '2024-01-15'
);

-- v1.1.0 - Sezione NRT
INSERT INTO changelog (version, type, title, description, release_date) VALUES
(
  '1.1.0',
  'minor',
  'Aggiunta sezione NRT per QA/QAA',
  E'**Nuove funzionalità:**\n- Sezione NRT (Non-Regression Testing) dedicata a QA/QAA\n- Default automatico 2 giorni sulla prima settimana di ogni sprint\n- Colore distintivo purple per identificazione rapida\n- Collassabile come KTLO e Ferie\n- Calcolo automatico nel riepilogo capacità',
  '2024-01-20'
);

-- v1.2.0 - Vista Gantt
INSERT INTO changelog (version, type, title, description, release_date) VALUES
(
  '1.2.0',
  'minor',
  'Nuova vista Gantt delle feature',
  E'**Nuove funzionalità:**\n- Vista Gantt dedicata per visualizzare timeline feature\n- Intensità colore basata su giorni allocati (più scuro = più allocazione)\n- Breakdown espandibile per famiglia professionale (PA, PD, BE, FE, QA, QAA)\n- Stessi filtri della timeline (feature, membri, ruoli, tipi)\n- Visualizzazione giorni totali (elapsed) per feature\n- Solo allocazioni feature (esclusi KTLO, NRT, ferie)\n\n**Miglioramenti UX:**\n- Nuova voce menu "Gantt" nella sidebar\n- Route dedicata /gantt',
  '2024-01-25'
);

-- v1.3.0 - Riepilogo Capacità
INSERT INTO changelog (version, type, title, description, release_date) VALUES
(
  '1.3.0',
  'minor',
  'Riepilogo Capacità in timeline',
  E'**Nuove funzionalità:**\n- Sezione collapsabile "Riepilogo Capacità" in cima alla timeline\n- Calcolo automatico totale: Feature + KTLO + NRT + Ferie\n- Colori automatici: verde se ≤ capacità, rosso se sovraccarico\n- Tooltip dettagliato con breakdown per tipo allocazione\n- Visualizzazione residuo capacità (±giorni)\n- Di default chiuso per non ingombrare la vista\n\n**Miglioramenti:**\n- Quick view per identificare sovraccarichi prima di scendere nel dettaglio\n- Rispetta i filtri applicati alla timeline',
  '2024-02-01'
);

-- v1.4.0 - Evidenziazione settimana corrente
INSERT INTO changelog (version, type, title, description, release_date) VALUES
(
  '1.4.0',
  'minor',
  'Evidenziazione settimana corrente',
  E'**Nuove funzionalità:**\n- Evidenziazione automatica della settimana corrente in tutte le viste\n- Border accent blu più spesso (2px) sulla colonna settimana\n- Background leggero accent per miglior visibilità\n- Font semibold per label settimana corrente\n\n**Applicato a:**\n- Timeline (header + tutte le celle)\n- Vista Gantt\n- Vista Ferie\n- Riepilogo Capacità\n- KTLO, NRT, Feature groups\n\n**Miglioramenti UX:**\n- Orientamento immediato sul "oggi"\n- Coerenza visiva su tutte le sezioni',
  '2024-02-05'
);

-- v1.5.0 - Precisione decimale
INSERT INTO changelog (version, type, title, description, release_date) VALUES
(
  '1.5.0',
  'minor',
  'Supporto decimali con precisione 0.01',
  E'**Miglioramenti:**\n- Step 0.01 invece di 0.5 per allocazioni\n- Supporto 2 decimali (es. 0.11, 0.12, 0.75)\n- Database aggiornato: NUMERIC(3,1) → NUMERIC(4,2)\n\n**Impatto:**\n- Allocazioni feature: step 0.01\n- KTLO: step 0.01\n- NRT: step 0.01\n- Ferie: step 0.01\n- Capacità settimanale membri: step 0.01\n\n**Breaking change:**\n- Richiede migration database',
  '2024-02-10'
);

-- v1.6.0 - Changelog
INSERT INTO changelog (version, type, title, description, release_date) VALUES
(
  '1.6.0',
  'minor',
  'Sezione Changelog con semantic versioning',
  E'**Nuove funzionalità:**\n- Sezione dedicata changelog con storico versioni\n- Semantic versioning (major.minor.patch)\n- Auto-incremento versioni basato su tipo\n- Badge colorati per tipo: major (rosso), minor (arancione), patch (verde)\n- Form creazione/modifica versioni\n- Supporto Markdown per descrizioni (bold, liste)\n- Timeline verticale con indicatori\n- Visualizzazione data in italiano\n\n**Gestione versioni:**\n- MAJOR: breaking changes, incompatibilità\n- MINOR: nuove funzionalità retrocompatibili\n- PATCH: bug fixes, piccole modifiche\n\n**UI/UX:**\n- Nuova voce menu "Changelog" nella sidebar\n- Route dedicata /changelog\n- Edit/Delete con conferma\n- Preview versione auto-calcolata',
  CURRENT_DATE
);


-- ============================================
-- VERIFICA COMPLETA
-- ============================================

-- Verifica modifiche decimali
SELECT
  'Verifica decimali' as check_type,
  table_name,
  column_name,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name IN ('team_members', 'allocations', 'time_offs', 'nrt_allocations')
  AND column_name IN ('weekly_capacity', 'days')
ORDER BY table_name, column_name;

-- Verifica tabelle create
SELECT
  'Verifica tabelle' as check_type,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('nrt_allocations', 'changelog')
  AND table_schema = 'public'
ORDER BY table_name;

-- Verifica changelog popolato
SELECT
  'Verifica changelog' as check_type,
  version,
  type,
  title,
  release_date
FROM changelog
ORDER BY release_date DESC;
