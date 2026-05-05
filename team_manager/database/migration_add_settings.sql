-- Migration: Aggiungi tabella settings per colori personalizzati sezioni
-- Permette di personalizzare colori NRT, KTLO, Ferie, Capacity Recap

-- Table: settings (singleton - una sola riga)
CREATE TABLE settings (
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
CREATE POLICY "Allow all for development" ON settings FOR ALL USING (true);

COMMENT ON TABLE settings IS 'Impostazioni globali applicazione - colori personalizzabili per sezioni (singleton)';

-- Insert default settings (singleton row)
INSERT INTO settings (nrt_color, ktlo_color, timeoff_color, capacity_color)
VALUES ('#9333ea', '#3b82f6', '#f59e0b', '#3b82f6');

-- Constraint: garantisce una sola riga
CREATE UNIQUE INDEX idx_settings_singleton ON settings ((id IS NOT NULL));
