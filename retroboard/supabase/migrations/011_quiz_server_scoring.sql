-- Server-side quiz scoring: compute points via trigger instead of trusting client
CREATE OR REPLACE FUNCTION compute_quiz_points()
RETURNS trigger AS $$
DECLARE
  _correct_choice integer;
  _is_correct boolean;
  _time_bonus integer;
BEGIN
  -- Get the correct answer for this question
  SELECT correct_choice INTO _correct_choice
    FROM quiz_questions
   WHERE id = NEW.question_id;

  _is_correct := (NEW.choice = _correct_choice);
  _time_bonus := GREATEST(0, ROUND((10 - NEW.time_taken) * 100));

  -- 1000 base + time bonus (max 1000) for correct, 0 for wrong
  NEW.points := CASE
    WHEN _is_correct THEN 1000 + _time_bonus
    ELSE 0
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_quiz_points_trigger
  BEFORE INSERT ON quiz_answers
  FOR EACH ROW
  EXECUTE FUNCTION compute_quiz_points();
