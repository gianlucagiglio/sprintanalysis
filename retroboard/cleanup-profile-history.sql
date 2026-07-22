-- ============================================
-- CLEANUP: Pulisci cronologia profilo
-- ============================================

-- OPZIONE A: Cancella solo la cronologia transazioni, mantieni punti e badge
-- ============================================================================
-- Questo cancella la lista "Attività Recente" ma mantiene il totale punti e i badge

DELETE FROM point_transactions
WHERE user_id = auth.uid();

-- Verifica: dovresti avere 0 transazioni ma i punti rimangono
SELECT
  (SELECT COUNT(*) FROM point_transactions WHERE user_id = auth.uid()) as transactions_count,
  (SELECT points FROM user_points WHERE user_id = auth.uid() AND team_id IS NULL) as current_points,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = auth.uid()) as badges_count;


-- ============================================================================
-- OPZIONE B: RESET COMPLETO - Azzera tutto (punti, badge, transazioni)
-- ============================================================================
-- ATTENZIONE: Questo cancella TUTTO il progresso di gamification
-- Decommentare le righe sotto solo se vuoi reset totale

/*
DELETE FROM point_transactions WHERE user_id = auth.uid();
DELETE FROM user_badges WHERE user_id = auth.uid();
DELETE FROM user_points WHERE user_id = auth.uid();

-- Verifica: tutto dovrebbe essere 0
SELECT
  (SELECT COUNT(*) FROM point_transactions WHERE user_id = auth.uid()) as transactions_count,
  (SELECT COUNT(*) FROM user_points WHERE user_id = auth.uid()) as points_records,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = auth.uid()) as badges_count;
*/
