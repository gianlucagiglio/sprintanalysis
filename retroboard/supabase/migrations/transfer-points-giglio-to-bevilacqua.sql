-- ============================================
-- TRANSFER POINTS FROM gianluca.giglio@gmail.com TO sbevilacqua@qubicaamf.com
-- ============================================

DO $$
DECLARE
  v_source_user_id UUID;
  v_target_user_id UUID;
  v_team_id UUID;
  v_source_email TEXT := 'gianluca.giglio@gmail.com';
  v_target_email TEXT := 'sbevilacqua@qubicaamf.com';
  v_affected_points INT := 0;
  v_affected_transactions INT := 0;
BEGIN
  -- Step 1: Find source user
  SELECT id INTO v_source_user_id
  FROM profiles
  WHERE email = v_source_email;

  IF v_source_user_id IS NULL THEN
    RAISE EXCEPTION 'Source user not found: %', v_source_email;
  END IF;

  -- Step 2: Find target user
  SELECT id INTO v_target_user_id
  FROM profiles
  WHERE email = v_target_email;

  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user not found: %', v_target_email;
  END IF;

  RAISE NOTICE 'Source user ID: %', v_source_user_id;
  RAISE NOTICE 'Target user ID: %', v_target_user_id;

  -- Step 3: Transfer point_transactions (simple update)
  UPDATE point_transactions
  SET user_id = v_target_user_id
  WHERE user_id = v_source_user_id;

  GET DIAGNOSTICS v_affected_transactions = ROW_COUNT;
  RAISE NOTICE 'Transferred % point transactions', v_affected_transactions;

  -- Step 4: Transfer user_points (with merge logic)
  -- For each team_id of the source user, merge into target user
  FOR v_team_id IN
    SELECT DISTINCT team_id FROM user_points WHERE user_id = v_source_user_id
  LOOP
    -- Check if target user already has points for this team
    IF EXISTS (
      SELECT 1 FROM user_points
      WHERE user_id = v_target_user_id AND team_id = v_team_id
    ) THEN
      -- Merge: Add source points to target points
      UPDATE user_points
      SET
        points = points + (
          SELECT points FROM user_points
          WHERE user_id = v_source_user_id AND team_id = v_team_id
        ),
        level = calculate_level(points + (
          SELECT points FROM user_points
          WHERE user_id = v_source_user_id AND team_id = v_team_id
        )),
        updated_at = now()
      WHERE user_id = v_target_user_id AND team_id = v_team_id;

      -- Delete source record
      DELETE FROM user_points
      WHERE user_id = v_source_user_id AND team_id = v_team_id;

      RAISE NOTICE 'Merged points for team_id: %', v_team_id;
    ELSE
      -- Simple transfer: Just update user_id
      UPDATE user_points
      SET user_id = v_target_user_id
      WHERE user_id = v_source_user_id AND team_id = v_team_id;

      RAISE NOTICE 'Transferred points for team_id: %', v_team_id;
    END IF;

    v_affected_points := v_affected_points + 1;
  END LOOP;

  RAISE NOTICE 'Transferred % user_points records', v_affected_points;
  RAISE NOTICE 'Transfer completed successfully!';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transfer failed: %', SQLERRM;
END $$;
