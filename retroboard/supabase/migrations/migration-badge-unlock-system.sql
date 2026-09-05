-- ============================================
-- BADGE AUTO-UNLOCK SYSTEM
-- ============================================

-- Funzione per controllare e sbloccare i badge
CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_badge RECORD;
  v_count INT;
  v_unlocked BOOLEAN;
BEGIN
  -- Itera su tutti i badge non ancora sbloccati dall'utente
  FOR v_badge IN
    SELECT bd.*
    FROM badge_definitions bd
    WHERE bd.code NOT IN (
      SELECT badge_code FROM user_badges WHERE user_id = p_user_id
    )
  LOOP
    v_unlocked := false;

    -- Controlla il criterio specifico del badge
    CASE v_badge.criteria->>'type'

      -- Retrospettive partecipate
      WHEN 'retrospectives_count' THEN
        SELECT COUNT(DISTINCT session_id) INTO v_count
        FROM session_participants
        WHERE user_id = p_user_id;

        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      -- Commenti scritti
      WHEN 'comments_count' THEN
        SELECT COUNT(*) INTO v_count
        FROM comments
        WHERE user_id = p_user_id;

        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      -- Azioni completate
      WHEN 'actions_completed' THEN
        SELECT COUNT(*) INTO v_count
        FROM actions
        WHERE assigned_to = p_user_id AND status = 'done';

        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      -- Azioni completate velocemente (< N giorni)
      WHEN 'actions_fast' THEN
        SELECT COUNT(*) INTO v_count
        FROM actions
        WHERE assigned_to = p_user_id
          AND status = 'done'
          AND completed_at IS NOT NULL
          AND (completed_at - created_at) < INTERVAL '1 day' * (v_badge.criteria->>'days')::INT;

        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      -- Voti dati ad altri
      WHEN 'votes_given' THEN
        SELECT COUNT(*) INTO v_count
        FROM votes
        WHERE user_id = p_user_id;

        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      -- Retrospettive organizzate
      WHEN 'sessions_organized' THEN
        SELECT COUNT(*) INTO v_count
        FROM sessions
        WHERE organizer_id = p_user_id;

        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      -- Quiz vinti
      WHEN 'quiz_wins' THEN
        SELECT COUNT(*) INTO v_count
        FROM point_transactions
        WHERE user_id = p_user_id AND action_type = 'quiz_win';

        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      ELSE
        -- Criteri non implementati (streak, mood_streak, ecc.)
        CONTINUE;
    END CASE;

    -- Se il badge è stato sbloccato, inseriscilo
    IF v_unlocked THEN
      INSERT INTO user_badges (user_id, badge_code, seen)
      VALUES (p_user_id, v_badge.code, false)
      ON CONFLICT (user_id, badge_code) DO NOTHING;

      RAISE NOTICE 'Badge unlocked: % for user %', v_badge.name, p_user_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Modifica add_user_points per chiamare il check dei badge
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

  -- Check and unlock badges
  PERFORM check_and_unlock_badges(p_user_id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_and_unlock_badges IS 'Check badge criteria and auto-unlock badges for user';
COMMENT ON FUNCTION add_user_points IS 'Add points to user account and check for badge unlocks';
