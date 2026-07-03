-- Nuova tabella per i voti mood team
CREATE TABLE IF NOT EXISTS team_mood_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('ottima', 'buona', 'sufficiente', 'scarsa')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- RLS policies (stesso pattern di mood_votes)
ALTER TABLE team_mood_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view team mood votes" ON team_mood_votes
  FOR SELECT USING (session_id IN (SELECT session_id FROM session_participants WHERE user_id = auth.uid()));
CREATE POLICY "Participants can insert team mood votes" ON team_mood_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team mood votes" ON team_mood_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Colonna mood_phase sulla sessione
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS mood_phase TEXT DEFAULT 'personal';

-- Indice
CREATE INDEX IF NOT EXISTS idx_team_mood_votes_session ON team_mood_votes(session_id);
