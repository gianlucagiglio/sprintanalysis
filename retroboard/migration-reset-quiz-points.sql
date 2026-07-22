-- ================================================================
-- RESET PUNTI QUIZ
-- ================================================================
-- Data: 2026-07-03
-- Motivo: Cancellare solo i punti guadagnati dai quiz
--
-- Mantiene tutti gli altri punti:
--   ✅ Partecipazione sessioni
--   ✅ Commenti
--   ✅ Voti
--   ✅ Azioni completate
--   ✅ Streak bonus
--
-- Cancella solo:
--   ❌ Punti quiz (action_type = 'quiz_win')
-- ================================================================

BEGIN;

-- 1. Cancella tutte le transazioni punti relative ai quiz
DELETE FROM point_transactions
WHERE action_type = 'quiz_win';

-- 2. Ricalcola i punti totali per ogni utente basandosi sulle transazioni rimaste
-- (Cancella e ricostruisce user_points da zero)
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

-- ================================================================
-- VERIFICA POST-RESET
-- ================================================================
-- Verifica che non ci siano più transazioni quiz:
-- SELECT COUNT(*) FROM point_transactions WHERE action_type = 'quiz_win';  -- Deve essere 0
--
-- Controlla i nuovi totali punti:
-- SELECT u.name, up.points, up.level
-- FROM user_points up
-- JOIN profiles u ON u.id = up.user_id
-- ORDER BY up.points DESC;
-- ================================================================
