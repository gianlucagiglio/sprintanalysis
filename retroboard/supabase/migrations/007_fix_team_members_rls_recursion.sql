-- Fix: infinite recursion detected in policy for relation "team_members" (error 42P17)
-- Dynamically drops ALL existing policies on teams and team_members,
-- then recreates them using SECURITY DEFINER functions to avoid recursion.

-- ============================================================
-- Step 1: Drop ALL existing policies dynamically (regardless of name)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop all policies on team_members
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'team_members' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON team_members', pol.policyname);
  END LOOP;

  -- Drop all policies on teams
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'teams' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON teams', pol.policyname);
  END LOOP;
END $$;

-- ============================================================
-- Step 2: Create SECURITY DEFINER helper functions (bypass RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION is_team_member(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_team_owner(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams
    WHERE id = p_team_id AND owner_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION is_team_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_member(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_team_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_owner(UUID) TO anon;

-- ============================================================
-- Step 3: Enable RLS (idempotent)
-- ============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 4: Recreate teams policies
-- ============================================================

-- Any authenticated user can read teams (needed for invite code lookup)
CREATE POLICY "teams_select" ON teams
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "teams_insert" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_update" ON teams
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "teams_delete" ON teams
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- Step 5: Recreate team_members policies (NO self-referencing!)
-- ============================================================

-- SELECT: user can see own rows + rows of teams they belong to (via SECURITY DEFINER)
CREATE POLICY "team_members_select" ON team_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_team_member(team_id)
  );

-- INSERT: user can add themselves, or team owner can add anyone
CREATE POLICY "team_members_insert" ON team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR is_team_owner(team_id)
  );

-- UPDATE: only team owner
CREATE POLICY "team_members_update" ON team_members
  FOR UPDATE TO authenticated
  USING (is_team_owner(team_id));

-- DELETE: user can remove self, or team owner can remove anyone
CREATE POLICY "team_members_delete" ON team_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR is_team_owner(team_id)
  );
