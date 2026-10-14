-- Fix RLS policy for team_members DELETE
-- Allow super admins and team owners to remove members

-- Drop existing DELETE policy if exists
DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;

-- Create new DELETE policy
CREATE POLICY "team_members_delete_policy" ON team_members
  FOR DELETE
  USING (
    -- Super admin can delete anyone
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
    OR
    -- Team owner can delete members from their team
    EXISTS (
      SELECT 1 FROM team_members AS tm_owner
      WHERE tm_owner.team_id = team_members.team_id
      AND tm_owner.user_id = auth.uid()
      AND tm_owner.role = 'owner'
    )
    OR
    -- User can remove themselves from a team
    user_id = auth.uid()
  );

COMMENT ON POLICY "team_members_delete_policy" ON team_members IS
  'Super admins and team owners can remove members. Users can leave teams.';

SELECT '✅ RLS policy for team_members DELETE fixed!' as status;
