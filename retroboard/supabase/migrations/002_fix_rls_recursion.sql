-- Fix: infinite recursion in session_participants RLS policy (error 42P17)
-- The SELECT policy on session_participants was querying itself, causing infinite recursion.
-- Solution: SECURITY DEFINER functions that bypass RLS for membership checks.

-- Helper: check if current user is a participant of a session (bypasses RLS)
CREATE OR REPLACE FUNCTION is_session_member(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM session_participants
    WHERE session_id = p_session_id AND user_id = auth.uid()
  );
$$;

-- Helper: check if current user is the organizer of a session (bypasses RLS)
CREATE OR REPLACE FUNCTION is_session_organizer(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM sessions
    WHERE id = p_session_id AND organizer_id = auth.uid()
  );
$$;

-- ============================================================
-- Fix session_participants policies (root cause of recursion)
-- ============================================================
DROP POLICY IF EXISTS "Participants viewable by session members" ON session_participants;
CREATE POLICY "Participants viewable by session members" ON session_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_session_member(session_id)
  );

-- ============================================================
-- Fix sessions SELECT policy (was triggering the recursive chain)
-- ============================================================
DROP POLICY IF EXISTS "Sessions viewable by participants" ON sessions;
CREATE POLICY "Sessions viewable by participants" ON sessions
  FOR SELECT TO authenticated
  USING (
    organizer_id = auth.uid()
    OR is_session_member(id)
  );

-- ============================================================
-- Fix all other policies that joined through session_participants
-- ============================================================

-- Sections
DROP POLICY IF EXISTS "Sections viewable by session participants" ON sections;
CREATE POLICY "Sections viewable by session participants" ON sections
  FOR SELECT TO authenticated
  USING (is_session_member(session_id));

-- Comments
DROP POLICY IF EXISTS "Comments viewable by session participants" ON comments;
CREATE POLICY "Comments viewable by session participants" ON comments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sections sec
    WHERE sec.id = comments.section_id
    AND is_session_member(sec.session_id)
  ));

-- Votes
DROP POLICY IF EXISTS "Votes viewable by session participants" ON votes;
CREATE POLICY "Votes viewable by session participants" ON votes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM comments c
    JOIN sections sec ON sec.id = c.section_id
    WHERE c.id = votes.comment_id
    AND is_session_member(sec.session_id)
  ));

-- Actions
DROP POLICY IF EXISTS "Actions viewable by session participants" ON actions;
CREATE POLICY "Actions viewable by session participants" ON actions
  FOR SELECT TO authenticated
  USING (is_session_member(session_id));

DROP POLICY IF EXISTS "Participants can manage actions" ON actions;
CREATE POLICY "Participants can manage actions" ON actions
  FOR ALL TO authenticated
  USING (is_session_member(session_id));

-- Quiz questions
DROP POLICY IF EXISTS "Quiz questions viewable by participants" ON quiz_questions;
CREATE POLICY "Quiz questions viewable by participants" ON quiz_questions
  FOR SELECT TO authenticated
  USING (is_session_member(session_id));

-- Quiz answers
DROP POLICY IF EXISTS "Quiz answers viewable by participants" ON quiz_answers;
CREATE POLICY "Quiz answers viewable by participants" ON quiz_answers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quiz_questions qq
    WHERE qq.id = quiz_answers.question_id
    AND is_session_member(qq.session_id)
  ));

-- Mood votes
DROP POLICY IF EXISTS "Mood votes viewable by participants" ON mood_votes;
CREATE POLICY "Mood votes viewable by participants" ON mood_votes
  FOR SELECT TO authenticated
  USING (is_session_member(session_id));
