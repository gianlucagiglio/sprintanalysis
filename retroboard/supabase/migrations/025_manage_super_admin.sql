-- ============================================
-- GESTIONE SUPER ADMIN
-- Permetti di promuovere/rimuovere super admin
-- ============================================

-- ============================================
-- FUNZIONE: Set/Unset Super Admin
-- ============================================

CREATE OR REPLACE FUNCTION set_super_admin_status(
  p_user_id UUID,
  p_is_super_admin BOOLEAN
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
  v_current_super_admin_count INT;
BEGIN
  -- Get admin ID
  v_admin_id := auth.uid();

  -- Check se chi chiama è super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM profiles
  WHERE id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono modificare i privilegi admin';
  END IF;

  -- Get target user info
  SELECT name, email, is_super_admin INTO v_target_name, v_target_email, v_is_super_admin
  FROM profiles
  WHERE id = p_user_id;

  IF v_target_name IS NULL THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  -- Previeni auto-rimozione
  IF p_user_id = v_admin_id AND p_is_super_admin = false THEN
    RAISE EXCEPTION 'Non puoi rimuovere i tuoi privilegi di super admin';
  END IF;

  -- Se sto RIMUOVENDO super admin, controlla che non sia l'ultimo
  IF p_is_super_admin = false THEN
    SELECT COUNT(*) INTO v_current_super_admin_count
    FROM profiles
    WHERE is_super_admin = true;

    IF v_current_super_admin_count <= 1 THEN
      RAISE EXCEPTION 'Impossibile rimuovere l''ultimo super admin. Deve esserci almeno 1 super admin.';
    END IF;
  END IF;

  -- Update super admin status
  UPDATE profiles
  SET is_super_admin = p_is_super_admin
  WHERE id = p_user_id;

  RAISE NOTICE 'Utente % (%) - Super Admin: % (modificato da %)', v_target_name, v_target_email, p_is_super_admin, v_admin_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_name', v_target_name,
    'user_email', v_target_email,
    'is_super_admin', p_is_super_admin
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION set_super_admin_status IS 'Promuove o rimuove privilegi super admin (solo super admin)';

-- ============================================
-- AUDIT: Log modifiche super admin
-- ============================================

CREATE TABLE IF NOT EXISTS super_admin_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now(),

  -- Info snapshot al momento del cambio
  target_user_name TEXT,
  changed_by_name TEXT
);

CREATE INDEX IF NOT EXISTS idx_super_admin_changes_target ON super_admin_changes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_changes_changed_at ON super_admin_changes(changed_at DESC);

COMMENT ON TABLE super_admin_changes IS 'Log audit delle modifiche ai privilegi super admin';

-- ============================================
-- TRIGGER: Log automatico modifiche super admin
-- ============================================

CREATE OR REPLACE FUNCTION log_super_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_changed_by_name TEXT;
BEGIN
  -- Solo se is_super_admin è cambiato
  IF (OLD.is_super_admin IS DISTINCT FROM NEW.is_super_admin) THEN

    -- Get nome di chi ha fatto il cambiamento
    SELECT name INTO v_changed_by_name
    FROM profiles
    WHERE id = auth.uid();

    INSERT INTO super_admin_changes (
      target_user_id,
      changed_by_user_id,
      is_super_admin,
      target_user_name,
      changed_by_name
    ) VALUES (
      NEW.id,
      auth.uid(),
      NEW.is_super_admin,
      NEW.name,
      v_changed_by_name
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_super_admin_change ON profiles;

CREATE TRIGGER trigger_log_super_admin_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_super_admin_change();

COMMENT ON FUNCTION log_super_admin_change IS 'Trigger per log automatico modifiche super admin';
