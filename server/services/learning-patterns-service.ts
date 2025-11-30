/**
 * Learning Patterns Service - Phase 2.2
 * Database-backed service for storing and retrieving user learning patterns
 */

import { pool } from '../db';

export interface UserPattern {
  userId: string;
  preferences: {
    responseLength: 'brief' | 'detailed' | 'comprehensive';
    communicationStyle: 'formal' | 'casual' | 'technical';
    focusAreas: string[];
    preferredTimeframes: 'immediate' | 'short_term' | 'long_term';
  };
  behaviorPatterns: {
    questionTypes: Record<string, number>;
    topicFrequency: Record<string, number>;
    engagementLevel: number;
    responsePreferences: string[];
  };
  learningInsights: {
    careerStage: 'entry' | 'mid' | 'senior' | 'executive' | 'transition';
    primaryGoals: string[];
    communicationPatterns: string[];
    preferredGuidanceStyle: 'directive' | 'collaborative' | 'exploratory';
  };
  lastUpdated: Date;
  confidence: number;
}

class LearningPatternsService {
  /**
   * Get or create user pattern from database
   */
  async getOrCreatePattern(userId: number): Promise<UserPattern> {
    try {
      const result = await pool.query(
        `SELECT * FROM user_learning_patterns WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length > 0) {
        return this.rowToPattern(userId.toString(), result.rows[0]);
      }

      // Create default pattern
      await pool.query(
        `INSERT INTO user_learning_patterns (user_id, preferences, behavior_patterns, learning_insights, confidence)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, JSON.stringify(this.defaultPreferences()), JSON.stringify(this.defaultBehavior()), JSON.stringify(this.defaultInsights()), 10]
      );

      return this.createDefaultPattern(userId.toString());
    } catch (error) {
      console.error('Error getting learning pattern:', error);
      return this.createDefaultPattern(userId.toString());
    }
  }

  /**
   * Update user pattern in database
   */
  async updatePattern(userId: number, pattern: Partial<UserPattern>): Promise<void> {
    try {
      const updates: Record<string, any> = {};
      
      if (pattern.preferences) updates.preferences = JSON.stringify(pattern.preferences);
      if (pattern.behaviorPatterns) updates.behavior_patterns = JSON.stringify(pattern.behaviorPatterns);
      if (pattern.learningInsights) updates.learning_insights = JSON.stringify(pattern.learningInsights);
      if (pattern.confidence !== undefined) updates.confidence = Math.round(pattern.confidence * 100);
      updates.last_updated = 'NOW()';

      const fields = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = Object.values(updates).map(v => v === 'NOW()' ? new Date() : v);

      await pool.query(
        `UPDATE user_learning_patterns SET ${fields}, updated_at = NOW() WHERE user_id = $${values.length + 1}`,
        [...values, userId]
      );

      console.log(`[Learning Patterns] Updated pattern for user ${userId}`);
    } catch (error) {
      console.error('Error updating learning pattern:', error);
    }
  }

  /**
   * Convert database row to UserPattern
   */
  private rowToPattern(userId: string, row: any): UserPattern {
    return {
      userId,
      preferences: row.preferences || this.defaultPreferences(),
      behaviorPatterns: row.behavior_patterns || this.defaultBehavior(),
      learningInsights: row.learning_insights || this.defaultInsights(),
      lastUpdated: row.last_updated || new Date(),
      confidence: (row.confidence || 10) / 100,
    };
  }

  /**
   * Create default pattern
   */
  private createDefaultPattern(userId: string): UserPattern {
    return {
      userId,
      preferences: this.defaultPreferences(),
      behaviorPatterns: this.defaultBehavior(),
      learningInsights: this.defaultInsights(),
      lastUpdated: new Date(),
      confidence: 0.1,
    };
  }

  private defaultPreferences() {
    return {
      responseLength: 'detailed' as const,
      communicationStyle: 'formal' as const,
      focusAreas: [],
      preferredTimeframes: 'short_term' as const,
    };
  }

  private defaultBehavior() {
    return {
      questionTypes: {},
      topicFrequency: {},
      engagementLevel: 0.5,
      responsePreferences: [],
    };
  }

  private defaultInsights() {
    return {
      careerStage: 'mid' as const,
      primaryGoals: [],
      communicationPatterns: [],
      preferredGuidanceStyle: 'collaborative' as const,
    };
  }
}

export const learningPatternsService = new LearningPatternsService();
