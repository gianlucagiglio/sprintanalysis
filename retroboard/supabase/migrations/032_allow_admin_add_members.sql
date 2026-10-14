-- Allow team admins to add members (in addition to owners)
-- Currently only owner_id can add members, but admin role should also be able to

-- Create helper function to check if user is admin or owner of a team
CREATE OR REPLACE FUNCTION is_team_admin_or_owner(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION is_team_admin_or_owner(UUID) TO authenticated;

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "team_members_insert" ON team_members;

-- Recreate INSERT policy with admin support
CREATE POLICY "team_members_insert" ON team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- User can add themselves
    user_id = auth.uid()
    OR
    -- Team admin or owner can add anyone (from team_members.role)
    is_team_admin_or_owner(team_id)
  );

COMMENT ON FUNCTION is_team_admin_or_owner(UUID) IS
  'Returns true if the current user is owner or admin of the specified team';

COMMENT ON POLICY "team_members_insert" ON team_members IS
  'Users can add themselves. Team owners and admins (from team_members.role) can add anyone.';

SELECT '✅ Team admins can now add members!' as status;
