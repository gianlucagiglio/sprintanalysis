-- ============================================
-- RESET PROFILO COMPLETO
-- ============================================

DO $$
DECLARE
  v_user_id UUID := 'e84d8f38-14bb-4480-a4de-d444a723989e';
BEGIN
  -- Mostra situazione PRIMA
  RAISE NOTICE '=== BEFORE RESET ===';
  RAISE NOTICE 'Transactions: %', (SELECT COUNT(*) FROM point_transactions WHERE user_id = v_user_id);
  RAISE NOTICE 'Points: %', (SELECT COALESCE(points, 0) FROM user_points WHERE user_id = v_user_id AND team_id IS NULL);
  RAISE NOTICE 'Badges: %', (SELECT COUNT(*) FROM user_badges WHERE user_id = v_user_id);

  -- CANCELLA TUTTO
  DELETE FROM point_transactions WHERE user_id = v_user_id;
  DELETE FROM user_badges WHERE user_id = v_user_id;
  DELETE FROM user_points WHERE user_id = v_user_id;

  -- Verifica DOPO
  RAISE NOTICE '=== AFTER RESET ===';
  RAISE NOTICE 'All data deleted. Profile reset to zero.';
END $$;

-- Verifica finale
SELECT
  (SELECT COUNT(*) FROM point_transactions WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e') as transactions,
  (SELECT COUNT(*) FROM user_points WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e') as points_records,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e') as badges;

-- Risultato atteso: tutto a 0
