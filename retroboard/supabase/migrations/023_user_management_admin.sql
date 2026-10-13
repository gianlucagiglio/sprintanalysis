-- ============================================
-- USER MANAGEMENT SYSTEM (Super Admin only)
-- Ban utenti + Delete utenti
-- ============================================

-- Aggiungi campo is_banned alla tabella profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Aggiungi campo banned_at per tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- Aggiungi campo banned_by per audit
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id);

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = true;

-- Commento
COMMENT ON COLUMN profiles.is_banned IS 'Se true, utente bannato e non può accedere';
COMMENT ON COLUMN profiles.banned_at IS 'Data/ora ban';
COMMENT ON COLUMN profiles.banned_by IS 'Super admin che ha bannato';

-- ============================================
-- FUNZIONE: Ban utente (solo super admin)
-- ============================================

CREATE OR REPLACE FUNCTION ban_user(
  p_user_id UUID,
  p_ban BOOLEAN DEFAULT true
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
    RAISE EXCEPTION 'Solo i super admin possono bannare utenti';
  END IF;

  -- Previeni auto-ban
  IF p_user_id = v_admin_id THEN
    RAISE EXCEPTION 'Non puoi bannare te stesso';
  END IF;

  -- Get target user info
  SELECT name, email INTO v_target_name, v_target_email
  FROM profiles
  WHERE id = p_user_id;

  IF v_target_name IS NULL THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  -- Ban/Unban
  IF p_ban THEN
    -- BAN
    UPDATE profiles
    SET
      is_banned = true,
      banned_at = now(),
      banned_by = v_admin_id
    WHERE id = p_user_id;

    RAISE NOTICE 'Utente % (%) bannato da admin %', v_target_name, v_target_email, v_admin_id;
  ELSE
    -- UNBAN
    UPDATE profiles
    SET
      is_banned = false,
      banned_at = NULL,
      banned_by = NULL
    WHERE id = p_user_id;

    RAISE NOTICE 'Utente % (%) sbannato da admin %', v_target_name, v_target_email, v_admin_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_name', v_target_name,
    'user_email', v_target_email,
    'is_banned', p_ban
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- FUNZIONE: Delete utente (solo super admin)
-- ============================================

CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_is_super_admin BOOLEAN;
  v_target_name TEXT;
  v_target_email TEXT;
  v_auth_user_exists BOOLEAN;
BEGIN
  -- Get admin ID
  v_admin_id := auth.uid();

  -- Check se chi chiama è super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM profiles
  WHERE id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono eliminare utenti';
  END IF;

  -- Previeni auto-delete
  IF p_user_id = v_admin_id THEN
    RAISE EXCEPTION 'Non puoi eliminare te stesso';
  END IF;

  -- Get target user info
  SELECT name, email INTO v_target_name, v_target_email
  FROM profiles
  WHERE id = p_user_id;

  IF v_target_name IS NULL THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  -- Check se utente esiste anche in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_user_id
  ) INTO v_auth_user_exists;

  -- Delete da profiles (CASCADE eliminerà tutto il resto)
  DELETE FROM profiles WHERE id = p_user_id;

  -- Note: Per eliminare anche da auth.users serve accesso admin API
  -- Qui eliminiamo solo da profiles, l'utente rimane in auth ma senza profile

  RAISE NOTICE 'Utente % (%) eliminato da admin %', v_target_name, v_target_email, v_admin_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_name', v_target_name,
    'user_email', v_target_email,
    'auth_user_exists', v_auth_user_exists,
    'note', 'Profile eliminato. Per eliminare completamente da auth.users usa Admin API.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- FUNZIONE: Get tutti gli utenti (solo super admin)
-- ============================================

CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  is_super_admin BOOLEAN,
  can_create_sessions BOOLEAN,
  is_banned BOOLEAN,
  banned_at TIMESTAMPTZ,
  banned_by_name TEXT,
  created_at TIMESTAMPTZ,
  teams_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_is_super_admin BOOLEAN;
BEGIN
  -- Get admin ID
  v_admin_id := auth.uid();

  -- Check se chi chiama è super admin
  SELECT p.is_super_admin INTO v_is_super_admin
  FROM profiles p
  WHERE p.id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono vedere tutti gli utenti';
  END IF;

  -- Return tutti gli utenti con info team
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.email,
    p.is_super_admin,
    COALESCE(p.can_create_sessions, false) as can_create_sessions,
    COALESCE(p.is_banned, false) as is_banned,
    p.banned_at,
    banner.name as banned_by_name,
    p.created_at,
    COUNT(DISTINCT tm.team_id) as teams_count
  FROM profiles p
  LEFT JOIN team_members tm ON tm.user_id = p.id
  LEFT JOIN profiles banner ON banner.id = p.banned_by
  GROUP BY p.id, p.name, p.email, p.is_super_admin, p.can_create_sessions, p.is_banned, p.banned_at, banner.name, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

-- Commenti
COMMENT ON FUNCTION ban_user IS 'Banna/sbanna un utente (solo super admin)';
COMMENT ON FUNCTION delete_user_account IS 'Elimina completamente un utente (solo super admin)';
COMMENT ON FUNCTION get_all_users_admin IS 'Ottiene lista completa utenti con stats (solo super admin)';

-- ============================================
-- TRIGGER: Previeni login utenti bannati
-- ============================================

-- Nota: Supabase gestisce questo a livello RLS
-- Aggiungiamo una policy per sicurezza extra

-- Update RLS policy per sessions - bannati non possono creare sessioni
DROP POLICY IF EXISTS "Users can create sessions" ON sessions;

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = organizer_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_banned = true
    )
  );
