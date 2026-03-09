-- Quiz: host controls navigation for all participants.
-- Store current question index in the session so it's shared via realtime.
ALTER TABLE sessions ADD COLUMN quiz_current_index INT DEFAULT 0;
