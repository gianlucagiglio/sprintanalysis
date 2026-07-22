-- ============================================
-- RESET COMPLETO PROFILO GAMIFICATION
-- ============================================
-- ATTENZIONE: Questo cancella TUTTO il progresso

-- 1. Mostra situazione attuale PRIMA del reset
SELECT
  'BEFORE RESET' as status,
  (SELECT COUNT(*) FROM point_transactions WHERE user_id = auth.uid()) as transactions,
  (SELECT COALESCE(points, 0) FROM user_points WHERE user_id = auth.uid() AND team_id IS NULL) as points,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = auth.uid()) as badges;

-- 2. CANCELLA TUTTO
DELETE FROM point_transactions WHERE user_id = auth.uid();
DELETE FROM user_badges WHERE user_id = auth.uid();
DELETE FROM user_points WHERE user_id = auth.uid();

-- 3. Verifica che sia tutto azzerato
SELECT
  'AFTER RESET' as status,
  (SELECT COUNT(*) FROM point_transactions WHERE user_id = auth.uid()) as transactions,
  (SELECT COUNT(*) FROM user_points WHERE user_id = auth.uid()) as points_records,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = auth.uid()) as badges;

-- Risultato atteso:
-- transactions: 0
-- points_records: 0
-- badges: 0
