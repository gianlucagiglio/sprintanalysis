-- Test RLS Policy per user_points

-- 1. Verifica che auth.uid() sia settato
SELECT auth.uid() as current_auth_uid;

-- 2. Mostra il record che DOVREBBE essere visibile
SELECT
  user_id,
  team_id,
  points,
  level,
  auth.uid() as current_user,
  (user_id = auth.uid()) as should_be_visible
FROM user_points
WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e'
  AND team_id IS NULL;

-- 3. Prova a leggere con RLS (simulando frontend)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'e84d8f38-14bb-4480-a4de-d444a723989e';

SELECT * FROM user_points
WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e'
  AND team_id IS NULL;

-- Reset
RESET ROLE;
