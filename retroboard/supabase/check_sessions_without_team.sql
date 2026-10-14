-- Query per verificare sessioni senza team_id
SELECT
  id,
  title,
  organizer_id,
  team_id,
  created_at
FROM sessions
WHERE team_id IS NULL
ORDER BY created_at DESC;

-- Conta sessioni senza team
SELECT COUNT(*) as sessions_without_team
FROM sessions
WHERE team_id IS NULL;
