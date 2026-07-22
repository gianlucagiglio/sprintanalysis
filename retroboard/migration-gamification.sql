-- ============================================
-- GAMIFICATION SYSTEM: Points & Badges
-- ============================================

-- Tabella User Points (stato corrente)
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  points INT DEFAULT 0 CHECK (points >= 0),
  level INT DEFAULT 1 CHECK (level >= 1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_team ON user_points(team_id);
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points DESC);

-- RLS Policies
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view team points" ON user_points
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert points" ON user_points
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update points" ON user_points
  FOR UPDATE USING (true);

-- ============================================
-- Tabella Point Transactions (storia)
-- ============================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  action_id UUID REFERENCES actions(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'participate', 'comment', 'vote', 'action_complete', 'quiz_win', 'streak_bonus'
  points INT NOT NULL,
  description TEXT,
  metadata JSONB, -- dati extra (es: { streak: 5, multiplier: 1.2 })
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_session ON point_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created ON point_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON point_transactions
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Tabella Badge Definitions (configurazione)
-- ============================================
CREATE TABLE IF NOT EXISTS badge_definitions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji
  category TEXT NOT NULL, -- 'participation', 'contribution', 'team', 'special'
  criteria JSONB NOT NULL, -- { type: 'retrospectives_count', threshold: 20 }
  sort_order INT DEFAULT 0,
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Badge Definitions
INSERT INTO badge_definitions (code, name, description, icon, category, criteria, sort_order) VALUES
  -- Participation Badges
  ('newcomer', 'Newcomer', 'Partecipa alla tua prima retrospettiva', '🥉', 'participation', '{"type": "retrospectives_count", "threshold": 1}', 1),
  ('regular', 'Regular', 'Partecipa a 5 retrospettive', '🥈', 'participation', '{"type": "retrospectives_count", "threshold": 5}', 2),
  ('veteran', 'Veteran', 'Partecipa a 20 retrospettive', '🥇', 'participation', '{"type": "retrospectives_count", "threshold": 20}', 3),
  ('legend', 'Legend', 'Partecipa a 50 retrospettive', '💎', 'participation', '{"type": "retrospectives_count", "threshold": 50}', 4),

  -- Contribution Badges
  ('chatterbox', 'Chatterbox', 'Scrivi 50 commenti in totale', '💬', 'contribution', '{"type": "comments_count", "threshold": 50}', 10),
  ('action_hero', 'Action Hero', 'Completa 10 azioni assegnate', '🎯', 'contribution', '{"type": "actions_completed", "threshold": 10}', 11),
  ('speed_demon', 'Speed Demon', 'Completa 5 azioni in meno di 3 giorni', '⚡', 'contribution', '{"type": "actions_fast", "threshold": 5, "days": 3}', 12),

  -- Streak Badges
  ('streak_master', 'Streak Master', 'Partecipa a 10 retrospettive consecutive', '🔥', 'contribution', '{"type": "streak", "threshold": 10}', 20),

  -- Team Badges
  ('team_player', 'Team Player', 'Vota 20 commenti di altri membri', '🤝', 'team', '{"type": "votes_given", "threshold": 20}', 30),
  ('motivator', 'Motivator', 'Mood positivo per 5 retrospettive consecutive', '🌟', 'team', '{"type": "mood_streak_positive", "threshold": 5}', 31),
  ('problem_solver', 'Problem Solver', 'Crea 3 azioni con alta priorità', '🚀', 'team', '{"type": "actions_high_priority", "threshold": 3}', 32),

  -- Special Badges
  ('organizer_pro', 'Organizer Pro', 'Organizza 10 retrospettive', '👑', 'special', '{"type": "sessions_organized", "threshold": 10}', 40),
  ('quiz_master', 'Quiz Master', 'Vinci 5 quiz', '🎓', 'special', '{"type": "quiz_wins", "threshold": 5}', 41),
  ('unicorn', 'Unicorn', 'Badge segreto - Scoprilo!', '🦄', 'special', '{"type": "secret", "threshold": 1}', 50)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Tabella User Badges (badge sbloccati)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_code TEXT REFERENCES badge_definitions(code) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  seen BOOLEAN DEFAULT false, -- se l'utente ha visto la notifica
  UNIQUE(user_id, badge_code)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked ON user_badges(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_seen ON user_badges(user_id, seen) WHERE NOT seen;

-- RLS Policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view team badges" ON user_badges
  FOR SELECT USING (
    user_id IN (
      SELECT tm.user_id
      FROM team_members tm
      WHERE tm.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own badges" ON user_badges
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Function: Calculate Level from Points
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level(points INT)
RETURNS INT AS $$
BEGIN
  -- Formula: Level = floor(sqrt(points / 100)) + 1
  -- Level 1: 0-99 points
  -- Level 2: 100-399 points
  -- Level 3: 400-899 points
  -- Level 4: 900-1599 points
  -- etc.
  RETURN GREATEST(1, FLOOR(SQRT(points / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Function: Add Points to User
-- ============================================
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_team_id UUID,
  p_session_id UUID,
  p_action_id UUID,
  p_action_type TEXT,
  p_points INT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
  v_new_total INT;
  v_new_level INT;
BEGIN
  -- Insert transaction
  INSERT INTO point_transactions (user_id, session_id, action_id, action_type, points, description, metadata)
  VALUES (p_user_id, p_session_id, p_action_id, p_action_type, p_points, p_description, p_metadata);

  -- Upsert user_points
  INSERT INTO user_points (user_id, team_id, points, level)
  VALUES (p_user_id, p_team_id, p_points, calculate_level(p_points))
  ON CONFLICT (user_id, team_id)
  DO UPDATE SET
    points = user_points.points + p_points,
    level = calculate_level(user_points.points + p_points),
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- View: User Stats (per calcolo badge)
-- NOTE: Simplified version without actions to avoid type casting issues
-- Actions stats will be calculated separately when checking badge criteria
-- ============================================
CREATE OR REPLACE VIEW user_stats AS
SELECT
  p.id as user_id,
  NULL::uuid as team_id,
  COUNT(DISTINCT sp.session_id) as retrospectives_count,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT v.id) as votes_given,
  0 as actions_completed, -- Calculated separately to avoid type issues
  COUNT(DISTINCT CASE WHEN s.organizer_id = p.id THEN s.id END) as sessions_organized
FROM profiles p
LEFT JOIN session_participants sp ON sp.user_id = p.id
LEFT JOIN sessions s ON s.id = sp.session_id
LEFT JOIN comments c ON c.user_id = p.id
LEFT JOIN votes v ON v.user_id = p.id
GROUP BY p.id;

COMMENT ON VIEW user_stats IS 'Aggregate stats for badge calculation (actions counted separately)';
