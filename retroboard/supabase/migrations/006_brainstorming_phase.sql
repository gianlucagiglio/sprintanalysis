-- Brainstorming phase: mark comments as resolved/addressed
ALTER TABLE comments ADD COLUMN is_resolved BOOLEAN DEFAULT false;
