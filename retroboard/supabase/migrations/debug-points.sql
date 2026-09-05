-- ================================================================
-- DEBUG: Verifica TUTTI i dati punti nel database
-- ================================================================

-- 1. Controlla TUTTI i record user_points (anche con team_id)
SELECT * FROM user_points;

-- 2. Controlla TUTTE le transazioni
SELECT * FROM point_transactions ORDER BY created_at DESC LIMIT 20;

-- 3. Conta per team_id
SELECT team_id, COUNT(*) as count FROM user_points GROUP BY team_id;

-- 4. Conta per user_id
SELECT user_id, SUM(points) as total_points FROM user_points GROUP BY user_id;

-- 5. Verifica se ci sono viste o tabelle simili
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%point%';
