-- ============================================
-- RESET COMPLETO PROFILO - Versione diretta
-- ============================================
-- Usa il tuo user_id specifico

-- SOSTITUISCI CON IL TUO USER_ID:
DO $$
DECLARE
  v_user_id UUID := 'e84d8f38-14bb-4480-a4de-d444a723989e'; -- <-- IL TUO USER_ID
BEGIN
  -- 1. Mostra situazione PRIMA
  RAISE NOTICE '=== BEFORE RESET ===';
  RAISE NOTICE 'Transactions: %', (SELECT COUNT(*) FROM point_transactions WHERE user_id = v_user_id);
  RAISE NOTICE 'Points: %', (SELECT COALESCE(points, 0) FROM user_points WHERE user_id = v_user_id AND team_id IS NULL);
  RAISE NOTICE 'Badges: %', (SELECT COUNT(*) FROM user_badges WHERE user_id = v_user_id);

  -- 2. CANCELLA TUTTO
  DELETE FROM point_transactions WHERE user_id = v_user_id;
  RAISE NOTICE 'Deleted % point_transactions', FOUND;

  DELETE FROM user_badges WHERE user_id = v_user_id;
  RAISE NOTICE 'Deleted % user_badges', FOUND;

  DELETE FROM user_points WHERE user_id = v_user_id;
  RAISE NOTICE 'Deleted % user_points', FOUND;

  -- 3. Verifica DOPO
  RAISE NOTICE '=== AFTER RESET ===';
  RAISE NOTICE 'Transactions: %', (SELECT COUNT(*) FROM point_transactions WHERE user_id = v_user_id);
  RAISE NOTICE 'Points records: %', (SELECT COUNT(*) FROM user_points WHERE user_id = v_user_id);
  RAISE NOTICE 'Badges: %', (SELECT COUNT(*) FROM user_badges WHERE user_id = v_user_id);
END $$;

-- Verifica finale con SELECT
SELECT
  'FINAL CHECK' as status,
  (SELECT COUNT(*) FROM point_transactions WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e') as transactions,
  (SELECT COUNT(*) FROM user_points WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e') as points_records,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = 'e84d8f38-14bb-4480-a4de-d444a723989e') as badges;
