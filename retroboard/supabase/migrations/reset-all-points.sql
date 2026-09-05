-- ================================================================
-- RESET COMPLETO PUNTI
-- ================================================================
-- Cancella TUTTI i punti e azzera la classifica
-- ================================================================

-- Cancella tutto lo storico transazioni punti
DELETE FROM point_transactions;

-- Cancella tutti i record punti
DELETE FROM user_points;

-- Fine: tutti i punti sono stati azzerati
