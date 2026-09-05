-- ============================================
-- FIX: Actions table + Badge unlock
-- ============================================

-- 1. Aggiungi updated_at alla tabella actions (best practice)
ALTER TABLE actions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Crea trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_actions_updated_at ON actions;
CREATE TRIGGER update_actions_updated_at
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. FIX: Badge unlock function senza completed_at
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
        WHERE assigned_to = p_user_id AND status = 'done';
        IF v_count >= (v_badge.criteria->>'threshold')::INT THEN
          v_unlocked := true;
        END IF;

      WHEN 'actions_fast' THEN
        -- Usa updated_at (ora disponibile) per calcolare velocità
        SELECT COUNT(*) INTO v_count FROM actions
        WHERE assigned_to = p_user_id AND status = 'done'
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

-- 4. Verifica che badge_definitions sia accessibile
SELECT COUNT(*) as total_badges FROM badge_definitions;

-- 5. Test manuale del check badges per il tuo utente
SELECT check_and_unlock_badges('e84d8f38-14bb-4480-a4de-d444a723989e');

-- 6. Verifica badge sbloccati
SELECT
  ub.badge_code,
  bd.name,
  bd.icon,
  ub.unlocked_at
FROM user_badges ub
JOIN badge_definitions bd ON bd.code = ub.badge_code
WHERE ub.user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e'
ORDER BY ub.unlocked_at DESC;
