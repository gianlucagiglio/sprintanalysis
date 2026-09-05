-- ============================================
-- Aggiorna check_and_unlock_badges per azioni create
-- ============================================

CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_badge RECORD;
  v_count INT;
  v_unlocked BOOLEAN;
BEGIN
  FOR v_badge IN
    SELECT bd.*
    FROM badge_definitions bd
    WHERE bd.code NOT IN (
      SELECT badge_code FROM user_badges WHERE user_id = p_user_id
    )
  LOOP
    v_unlocked := false;

    CASE v_badge.criteria->>'type'
      WHEN 'retrospectives_count' THEN
        SELECT COUNT(DISTINCT session_id) INTO v_count
        FROM session_participants WHERE user_id = p_user_id;
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'comments_count' THEN
        SELECT COUNT(*) INTO v_count FROM comments WHERE user_id = p_user_id;
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'actions_completed' THEN
        SELECT COUNT(*) INTO v_count FROM actions
        WHERE (assigned_to = p_user_id OR p_user_id = ANY(assigned_to_multi))
          AND status = 'done';
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'actions_created' THEN
        SELECT COUNT(*) INTO v_count
        FROM point_transactions
        WHERE user_id = p_user_id AND action_type = 'action_create';
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'actions_fast' THEN
        SELECT COUNT(*) INTO v_count FROM actions
        WHERE (assigned_to = p_user_id OR p_user_id = ANY(assigned_to_multi))
          AND status = 'done'
          AND updated_at IS NOT NULL
          AND (updated_at - created_at) < INTERVAL '1 day' * (v_badge.criteria->>'days')::INT;
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'votes_given' THEN
        SELECT COUNT(*) INTO v_count FROM votes WHERE user_id = p_user_id;
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'sessions_organized' THEN
        SELECT COUNT(*) INTO v_count FROM sessions WHERE organizer_id = p_user_id;
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'quiz_wins' THEN
        SELECT COUNT(*) INTO v_count FROM point_transactions
        WHERE user_id = p_user_id AND action_type = 'quiz_win';
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      ELSE CONTINUE;
    END CASE;

    IF v_unlocked THEN
      INSERT INTO user_badges (user_id, badge_code, seen)
      VALUES (p_user_id, v_badge.code, false)
      ON CONFLICT (user_id, badge_code) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_and_unlock_badges IS 'Check badge criteria including actions created';
