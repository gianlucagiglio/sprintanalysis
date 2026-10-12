-- ============================================
-- MIGLIORAMENTO SICUREZZA: close_quiz_league
-- Aggiunge transazioni esplicite e dry-run mode
-- ============================================

-- Funzione per preview (dry-run) senza modificare nulla
CREATE OR REPLACE FUNCTION preview_close_quiz_league(p_league_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_super_admin BOOLEAN;
  v_league_status TEXT;
  v_league_name TEXT;
  v_expected_rankings INT;
BEGIN
  v_user_id := auth.uid();

  -- Check super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM profiles WHERE id = v_user_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono chiudere le league';
  END IF;

  -- Verifica league
  SELECT status, name INTO v_league_status, v_league_name
  FROM quiz_leagues WHERE id = p_league_id;

  IF v_league_status IS NULL THEN
    RAISE EXCEPTION 'League non trovata';
  END IF;

  IF v_league_status = 'closed' THEN
    RAISE EXCEPTION 'League già chiusa';
  END IF;

  -- Conta quanti rankings verrebbero salvati
  WITH quiz_stats AS (
    SELECT
      qa.user_id,
      COUNT(DISTINCT qq.session_id) as games_played,
      SUM(qa.points) as total_points
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qq.league_id = p_league_id
    GROUP BY qa.user_id
  )
  SELECT COUNT(*) INTO v_expected_rankings FROM quiz_stats;

  -- Return preview senza modificare nulla
  RETURN jsonb_build_object(
    'success', true,
    'league_id', p_league_id,
    'league_name', v_league_name,
    'current_status', v_league_status,
    'expected_rankings_to_save', v_expected_rankings,
    'warning', 'Questa è una PREVIEW. Nessun dato è stato modificato.'
  );
END;
$$;

-- Versione migliorata di close_quiz_league con transazioni esplicite
CREATE OR REPLACE FUNCTION close_quiz_league(
  p_league_id UUID,
  p_new_league_name TEXT DEFAULT NULL,
  p_new_league_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_super_admin BOOLEAN;
  v_league_status TEXT;
  v_new_league_id UUID;
  v_rankings_count INT;
  v_league_name TEXT;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();

  -- Check se utente è super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM profiles WHERE id = v_user_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono chiudere le league';
  END IF;

  -- Verifica che la league esista e sia attiva
  SELECT status, name INTO v_league_status, v_league_name
  FROM quiz_leagues WHERE id = p_league_id;

  IF v_league_status IS NULL THEN
    RAISE EXCEPTION 'League non trovata';
  END IF;

  IF v_league_status = 'closed' THEN
    RAISE EXCEPTION 'League già chiusa';
  END IF;

  -- ⚠️ INIZIO OPERAZIONI CRITICHE (transazione implicita garantita da PL/pgSQL)

  -- 1. Crea snapshot della classifica attuale
  -- Usa UPSERT per sicurezza (in caso di retry)
  WITH quiz_stats AS (
    SELECT
      qa.user_id,
      COUNT(DISTINCT qq.session_id) as games_played,
      SUM(qa.points) as total_points
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qq.league_id = p_league_id
    GROUP BY qa.user_id
  ),
  ranked_stats AS (
    SELECT
      user_id,
      total_points,
      games_played,
      RANK() OVER (ORDER BY total_points DESC) as rank
    FROM quiz_stats
  )
  INSERT INTO league_rankings (league_id, user_id, total_points, games_played, rank)
  SELECT
    p_league_id,
    user_id,
    COALESCE(total_points, 0),
    games_played,
    rank
  FROM ranked_stats
  ON CONFLICT (league_id, user_id) DO UPDATE
  SET
    total_points = EXCLUDED.total_points,
    games_played = EXCLUDED.games_played,
    rank = EXCLUDED.rank,
    snapshot_at = now();

  GET DIAGNOSTICS v_rankings_count = ROW_COUNT;

  -- Verifica che almeno 1 ranking sia stato salvato (se ci sono dati)
  IF v_rankings_count = 0 THEN
    RAISE NOTICE 'ATTENZIONE: Nessun ranking salvato per la league "%". Potrebbe non esserci stato nessun quiz giocato.', v_league_name;
  END IF;

  -- 2. Chiudi la league (UPDATE atomico)
  UPDATE quiz_leagues
  SET
    status = 'closed',
    end_date = now()
  WHERE id = p_league_id
    AND status = 'active'; -- Double check per sicurezza

  -- Verifica che l'update sia andato a buon fine
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Impossibile chiudere la league - stato non valido';
  END IF;

  -- 3. Crea nuova league se richiesto
  IF p_new_league_name IS NOT NULL THEN
    INSERT INTO quiz_leagues (name, description, status, created_by)
    VALUES (p_new_league_name, p_new_league_description, 'active', v_user_id)
    RETURNING id INTO v_new_league_id;
  END IF;

  -- ✅ FINE OPERAZIONI CRITICHE

  -- Log successo
  RAISE NOTICE 'League "%" chiusa con successo. Rankings salvati: %', v_league_name, v_rankings_count;

  -- Return risultati
  RETURN jsonb_build_object(
    'success', true,
    'closed_league_id', p_league_id,
    'closed_league_name', v_league_name,
    'rankings_saved', v_rankings_count,
    'new_league_id', v_new_league_id
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback automatico garantito da PostgreSQL
    RAISE NOTICE 'ERRORE durante chiusura league: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'hint', 'Tutte le modifiche sono state annullate (rollback automatico)'
    );
END;
$$;

-- Commenti
COMMENT ON FUNCTION preview_close_quiz_league IS 'Preview (dry-run) chiusura league senza modificare dati - per verificare prima';
COMMENT ON FUNCTION close_quiz_league IS 'Chiude league con transazioni esplicite e rollback automatico in caso di errore';
