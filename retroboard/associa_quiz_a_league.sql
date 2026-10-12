-- ============================================
-- ASSOCIA QUIZ ESISTENTI ALLA LEAGUE ATTIVA
-- Esegui questo PASSO per PASSO nel SQL Editor
-- ============================================

-- STEP 1: VERIFICA cosa verrà modificato (SAFE - non modifica nulla)
SELECT
  COUNT(DISTINCT qq.id) as domande_da_associare,
  COUNT(DISTINCT qa.user_id) as utenti_coinvolti,
  COUNT(qa.id) as risposte_totali,
  SUM(qa.points) as punti_totali
FROM quiz_questions qq
LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
WHERE qq.league_id IS NULL;

-- STEP 2: Verifica ID della league attiva
SELECT
  id,
  name,
  description,
  status,
  start_date
FROM quiz_leagues
WHERE status = 'active';

-- STEP 3: ASSOCIA tutti i quiz esistenti alla league attiva
-- ⚠️ QUESTO MODIFICA I DATI - esegui solo se STEP 1 e 2 sono OK!
UPDATE quiz_questions
SET league_id = (
  SELECT id FROM quiz_leagues WHERE status = 'active' LIMIT 1
)
WHERE league_id IS NULL;

-- STEP 4: VERIFICA risultato
SELECT
  ql.name as league_name,
  ql.status,
  COUNT(DISTINCT qq.id) as domande_associate,
  COUNT(DISTINCT qa.user_id) as utenti_nella_classifica,
  COUNT(DISTINCT qq.session_id) as sessioni_con_quiz,
  SUM(qa.points) as punti_totali
FROM quiz_leagues ql
LEFT JOIN quiz_questions qq ON qq.league_id = ql.id
LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
WHERE ql.status = 'active'
GROUP BY ql.id, ql.name, ql.status;

-- STEP 5: Controlla che non ci siano più quiz senza league
SELECT COUNT(*) as quiz_rimasti_senza_league
FROM quiz_questions
WHERE league_id IS NULL;
-- Dovrebbe essere 0!
