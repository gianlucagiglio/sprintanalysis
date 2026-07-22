-- ================================================================
-- RESET PUNTI QUIZ - VERSIONE PULITA
-- ================================================================
-- Cancella solo i punti dei quiz e ricalcola i totali
-- ================================================================

BEGIN;

-- Cancella tutte le transazioni punti relative ai quiz
DELETE FROM point_transactions
WHERE action_type = 'quiz_win';

-- Ricalcola i punti totali per ogni utente
DELETE FROM user_points;

INSERT INTO user_points (user_id, team_id, points, level, created_at, updated_at)
SELECT
  user_id,
  NULL as team_id,
  SUM(points)::INT as total_points,
  calculate_level(SUM(points)::INT) as level,
  MIN(created_at) as created_at,
  now() as updated_at
FROM point_transactions
GROUP BY user_id
ON CONFLICT (user_id) WHERE team_id IS NULL
DO UPDATE SET
  points = EXCLUDED.points,
  level = EXCLUDED.level,
  updated_at = now();

COMMIT;
