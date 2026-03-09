-- Add sentiment column to comments
ALTER TABLE comments
  ADD COLUMN sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral'));

-- Backfill existing comments based on section sort_order
UPDATE comments c
SET sentiment = CASE s.sort_order
  WHEN 0 THEN 'positive'
  WHEN 1 THEN 'negative'
  ELSE 'neutral'
END
FROM sections s
WHERE c.section_id = s.id
  AND c.sentiment IS NULL;
