-- ============================================
-- SISTEMA OWNER/CREATOR CONFIGURABILE
-- Sostituisce la whitelist hardcoded in permissions.ts
-- ============================================

-- Aggiungi campo can_create_sessions
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS can_create_sessions BOOLEAN DEFAULT false;

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_profiles_can_create_sessions
  ON profiles(can_create_sessions)
  WHERE can_create_sessions = true;

COMMENT ON COLUMN profiles.can_create_sessions IS 'Se true, utente può creare nuove retrospettive';

-- ============================================
-- MIGRAZIONE DATI: Abilita utenti esistenti
-- ============================================

-- Abilita tutti i super admin
UPDATE profiles
SET can_create_sessions = true
WHERE is_super_admin = true;

-- Abilita Beatrice (owner attuale)
UPDATE profiles
SET can_create_sessions = true
WHERE email ILIKE '%beatrice%';

-- ============================================
-- FUNZIONE: Toggle permesso creazione sessioni
-- ============================================

CREATE OR REPLACE FUNCTION set_can_create_sessions(
  p_user_id UUID,
  p_can_create BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_is_super_admin BOOLEAN;
  v_target_name TEXT;
  v_target_email TEXT;
BEGIN
  -- Get admin ID
  v_admin_id := auth.uid();

  -- Check se chi chiama è super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM profiles
  WHERE id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono modificare i permessi di creazione';
  END IF;

  -- Get target user info
  SELECT name, email INTO v_target_name, v_target_email
  FROM profiles
  WHERE id = p_user_id;

  IF v_target_name IS NULL THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  -- Update permission
  UPDATE profiles
  SET can_create_sessions = p_can_create
  WHERE id = p_user_id;

  RAISE NOTICE 'Utente % (%) - Può creare sessioni: % (modificato da %)',
    v_target_name, v_target_email, p_can_create, v_admin_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_name', v_target_name,
    'user_email', v_target_email,
    'can_create_sessions', p_can_create
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION set_can_create_sessions IS 'Abilita/disabilita creazione sessioni per utente (solo super admin)';

-- ============================================
-- UPDATE RLS: Solo utenti autorizzati possono creare sessioni
-- ============================================

DROP POLICY IF EXISTS "Users can create sessions" ON sessions;

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = organizer_id
    AND NOT is_user_banned(auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (can_create_sessions = true OR is_super_admin = true)
    )
  );

-- ============================================
-- AUDIT LOG: Modifiche permessi creazione
-- ============================================

CREATE TABLE IF NOT EXISTS session_creator_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_create_sessions BOOLEAN NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now(),

  target_user_name TEXT,
  changed_by_name TEXT
);

CREATE INDEX IF NOT EXISTS idx_session_creator_changes_target
  ON session_creator_changes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_session_creator_changes_changed_at
  ON session_creator_changes(changed_at DESC);

COMMENT ON TABLE session_creator_changes IS 'Log audit modifiche permessi creazione sessioni';

-- ============================================
-- TRIGGER: Log automatico modifiche permessi
-- ============================================

CREATE OR REPLACE FUNCTION log_session_creator_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_changed_by_name TEXT;
BEGIN
  -- Solo se can_create_sessions è cambiato
  IF (OLD.can_create_sessions IS DISTINCT FROM NEW.can_create_sessions) THEN

    SELECT name INTO v_changed_by_name
    FROM profiles
    WHERE id = auth.uid();

    INSERT INTO session_creator_changes (
      target_user_id,
      changed_by_user_id,
      can_create_sessions,
      target_user_name,
      changed_by_name
    ) VALUES (
      NEW.id,
      auth.uid(),
      NEW.can_create_sessions,
      NEW.name,
      v_changed_by_name
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_session_creator_change ON profiles;

CREATE TRIGGER trigger_log_session_creator_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_session_creator_change();

COMMENT ON FUNCTION log_session_creator_change IS 'Trigger log automatico modifiche permessi creazione';
