-- ============================================
-- FIX: Gamification Points Accumulation
-- ============================================

-- 1. Drop existing constraint that doesn't work with NULL
ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_user_id_team_id_key;

-- 2. Create partial unique index that handles NULL correctly
-- This ensures one record per user when team_id IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_user_null_team
  ON user_points(user_id)
  WHERE team_id IS NULL;

-- 3. Create unique index for non-NULL team_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_user_team
  ON user_points(user_id, team_id)
  WHERE team_id IS NOT NULL;

-- 4. Fix the add_user_points function to handle NULL team_id correctly
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_team_id UUID,
  p_session_id UUID,
  p_action_id UUID,
  p_action_type TEXT,
  p_points INT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
  v_current_points INT;
  v_new_total INT;
  v_new_level INT;
BEGIN
  -- Insert transaction
  INSERT INTO point_transactions (user_id, session_id, action_id, action_type, points, description, metadata)
  VALUES (p_user_id, p_session_id, p_action_id, p_action_type, p_points, p_description, p_metadata);

  -- Get current points (handle NULL team_id correctly)
  SELECT COALESCE(points, 0) INTO v_current_points
  FROM user_points
  WHERE user_id = p_user_id
    AND ((team_id IS NULL AND p_team_id IS NULL) OR (team_id = p_team_id));

  -- Calculate new total
  v_new_total := COALESCE(v_current_points, 0) + p_points;
  v_new_level := calculate_level(v_new_total);

  -- Upsert user_points (use WHERE clause to handle NULL)
  IF p_team_id IS NULL THEN
    -- Handle NULL team_id case
    INSERT INTO user_points (user_id, team_id, points, level, updated_at)
    VALUES (p_user_id, NULL, p_points, calculate_level(p_points), now())
    ON CONFLICT (user_id) WHERE team_id IS NULL
    DO UPDATE SET
      points = user_points.points + p_points,
      level = calculate_level(user_points.points + p_points),
      updated_at = now();
  ELSE
    -- Handle non-NULL team_id case
    INSERT INTO user_points (user_id, team_id, points, level, updated_at)
    VALUES (p_user_id, p_team_id, p_points, calculate_level(p_points), now())
    ON CONFLICT (user_id, team_id) WHERE team_id IS NOT NULL
    DO UPDATE SET
      points = user_points.points + p_points,
      level = calculate_level(user_points.points + p_points),
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Clean up any duplicate records (keep the one with most points)
DELETE FROM user_points up1
WHERE EXISTS (
  SELECT 1
  FROM user_points up2
  WHERE up2.user_id = up1.user_id
    AND up2.team_id IS NOT DISTINCT FROM up1.team_id
    AND up2.id > up1.id
);

-- 6. Consolidate points if there are multiple records per user
WITH consolidated AS (
  SELECT
    user_id,
    team_id,
    SUM(points) as total_points,
    MIN(id) as keep_id
  FROM user_points
  WHERE team_id IS NULL
  GROUP BY user_id, team_id
  HAVING COUNT(*) > 1
)
UPDATE user_points up
SET
  points = c.total_points,
  level = calculate_level(c.total_points)
FROM consolidated c
WHERE up.id = c.keep_id;

-- Delete duplicate records after consolidation
DELETE FROM user_points up
WHERE team_id IS NULL
  AND id NOT IN (
    SELECT MIN(id)
    FROM user_points
    WHERE team_id IS NULL
    GROUP BY user_id
  );

COMMENT ON FUNCTION add_user_points IS 'Add points to user account with proper NULL handling';
