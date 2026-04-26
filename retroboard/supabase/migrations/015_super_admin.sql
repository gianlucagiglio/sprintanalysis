-- Add super_admin flag to profiles
ALTER TABLE profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;

-- Set gianluca.giglio@gmail.com as super admin
UPDATE profiles SET is_super_admin = true WHERE email = 'gianluca.giglio@gmail.com';

-- Helper function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow super admin full access

-- Sessions: super admin can do everything
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON sessions;
CREATE POLICY "Users can view sessions they participate in" ON sessions
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    id IN (SELECT session_id FROM session_participants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Organizers can update their sessions" ON sessions;
CREATE POLICY "Organizers can update their sessions" ON sessions
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR organizer_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can delete their sessions" ON sessions;
CREATE POLICY "Organizers can delete their sessions" ON sessions
  FOR DELETE TO authenticated
  USING (is_super_admin() OR organizer_id = auth.uid());

-- Session participants: super admin can manage all
DROP POLICY IF EXISTS "Participants can view session participants" ON session_participants;
CREATE POLICY "Participants can view session participants" ON session_participants
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    session_id IN (SELECT session_id FROM session_participants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Organizer can update participants" ON session_participants;
CREATE POLICY "Organizer can update participants" ON session_participants
  FOR UPDATE TO authenticated
  USING (
    is_super_admin() OR
    session_id IN (SELECT id FROM sessions WHERE organizer_id = auth.uid())
  );

-- Comments: super admin can edit/delete any comment
DROP POLICY IF EXISTS "Comment owners can update" ON comments;
CREATE POLICY "Comment owners can update" ON comments
  FOR UPDATE TO authenticated
  USING (
    is_super_admin() OR
    user_id = auth.uid() OR
    section_id IN (
      SELECT s.id FROM sections s
      JOIN sessions sess ON s.session_id = sess.id
      WHERE sess.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Comment owners can delete" ON comments;
CREATE POLICY "Comment owners can delete" ON comments
  FOR DELETE TO authenticated
  USING (is_super_admin() OR user_id = auth.uid());

-- Actions: super admin can manage all actions
DROP POLICY IF EXISTS "Participants can view actions" ON actions;
CREATE POLICY "Participants can view actions" ON actions
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    session_id IN (SELECT session_id FROM session_participants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Organizers and assigned users can update actions" ON actions;
CREATE POLICY "Organizers and assigned users can update actions" ON actions
  FOR UPDATE TO authenticated
  USING (
    is_super_admin() OR
    session_id IN (SELECT id FROM sessions WHERE organizer_id = auth.uid()) OR
    id IN (SELECT action_id FROM action_owners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Organizers can delete actions" ON actions;
CREATE POLICY "Organizers can delete actions" ON actions
  FOR DELETE TO authenticated
  USING (
    is_super_admin() OR
    session_id IN (SELECT id FROM sessions WHERE organizer_id = auth.uid())
  );

-- Teams: super admin can manage all teams
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
CREATE POLICY "Team members can view their teams" ON teams
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Team owners can update teams" ON teams;
CREATE POLICY "Team owners can update teams" ON teams
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Team owners can delete teams" ON teams;
CREATE POLICY "Team owners can delete teams" ON teams
  FOR DELETE TO authenticated
  USING (is_super_admin() OR owner_id = auth.uid());

-- Team members: super admin can manage all
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
CREATE POLICY "Team members can view team members" ON team_members
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;
CREATE POLICY "Team owners can manage members" ON team_members
  FOR ALL TO authenticated
  USING (
    is_super_admin() OR
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );
