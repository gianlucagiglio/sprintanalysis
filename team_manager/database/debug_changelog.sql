-- DEBUG: Verifica stato changelog nel database

-- 1. Vedi tutte le versioni presenti
SELECT version, type, title, release_date, created_at
FROM changelog
ORDER BY release_date DESC, version DESC;

-- 2. Conta quante entry ci sono
SELECT COUNT(*) as total_entries FROM changelog;

-- 3. Verifica se v1.7.0 esiste
SELECT * FROM changelog WHERE version = '1.7.0';

-- 4. Verifica la struttura della tabella
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'changelog'
ORDER BY ordinal_position;

-- 5. Se v1.7.0 non esiste, reinseriscilo
-- INSERT INTO changelog (version, type, title, description, release_date)
-- VALUES (
--   '1.7.0',
--   'minor',
--   'Personalizzazione colori sezioni Timeline',
--   'Descrizione completa...',
--   '2025-04-26'
-- );
