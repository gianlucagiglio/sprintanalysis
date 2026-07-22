-- ============================================
-- DIAGNOSTIC: Check gamification data state
-- ============================================

-- 1. Check how many user_points records exist per user
SELECT
  user_id,
  team_id,
  points,
  level,
  created_at,
  updated_at
FROM user_points
ORDER BY user_id, team_id NULLS FIRST;

-- 2. Check for duplicate records (should be none after fix)
SELECT
  user_id,
  CASE WHEN team_id IS NULL THEN 'NULL' ELSE team_id::text END as team_id_display,
  COUNT(*) as record_count,
  SUM(points) as total_points
FROM user_points
GROUP BY user_id, team_id
HAVING COUNT(*) > 1;

-- 3. Check point transactions
SELECT
  user_id,
  action_type,
  points,
  description,
  created_at
FROM point_transactions
ORDER BY created_at DESC
LIMIT 20;

-- 4. Verify total points from transactions vs user_points
SELECT
  pt.user_id,
  SUM(pt.points) as transaction_total,
  COALESCE(up.points, 0) as user_points_total,
  SUM(pt.points) - COALESCE(up.points, 0) as difference
FROM point_transactions pt
LEFT JOIN user_points up ON up.user_id = pt.user_id AND up.team_id IS NULL
GROUP BY pt.user_id, up.points;
