-- Fix team deletion by adding proper CASCADE/SET NULL constraints
-- Issue: Deleting a team fails because of foreign key constraints

-- First, we need to ensure the teams and team_members tables exist
-- (they might have been created manually via Supabase dashboard)

-- Create teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Add team_id to sessions if it doesn't exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Now fix the foreign key constraints to support cascading deletes
-- We need to drop and recreate the constraints

-- Drop existing foreign key constraints if they exist
DO $$
BEGIN
    -- Drop team_members.team_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'team_members_team_id_fkey'
        AND table_name = 'team_members'
    ) THEN
        ALTER TABLE team_members DROP CONSTRAINT team_members_team_id_fkey;
    END IF;

    -- Drop sessions.team_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'sessions_team_id_fkey'
        AND table_name = 'sessions'
    ) THEN
        ALTER TABLE sessions DROP CONSTRAINT sessions_team_id_fkey;
    END IF;
END $$;

-- Recreate constraints with proper CASCADE/SET NULL behavior
ALTER TABLE team_members
    ADD CONSTRAINT team_members_team_id_fkey
    FOREIGN KEY (team_id)
    REFERENCES teams(id)
    ON DELETE CASCADE;

ALTER TABLE sessions
    ADD CONSTRAINT sessions_team_id_fkey
    FOREIGN KEY (team_id)
    REFERENCES teams(id)
    ON DELETE SET NULL;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_team_id ON sessions(team_id);

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
