-- Add configurable max votes per participant
ALTER TABLE sessions
  ADD COLUMN max_votes integer NOT NULL DEFAULT 3;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_max_votes_range
  CHECK (max_votes >= 0 AND max_votes <= 20);

-- Trigger function: block INSERT on votes if user already reached the session limit
CREATE OR REPLACE FUNCTION check_vote_limit()
RETURNS trigger AS $$
DECLARE
  _max_votes integer;
  _current_count integer;
  _session_id uuid;
BEGIN
  -- Find the session_id via the comment's section
  SELECT s.id, s.max_votes
    INTO _session_id, _max_votes
    FROM sessions s
    JOIN sections sec ON sec.session_id = s.id
    JOIN comments c   ON c.section_id  = sec.id
   WHERE c.id = NEW.comment_id
   LIMIT 1;

  IF _session_id IS NULL THEN
    RAISE EXCEPTION 'Comment does not belong to any session';
  END IF;

  -- 0 means voting is disabled
  IF _max_votes = 0 THEN
    RAISE EXCEPTION 'Voting is disabled for this session';
  END IF;

  -- Count existing votes for this user in this session
  SELECT COUNT(*)
    INTO _current_count
    FROM votes v
    JOIN comments c  ON c.id = v.comment_id
    JOIN sections sec ON sec.id = c.section_id
   WHERE sec.session_id = _session_id
     AND v.user_id = NEW.user_id;

  IF _current_count >= _max_votes THEN
    RAISE EXCEPTION 'Vote limit reached (% / %)', _current_count, _max_votes;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_vote_limit
  BEFORE INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION check_vote_limit();
