-- Debug per user_id specifico: e84d8f38-14bb-4480-a4de-d444a723989e

-- 1. Cerca in user_points
SELECT * FROM user_points
WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e';

-- 2. Cerca transazioni
SELECT
  action_type,
  points,
  description,
  created_at
FROM point_transactions
WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e'
ORDER BY created_at DESC;

-- 3. Calcola il totale che DOVREBBE avere
SELECT
  SUM(points) as total_points,
  calculate_level(SUM(points)::INT) as should_be_level,
  COUNT(*) as transaction_count
FROM point_transactions
WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e';

-- 4. FIX: Se non esiste il record in user_points, crealo
INSERT INTO user_points (user_id, team_id, points, level)
SELECT
  'e84d8f38-14bb-4480-a4de-d444a723989e',
  NULL,
  COALESCE(SUM(points), 0)::INT,
  calculate_level(COALESCE(SUM(points), 0)::INT)
FROM point_transactions
WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e'
ON CONFLICT (user_id) WHERE team_id IS NULL
DO UPDATE SET
  points = EXCLUDED.points,
  level = EXCLUDED.level,
  updated_at = now();

-- 5. Verifica il risultato
SELECT * FROM user_points
WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e'
AND team_id IS NULL;
