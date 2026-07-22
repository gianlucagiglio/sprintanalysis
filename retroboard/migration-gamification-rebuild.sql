-- ============================================
-- REBUILD: Recalculate all user points from transactions
-- ============================================

-- 1. Backup existing user_points (optional, for safety)
-- CREATE TABLE user_points_backup AS SELECT * FROM user_points;

-- 2. Delete all existing user_points records
DELETE FROM user_points;

-- 3. Rebuild user_points from point_transactions
-- For users with NULL team_id (personal points)
INSERT INTO user_points (user_id, team_id, points, level, created_at, updated_at)
SELECT
  user_id,
  NULL as team_id,
  SUM(points) as total_points,
  calculate_level(SUM(points)) as level,
  MIN(created_at) as created_at,
  now() as updated_at
FROM point_transactions
GROUP BY user_id
ON CONFLICT (user_id) WHERE team_id IS NULL
DO UPDATE SET
  points = EXCLUDED.points,
  level = EXCLUDED.level,
  updated_at = now();

-- 4. Verify the rebuild
SELECT
  up.user_id,
  up.points,
  up.level,
  COUNT(pt.id) as transaction_count
FROM user_points up
LEFT JOIN point_transactions pt ON pt.user_id = up.user_id
WHERE up.team_id IS NULL
GROUP BY up.user_id, up.points, up.level
ORDER BY up.points DESC;

-- 5. Show summary
SELECT
  COUNT(DISTINCT user_id) as total_users,
  SUM(points) as total_points_distributed,
  AVG(points) as avg_points_per_user,
  MAX(points) as highest_points,
  MAX(level) as highest_level
FROM user_points
WHERE team_id IS NULL;
