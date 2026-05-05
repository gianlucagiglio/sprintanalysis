-- ============================================
-- Migration v1.7.1 - Ordinamento manuale features
-- Data: 2025-04-26
-- ============================================

-- STEP 1: Aggiungi campo display_order
-- ============================================

-- Aggiungi colonna display_order alla tabella features
ALTER TABLE features
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Imposta ordine default in base all'ID (cronologico)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM features
  WHERE display_order = 0 OR display_order IS NULL
)
UPDATE features
SET display_order = numbered.rn
FROM numbered
WHERE features.id = numbered.id;

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_features_display_order ON features(display_order);

-- Commento
COMMENT ON COLUMN features.display_order IS 'Ordine di visualizzazione nella timeline (0 = primo, valori più alti = dopo)';


-- STEP 2: Aggiornamento changelog
-- ============================================

-- Rimuovi se esiste (per evitare duplicati)
DELETE FROM changelog WHERE version = '1.7.1';

INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.7.1',
  'patch',
  'Ordinamento manuale features nella Timeline',
  '## Miglioramenti

- **Ordinamento features**: Aggiunto campo "Ordine Visualizzazione" nella creazione/modifica feature
- Le feature nella timeline vengono ora ordinate in base al numero d''ordine impostato
- Ordinamento predefinito in base alla data di creazione (cronologico)
- Possibilità di riordinare le feature impostando numeri diversi (0 = prima, valori più alti = dopo)

## Modifiche tecniche

- Aggiunto campo `display_order` INTEGER nella tabella `features`
- Migrazione automatica che imposta ordine cronologico per le feature esistenti
- Aggiornato `FeatureForm` con input numerico per l''ordinamento
- Modificato `useSprints` per ordinare per `display_order` ASC, poi per `name` ASC
- Creato indice `idx_features_display_order` per performance

## Database

- Migration `migration_add_feature_order.sql` con colonna display_order
- Popolazione automatica valori default in base a created_at
- Indice per ottimizzare query di ordinamento',
  '2025-04-26'
);

-- Verifica
SELECT version, type, title, release_date FROM changelog ORDER BY release_date DESC, version DESC LIMIT 3;

-- ============================================
-- Fine Migration v1.7.1
-- ============================================
