-- Migration: Enforce team_id NOT NULL for sessions
-- This ensures complete team isolation

-- Step 1: Assign team_id to sessions without team based on organizer's first team
UPDATE sessions s
SET team_id = (
  SELECT tm.team_id
  FROM team_members tm
  WHERE tm.user_id = s.organizer_id
  LIMIT 1
)
WHERE s.team_id IS NULL
  AND EXISTS (
    SELECT 1 FROM team_members tm WHERE tm.user_id = s.organizer_id
  );

-- Step 2: Delete sessions that still don't have a team_id
-- (these are orphaned sessions from users without teams)
DELETE FROM sessions WHERE team_id IS NULL;

-- Step 3: Make team_id NOT NULL
ALTER TABLE sessions ALTER COLUMN team_id SET NOT NULL;

-- Step 4: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_team_id ON sessions(team_id);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN sessions.team_id IS 'Required: Every session must belong to a team';
