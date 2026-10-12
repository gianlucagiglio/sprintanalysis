-- ============================================
-- VERIFICA DATI LEAGUE
-- Esegui questo nel SQL Editor di Supabase
-- ============================================

-- 1. Controlla league attiva
SELECT
  id,
  name,
  description,
  start_date,
  status,
  created_at
FROM quiz_leagues
WHERE status = 'active';

-- 2. Controlla domande quiz associate alla league attiva
SELECT
  qq.id,
  qq.question,
  qq.session_id,
  qq.league_id,
  s.name as session_name,
  s.created_at as session_created
FROM quiz_questions qq
LEFT JOIN sessions s ON s.id = qq.session_id
WHERE qq.league_id IN (
  SELECT id FROM quiz_leagues WHERE status = 'active'
)
ORDER BY s.created_at DESC
LIMIT 20;

-- 3. Controlla domande quiz SENZA league (potrebbero essere quelle giocate!)
SELECT
  qq.id,
  qq.question,
  qq.session_id,
  qq.league_id,
  s.created_at as session_created,
  COUNT(qa.id) as total_answers
FROM quiz_questions qq
LEFT JOIN sessions s ON s.id = qq.session_id
LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
WHERE qq.league_id IS NULL
GROUP BY qq.id, qq.question, qq.session_id, qq.league_id, s.created_at
ORDER BY s.created_at DESC
LIMIT 20;

-- 4. Controlla risposte quiz in generale
SELECT
  COUNT(DISTINCT qa.user_id) as total_users,
  COUNT(DISTINCT qq.session_id) as total_sessions,
  COUNT(qa.id) as total_answers,
  SUM(qa.points) as total_points
FROM quiz_answers qa
JOIN quiz_questions qq ON qa.question_id = qq.id;

-- 5. Risposte quiz PER league
SELECT
  ql.name as league_name,
  ql.status,
  COUNT(DISTINCT qa.user_id) as users_count,
  COUNT(DISTINCT qq.session_id) as sessions_count,
  COUNT(qa.id) as answers_count,
  SUM(qa.points) as total_points
FROM quiz_leagues ql
LEFT JOIN quiz_questions qq ON qq.league_id = ql.id
LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
GROUP BY ql.id, ql.name, ql.status
ORDER BY ql.created_at DESC;

-- 6. Verifica se esistono risposte ma domande non associate
SELECT
  'Risposte con league' as tipo,
  COUNT(DISTINCT qa.user_id) as users,
  COUNT(qa.id) as answers
FROM quiz_answers qa
JOIN quiz_questions qq ON qa.question_id = qq.id
WHERE qq.league_id IS NOT NULL

UNION ALL

SELECT
  'Risposte SENZA league' as tipo,
  COUNT(DISTINCT qa.user_id) as users,
  COUNT(qa.id) as answers
FROM quiz_answers qa
JOIN quiz_questions qq ON qa.question_id = qq.id
WHERE qq.league_id IS NULL;
