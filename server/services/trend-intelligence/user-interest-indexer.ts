/**
 * User Interest Indexer
 * 
 * Maintains reverse indexes for efficient trend-to-user matching at scale:
 * - Indexes users by industry, domain, and followed hashtags
 * - Provides O(1) lookup for finding relevant users
 * - Rebuilds indexes periodically to stay fresh
 * - In-memory implementation (can be moved to Redis for multi-server setup)
 */

import { db } from '../../db';
import { users, brandGoals, userHashtagFollows, hashtags } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface UserInterestProfile {
  userId: number;
  industries: string[];
  domains: string[];
  followedHashtags: string[];
  brandGoals: string[];
  primaryAudience: string[];
  secondaryAudience: string[];
}

export class UserInterestIndexer {
  
  private industryIndex: Map<string, Set<number>> = new Map();
  private domainIndex: Map<string, Set<number>> = new Map();
  private hashtagIndex: Map<string, Set<number>> = new Map();
  private lastRebuildTime: Date | null = null;
  private isRebuilding: boolean = false;

  /**
   * Build complete user interest index
   */
  async buildIndex(): Promise<void> {
    if (this.isRebuilding) {
      console.log('[UserInterestIndexer] Index rebuild already in progress, skipping...');
      return;
    }

    this.isRebuilding = true;
    console.log('[UserInterestIndexer] 🔨 Building user interest index...');
    
    const startTime = Date.now();

    try {
      // Clear existing indexes
      this.industryIndex.clear();
      this.domainIndex.clear();
      this.hashtagIndex.clear();

      // Get all users with their interest data
      const allUsers = await db.select().from(users);
      console.log(`[UserInterestIndexer] Processing ${allUsers.length} users...`);

      let indexedUsers = 0;

      for (const user of allUsers) {
        // Index by industry
        if (user.industry) {
          this.addToIndex(this.industryIndex, user.industry, user.id);
        }

        // Index by domain
        if (user.domain) {
          this.addToIndex(this.domainIndex, user.domain, user.id);
        }

        // Get and index followed hashtags
        const followedHashtags = await db
          .select({ tag: hashtags.tag })
          .from(userHashtagFollows)
          .innerJoin(hashtags, eq(userHashtagFollows.hashtagId, hashtags.id))
          .where(eq(userHashtagFollows.userId, user.id));

        for (const { tag } of followedHashtags) {
          this.addToIndex(this.hashtagIndex, tag, user.id);
        }

        indexedUsers++;
      }

      this.lastRebuildTime = new Date();
      const duration = Date.now() - startTime;

      console.log(`[UserInterestIndexer] ✅ Index built successfully in ${duration}ms`);
      console.log(`[UserInterestIndexer] Indexed ${indexedUsers} users:`);
      console.log(`  - ${this.industryIndex.size} unique industries`);
      console.log(`  - ${this.domainIndex.size} unique domains`);
      console.log(`  - ${this.hashtagIndex.size} unique hashtags`);
    } catch (error) {
      console.error('[UserInterestIndexer] ❌ Error building index:', error);
      throw error;
    } finally {
      this.isRebuilding = false;
    }
  }

  /**
   * Find users interested in a specific industry
   */
  getUsersByIndustry(industry: string): number[] {
    const userSet = this.industryIndex.get(industry);
    return userSet ? Array.from(userSet) : [];
  }

  /**
   * Find users interested in a specific domain
   */
  getUsersByDomain(domain: string): number[] {
    const userSet = this.domainIndex.get(domain);
    return userSet ? Array.from(userSet) : [];
  }

  /**
   * Find users following a specific hashtag
   */
  getUsersByHashtag(hashtag: string): number[] {
    // Normalize hashtag (remove # if present)
    const normalizedTag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
    const userSet = this.hashtagIndex.get(normalizedTag) || this.hashtagIndex.get(`#${normalizedTag}`);
    return userSet ? Array.from(userSet) : [];
  }

  /**
   * Find users interested in multiple industries/domains/hashtags (union)
   */
  getUsersByInterests(
    industries: string[] = [],
    domains: string[] = [],
    hashtagsToMatch: string[] = []
  ): number[] {
    const userSet = new Set<number>();

    // Add users from industry matches
    for (const industry of industries) {
      const users = this.getUsersByIndustry(industry);
      users.forEach(userId => userSet.add(userId));
    }

    // Add users from domain matches
    for (const domain of domains) {
      const users = this.getUsersByDomain(domain);
      users.forEach(userId => userSet.add(userId));
    }

    // Add users from hashtag matches
    for (const hashtag of hashtagsToMatch) {
      const users = this.getUsersByHashtag(hashtag);
      users.forEach(userId => userSet.add(userId));
    }

    return Array.from(userSet);
  }

  /**
   * Get detailed interest profile for a user
   */
  async getUserInterestProfile(userId: number): Promise<UserInterestProfile | null> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (user.length === 0) return null;

    const userData = user[0];

    // Get brand goals
    const goals = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));
    const brandGoalsList = goals.length > 0 && goals[0].selectedGoals 
      ? goals[0].selectedGoals 
      : [];

    // Get followed hashtags
    const followedHashtags = await db
      .select({ tag: hashtags.tag })
      .from(userHashtagFollows)
      .innerJoin(hashtags, eq(userHashtagFollows.hashtagId, hashtags.id))
      .where(eq(userHashtagFollows.userId, userId));

    return {
      userId,
      industries: userData.industry ? [userData.industry] : [],
      domains: userData.domain ? [userData.domain] : [],
      followedHashtags: followedHashtags.map(h => h.tag),
      brandGoals: brandGoalsList,
      primaryAudience: userData.primaryAudience || [],
      secondaryAudience: userData.secondaryAudience || []
    };
  }

  /**
   * Helper to add user to index
   */
  private addToIndex(index: Map<string, Set<number>>, key: string, userId: number): void {
    if (!index.has(key)) {
      index.set(key, new Set());
    }
    index.get(key)!.add(userId);
  }

  /**
   * Check if index needs rebuild (older than 24 hours)
   */
  needsRebuild(): boolean {
    if (!this.lastRebuildTime) return true;
    
    const hoursSinceRebuild = (Date.now() - this.lastRebuildTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceRebuild >= 24;
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      industryCount: this.industryIndex.size,
      domainCount: this.domainIndex.size,
      hashtagCount: this.hashtagIndex.size,
      lastRebuild: this.lastRebuildTime,
      isRebuilding: this.isRebuilding
    };
  }
}

// Export singleton instance
export const userInterestIndexer = new UserInterestIndexer();
