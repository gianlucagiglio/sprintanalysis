-- Verifica se il changelog v1.7.0 esiste
SELECT * FROM changelog ORDER BY release_date DESC, version DESC;

-- Verifica se la tabella settings esiste
SELECT * FROM settings;

-- Se il changelog v1.7.0 non c'è, eseguilo di nuovo:
-- INSERT INTO changelog (version, type, title, description, release_date)
-- VALUES (
--   '1.7.0',
--   'minor',
--   'Personalizzazione colori sezioni Timeline',
--   '...',
--   CURRENT_DATE
-- );
