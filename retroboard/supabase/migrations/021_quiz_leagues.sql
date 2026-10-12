-- ============================================
-- QUIZ LEAGUES SYSTEM
-- Gestione stagioni quiz con storico classifiche
-- ============================================

-- Tabella per gestire le league (stagioni)
CREATE TABLE IF NOT EXISTS quiz_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),

  -- Solo una league può essere attiva alla volta
  CONSTRAINT only_one_active_league EXCLUDE (status WITH =) WHERE (status = 'active')
);

-- Tabella per storicizzare le classifiche quando si chiude una league
CREATE TABLE IF NOT EXISTS league_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES quiz_leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_points INT NOT NULL DEFAULT 0,
  games_played INT NOT NULL DEFAULT 0,
  rank INT NOT NULL,
  snapshot_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(league_id, user_id)
);

-- Aggiungi league_id a quiz_questions (le domande appartengono a una league)
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES quiz_leagues(id) ON DELETE SET NULL;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_quiz_leagues_status ON quiz_leagues(status);
CREATE INDEX IF NOT EXISTS idx_quiz_leagues_created_at ON quiz_leagues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_league_rankings_league_id ON league_rankings(league_id);
CREATE INDEX IF NOT EXISTS idx_league_rankings_user_id ON league_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_league_rankings_rank ON league_rankings(league_id, rank);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_league_id ON quiz_questions(league_id);

-- Comments per documentazione
COMMENT ON TABLE quiz_leagues IS 'Stagioni quiz con gestione apertura/chiusura';
COMMENT ON TABLE league_rankings IS 'Storico classifiche al momento della chiusura league';
COMMENT ON COLUMN quiz_questions.league_id IS 'League a cui appartiene il set di domande';

-- Enable RLS
ALTER TABLE quiz_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies per quiz_leagues

-- Tutti possono leggere le league
CREATE POLICY "Anyone can read quiz leagues"
  ON quiz_leagues FOR SELECT
  TO authenticated
  USING (true);

-- Solo super admin può creare league
CREATE POLICY "Only super admin can create quiz leagues"
  ON quiz_leagues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- Solo super admin può aggiornare league
CREATE POLICY "Only super admin can update quiz leagues"
  ON quiz_leagues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- RLS Policies per league_rankings

-- Tutti possono leggere le classifiche storiche
CREATE POLICY "Anyone can read league rankings"
  ON league_rankings FOR SELECT
  TO authenticated
  USING (true);

-- Solo il sistema può inserire rankings (via RPC function)
CREATE POLICY "Only system can insert league rankings"
  ON league_rankings FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Verrà fatto tramite RPC con security definer

-- ============================================
-- FUNZIONE RPC: Chiudi league e crea snapshot
-- ============================================

CREATE OR REPLACE FUNCTION close_quiz_league(
  p_league_id UUID,
  p_new_league_name TEXT DEFAULT NULL,
  p_new_league_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Esegue con permessi del creatore (bypassa RLS)
AS $$
DECLARE
  v_user_id UUID;
  v_is_super_admin BOOLEAN;
  v_league_status TEXT;
  v_new_league_id UUID;
  v_rankings_count INT;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();

  -- Check se utente è super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM profiles
  WHERE id = v_user_id;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Solo i super admin possono chiudere le league';
  END IF;

  -- Verifica che la league esista e sia attiva
  SELECT status INTO v_league_status
  FROM quiz_leagues
  WHERE id = p_league_id;

  IF v_league_status IS NULL THEN
    RAISE EXCEPTION 'League non trovata';
  END IF;

  IF v_league_status = 'closed' THEN
    RAISE EXCEPTION 'League già chiusa';
  END IF;

  -- 1. Crea snapshot della classifica attuale
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

  -- 2. Chiudi la league
  UPDATE quiz_leagues
  SET
    status = 'closed',
    end_date = now()
  WHERE id = p_league_id;

  -- 3. Crea nuova league se richiesto
  IF p_new_league_name IS NOT NULL THEN
    INSERT INTO quiz_leagues (name, description, status, created_by)
    VALUES (p_new_league_name, p_new_league_description, 'active', v_user_id)
    RETURNING id INTO v_new_league_id;
  END IF;

  -- Return risultati
  RETURN jsonb_build_object(
    'success', true,
    'closed_league_id', p_league_id,
    'rankings_saved', v_rankings_count,
    'new_league_id', v_new_league_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- FUNZIONE RPC: Ottieni classifica league attiva
-- ============================================

CREATE OR REPLACE FUNCTION get_active_league_rankings()
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  total_points BIGINT,
  games_played BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_league_id UUID;
BEGIN
  -- Trova la league attiva
  SELECT id INTO v_active_league_id
  FROM quiz_leagues
  WHERE status = 'active'
  LIMIT 1;

  IF v_active_league_id IS NULL THEN
    -- Nessuna league attiva, ritorna vuoto
    RETURN;
  END IF;

  -- Calcola classifica in real-time
  RETURN QUERY
  WITH quiz_stats AS (
    SELECT
      qa.user_id,
      COUNT(DISTINCT qq.session_id) as games_played,
      SUM(qa.points) as total_points
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qq.league_id = v_active_league_id
    GROUP BY qa.user_id
  )
  SELECT
    qs.user_id,
    p.name as user_name,
    COALESCE(qs.total_points, 0)::BIGINT as total_points,
    qs.games_played::BIGINT,
    RANK() OVER (ORDER BY COALESCE(qs.total_points, 0) DESC)::BIGINT as rank
  FROM quiz_stats qs
  JOIN profiles p ON p.id = qs.user_id
  ORDER BY total_points DESC;
END;
$$;

-- ============================================
-- FUNZIONE RPC: Crea league iniziale se non esiste
-- ============================================

CREATE OR REPLACE FUNCTION ensure_default_league()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_league_id UUID;
BEGIN
  -- Controlla se esiste già una league attiva
  SELECT id INTO v_league_id
  FROM quiz_leagues
  WHERE status = 'active'
  LIMIT 1;

  -- Se non esiste, creala
  IF v_league_id IS NULL THEN
    INSERT INTO quiz_leagues (name, description, status)
    VALUES ('Stagione 1', 'Prima stagione quiz', 'active')
    RETURNING id INTO v_league_id;
  END IF;

  RETURN v_league_id;
END;
$$;

-- Crea league iniziale
SELECT ensure_default_league();

-- Enable Realtime per le nuove tabelle
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_leagues, league_rankings;

-- Commenti finali
COMMENT ON FUNCTION close_quiz_league IS 'Chiude una league, crea snapshot classifica e opzionalmente apre nuova league';
COMMENT ON FUNCTION get_active_league_rankings IS 'Ottiene classifica real-time della league attiva';
COMMENT ON FUNCTION ensure_default_league IS 'Crea league di default se non ne esiste una attiva';
