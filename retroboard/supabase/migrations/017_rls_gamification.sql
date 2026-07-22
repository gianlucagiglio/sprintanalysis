-- ================================================================
-- RLS POLICIES PER TABELLE GAMIFICATION
-- ================================================================
-- Fix security: user_points, point_transactions, user_badges
-- devono avere RLS policies per proteggere dati sensibili
-- ================================================================

-- Enable RLS su tutte le tabelle gamification
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- USER_POINTS POLICIES
-- ================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
DROP POLICY IF EXISTS "Users can view team points" ON user_points;
DROP POLICY IF EXISTS "System can manage points" ON user_points;

-- Gli utenti possono leggere solo i propri punti
CREATE POLICY "Users can view their own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Gli utenti possono leggere i punti dei membri del loro team
CREATE POLICY "Users can view team points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (
    team_id IS NOT NULL
    AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Solo il sistema può inserire/aggiornare punti (via RPC functions)
CREATE POLICY "System can manage points"
  ON user_points
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ================================================================
-- POINT_TRANSACTIONS POLICIES
-- ================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own transactions" ON point_transactions;
DROP POLICY IF EXISTS "System can create transactions" ON point_transactions;

-- Gli utenti possono leggere solo le proprie transazioni
CREATE POLICY "Users can view their own transactions"
  ON point_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Solo il sistema può inserire transazioni (via RPC add_user_points)
CREATE POLICY "System can create transactions"
  ON point_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- ================================================================
-- USER_BADGES POLICIES
-- ================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view team member badges" ON user_badges;
DROP POLICY IF EXISTS "System can manage badges" ON user_badges;

-- Gli utenti possono leggere i propri badge
CREATE POLICY "Users can view their own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Gli utenti possono leggere i badge dei membri del loro team
CREATE POLICY "Users can view team member badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT tm.user_id
      FROM team_members tm
      INNER JOIN team_members my_teams ON tm.team_id = my_teams.team_id
      WHERE my_teams.user_id = auth.uid()
    )
  );

-- Solo il sistema può assegnare badge (via trigger check_and_unlock_badges)
CREATE POLICY "System can manage badges"
  ON user_badges
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ================================================================
-- BADGE_DEFINITIONS - Read-only per tutti (già OK)
-- ================================================================
-- Verifica che badge_definitions sia leggibile da tutti
-- Drop if exists + recreate
DROP POLICY IF EXISTS "Badge definitions are viewable by all authenticated users" ON badge_definitions;

CREATE POLICY "Badge definitions are viewable by all authenticated users"
  ON badge_definitions
  FOR SELECT
  TO authenticated
  USING (true);

-- ================================================================
-- VERIFICA POST-MIGRATION
-- ================================================================
-- Per verificare che le policies siano attive:
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('user_points', 'point_transactions', 'user_badges')
-- ORDER BY tablename, policyname;
-- ================================================================
