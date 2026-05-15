-- Migration: Enhanced Quest System with Detailed Content and Auto-Tracking
-- Description: Adds comprehensive quest detail fields and enhanced tracking capabilities
-- Date: 2026-05-10

-- ==========================================
-- QUEST DEFINITIONS ENHANCEMENT
-- ==========================================

-- Add enhanced detailed quest content fields
ALTER TABLE quest_definitions 
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS why_this_matters TEXT,
ADD COLUMN IF NOT EXISTS step_by_step_instructions TEXT[],
ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
ADD COLUMN IF NOT EXISTS success_criteria TEXT[],
ADD COLUMN IF NOT EXISTS auto_tracking_conditions TEXT[],
ADD COLUMN IF NOT EXISTS estimated_impact TEXT,
ADD COLUMN IF NOT EXISTS skill_area TEXT;

-- Add comments for documentation
COMMENT ON COLUMN quest_definitions.objective IS 'Clear, specific objective statement for the quest';
COMMENT ON COLUMN quest_definitions.why_this_matters IS 'Explanation of career/networking benefits';
COMMENT ON COLUMN quest_definitions.step_by_step_instructions IS 'Detailed execution steps as an array';
COMMENT ON COLUMN quest_definitions.expected_outcome IS 'What user will achieve upon completion';
COMMENT ON COLUMN quest_definitions.success_criteria IS 'Specific criteria that define completion';
COMMENT ON COLUMN quest_definitions.auto_tracking_conditions IS 'Conditions for automatic progress tracking';
COMMENT ON COLUMN quest_definitions.estimated_impact IS 'Expected career/visibility impact description';
COMMENT ON COLUMN quest_definitions.skill_area IS 'Professional skill area this quest develops';

-- ==========================================
-- USER QUESTS ENHANCEMENT
-- ==========================================

-- Add enhanced automatic tracking fields
ALTER TABLE user_quests 
ADD COLUMN IF NOT EXISTS last_tracked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS tracked_activities TEXT[],
ADD COLUMN IF NOT EXISTS auto_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN user_quests.last_tracked_at IS 'When progress was last updated';
COMMENT ON COLUMN user_quests.tracked_activities IS 'List of activities that contributed to progress';
COMMENT ON COLUMN user_quests.auto_completed IS 'Whether quest was completed automatically';
COMMENT ON COLUMN user_quests.completion_percentage IS 'Calculated completion percentage';

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Index for tracking lookups
CREATE INDEX IF NOT EXISTS idx_user_quests_last_tracked 
ON user_quests(user_id, last_tracked_at) 
WHERE last_tracked_at IS NOT NULL;

-- Index for auto-completed quests
CREATE INDEX IF NOT EXISTS idx_user_quests_auto_completed 
ON user_quests(user_id, auto_completed) 
WHERE auto_completed = TRUE;

-- Index for quest content hash (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_quest_definitions_content_hash 
ON quest_definitions(quest_content_hash) 
WHERE quest_content_hash IS NOT NULL;

-- Index for skill area filtering
CREATE INDEX IF NOT EXISTS idx_quest_definitions_skill_area 
ON quest_definitions(skill_area) 
WHERE skill_area IS NOT NULL;

-- ==========================================
-- UPDATE EXISTING QUESTS WITH DEFAULT VALUES
-- ==========================================

-- Set completion_percentage for existing quests
UPDATE user_quests 
SET completion_percentage = CASE 
    WHEN is_completed = TRUE THEN 100
    WHEN progress > 0 AND target_count > 0 THEN LEAST(100, (progress * 100 / target_count))
    ELSE 0
END
WHERE completion_percentage = 0;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
