-- ============================================
-- Declassa Beatrice a MEMBER in tutti i team
-- ============================================

-- 1. Verifica stato attuale
SELECT
  t.name as team_name,
  tm.role as current_role
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
JOIN profiles p ON p.id = tm.user_id
WHERE p.email = 'bciarlante@qubicaamf.com'
ORDER BY t.name;

-- 2. Declassa a MEMBER
UPDATE team_members
SET role = 'member'
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'bciarlante@qubicaamf.com'
);

-- 3. Verifica risultato
SELECT
  t.name as team_name,
  tm.role as new_role,
  '✅ Beatrice è ora member' as status
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
JOIN profiles p ON p.id = tm.user_id
WHERE p.email = 'bciarlante@qubicaamf.com'
ORDER BY t.name;
