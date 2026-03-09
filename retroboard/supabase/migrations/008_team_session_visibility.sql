-- Fix: team members can't see sessions associated with their team
-- Two issues:
-- 1. session_participants INSERT policy only allows user_id = auth.uid(),
--    so organizer can't batch-insert team members as participants.
-- 2. sessions SELECT policy doesn't check team membership,
--    so even querying by team_id is blocked by RLS.

-- ============================================================
-- 1. Allow organizer to add other users as session participants
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can join sessions" ON session_participants;
CREATE POLICY "Authenticated users can join sessions" ON session_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR is_session_organizer(session_id)
  );

-- ============================================================
-- 2. Allow team members to see sessions associated with their team
-- ============================================================
DROP POLICY IF EXISTS "Sessions viewable by participants" ON sessions;
CREATE POLICY "Sessions viewable by participants" ON sessions
  FOR SELECT TO authenticated
  USING (
    organizer_id = auth.uid()
    OR is_session_member(id)
    OR (team_id IS NOT NULL AND is_team_member(team_id))
  );

-- ============================================================
-- 3. Allow organizer to delete sessions (CASCADE handles child rows)
-- ============================================================
DROP POLICY IF EXISTS "Organizer can delete sessions" ON sessions;
CREATE POLICY "Organizer can delete sessions" ON sessions
  FOR DELETE TO authenticated
  USING (organizer_id = auth.uid());
