-- Phase timer: optional countdown per retro phase
ALTER TABLE sessions
  ADD COLUMN phase_timer_duration INT DEFAULT 0,
  ADD COLUMN phase_timer_started_at TIMESTAMPTZ DEFAULT NULL;
