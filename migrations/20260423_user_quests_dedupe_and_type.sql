-- Add quest_type and quest_title safely for user_quests
ALTER TABLE user_quests
ADD COLUMN IF NOT EXISTS quest_type TEXT NOT NULL DEFAULT 'career';

ALTER TABLE user_quests
ADD COLUMN IF NOT EXISTS quest_title TEXT NOT NULL DEFAULT 'Untitled Quest';

-- Backfill null/empty values defensively
UPDATE user_quests
SET quest_type = 'career'
WHERE quest_type IS NULL OR TRIM(quest_type) = '';

UPDATE user_quests uq
SET quest_title = COALESCE(qd.title, 'Untitled Quest')
FROM quest_definitions qd
WHERE uq.quest_definition_id = qd.id
  AND (uq.quest_title IS NULL OR TRIM(uq.quest_title) = '' OR uq.quest_title = 'Untitled Quest');

-- Create uniqueness guard to prevent duplicate generation after restart/retry
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_quests_user_date_type_title_unique'
  ) THEN
    ALTER TABLE user_quests
    ADD CONSTRAINT user_quests_user_date_type_title_unique
    UNIQUE (user_id, assigned_date, quest_type, quest_title);
  END IF;
END $$;