-- ============================================
-- DEBUG COMPLETO LEADERBOARD
-- ============================================

-- 1. Quale league è attiva ORA?
SELECT 'LEAGUE ATTIVA' as tipo, id, name, status, created_at
FROM quiz_leagues
WHERE status = 'active'

UNION ALL

SELECT 'LEAGUE CHIUSA' as tipo, id, name, status, end_date as created_at
FROM quiz_leagues
WHERE status = 'closed'
ORDER BY created_at DESC;

-- 2. Quanti quiz per ogni league?
SELECT
  COALESCE(ql.name, '⚠️ SENZA LEAGUE') as league,
  ql.status,
  COUNT(DISTINCT qq.id) as num_domande,
  COUNT(DISTINCT qa.user_id) as num_utenti,
  COUNT(qa.id) as num_risposte,
  SUM(qa.points) as punti_totali
FROM quiz_questions qq
LEFT JOIN quiz_leagues ql ON qq.league_id = ql.id
LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
GROUP BY ql.name, ql.status
ORDER BY punti_totali DESC NULLS LAST;

-- 3. CRITICO: Simula la query della leaderboard per league ATTIVA
WITH active_league AS (
  SELECT id FROM quiz_leagues WHERE status = 'active' LIMIT 1
),
filtered_questions AS (
  SELECT id, session_id
  FROM quiz_questions
  WHERE league_id = (SELECT id FROM active_league)
)
SELECT
  p.name as utente,
  COUNT(DISTINCT qa.id) as risposte,
  SUM(qa.points) as punti_totali
FROM filtered_questions fq
JOIN quiz_answers qa ON qa.question_id = fq.id
JOIN profiles p ON p.id = qa.user_id
GROUP BY p.name
ORDER BY punti_totali DESC;

-- 4. CONFRONTO: Cosa mostrerebbe se NON filtrasse per league?
SELECT
  p.name as utente,
  COUNT(DISTINCT qa.id) as risposte,
  SUM(qa.points) as punti_totali,
  STRING_AGG(DISTINCT COALESCE(ql.name, 'NO LEAGUE'), ', ') as leagues
FROM quiz_questions qq
JOIN quiz_answers qa ON qa.question_id = qq.id
JOIN profiles p ON p.id = qa.user_id
LEFT JOIN quiz_leagues ql ON qq.league_id = ql.id
GROUP BY p.name
ORDER BY punti_totali DESC;
