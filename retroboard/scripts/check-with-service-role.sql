-- Query da eseguire manualmente in Supabase SQL Editor
-- (ha i permessi di SERVICE_ROLE e bypassa RLS)

-- 1. Conta team
SELECT COUNT(*) as total_teams FROM teams;

-- 2. Mostra tutti i team
SELECT id, name, created_at FROM teams ORDER BY name;

-- 3. Conta sessioni per team
SELECT
  t.name as team_name,
  COUNT(s.id) as session_count
FROM teams t
LEFT JOIN sessions s ON s.team_id = t.id
GROUP BY t.id, t.name
ORDER BY t.name;

-- 4. Sessioni senza team
SELECT COUNT(*) as orphaned_sessions
FROM sessions
WHERE team_id IS NULL;

-- 5. Mostra sample di sessioni
SELECT
  s.id,
  s.title,
  s.team_id,
  t.name as team_name,
  s.created_at
FROM sessions s
LEFT JOIN teams t ON t.id = s.team_id
ORDER BY s.created_at DESC
LIMIT 10;
