-- ============================================
-- FIX: Trasferimento ownership team
-- ============================================

-- 1. Trova tutti i team dove Beatrice è owner
SELECT
  t.id as team_id,
  t.name as team_name,
  p.name as current_owner,
  p.email as owner_email,
  tm.role
FROM teams t
JOIN team_members tm ON tm.team_id = t.id
JOIN profiles p ON p.id = tm.user_id
WHERE tm.role = 'owner'
  AND p.email = 'bciarlante@qubicaamf.com'
ORDER BY t.name;

-- 2. OPZIONE A: Cambia owner a Gianluca per TUTTI i team di Beatrice
-- (Decommenta se vuoi eseguire)
/*
UPDATE team_members
SET role = 'owner'
WHERE team_id IN (
  SELECT tm.team_id
  FROM team_members tm
  JOIN profiles p ON p.id = tm.user_id
  WHERE tm.role = 'owner'
    AND p.email = 'bciarlante@qubicaamf.com'
)
AND user_id = (
  SELECT id FROM profiles WHERE email = 'gianluca.giglio@gmail.com'
);

-- Declassa Beatrice ad admin nei team dove era owner
UPDATE team_members
SET role = 'admin'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'bciarlante@qubicaamf.com')
  AND role = 'owner';
*/

-- 3. OPZIONE B: Lista utenti disponibili per assegnare ownership
-- (Usa questa per decidere a chi trasferire)
SELECT
  p.id,
  p.name,
  p.email,
  COUNT(tm.team_id) as teams_count,
  STRING_AGG(DISTINCT tm.role, ', ') as roles
FROM profiles p
LEFT JOIN team_members tm ON tm.user_id = p.id
WHERE p.is_banned = false
GROUP BY p.id, p.name, p.email
ORDER BY teams_count DESC;

-- 4. OPZIONE C: Trasferisci ownership di UN team specifico
-- (Sostituisci [TEAM_ID] e [NEW_OWNER_EMAIL])
/*
-- Promuovi nuovo owner
UPDATE team_members
SET role = 'owner'
WHERE team_id = '[TEAM_ID]'
  AND user_id = (SELECT id FROM profiles WHERE email = '[NEW_OWNER_EMAIL]');

-- Declassa vecchio owner ad admin
UPDATE team_members
SET role = 'admin'
WHERE team_id = '[TEAM_ID]'
  AND user_id = (SELECT id FROM profiles WHERE email = 'bciarlante@qubicaamf.com')
  AND role = 'owner';
*/

-- 5. Verifica risultato finale
SELECT
  t.name as team_name,
  p.name as owner_name,
  p.email as owner_email
FROM teams t
JOIN team_members tm ON tm.team_id = t.id AND tm.role = 'owner'
JOIN profiles p ON p.id = tm.user_id
ORDER BY t.name;
