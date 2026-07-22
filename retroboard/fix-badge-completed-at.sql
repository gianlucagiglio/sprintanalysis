-- ============================================
-- FIX: Rimuovi criterio actions_fast (colonna mancante)
-- ============================================

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

      -- RIMOSSO: actions_fast (richiede colonna completed_at)

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
        -- Criteri non implementati
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

-- Disabilita il badge "Speed Demon" per ora
UPDATE badge_definitions
SET criteria = jsonb_set(criteria, '{enabled}', 'false')
WHERE code = 'speed_demon';

COMMENT ON FUNCTION check_and_unlock_badges IS 'Check badge criteria and auto-unlock (actions_fast disabled)';
