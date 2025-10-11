/**
 * Instant Quest Matcher
 * 
 * Efficiently matches trending topics to relevant users at scale:
 * - Uses reverse indexes for O(1) user lookups
 * - Batch inserts instant quests (1000 records at a time)
 * - Calculates relevance scores for each user-trend pair
 * - Generates both career and social quest options
 */

import { db } from '../../db';
import { instantQuests, questDefinitions, InsertInstantQuest } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { TrendAggregate } from './trend-aggregation-engine';
import { userInterestIndexer } from './user-interest-indexer';

export interface InstantQuestMatchResult {
  trendTopic: string;
  matchedUsers: number;
  questsCreated: number;
  tier: string;
}

export class InstantQuestMatcher {
  
  /**
   * Match all trends to relevant users and create instant quests
   */
  async matchTrendsToUsers(trends: TrendAggregate[]): Promise<InstantQuestMatchResult[]> {
    console.log(`[InstantQuestMatcher] 🎯 Matching ${trends.length} trends to users...`);
    
    const results: InstantQuestMatchResult[] = [];

    for (const trend of trends) {
      const result = await this.matchSingleTrend(trend);
      results.push(result);
    }

    const totalQuests = results.reduce((sum, r) => sum + r.questsCreated, 0);
    console.log(`[InstantQuestMatcher] ✅ Created ${totalQuests} instant quests across ${trends.length} trends`);

    return results;
  }

  /**
   * Match a single trend to relevant users
   */
  private async matchSingleTrend(trend: TrendAggregate): Promise<InstantQuestMatchResult> {
    console.log(`[InstantQuestMatcher] Processing trend: "${trend.topic}" (${trend.tier})`);

    // Find relevant users using the index
    const relevantUsers = await this.findRelevantUsers(trend);
    console.log(`[InstantQuestMatcher] Found ${relevantUsers.length} relevant users`);

    if (relevantUsers.length === 0) {
      return {
        trendTopic: trend.topic,
        matchedUsers: 0,
        questsCreated: 0,
        tier: trend.tier
      };
    }

    // Get quest definitions for instant quests
    const { careerQuestId, socialQuestId } = await this.getQuestDefinitions();

    // Calculate relevance scores for each user
    const userRelevanceScores = await this.calculateRelevanceScores(trend, relevantUsers);

    // Create instant quest records
    const questRecords: InsertInstantQuest[] = relevantUsers.map(userId => ({
      userId,
      trendTopic: trend.topic,
      trendKeywords: trend.keywords,
      careerQuestDefinitionId: careerQuestId,
      socialQuestDefinitionId: socialQuestId,
      suggestedHashtags: trend.relevantHashtags,
      status: 'pending' as const,
      spikeScore: trend.spikeScore,
      relevanceScore: userRelevanceScores.get(userId) || 50,
      feedSources: trend.feedSources.slice(0, 5), // Limit to 5 sources
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours from now
    }));

    // Batch insert (1000 records at a time)
    let totalInserted = 0;
    for (let i = 0; i < questRecords.length; i += 1000) {
      const batch = questRecords.slice(i, i + 1000);
      await db.insert(instantQuests).values(batch);
      totalInserted += batch.length;
    }

    console.log(`[InstantQuestMatcher] ✅ Created ${totalInserted} instant quests for "${trend.topic}"`);

    return {
      trendTopic: trend.topic,
      matchedUsers: relevantUsers.length,
      questsCreated: totalInserted,
      tier: trend.tier
    };
  }

  /**
   * Find users relevant to a trend using the index
   */
  private async findRelevantUsers(trend: TrendAggregate): Promise<number[]> {
    const userSet = new Set<number>();

    // Match by industry
    for (const industry of trend.relevantIndustries) {
      const users = userInterestIndexer.getUsersByIndustry(industry);
      users.forEach(userId => userSet.add(userId));
    }

    // Match by domain
    for (const domain of trend.relevantDomains) {
      const users = userInterestIndexer.getUsersByDomain(domain);
      users.forEach(userId => userSet.add(userId));
    }

    // Match by hashtags
    for (const hashtag of trend.relevantHashtags) {
      const users = userInterestIndexer.getUsersByHashtag(hashtag);
      users.forEach(userId => userSet.add(userId));
    }

    // Match by keywords in followed hashtags
    for (const keyword of trend.keywords) {
      const users = userInterestIndexer.getUsersByHashtag(keyword);
      users.forEach(userId => userSet.add(userId));
    }

    return Array.from(userSet);
  }

  /**
   * Calculate relevance score for each user
   */
  private async calculateRelevanceScores(
    trend: TrendAggregate, 
    userIds: number[]
  ): Promise<Map<number, number>> {
    const scores = new Map<number, number>();

    for (const userId of userIds) {
      const profile = await userInterestIndexer.getUserInterestProfile(userId);
      
      if (!profile) {
        scores.set(userId, 50); // Default score
        continue;
      }

      let score = 0;

      // Industry match (+30 points)
      if (profile.industries.some(i => trend.relevantIndustries.includes(i))) {
        score += 30;
      }

      // Domain match (+25 points)
      if (profile.domains.some(d => trend.relevantDomains.includes(d))) {
        score += 25;
      }

      // Hashtag match (+20 points per match, max 40)
      const hashtagMatches = profile.followedHashtags.filter(h => 
        trend.relevantHashtags.includes(h) || trend.keywords.includes(h.replace('#', '').toLowerCase())
      ).length;
      score += Math.min(hashtagMatches * 20, 40);

      // Tier bonus
      if (trend.tier === 'niche') score += 5; // Niche trends are highly relevant

      // Normalize to 0-100
      scores.set(userId, Math.min(score, 100));
    }

    return scores;
  }

  /**
   * Get quest definition IDs for instant quests
   */
  private async getQuestDefinitions(): Promise<{ careerQuestId: number | null, socialQuestId: number | null }> {
    // Get a general pulse creation quest for career quest
    const careerQuest = await db
      .select()
      .from(questDefinitions)
      .where(and(
        eq(questDefinitions.type, 'pulse_creation'),
        eq(questDefinitions.isActive, true)
      ))
      .limit(1);

    // Get a social quest
    const socialQuest = await db
      .select()
      .from(questDefinitions)
      .where(and(
        eq(questDefinitions.type, 'social_quest'),
        eq(questDefinitions.isActive, true)
      ))
      .limit(1);

    return {
      careerQuestId: careerQuest.length > 0 ? careerQuest[0].id : null,
      socialQuestDefinitionId: socialQuest.length > 0 ? socialQuest[0].id : null
    };
  }

  /**
   * Clean up expired instant quests
   */
  async cleanupExpiredQuests(): Promise<number> {
    const result = await db
      .delete(instantQuests)
      .where(and(
        eq(instantQuests.status, 'pending'),
        eq(instantQuests.expiresAt, new Date())
      ))
      .returning({ id: instantQuests.id });

    console.log(`[InstantQuestMatcher] 🧹 Cleaned up ${result.length} expired instant quests`);
    return result.length;
  }
}

// Export singleton instance
export const instantQuestMatcher = new InstantQuestMatcher();
