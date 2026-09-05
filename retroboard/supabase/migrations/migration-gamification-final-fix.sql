-- ============================================
-- FINAL FIX: Rebuild user_points con RLS corretto
-- ============================================

-- Questo script risolve il problema una volta per tutte
-- eseguendo il rebuild in modo che rispetti le RLS policies

-- Step 1: Verifica situazione attuale
DO $$
DECLARE
  v_auth_uid UUID;
  v_points_count INT;
  v_transactions_count INT;
BEGIN
  -- Ottieni il tuo user_id autenticato
  v_auth_uid := auth.uid();

  RAISE NOTICE 'Il tuo user_id autenticato è: %', v_auth_uid;

  -- Conta record in user_points per il tuo utente
  SELECT COUNT(*) INTO v_points_count
  FROM user_points
  WHERE user_id = v_auth_uid AND team_id IS NULL;

  RAISE NOTICE 'Record in user_points per te: %', v_points_count;

  -- Conta transazioni per il tuo utente
  SELECT COUNT(*) INTO v_transactions_count
  FROM point_transactions
  WHERE user_id = v_auth_uid;

  RAISE NOTICE 'Transazioni per te: %', v_transactions_count;

  -- Se hai transazioni ma non punti, ricostruiamo
  IF v_transactions_count > 0 AND v_points_count = 0 THEN
    RAISE NOTICE 'PROBLEMA TROVATO: Hai % transazioni ma nessun record in user_points!', v_transactions_count;
    RAISE NOTICE 'Procedo con la ricostruzione...';

    -- Inserisci il record corretto
    INSERT INTO user_points (user_id, team_id, points, level)
    SELECT
      v_auth_uid,
      NULL,
      SUM(points),
      calculate_level(SUM(points))
    FROM point_transactions
    WHERE user_id = v_auth_uid
    ON CONFLICT (user_id) WHERE team_id IS NULL
    DO UPDATE SET
      points = EXCLUDED.points,
      level = EXCLUDED.level,
      updated_at = now();

    RAISE NOTICE 'Record creato/aggiornato con successo!';
  ELSIF v_points_count > 0 THEN
    RAISE NOTICE 'OK: Hai già un record in user_points';
  ELSE
    RAISE NOTICE 'INFO: Non hai ancora transazioni da consolidare';
  END IF;
END $$;

-- Step 2: Mostra il risultato finale
SELECT
  user_id,
  team_id,
  points,
  level,
  updated_at
FROM user_points
WHERE user_id = auth.uid() AND team_id IS NULL;

-- Step 3: Mostra le ultime transazioni
SELECT
  action_type,
  points,
  description,
  created_at
FROM point_transactions
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
