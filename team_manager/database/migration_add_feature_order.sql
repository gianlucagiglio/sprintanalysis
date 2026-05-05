-- Migration: Aggiungi campo display_order per ordinamento manuale features
-- Data: 2025-04-26

-- Aggiungi colonna display_order alla tabella features
ALTER TABLE features
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Imposta ordine default in base all'ID (cronologico)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM features
)
UPDATE features
SET display_order = numbered.rn
FROM numbered
WHERE features.id = numbered.id;

-- Crea indice per performance
CREATE INDEX idx_features_display_order ON features(display_order);

-- Commento
COMMENT ON COLUMN features.display_order IS 'Ordine di visualizzazione nella timeline (0 = primo, valori più alti = dopo)';
