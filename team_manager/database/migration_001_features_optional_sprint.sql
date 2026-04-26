-- Migration: Rendere sprint_id opzionale per le feature
-- Le feature non sono più legate a uno sprint specifico
-- Gli utenti allocano i giorni direttamente sulla timeline

-- 1. Rimuovi il constraint NOT NULL da sprint_id
ALTER TABLE features
  ALTER COLUMN sprint_id DROP NOT NULL;

-- 2. Aggiorna il commento della tabella
COMMENT ON TABLE features IS 'Feature da sviluppare. Lo sprint_id è opzionale - le allocazioni vengono fatte direttamente sulla timeline';

-- 3. Nota: le feature esistenti mantengono il loro sprint_id se presente
-- Le nuove feature possono essere create senza sprint_id
