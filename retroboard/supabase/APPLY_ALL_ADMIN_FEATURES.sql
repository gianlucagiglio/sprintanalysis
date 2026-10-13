-- ============================================
-- APPLICAZIONE COMPLETA SISTEMA ADMIN
-- Esegui TUTTO questo file in una volta sola
-- ============================================

-- ============================================
-- 1. USER MANAGEMENT BASE
-- ============================================

-- Campo ban
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id);

-- Campo creazione sessioni
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_create_sessions BOOLEAN DEFAULT false;

-- Indici
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_profiles_can_create_sessions ON profiles(can_create_sessions) WHERE can_create_sessions = true;

-- Commenti
COMMENT ON COLUMN profiles.is_banned IS 'Se true, utente bannato e non può accedere';
COMMENT ON COLUMN profiles.banned_at IS 'Data/ora ban';
COMMENT ON COLUMN profiles.banned_by IS 'Super admin che ha bannato';
COMMENT ON COLUMN profiles.can_create_sessions IS 'Se true, utente può creare nuove retrospettive';

-- ============================================
-- 2. FUNZIONI HELPER
-- ============================================

CREATE OR REPLACE FUNCTION is_user_banned(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_banned, false) FROM profiles WHERE id = user_id;
$$;

-- ============================================
-- 3. FUNZIONE: Get tutti gli utenti (super admin only)
-- ============================================

-- Drop esistente se presente (per cambiare signature)
DROP FUNCTION IF EXISTS get_all_users_admin();

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
  v_admin_id := auth.uid();
  SELECT p.is_super_admin INTO v_is_super_admin FROM profiles p WHERE p.id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono vedere tutti gli utenti';
  END IF;

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

-- ============================================
-- 4. FUNZIONE: Ban utente
-- ============================================

CREATE OR REPLACE FUNCTION ban_user(p_user_id UUID, p_ban BOOLEAN DEFAULT true)
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
  v_admin_id := auth.uid();
  SELECT is_super_admin INTO v_is_super_admin FROM profiles WHERE id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono bannare utenti';
  END IF;

  IF p_user_id = v_admin_id THEN
    RAISE EXCEPTION 'Non puoi bannare te stesso';
  END IF;

  SELECT name, email INTO v_target_name, v_target_email FROM profiles WHERE id = p_user_id;
  IF v_target_name IS NULL THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  IF p_ban THEN
    UPDATE profiles SET is_banned = true, banned_at = now(), banned_by = v_admin_id WHERE id = p_user_id;
  ELSE
    UPDATE profiles SET is_banned = false, banned_at = NULL, banned_by = NULL WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'user_name', v_target_name, 'user_email', v_target_email, 'is_banned', p_ban);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================
-- 5. FUNZIONE: Delete utente
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
BEGIN
  v_admin_id := auth.uid();
  SELECT is_super_admin INTO v_is_super_admin FROM profiles WHERE id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono eliminare utenti';
  END IF;

  IF p_user_id = v_admin_id THEN
    RAISE EXCEPTION 'Non puoi eliminare te stesso';
  END IF;

  SELECT name, email INTO v_target_name, v_target_email FROM profiles WHERE id = p_user_id;
  IF v_target_name IS NULL THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  DELETE FROM profiles WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'user_name', v_target_name, 'user_email', v_target_email);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================
-- 6. FUNZIONE: Set permesso creazione sessioni
-- ============================================

CREATE OR REPLACE FUNCTION set_can_create_sessions(p_user_id UUID, p_can_create BOOLEAN)
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
  v_admin_id := auth.uid();
  SELECT is_super_admin INTO v_is_super_admin FROM profiles WHERE id = v_admin_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono modificare i permessi';
  END IF;

  SELECT name, email INTO v_target_name, v_target_email FROM profiles WHERE id = p_user_id;
  IF v_target_name IS NULL THEN
    RAISE EXCEPTION 'Utente non trovato';
  END IF;

  UPDATE profiles SET can_create_sessions = p_can_create WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'user_name', v_target_name, 'user_email', v_target_email, 'can_create_sessions', p_can_create);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================
-- 7. UPDATE RLS POLICIES - ENFORCE BAN
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() AND NOT is_user_banned(auth.uid()));

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated
  USING (NOT is_user_banned(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() AND NOT is_user_banned(auth.uid()));

-- Sessions - Solo autorizzati e non bannati
DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
CREATE POLICY "Users can create sessions" ON sessions FOR INSERT TO authenticated
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
-- 8. MIGRAZIONE DATI INIZIALE
-- ============================================

-- Abilita super admin come creator
UPDATE profiles SET can_create_sessions = true WHERE is_super_admin = true;

-- Abilita Beatrice (owner attuale)
UPDATE profiles SET can_create_sessions = true WHERE email ILIKE '%beatrice%';

-- ============================================
-- COMPLETATO!
-- ============================================

SELECT '✅ Sistema Admin completo installato!' as status;
