-- ================================================================
-- RESET QUIZ LEADERBOARD (HALL OF FAME QUIZ)
-- ================================================================
-- Data: 2026-07-22
-- Motivo: Azzeramento punti accumulati nella hall of fame dei quiz
--
-- COSA VIENE CANCELLATO:
--   ✅ Tutte le risposte ai quiz (quiz_answers)
--   ✅ Tutti i punti della leaderboard quiz
--
-- COSA RIMANE INTATTO:
--   ❌ Le domande dei quiz (quiz_questions) - possono essere riutilizzate
--   ❌ Le sessioni
--   ❌ I partecipanti
--   ❌ Badge e altri punti gamification
-- ================================================================

BEGIN;

-- Cancella tutte le risposte ai quiz (questo resetta la leaderboard)
DELETE FROM quiz_answers;

-- Opzionale: decommentare per cancellare anche le domande
-- DELETE FROM quiz_questions;

COMMIT;

-- ================================================================
-- VERIFICA POST-RESET
-- ================================================================
-- Verifica che le risposte siano state cancellate:
-- SELECT COUNT(*) FROM quiz_answers;  -- Deve essere 0
--
-- Verifica che le domande esistano ancora (se vuoi mantenerle):
-- SELECT COUNT(*) FROM quiz_questions;  -- Deve essere > 0 se avevi domande
--
-- La leaderboard quiz ora dovrebbe essere vuota
-- ================================================================

-- Note:
-- - La quiz leaderboard calcola i punti da quiz_answers
-- - Cancellando le risposte, la leaderboard risulterà vuota
-- - Le domande rimangono disponibili per nuovi quiz
-- - Gli utenti potranno rispondere di nuovo ai quiz
