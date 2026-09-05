-- ============================================
-- CHECK: Verify user_id mismatch
-- ============================================

-- 1. Show all user_ids in user_points
SELECT DISTINCT
  user_id,
  points,
  level
FROM user_points
WHERE team_id IS NULL;

-- 2. Show all user_ids in point_transactions
SELECT DISTINCT
  user_id,
  COUNT(*) as transaction_count,
  SUM(points) as total_points
FROM point_transactions
GROUP BY user_id;

-- 3. Show your current auth user ID (run this to get your ID)
SELECT auth.uid() as your_user_id;

-- 4. Check if there's a mismatch
SELECT
  'user_points' as table_name,
  user_id
FROM user_points
WHERE team_id IS NULL
UNION ALL
SELECT
  'point_transactions' as table_name,
  user_id
FROM point_transactions
GROUP BY user_id;

-- 5. If you know your user_id from the frontend console, replace 'YOUR-USER-ID-HERE' below:
-- SELECT * FROM user_points WHERE user_id = 'YOUR-USER-ID-HERE' AND team_id IS NULL;
-- SELECT * FROM point_transactions WHERE user_id = 'YOUR-USER-ID-HERE' LIMIT 10;
