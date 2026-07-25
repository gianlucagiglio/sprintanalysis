-- Fix: team deletion fails due to user_points unique constraint conflict
--
-- Problem:
-- When deleting a team, team_id in user_points is set to NULL (ON DELETE SET NULL).
-- But user already has a record with team_id = NULL (global points),
-- causing "duplicate key value violates unique constraint idx_user_points_user_null_team".
--
-- Solution:
-- Change ON DELETE SET NULL to ON DELETE CASCADE for user_points.team_id.
-- When a team is deleted, delete all points associated with that team.
-- This makes sense: team points are meaningless without the team.

-- Drop existing foreign key constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_points_team_id_fkey'
        AND table_name = 'user_points'
    ) THEN
        ALTER TABLE user_points DROP CONSTRAINT user_points_team_id_fkey;
    END IF;
END $$;

-- Recreate with ON DELETE CASCADE instead of ON DELETE SET NULL
ALTER TABLE user_points
    ADD CONSTRAINT user_points_team_id_fkey
    FOREIGN KEY (team_id)
    REFERENCES teams(id)
    ON DELETE CASCADE;

-- Ensure the unique constraint exists (should already be there from gamification migration)
-- This prevents duplicate (user_id, team_id) pairs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_points_user_id_team_id_key'
    ) THEN
        ALTER TABLE user_points ADD CONSTRAINT user_points_user_id_team_id_key UNIQUE (user_id, team_id);
    END IF;
END $$;

-- Clean up: remove any orphaned user_points records that might have been created
-- (where team_id references a deleted team)
DELETE FROM user_points
WHERE team_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM teams WHERE teams.id = user_points.team_id);
