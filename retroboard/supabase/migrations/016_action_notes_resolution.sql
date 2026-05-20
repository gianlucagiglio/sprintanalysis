-- Add notes and resolution fields to actions table
ALTER TABLE actions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE actions ADD COLUMN IF NOT EXISTS resolution TEXT;
