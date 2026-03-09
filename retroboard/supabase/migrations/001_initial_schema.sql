-- Profili utente (estende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessioni retrospettiva
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  current_step INT DEFAULT 1,
  retro_phase TEXT DEFAULT 'comments',
  max_participants INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partecipanti sessione
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT DEFAULT 'participant' CHECK (role IN ('organizer','participant')),
  is_done BOOLEAN DEFAULT false,
  can_group BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Sezioni retrospettiva
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  requires_interaction BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- Commenti
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  text TEXT NOT NULL,
  group_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Voti sui commenti (1-5)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  value INT CHECK (value BETWEEN 1 AND 5),
  UNIQUE(comment_id, user_id)
);

-- Azioni (kanban)
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  deadline DATE,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Domande quiz
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_choice INT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Risposte quiz
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  choice INT NOT NULL,
  time_taken FLOAT NOT NULL,
  points INT DEFAULT 0,
  UNIQUE(question_id, user_id)
);

-- Mood votes
CREATE TABLE mood_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  mood TEXT NOT NULL CHECK (mood IN ('glad','sad','mad','custom')),
  custom_label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE comments, votes, actions,
  session_participants, sessions, mood_votes, quiz_answers;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read all profiles, update own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Sessions: participants can read, organizer can update
CREATE POLICY "Sessions viewable by participants" ON sessions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM session_participants sp WHERE sp.session_id = id AND sp.user_id = auth.uid()
  ) OR organizer_id = auth.uid());
CREATE POLICY "Organizer can create sessions" ON sessions
  FOR INSERT TO authenticated WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Organizer can update sessions" ON sessions
  FOR UPDATE TO authenticated USING (organizer_id = auth.uid());

-- Session participants
CREATE POLICY "Participants viewable by session members" ON session_participants
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM session_participants sp2 WHERE sp2.session_id = session_id AND sp2.user_id = auth.uid()
  ));
CREATE POLICY "Authenticated users can join sessions" ON session_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own participation" ON session_participants
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Sections
CREATE POLICY "Sections viewable by session participants" ON sections
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM session_participants sp WHERE sp.session_id = sections.session_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "Organizer can manage sections" ON sections
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sessions s WHERE s.id = sections.session_id AND s.organizer_id = auth.uid()
  ));

-- Comments
CREATE POLICY "Comments viewable by session participants" ON comments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sections sec
    JOIN session_participants sp ON sp.session_id = sec.session_id
    WHERE sec.id = comments.section_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "Participants can add comments" ON comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Comment owners or organizers can update" ON comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM sections sec
    JOIN sessions s ON s.id = sec.session_id
    WHERE sec.id = comments.section_id AND s.organizer_id = auth.uid()
  ));

-- Votes
CREATE POLICY "Votes viewable by session participants" ON votes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM comments c
    JOIN sections sec ON sec.id = c.section_id
    JOIN session_participants sp ON sp.session_id = sec.session_id
    WHERE c.id = votes.comment_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "Users can manage own votes" ON votes
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Actions
CREATE POLICY "Actions viewable by session participants" ON actions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM session_participants sp WHERE sp.session_id = actions.session_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "Participants can manage actions" ON actions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM session_participants sp WHERE sp.session_id = actions.session_id AND sp.user_id = auth.uid()
  ));

-- Quiz questions
CREATE POLICY "Quiz questions viewable by participants" ON quiz_questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM session_participants sp WHERE sp.session_id = quiz_questions.session_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "Organizer can manage quiz questions" ON quiz_questions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sessions s WHERE s.id = quiz_questions.session_id AND s.organizer_id = auth.uid()
  ));

-- Quiz answers
CREATE POLICY "Quiz answers viewable by participants" ON quiz_answers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quiz_questions qq
    JOIN session_participants sp ON sp.session_id = qq.session_id
    WHERE qq.id = quiz_answers.question_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "Users can submit own answers" ON quiz_answers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Mood votes
CREATE POLICY "Mood votes viewable by participants" ON mood_votes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM session_participants sp WHERE sp.session_id = mood_votes.session_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "Users can manage own mood votes" ON mood_votes
  FOR ALL TO authenticated USING (user_id = auth.uid());
