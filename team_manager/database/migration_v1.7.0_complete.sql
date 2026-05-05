-- ============================================
-- Migration v1.7.0 - Personalizzazione Colori Sezioni
-- Data: 2025-04-26
-- ============================================

-- STEP 1: Creazione tabella settings
-- ============================================

-- Table: settings (singleton - una sola riga)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nrt_color VARCHAR(7) NOT NULL DEFAULT '#9333ea', -- Purple
  ktlo_color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- Blue (accent-secondary)
  timeoff_color VARCHAR(7) NOT NULL DEFAULT '#f59e0b', -- Orange (warning)
  capacity_color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- Blue (accent-primary)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: allow all (for development)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow all for development'
  ) THEN
    CREATE POLICY "Allow all for development" ON settings FOR ALL USING (true);
  END IF;
END$$;

COMMENT ON TABLE settings IS 'Impostazioni globali applicazione - colori personalizzabili per sezioni (singleton)';

-- Constraint: garantisce una sola riga
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_singleton ON settings ((id IS NOT NULL));

-- Insert default settings (singleton row) solo se non esiste già
INSERT INTO settings (nrt_color, ktlo_color, timeoff_color, capacity_color)
SELECT '#9333ea', '#3b82f6', '#f59e0b', '#3b82f6'
WHERE NOT EXISTS (SELECT 1 FROM settings);


-- STEP 2: Aggiornamento changelog
-- ============================================

INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.0',
  'minor',
  'Personalizzazione colori sezioni Timeline',
  '## Nuove funzionalità

- **Customizzazione colori sezioni**: Aggiunta possibilità di personalizzare i colori delle sezioni NRT, KTLO, Ferie & Assenze, e Riepilogo Capacità nella Timeline
- Nuovo modal "Impostazioni Colori" accessibile dalla sidebar con ColorPicker per ogni sezione
- Colori persistenti in database con tabella `settings` (singleton)
- Aggiornamento dinamico dei colori in tutte le viste senza refresh

## Modifiche tecniche

- Creata tabella `settings` con campi: `nrt_color`, `ktlo_color`, `timeoff_color`, `capacity_color`
- Implementato hook `useSettings()` per fetch/update colori con fallback ai default
- Componente `SettingsModal` con gestione ColorPicker e reset valori default
- Aggiornati componenti timeline per usare colori dinamici da props invece di valori hardcoded:
  - `NRTRow` e `MemberNRTRow`
  - `KTLORow` e `MemberKTLORow`
  - `GlobalTimeOffRow` e `MemberTimeOffRow`
  - `CapacityRecapRow`
- Colori default: NRT (#9333ea purple), KTLO (#3b82f6 blue), Ferie (#f59e0b orange), Capacity (#3b82f6 blue)

## Database

- Migration `migration_add_settings.sql` con tabella settings e policies RLS
- Inserimento automatico riga default con colori standard
- Constraint singleton per garantire una sola riga di configurazione',
  '2025-04-26'
)
ON CONFLICT (version) DO NOTHING;

-- ============================================
-- Fine Migration v1.7.0
-- ============================================
