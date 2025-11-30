/**
 * Cohort Intelligence Service - Phase 2.3
 * Database-backed service for storing and retrieving user cohort data
 */

import { pool } from '../db';

export interface UserCohort {
  id: string;
  criteria: {
    industry: string;
    roleLevel: 'entry' | 'mid' | 'senior' | 'executive';
    careerStage: 'early' | 'growth' | 'transition' | 'leadership';
    geography?: string;
  };
  patterns: {
    commonChallenges: string[];
    successfulStrategies: string[];
    preferredCommunicationStyle: string;
    typicalCareerPath: string[];
    skillDevelopmentPriorities: string[];
  };
  insights: {
    averageResponseLength: 'brief' | 'detailed' | 'comprehensive';
    preferredTimeframes: 'immediate' | 'short_term' | 'long_term';
    engagementPatterns: string[];
    successMetrics: string[];
  };
  sampleSize: number;
  lastUpdated: Date;
  confidence: number;
}

class CohortIntelligenceService {
  /**
   * Get or create cohort from database
   */
  async getOrCreateCohort(cohortId: string, userProfile: any): Promise<UserCohort> {
    try {
      const result = await pool.query(
        `SELECT * FROM user_cohorts WHERE cohort_id = $1`,
        [cohortId]
      );

      if (result.rows.length > 0) {
        return this.rowToCohort(result.rows[0]);
      }

      // Create new cohort
      const newCohort = this.createNewCohort(cohortId, userProfile);
      await pool.query(
        `INSERT INTO user_cohorts (cohort_id, criteria, patterns, insights, sample_size, confidence)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cohortId, JSON.stringify(newCohort.criteria), JSON.stringify(newCohort.patterns), JSON.stringify(newCohort.insights), 0, 10]
      );

      return newCohort;
    } catch (error) {
      console.error('Error getting cohort:', error);
      return this.createNewCohort(cohortId, userProfile);
    }
  }

  /**
   * Update cohort patterns in database
   */
  async updateCohort(cohortId: string, updates: Partial<UserCohort>): Promise<void> {
    try {
      const setFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.criteria) {
        setFields.push(`criteria = $${paramIndex}`);
        values.push(JSON.stringify(updates.criteria));
        paramIndex++;
      }
      if (updates.patterns) {
        setFields.push(`patterns = $${paramIndex}`);
        values.push(JSON.stringify(updates.patterns));
        paramIndex++;
      }
      if (updates.insights) {
        setFields.push(`insights = $${paramIndex}`);
        values.push(JSON.stringify(updates.insights));
        paramIndex++;
      }
      if (updates.sampleSize !== undefined) {
        setFields.push(`sample_size = $${paramIndex}`);
        values.push(updates.sampleSize);
        paramIndex++;
      }
      if (updates.confidence !== undefined) {
        setFields.push(`confidence = $${paramIndex}`);
        values.push(Math.round(updates.confidence * 100));
        paramIndex++;
      }

      if (setFields.length === 0) return;

      setFields.push(`last_updated = NOW()`);
      values.push(cohortId);

      await pool.query(
        `UPDATE user_cohorts SET ${setFields.join(', ')} WHERE cohort_id = $${paramIndex}`,
        values
      );

      console.log(`[Cohort Intelligence] Updated cohort ${cohortId}`);
    } catch (error) {
      console.error('Error updating cohort:', error);
    }
  }

  /**
   * Add user to cohort
   */
  async addUserToCohort(userId: number, cohortId: string): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO cohort_membership (user_id, cohort_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [userId, cohortId]
      );
    } catch (error) {
      console.error('Error adding user to cohort:', error);
    }
  }

  /**
   * Get all cohorts for user
   */
  async getUserCohorts(userId: number): Promise<UserCohort[]> {
    try {
      const result = await pool.query(
        `SELECT c.* FROM user_cohorts c
         JOIN cohort_membership m ON c.cohort_id = m.cohort_id
         WHERE m.user_id = $1 AND c.sample_size >= 3`,
        [userId]
      );

      return result.rows.map(row => this.rowToCohort(row)).sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error getting user cohorts:', error);
      return [];
    }
  }

  /**
   * Convert database row to UserCohort
   */
  private rowToCohort(row: any): UserCohort {
    return {
      id: row.cohort_id,
      criteria: row.criteria,
      patterns: row.patterns,
      insights: row.insights,
      sampleSize: row.sample_size,
      lastUpdated: row.last_updated,
      confidence: (row.confidence || 10) / 100,
    };
  }

  /**
   * Create new cohort
   */
  private createNewCohort(cohortId: string, userProfile: any): UserCohort {
    const [part1, part2] = cohortId.split('_');
    
    return {
      id: cohortId,
      criteria: {
        industry: userProfile?.industry || 'general',
        roleLevel: this.determineRoleLevel(userProfile?.title),
        careerStage: this.determineCareerStage(userProfile),
        geography: this.extractRegion(userProfile?.location),
      },
      patterns: {
        commonChallenges: [],
        successfulStrategies: [],
        preferredCommunicationStyle: 'formal',
        typicalCareerPath: [],
        skillDevelopmentPriorities: [],
      },
      insights: {
        averageResponseLength: 'detailed',
        preferredTimeframes: 'short_term',
        engagementPatterns: [],
        successMetrics: [],
      },
      sampleSize: 0,
      lastUpdated: new Date(),
      confidence: 0.1,
    };
  }

  private determineRoleLevel(title?: string): 'entry' | 'mid' | 'senior' | 'executive' {
    if (!title) return 'mid';
    if (/director|vp|chief|ceo|cto|cfo/i.test(title)) return 'executive';
    if (/senior|lead|principal/i.test(title)) return 'senior';
    if (/junior|associate|coordinator/i.test(title)) return 'entry';
    return 'mid';
  }

  private determineCareerStage(userProfile?: any): 'early' | 'growth' | 'transition' | 'leadership' {
    const roleLevel = this.determineRoleLevel(userProfile?.title);
    if (roleLevel === 'entry') return 'early';
    if (roleLevel === 'executive') return 'leadership';
    if (userProfile?.lookingFor === 'career_change') return 'transition';
    return 'growth';
  }

  private extractRegion(location?: string): string | undefined {
    if (!location) return undefined;
    if (/india|mumbai|delhi|bangalore|gujarat/i.test(location)) return 'india';
    if (/usa|america|san francisco|new york|california/i.test(location)) return 'usa';
    if (/uk|london|britain/i.test(location)) return 'uk';
    return undefined;
  }
}

export const cohortIntelligenceService = new CohortIntelligenceService();
