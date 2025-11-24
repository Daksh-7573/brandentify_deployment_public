/**
 * User Musk Memory Service - 360° Behavioral Tracking
 * Tracks user preferences, behavior patterns, and brand goals for personalization
 */

import { pool } from '../db';

export interface UserMemoryProfile {
  userId: number;
  behaviorPatterns: {
    questCompletion: number;
    platformPreferences: Record<string, number>;
    contentPreferences: string[];
    skippedTopics: string[];
  };
  preferredPlatforms: string[];
  contentFormat?: string;
  tone: string;
  recentActions: Array<{
    action: string;
    timestamp: Date;
    platform?: string;
  }>;
}

class UserMuskMemoryService {
  /**
   * Get or create user memory profile
   */
  async getOrCreateMemory(userId: number): Promise<UserMemoryProfile> {
    try {
      const result = await pool.query(
        `SELECT * FROM user_musk_memory WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          userId,
          behaviorPatterns: row.behavior_patterns,
          preferredPlatforms: row.preferred_platforms || [],
          contentFormat: row.content_format,
          tone: row.tone || 'neutral',
          recentActions: row.recent_actions || [],
        };
      }

      // Create new memory
      await pool.query(
        `INSERT INTO user_musk_memory (user_id, behavior_patterns, tone)
         VALUES ($1, $2, $3)`,
        [userId, JSON.stringify({
          questCompletion: 0,
          platformPreferences: {},
          contentPreferences: [],
          skippedTopics: [],
        }), 'neutral']
      );

      return {
        userId,
        behaviorPatterns: {
          questCompletion: 0,
          platformPreferences: {},
          contentPreferences: [],
          skippedTopics: [],
        },
        preferredPlatforms: [],
        contentFormat: 'balanced',
        tone: 'neutral',
        recentActions: [],
      };
    } catch (error) {
      console.error('Error getting user memory:', error);
      throw error;
    }
  }

  /**
   * Update tone based on user interaction
   */
  async updateTone(userId: number, newTone: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE user_musk_memory SET tone = $1, updated_at = NOW() WHERE user_id = $2`,
        [newTone, userId]
      );
    } catch (error) {
      console.error('Error updating tone:', error);
    }
  }

  /**
   * Record a completed action
   */
  async recordAction(userId: number, action: string, platform?: string): Promise<void> {
    try {
      const memory = await this.getOrCreateMemory(userId);

      const newAction = {
        action,
        timestamp: new Date(),
        platform,
      };

      // Keep last 20 actions
      const updated = [newAction, ...memory.recentActions].slice(0, 20);

      await pool.query(
        `UPDATE user_musk_memory SET recent_actions = $1, updated_at = NOW() WHERE user_id = $2`,
        [JSON.stringify(updated), userId]
      );
    } catch (error) {
      console.error('Error recording action:', error);
    }
  }

  /**
   * Track platform preference (e.g., user completes LinkedIn task more often)
   */
  async recordPlatformInteraction(userId: number, platform: string): Promise<void> {
    try {
      const memory = await this.getOrCreateMemory(userId);
      const prefs = memory.behaviorPatterns.platformPreferences;

      prefs[platform] = (prefs[platform] || 0) + 1;

      const updated = {
        ...memory.behaviorPatterns,
        platformPreferences: prefs,
      };

      await pool.query(
        `UPDATE user_musk_memory SET behavior_patterns = $1, updated_at = NOW() WHERE user_id = $2`,
        [JSON.stringify(updated), userId]
      );
    } catch (error) {
      console.error('Error recording platform interaction:', error);
    }
  }

  /**
   * Get recommended platforms based on history
   */
  async getRecommendedPlatforms(userId: number): Promise<string[]> {
    try {
      const memory = await this.getOrCreateMemory(userId);
      const prefs = memory.behaviorPatterns.platformPreferences;

      if (Object.keys(prefs).length === 0) {
        return ['LinkedIn', 'Twitter', 'Instagram'];
      }

      // Sort platforms by interaction count
      return Object.entries(prefs)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([platform]) => platform);
    } catch (error) {
      console.error('Error getting recommended platforms:', error);
      return ['LinkedIn'];
    }
  }

  /**
   * Track skipped topics (so Musk doesn't suggest them again)
   */
  async skipTopic(userId: number, topic: string): Promise<void> {
    try {
      const memory = await this.getOrCreateMemory(userId);

      if (!memory.behaviorPatterns.skippedTopics.includes(topic)) {
        memory.behaviorPatterns.skippedTopics.push(topic);

        await pool.query(
          `UPDATE user_musk_memory SET behavior_patterns = $1, updated_at = NOW() WHERE user_id = $2`,
          [JSON.stringify(memory.behaviorPatterns), userId]
        );
      }
    } catch (error) {
      console.error('Error skipping topic:', error);
    }
  }
}

export const userMuskMemoryService = new UserMuskMemoryService();
