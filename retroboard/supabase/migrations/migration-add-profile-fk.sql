-- ============================================
-- FIX: Add foreign key to profiles for Leaderboard
-- ============================================

-- 1. Verifica che tutti gli user_id in user_points esistano in profiles
-- (pulizia preventiva)
DELETE FROM user_points
WHERE user_id NOT IN (SELECT id FROM profiles);

-- 2. Aggiungi la foreign key
ALTER TABLE user_points
  ADD CONSTRAINT user_points_user_id_profiles_fk
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- 3. Verifica che la FK sia stata creata
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conname = 'user_points_user_id_profiles_fk';

-- 4. Test query (dovrebbe funzionare ora)
SELECT
  up.*,
  p.name,
  p.email
FROM user_points up
LEFT JOIN profiles p ON p.id = up.user_id
WHERE up.team_id IS NULL
ORDER BY up.points DESC
LIMIT 8;
