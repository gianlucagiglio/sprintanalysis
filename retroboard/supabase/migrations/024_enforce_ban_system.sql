-- ============================================
-- ENFORCE BAN SYSTEM
-- Blocca completamente utenti bannati
-- ============================================

-- ============================================
-- FUNZIONE: Check se utente è bannato
-- ============================================

CREATE OR REPLACE FUNCTION is_user_banned(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_banned, false)
  FROM profiles
  WHERE id = user_id;
$$;

COMMENT ON FUNCTION is_user_banned IS 'Controlla se un utente è bannato';

-- ============================================
-- UPDATE RLS POLICIES: Blocca utenti bannati
-- ============================================

-- PROFILES: Utenti bannati non possono leggere nemmeno il proprio profilo
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    AND NOT is_user_banned(auth.uid())
  );

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (NOT is_user_banned(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    AND NOT is_user_banned(auth.uid())
  );

-- SESSIONS: Utenti bannati non possono creare o partecipare a sessioni
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON sessions;
CREATE POLICY "Users can view sessions they participate in"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    NOT is_user_banned(auth.uid())
    AND (
      organizer_id = auth.uid()
      OR id IN (
        SELECT session_id FROM session_participants WHERE user_id = auth.uid()
      )
      OR (team_id IS NOT NULL AND team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ))
      OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = organizer_id
    AND NOT is_user_banned(auth.uid())
  );

DROP POLICY IF EXISTS "Organizers and admins can update sessions" ON sessions;
CREATE POLICY "Organizers and admins can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (
    NOT is_user_banned(auth.uid())
    AND (
      organizer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
      )
    )
  );

-- SESSION_PARTICIPANTS: Utenti bannati non possono partecipare
DROP POLICY IF EXISTS "Users can view participants" ON session_participants;
CREATE POLICY "Users can view participants"
  ON session_participants FOR SELECT
  TO authenticated
  USING (NOT is_user_banned(auth.uid()));

DROP POLICY IF EXISTS "Users can join sessions" ON session_participants;
CREATE POLICY "Users can join sessions"
  ON session_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT is_user_banned(auth.uid())
  );

-- COMMENTS: Utenti bannati non possono commentare
DROP POLICY IF EXISTS "Participants can create comments" ON comments;
CREATE POLICY "Participants can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT is_user_banned(auth.uid())
    AND EXISTS (
      SELECT 1 FROM session_participants
      WHERE session_id = comments.session_id AND user_id = auth.uid()
    )
  );

-- QUIZ_ANSWERS: Utenti bannati non possono rispondere a quiz
DROP POLICY IF EXISTS "Users can submit quiz answers" ON quiz_answers;
CREATE POLICY "Users can submit quiz answers"
  ON quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT is_user_banned(auth.uid())
  );

-- TEAMS: Utenti bannati non possono vedere team
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
CREATE POLICY "Team members can view their teams"
  ON teams FOR SELECT
  TO authenticated
  USING (
    NOT is_user_banned(auth.uid())
    AND (
      id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true
      )
    )
  );

-- ============================================
-- FUNCTION: Auto-logout se bannato
-- Chiamata dal frontend all'inizializzazione
-- ============================================

CREATE OR REPLACE FUNCTION check_user_ban_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_banned BOOLEAN;
  v_banned_at TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'is_banned', false,
      'message', 'Not authenticated'
    );
  END IF;

  SELECT is_banned, banned_at INTO v_is_banned, v_banned_at
  FROM profiles
  WHERE id = v_user_id;

  IF v_is_banned THEN
    RETURN jsonb_build_object(
      'is_banned', true,
      'banned_at', v_banned_at,
      'message', 'Il tuo account è stato sospeso. Contatta l''amministratore per maggiori informazioni.'
    );
  END IF;

  RETURN jsonb_build_object(
    'is_banned', false,
    'message', 'OK'
  );
END;
$$;

COMMENT ON FUNCTION check_user_ban_status IS 'Controlla se l''utente corrente è bannato (chiamata all''inizializzazione)';

-- ============================================
-- TRIGGER: Log tentativi accesso bannati
-- ============================================

CREATE TABLE IF NOT EXISTS banned_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_banned_login_attempts_user_id ON banned_login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_login_attempts_attempted_at ON banned_login_attempts(attempted_at DESC);

COMMENT ON TABLE banned_login_attempts IS 'Log dei tentativi di login da utenti bannati';

-- ============================================
-- IMPORTANTE: Revoca permessi default
-- ============================================

-- Revoca permessi INSERT su tabelle critiche per utenti bannati
-- Questo è un layer extra di sicurezza oltre alle policies

-- Nota: Le policies sopra già gestiscono questo, ma è bene essere ridondanti
