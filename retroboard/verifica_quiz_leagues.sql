-- ============================================
-- VERIFICA ASSOCIAZIONE QUIZ A LEAGUES
-- ============================================

-- 1. Controlla league attiva
SELECT id, name, status, created_at
FROM quiz_leagues
WHERE status = 'active';

-- 2. Controlla league chiuse
SELECT id, name, status, end_date
FROM quiz_leagues
WHERE status = 'closed'
ORDER BY end_date DESC;

-- 3. CRITICO: Verifica a quale league sono associati i quiz
SELECT
  COALESCE(ql.name, 'NESSUNA LEAGUE') as league_name,
  ql.status as league_status,
  COUNT(qq.id) as num_domande,
  COUNT(DISTINCT qq.session_id) as num_sessioni,
  COUNT(qa.id) as num_risposte,
  MIN(s.created_at) as prima_sessione,
  MAX(s.created_at) as ultima_sessione
FROM quiz_questions qq
LEFT JOIN quiz_leagues ql ON qq.league_id = ql.id
LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
LEFT JOIN sessions s ON s.id = qq.session_id
GROUP BY ql.name, ql.status
ORDER BY MAX(s.created_at) DESC;

-- 4. Dettaglio: Ultime 10 sessioni con quiz e la loro league
SELECT
  s.id,
  s.title,
  s.created_at,
  COUNT(qq.id) as num_domande,
  COALESCE(ql.name, 'NO LEAGUE') as league_associata,
  ql.status as league_status
FROM sessions s
LEFT JOIN quiz_questions qq ON qq.session_id = s.id
LEFT JOIN quiz_leagues ql ON qq.league_id = ql.id
WHERE qq.id IS NOT NULL
GROUP BY s.id, s.title, s.created_at, ql.name, ql.status
ORDER BY s.created_at DESC
LIMIT 10;
