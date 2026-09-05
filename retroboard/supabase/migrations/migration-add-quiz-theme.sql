-- Add quiz_theme_id column to sessions table
-- This allows tracking which quiz theme was used in each session

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS quiz_theme_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_quiz_theme_id ON sessions(quiz_theme_id);

-- Comment for documentation
COMMENT ON COLUMN sessions.quiz_theme_id IS 'ID of the quiz theme used in this session (from quizThemes.ts)';
