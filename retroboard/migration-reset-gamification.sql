-- ================================================================
-- RESET COMPLETO SISTEMA GAMIFICATION
-- ================================================================
-- Data: 2026-07-03
-- Motivo: Cambio composizione team (nuovo membro, vecchio membro uscito)
--
-- COSA VIENE RESETTATO:
--   ✅ Punti totali e livelli (user_points)
--   ✅ Storico transazioni punti (point_transactions)
--   ✅ Badge sbloccati (user_badges)
--   ✅ Classifica (leaderboard)
--
-- COSA RIMANE INTATTO:
--   ❌ Sessioni/retrospettive (sessions)
--   ❌ Commenti, voti, azioni
--   ❌ Quiz games e risposte
--   ❌ Team e profili utenti
--   ❌ Definizioni badge (badge_definitions)
-- ================================================================

-- 1. Elimina tutti i badge sbloccati
DELETE FROM user_badges;

-- 2. Elimina tutto lo storico transazioni punti
DELETE FROM point_transactions;

-- 3. Elimina tutti i record punti (classifica)
DELETE FROM user_points;

-- ================================================================
-- VERIFICA POST-RESET
-- ================================================================
-- Esegui queste query per verificare che tutto sia a zero:
--
-- SELECT COUNT(*) FROM user_badges;         -- Deve essere 0
-- SELECT COUNT(*) FROM point_transactions;  -- Deve essere 0
-- SELECT COUNT(*) FROM user_points;         -- Deve essere 0
--
-- Le tabelle sessions, comments, votes, actions devono rimanere popolate:
-- SELECT COUNT(*) FROM sessions;            -- Deve essere > 0 (se hai sessioni)
-- SELECT COUNT(*) FROM comments;            -- Deve essere > 0 (se hai commenti)
-- ================================================================

-- Note:
-- - I badge verranno automaticamente ri-sbloccati quando gli utenti
--   raggiungeranno nuovamente i criteri (via trigger check_and_unlock_badges)
-- - I punti verranno riaccumulati partecipando a nuove sessioni
-- - Tutti gli utenti ripartono da zero in modo equo
