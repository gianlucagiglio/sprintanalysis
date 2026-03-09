-- Fix: ensure is_session_member function exists, works, and is callable by all roles.
-- Also re-grant execute permissions explicitly.

-- Recreate the function (idempotent with CREATE OR REPLACE)
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

-- Grant execute to all relevant roles
GRANT EXECUTE ON FUNCTION is_session_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_session_member(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_session_organizer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_session_organizer(UUID) TO anon;

-- ============================================================
-- Drop ALL existing policies and recreate them cleanly
-- This ensures no stale or conflicting policies remain
-- ============================================================

-- === profiles ===
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- === sessions ===
DROP POLICY IF EXISTS "Sessions viewable by participants" ON sessions;
DROP POLICY IF EXISTS "Organizer can create sessions" ON sessions;
DROP POLICY IF EXISTS "Organizer can update sessions" ON sessions;

CREATE POLICY "Sessions viewable by participants" ON sessions
  FOR SELECT TO authenticated
  USING (organizer_id = auth.uid() OR is_session_member(id));
CREATE POLICY "Organizer can create sessions" ON sessions
  FOR INSERT TO authenticated WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Organizer can update sessions" ON sessions
  FOR UPDATE TO authenticated USING (organizer_id = auth.uid());

-- === session_participants ===
DROP POLICY IF EXISTS "Participants viewable by session members" ON session_participants;
DROP POLICY IF EXISTS "Authenticated users can join sessions" ON session_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON session_participants;

CREATE POLICY "Participants viewable by session members" ON session_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_session_member(session_id));
CREATE POLICY "Authenticated users can join sessions" ON session_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own participation" ON session_participants
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- === sections ===
DROP POLICY IF EXISTS "Sections viewable by session participants" ON sections;
DROP POLICY IF EXISTS "Organizer can manage sections" ON sections;

CREATE POLICY "Sections viewable by session participants" ON sections
  FOR SELECT TO authenticated
  USING (is_session_member(session_id) OR is_session_organizer(session_id));
CREATE POLICY "Organizer can manage sections" ON sections
  FOR ALL TO authenticated
  USING (is_session_organizer(session_id));

-- === comments ===
DROP POLICY IF EXISTS "Comments viewable by session participants" ON comments;
DROP POLICY IF EXISTS "Participants can add comments" ON comments;
DROP POLICY IF EXISTS "Comment owners or organizers can update" ON comments;

CREATE POLICY "Comments viewable by session participants" ON comments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sections sec
    WHERE sec.id = comments.section_id
    AND (is_session_member(sec.session_id) OR is_session_organizer(sec.session_id))
  ));
CREATE POLICY "Participants can add comments" ON comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Comment owners or organizers can update" ON comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM sections sec
    WHERE sec.id = comments.section_id AND is_session_organizer(sec.session_id)
  ));

-- === votes ===
DROP POLICY IF EXISTS "Votes viewable by session participants" ON votes;
DROP POLICY IF EXISTS "Users can manage own votes" ON votes;

CREATE POLICY "Votes viewable by session participants" ON votes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM comments c
    JOIN sections sec ON sec.id = c.section_id
    WHERE c.id = votes.comment_id
    AND (is_session_member(sec.session_id) OR is_session_organizer(sec.session_id))
  ));
CREATE POLICY "Users can manage own votes" ON votes
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- === actions ===
DROP POLICY IF EXISTS "Actions viewable by session participants" ON actions;
DROP POLICY IF EXISTS "Participants can manage actions" ON actions;

CREATE POLICY "Actions viewable by session participants" ON actions
  FOR SELECT TO authenticated
  USING (is_session_member(session_id) OR is_session_organizer(session_id));
CREATE POLICY "Participants can manage actions" ON actions
  FOR ALL TO authenticated
  USING (is_session_member(session_id) OR is_session_organizer(session_id));

-- === quiz_questions ===
DROP POLICY IF EXISTS "Quiz questions viewable by participants" ON quiz_questions;
DROP POLICY IF EXISTS "Organizer can manage quiz questions" ON quiz_questions;

CREATE POLICY "Quiz questions viewable by participants" ON quiz_questions
  FOR SELECT TO authenticated
  USING (is_session_member(session_id) OR is_session_organizer(session_id));
CREATE POLICY "Organizer can manage quiz questions" ON quiz_questions
  FOR ALL TO authenticated
  USING (is_session_organizer(session_id));

-- === quiz_answers ===
DROP POLICY IF EXISTS "Quiz answers viewable by participants" ON quiz_answers;
DROP POLICY IF EXISTS "Users can submit own answers" ON quiz_answers;

CREATE POLICY "Quiz answers viewable by participants" ON quiz_answers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quiz_questions qq
    WHERE qq.id = quiz_answers.question_id
    AND (is_session_member(qq.session_id) OR is_session_organizer(qq.session_id))
  ));
CREATE POLICY "Users can submit own answers" ON quiz_answers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- === mood_votes ===
DROP POLICY IF EXISTS "Mood votes viewable by participants" ON mood_votes;
DROP POLICY IF EXISTS "Users can manage own mood votes" ON mood_votes;

CREATE POLICY "Mood votes viewable by participants" ON mood_votes
  FOR SELECT TO authenticated
  USING (is_session_member(session_id) OR is_session_organizer(session_id));
CREATE POLICY "Users can manage own mood votes" ON mood_votes
  FOR ALL TO authenticated USING (user_id = auth.uid());
