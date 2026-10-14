-- Migration: Add team_id to quiz_leagues for team isolation
-- Every league now belongs to a specific team

-- Step 1: Add team_id column (nullable initially)
ALTER TABLE quiz_leagues
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Step 2: Assign existing leagues to a team
-- Strategy: assign to the first team alphabetically (or you can choose manually)
UPDATE quiz_leagues
SET team_id = (
  SELECT id FROM teams ORDER BY name LIMIT 1
)
WHERE team_id IS NULL;

-- Step 3: Make team_id NOT NULL (all leagues must belong to a team)
ALTER TABLE quiz_leagues
ALTER COLUMN team_id SET NOT NULL;

-- Step 4: Update the unique constraint for active leagues
-- Now only one active league PER TEAM
ALTER TABLE quiz_leagues
  DROP CONSTRAINT IF EXISTS only_one_active_league;

-- Create unique constraint: only one active league per team
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_league_per_team
  ON quiz_leagues(team_id)
  WHERE status = 'active';

-- Step 5: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_leagues_team_id ON quiz_leagues(team_id);

-- Step 6: Add comment for documentation
COMMENT ON COLUMN quiz_leagues.team_id IS 'Required: Every league belongs to a specific team';
