-- Team Resource Manager - Supabase Database Schema
-- Esegui questo script nel SQL Editor di Supabase Dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Hex color: #RRGGBB
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: team_members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  weekly_capacity NUMERIC(4, 2) NOT NULL DEFAULT 5.0, -- 0-5 days, step 0.01
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT weekly_capacity_range CHECK (weekly_capacity >= 0 AND weekly_capacity <= 5)
);

-- Table: sprints
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Table: features
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL, -- Opzionale - le allocazioni vengono fatte sulla timeline
  color VARCHAR(7) NOT NULL, -- Hex color: #RRGGBB
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: allocations
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  days NUMERIC(4, 2) NOT NULL DEFAULT 0, -- 0-5 days, step 0.01
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT days_range CHECK (days >= 0 AND days <= 5),
  CONSTRAINT unique_allocation UNIQUE (feature_id, member_id, week_start)
);

-- Table: time_offs
CREATE TABLE time_offs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the week
  days NUMERIC(4, 2) NOT NULL DEFAULT 0, -- 0-5 days, step 0.01
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT time_off_days_range CHECK (days >= 0 AND days <= 5),
  CONSTRAINT unique_time_off UNIQUE (member_id, week_start)
);

-- Table: feature_members (assegnazione membri a feature)
CREATE TABLE feature_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_feature_member UNIQUE (feature_id, member_id)
);

-- Indexes for performance
CREATE INDEX idx_team_members_role ON team_members(role_id);
CREATE INDEX idx_features_sprint ON features(sprint_id);
CREATE INDEX idx_allocations_feature ON allocations(feature_id);
CREATE INDEX idx_allocations_member ON allocations(member_id);
CREATE INDEX idx_allocations_week ON allocations(week_start);
CREATE INDEX idx_time_offs_member ON time_offs(member_id);
CREATE INDEX idx_time_offs_week ON time_offs(week_start);
CREATE INDEX idx_feature_members_feature ON feature_members(feature_id);
CREATE INDEX idx_feature_members_member ON feature_members(member_id);

-- Enable Row Level Security (RLS) - DISABLED for v1
-- In production, enable RLS and create appropriate policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_members ENABLE ROW LEVEL SECURITY;

-- Temporary policy: allow all operations (for development)
-- IMPORTANT: Replace with proper policies in production
CREATE POLICY "Allow all for development" ON roles FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON sprints FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON features FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON allocations FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON time_offs FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON feature_members FOR ALL USING (true);

-- Sample data (optional, for testing)
INSERT INTO roles (name, color) VALUES
  ('Frontend Developer', '#3b82f6'),
  ('Backend Developer', '#10b981'),
  ('DevOps Engineer', '#f59e0b'),
  ('UI/UX Designer', '#ec4899');

COMMENT ON TABLE roles IS 'Ruoli del team (es. Frontend Developer, Designer)';
COMMENT ON TABLE team_members IS 'Membri del team con capacità settimanale';
COMMENT ON TABLE sprints IS 'Sprint con date inizio/fine';
COMMENT ON TABLE features IS 'Feature da sviluppare. Le allocazioni vengono gestite direttamente sulla timeline, sprint_id è opzionale';
COMMENT ON TABLE allocations IS 'Allocazioni settimanali: feature + membro + giorni';
COMMENT ON TABLE time_offs IS 'Ferie/assenze per membro e settimana';
COMMENT ON TABLE feature_members IS 'Assegnazione membri a feature (quali membri lavoreranno su questa feature)';
