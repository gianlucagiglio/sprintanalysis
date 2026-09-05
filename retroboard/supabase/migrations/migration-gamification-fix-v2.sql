-- ============================================
-- FIX: Gamification Points Accumulation (v2)
-- ============================================

-- 1. Drop existing constraint that doesn't work with NULL
ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_user_id_team_id_key;

-- 2. Create partial unique indexes that handle NULL correctly
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_user_null_team
  ON user_points(user_id) WHERE team_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_user_team
  ON user_points(user_id, team_id) WHERE team_id IS NOT NULL;

-- 3. Fix the add_user_points function
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
BEGIN
  -- Insert transaction
  INSERT INTO point_transactions (user_id, session_id, action_id, action_type, points, description, metadata)
  VALUES (p_user_id, p_session_id, p_action_id, p_action_type, p_points, p_description, p_metadata);

  -- Handle NULL team_id case
  IF p_team_id IS NULL THEN
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

-- 4. Consolidate existing duplicate records (simple approach)
-- First, consolidate points into the record with the highest points
DO $$
DECLARE
  rec RECORD;
  total_pts INT;
  best_id UUID;
BEGIN
  -- For each user with multiple records (team_id IS NULL)
  FOR rec IN
    SELECT user_id, COUNT(*) as cnt
    FROM user_points
    WHERE team_id IS NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  LOOP
    -- Get total points and best record id
    SELECT SUM(points), (SELECT id FROM user_points WHERE user_id = rec.user_id AND team_id IS NULL ORDER BY points DESC, created_at ASC LIMIT 1)
    INTO total_pts, best_id
    FROM user_points
    WHERE user_id = rec.user_id AND team_id IS NULL;

    -- Update the best record with total points
    UPDATE user_points
    SET points = total_pts,
        level = calculate_level(total_pts),
        updated_at = now()
    WHERE id = best_id;

    -- Delete other records
    DELETE FROM user_points
    WHERE user_id = rec.user_id
      AND team_id IS NULL
      AND id != best_id;
  END LOOP;
END $$;

COMMENT ON FUNCTION add_user_points IS 'Add points to user account with proper NULL handling';
