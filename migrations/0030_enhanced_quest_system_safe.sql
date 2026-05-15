-- Migration: Enhanced Quest System with Detailed Content and Auto-Tracking
-- Description: Adds comprehensive quest detail fields and enhanced tracking capabilities
-- Date: 2026-05-10
-- Safe version - handles missing columns gracefully

-- ==========================================
-- QUEST DEFINITIONS ENHANCEMENT
-- ==========================================

-- Add enhanced detailed quest content fields (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'objective') THEN
        ALTER TABLE quest_definitions ADD COLUMN objective TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'why_this_matters') THEN
        ALTER TABLE quest_definitions ADD COLUMN why_this_matters TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'step_by_step_instructions') THEN
        ALTER TABLE quest_definitions ADD COLUMN step_by_step_instructions TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'expected_outcome') THEN
        ALTER TABLE quest_definitions ADD COLUMN expected_outcome TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'success_criteria') THEN
        ALTER TABLE quest_definitions ADD COLUMN success_criteria TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'auto_tracking_conditions') THEN
        ALTER TABLE quest_definitions ADD COLUMN auto_tracking_conditions TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'estimated_impact') THEN
        ALTER TABLE quest_definitions ADD COLUMN estimated_impact TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quest_definitions' AND column_name = 'skill_area') THEN
        ALTER TABLE quest_definitions ADD COLUMN skill_area TEXT;
    END IF;
END $$;

-- ==========================================
-- USER QUESTS ENHANCEMENT
-- ==========================================

-- Add enhanced automatic tracking fields (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_quests' AND column_name = 'last_tracked_at') THEN
        ALTER TABLE user_quests ADD COLUMN last_tracked_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_quests' AND column_name = 'tracked_activities') THEN
        ALTER TABLE user_quests ADD COLUMN tracked_activities TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_quests' AND column_name = 'auto_completed') THEN
        ALTER TABLE user_quests ADD COLUMN auto_completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_quests' AND column_name = 'completion_percentage') THEN
        ALTER TABLE user_quests ADD COLUMN completion_percentage INTEGER DEFAULT 0;
    END IF;
END $$;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Index for tracking lookups
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_quests_last_tracked') THEN
        CREATE INDEX idx_user_quests_last_tracked 
        ON user_quests(user_id, last_tracked_at) 
        WHERE last_tracked_at IS NOT NULL;
    END IF;
END $$;

-- Index for auto-completed quests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_quests_auto_completed') THEN
        CREATE INDEX idx_user_quests_auto_completed 
        ON user_quests(user_id, auto_completed) 
        WHERE auto_completed = TRUE;
    END IF;
END $$;

-- Index for quest content hash
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quest_definitions_content_hash') THEN
        CREATE INDEX idx_quest_definitions_content_hash 
        ON quest_definitions(quest_content_hash) 
        WHERE quest_content_hash IS NOT NULL;
    END IF;
END $$;

-- Index for skill area filtering
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quest_definitions_skill_area') THEN
        CREATE INDEX idx_quest_definitions_skill_area 
        ON quest_definitions(skill_area) 
        WHERE skill_area IS NOT NULL;
    END IF;
END $$;

-- ==========================================
-- UPDATE EXISTING QUESTS WITH DEFAULT VALUES
-- ==========================================

-- Set completion_percentage for existing quests (only if column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_quests' AND column_name = 'completion_percentage') THEN
        UPDATE user_quests 
        SET completion_percentage = CASE 
            WHEN is_completed = TRUE THEN 100
            WHEN progress > 0 AND target_count > 0 THEN LEAST(100, (progress * 100 / target_count))
            ELSE 0
        END
        WHERE completion_percentage = 0 OR completion_percentage IS NULL;
    END IF;
END $$;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
