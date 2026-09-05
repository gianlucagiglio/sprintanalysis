-- ================================================================
-- RESET HALL OF FAME (CLASSIFICA PUNTI)
-- ================================================================
-- Data: 2026-07-22
-- Motivo: Azzeramento punti accumulati nella hall of fame
--
-- COSA VIENE RESETTATO:
--   ✅ Punti totali e livelli (user_points)
--   ✅ Storico transazioni punti (point_transactions)
--
-- COSA RIMANE INTATTO:
--   ❌ Badge sbloccati (user_badges) - rimangono acquisiti
--   ❌ Sessioni/retrospettive (sessions)
--   ❌ Commenti, voti, azioni
--   ❌ Quiz games e risposte
--   ❌ Team e profili utenti
--   ❌ Definizioni badge (badge_definitions)
-- ================================================================

BEGIN;

-- 1. Elimina tutto lo storico transazioni punti
DELETE FROM point_transactions;

-- 2. Elimina tutti i record punti (classifica/hall of fame)
DELETE FROM user_points;

-- Nota: i cast ::INT alle righe precedenti prevengono errori bigint se presenti

COMMIT;

-- ================================================================
-- VERIFICA POST-RESET
-- ================================================================
-- Esegui queste query per verificare che tutto sia azzerato:
--
-- SELECT COUNT(*) FROM point_transactions;  -- Deve essere 0
-- SELECT COUNT(*) FROM user_points;         -- Deve essere 0
--
-- Verifica che i badge siano ancora presenti:
-- SELECT COUNT(*) FROM user_badges;         -- Deve essere > 0 (se esistevano)
--
-- Le altre tabelle devono rimanere popolate:
-- SELECT COUNT(*) FROM sessions;            -- Deve essere > 0 (se hai sessioni)
-- SELECT COUNT(*) FROM comments;            -- Deve essere > 0 (se hai commenti)
-- ================================================================

-- Note finali:
-- - I punti verranno riaccumulati partecipando a nuove sessioni
-- - I badge rimangono sbloccati (non vengono cancellati)
-- - Tutti gli utenti ripartono da zero punti
-- - Le attività passate (commenti, voti, azioni) rimangono registrate
