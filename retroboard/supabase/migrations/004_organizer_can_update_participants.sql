-- Fix: allow organizer to update session_participants (e.g. reset is_done)
-- Currently only user_id = auth.uid() can update, blocking organizer from resetting all.

CREATE POLICY "Organizer can update participants" ON session_participants
  FOR UPDATE TO authenticated
  USING (is_session_organizer(session_id));
