-- ================================================================
-- RESET PUNTI CON FEEDBACK
-- ================================================================
-- Prima mostra quanti record esistono, poi li cancella
-- ================================================================

-- STEP 1: Conta i record PRIMA della cancellazione
SELECT
  'PRIMA DEL RESET' as stato,
  (SELECT COUNT(*) FROM point_transactions) as transazioni,
  (SELECT COUNT(*) FROM user_points) as utenti_con_punti;

-- STEP 2: Cancella i dati e mostra quanti sono stati cancellati
WITH deleted_transactions AS (
  DELETE FROM point_transactions RETURNING *
),
deleted_points AS (
  DELETE FROM user_points RETURNING *
)
SELECT
  'DOPO IL RESET' as stato,
  (SELECT COUNT(*) FROM deleted_transactions) as transazioni_cancellate,
  (SELECT COUNT(*) FROM deleted_points) as utenti_azzerati;
