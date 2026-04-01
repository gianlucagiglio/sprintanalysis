-- Multi-owner actions: support multiple assignees per action
ALTER TABLE actions ADD COLUMN assigned_to_multi UUID[] NOT NULL DEFAULT '{}';

-- Migrate existing single-assignee data
UPDATE actions SET assigned_to_multi = ARRAY[assigned_to] WHERE assigned_to IS NOT NULL;
