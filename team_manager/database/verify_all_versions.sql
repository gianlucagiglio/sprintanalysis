-- Verifica tutte le versioni presenti nel changelog

SELECT
  version,
  type,
  title,
  release_date,
  created_at
FROM changelog
ORDER BY version DESC;

-- Conta quante versioni ci sono
SELECT COUNT(*) as total FROM changelog;

-- Verifica specificamente le versioni 1.7.x
SELECT version FROM changelog WHERE version LIKE '1.7.%' ORDER BY version DESC;
