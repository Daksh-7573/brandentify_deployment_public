/**
 * Personalized Feed Service - Advanced AI-Driven Content Curation
 * 
 * This service implements intelligent feed personalization using multiple signals:
 * 1. Followed hashtags feed
 * 2. Mentor-based feed (followed users)
 * 3. Similar hashtags discovery
 * 4. Engagement-based hashtag learning
 * 5. Industry/Domain matching
 * 6. AI-detected interests
 */

import { localAIService } from "./local-ai-service";

export interface PersonalizedFeedOptions {
  userId: number;
  userProfile: {
    industry?: string;
    domain?: string;
    location?: string;
    title?: string;
  };
  limit?: number;
  offset?: number;
  includeTypes?: ('media-pulse' | 'poll' | 'project' | 'news-pulse')[];
}

export interface FeedItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string | null;
  createdAt: string | Date;
  industry?: string;
  category?: string;
  hashtags?: string[];
  relevanceScore: number;
  reason: string; // Why this item was recommended
  user?: {
    name: string | null;
    photoURL: string | null;
    title?: string;
  };
}

export interface PersonalizedFeedResult {
  items: FeedItem[];
  sources: {
    followedHashtags: number;
    mentorPulses: number;
    similarHashtags: number;
    engagementBased: number;
    industryMatch: number;
    aiInterests: number;
  };
  totalItems: number;
  hasMore: boolean;
}

export class PersonalizedFeedService {
  
  /**
   * Generate personalized feed combining all recommendation sources
   */
  async generatePersonalizedFeed(
    storage: any,
    options: PersonalizedFeedOptions
  ): Promise<PersonalizedFeedResult> {
    const { userId, userProfile, limit = 20, offset = 0, includeTypes } = options;
    
    console.log(`[PersonalizedFeed] Generating feed for user ${userId}`);
    
    // Get all feed sources in parallel
    const [
      followedHashtagsItems,
      mentorPulsesItems,
      similarHashtagsItems,
      engagementBasedItems,
      industryMatchItems,
      aiInterestsItems
    ] = await Promise.all([
      this.getFollowedHashtagsFeed(storage, userId, includeTypes),
      this.getMentorPulsesFeed(storage, userId, includeTypes),
      this.getSimilarHashtagsFeed(storage, userId, includeTypes),
      this.getEngagementBasedFeed(storage, userId, includeTypes),
      this.getIndustryMatchFeed(storage, userProfile, includeTypes),
      this.getAIInterestsFeed(storage, userId, includeTypes)
    ]);

    // Combine and score all items
    const allItems = [
      ...followedHashtagsItems.map(item => ({ ...item, reason: 'Followed hashtag', relevanceScore: 0.9 })),
      ...mentorPulsesItems.map(item => ({ ...item, reason: 'Mentor content', relevanceScore: 0.85 })),
      ...similarHashtagsItems.map(item => ({ ...item, reason: 'Similar interests', relevanceScore: 0.75 })),
      ...engagementBasedItems.map(item => ({ ...item, reason: 'Based on your activity', relevanceScore: 0.8 })),
      ...industryMatchItems.map(item => ({ ...item, reason: 'Industry match', relevanceScore: 0.7 })),
      ...aiInterestsItems.map(item => ({ ...item, reason: 'AI detected interest', relevanceScore: 0.65 }))
    ];

    // Remove duplicates and sort by relevance + recency
    const uniqueItems = this.deduplicateAndScore(allItems);
    
    // Apply pagination
    const paginatedItems = uniqueItems.slice(offset, offset + limit);

    const sources = {
      followedHashtags: followedHashtagsItems.length,
      mentorPulses: mentorPulsesItems.length,
      similarHashtags: similarHashtagsItems.length,
      engagementBased: engagementBasedItems.length,
      industryMatch: industryMatchItems.length,
      aiInterests: aiInterestsItems.length
    };

    console.log(`[PersonalizedFeed] Generated ${uniqueItems.length} items from sources:`, sources);

    return {
      items: paginatedItems,
      sources,
      totalItems: uniqueItems.length,
      hasMore: offset + limit < uniqueItems.length
    };
  }

  /**
   * Get pulses from followed hashtags
   */
  private async getFollowedHashtagsFeed(
    storage: any,
    userId: number,
    includeTypes?: string[]
  ): Promise<FeedItem[]> {
    try {
      // Get user's followed hashtags
      const followedHashtags = await storage.getFollowedHashtagsByUserId(userId);
      if (!followedHashtags.length) return [];

      const hashtagIds = followedHashtags.map(fh => fh.hashtagId);
      
      // Get pulses with these hashtags
      const pulses = await storage.getPulsesByHashtagIds(hashtagIds, includeTypes);
      
      return this.formatPulsesToFeedItems(pulses);
    } catch (error) {
      console.error('[PersonalizedFeed] Error getting followed hashtags feed:', error);
      return [];
    }
  }

  /**
   * Get pulses from followed mentors/users
   */
  private async getMentorPulsesFeed(
    storage: any,
    userId: number,
    includeTypes?: string[]
  ): Promise<FeedItem[]> {
    try {
      // Get users that this user follows
      const followedUsers = await storage.getFollowedUsersByUserId(userId);
      if (!followedUsers.length) return [];

      const userIds = followedUsers.map(fu => fu.followeeId);
      
      // Get pulses from these users
      const pulses = await storage.getPulsesByUserIds(userIds, includeTypes);
      
      return this.formatPulsesToFeedItems(pulses);
    } catch (error) {
      console.error('[PersonalizedFeed] Error getting mentor pulses feed:', error);
      return [];
    }
  }

  /**
   * Get pulses with hashtags similar to followed ones
   */
  private async getSimilarHashtagsFeed(
    storage: any,
    userId: number,
    includeTypes?: string[]
  ): Promise<FeedItem[]> {
    try {
      // Get user's followed hashtags
      const followedHashtags = await storage.getFollowedHashtagsByUserId(userId);
      if (!followedHashtags.length) return [];

      // Use AI to find similar hashtags
      const hashtagTexts = followedHashtags.map(fh => fh.tag);
      const similarHashtags = await this.findSimilarHashtags(storage, hashtagTexts);
      
      if (!similarHashtags.length) return [];

      // Get pulses with similar hashtags
      const pulses = await storage.getPulsesByHashtagIds(similarHashtags, includeTypes);
      
      return this.formatPulsesToFeedItems(pulses);
    } catch (error) {
      console.error('[PersonalizedFeed] Error getting similar hashtags feed:', error);
      return [];
    }
  }

  /**
   * Get pulses based on user's engagement patterns
   */
  private async getEngagementBasedFeed(
    storage: any,
    userId: number,
    includeTypes?: string[]
  ): Promise<FeedItem[]> {
    try {
      // Get hashtags from pulses user has engaged with
      const engagementHashtags = await storage.getHashtagsFromUserEngagements(userId);
      if (!engagementHashtags.length) return [];

      // Get more pulses with these hashtags
      const pulses = await storage.getPulsesByHashtagIds(engagementHashtags, includeTypes);
      
      return this.formatPulsesToFeedItems(pulses);
    } catch (error) {
      console.error('[PersonalizedFeed] Error getting engagement-based feed:', error);
      return [];
    }
  }

  /**
   * Get pulses matching user's industry and domain
   */
  private async getIndustryMatchFeed(
    storage: any,
    userProfile: PersonalizedFeedOptions['userProfile'],
    includeTypes?: string[]
  ): Promise<FeedItem[]> {
    try {
      const { industry, domain } = userProfile;
      if (!industry && !domain) return [];

      // Get pulses matching industry/domain
      const pulses = await storage.getPulsesByIndustryAndDomain(industry, domain, includeTypes);
      
      return this.formatPulsesToFeedItems(pulses);
    } catch (error) {
      console.error('[PersonalizedFeed] Error getting industry match feed:', error);
      return [];
    }
  }

  /**
   * Get pulses based on AI-detected user interests
   */
  private async getAIInterestsFeed(
    storage: any,
    userId: number,
    includeTypes?: string[]
  ): Promise<FeedItem[]> {
    try {
      // Get user's AI-detected interests
      const userInterests = await storage.getUserInterests(userId);
      if (!userInterests.length) return [];

      // Use interests to find relevant content
      const interestTerms = userInterests.map(ui => ui.interest);
      const pulses = await storage.getPulsesByInterests(interestTerms, includeTypes);
      
      return this.formatPulsesToFeedItems(pulses);
    } catch (error) {
      console.error('[PersonalizedFeed] Error getting AI interests feed:', error);
      return [];
    }
  }

  /**
   * Use AI to find hashtags similar to followed ones
   */
  private async findSimilarHashtags(storage: any, hashtagTexts: string[]): Promise<number[]> {
    try {
      const prompt = `
        Given these hashtags that a user follows: ${hashtagTexts.join(', ')}
        
        Suggest 10 similar hashtags that someone with these interests might also like.
        Focus on related topics, broader categories, and complementary interests.
        
        Return only the hashtag text (without #), one per line.
      `;

      const response = await localAIService.generateText(prompt);
      const suggestedTags = response.split('\n')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      // Find hashtag IDs for existing tags
      const hashtagIds: number[] = [];
      for (const tag of suggestedTags) {
        const hashtag = await storage.getHashtagByTag(tag);
        if (hashtag) {
          hashtagIds.push(hashtag.id);
        }
      }

      return hashtagIds;
    } catch (error) {
      console.error('[PersonalizedFeed] Error finding similar hashtags:', error);
      return [];
    }
  }

  /**
   * Remove duplicates and calculate final relevance scores
   */
  private deduplicateAndScore(items: FeedItem[]): FeedItem[] {
    const seenIds = new Set<number>();
    const uniqueItems: FeedItem[] = [];

    // Sort by relevance score first, then by recency
    items.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        
        // Boost score for recent content
        const hoursOld = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, 1 - hoursOld / 168); // Boost for content less than 7 days old
        item.relevanceScore = Math.min(1, item.relevanceScore + recencyBoost * 0.1);
        
        uniqueItems.push(item);
      }
    }

    return uniqueItems;
  }

  /**
   * Convert pulse objects to standardized feed items
   */
  private formatPulsesToFeedItems(pulses: any[]): FeedItem[] {
    return pulses.map(pulse => ({
      id: pulse.id,
      userId: pulse.userId,
      type: pulse.type || 'pulse',
      title: pulse.title || '',
      content: pulse.content,
      createdAt: pulse.createdAt,
      industry: pulse.industry,
      category: pulse.category,
      hashtags: pulse.hashtags || [],
      relevanceScore: 0.5, // Base score, will be adjusted
      reason: '', // Will be set by caller
      user: pulse.user || {
        name: null,
        photoURL: null,
        title: null
      }
    }));
  }

  /**
   * Track user engagement for learning preferences
   */
  async trackEngagement(
    storage: any,
    userId: number,
    pulseId: number,
    engagementType: string,
    weight: number = 1.0
  ): Promise<void> {
    try {
      await storage.createPulseEngagement({
        userId,
        pulseId,
        engagementType,
        weight
      });

      // Update AI interests based on engagement
      await this.updateAIInterestsFromEngagement(storage, userId, pulseId);
    } catch (error) {
      console.error('[PersonalizedFeed] Error tracking engagement:', error);
    }
  }

  /**
   * Update user's AI-detected interests based on engagement
   */
  private async updateAIInterestsFromEngagement(
    storage: any,
    userId: number,
    pulseId: number
  ): Promise<void> {
    try {
      // Get pulse content and hashtags
      const pulse = await storage.getPulseById(pulseId);
      if (!pulse) return;

      const hashtags = await storage.getHashtagsByPulseId(pulseId);
      const content = [pulse.title, pulse.content, ...hashtags.map(h => h.tag)].join(' ');

      // Use AI to extract interests
      const prompt = `
        Analyze this content and extract 3-5 key interests or topics:
        "${content}"
        
        Return only topic keywords, one per line, focusing on:
        - Professional skills and technologies
        - Industry domains
        - Career interests
        - Learning topics
      `;

      const response = await localAIService.generateText(prompt);
      const interests = response.split('\n')
        .map(interest => interest.trim().toLowerCase())
        .filter(interest => interest.length > 0)
        .slice(0, 5);

      // Update or create user interests
      for (const interest of interests) {
        await storage.upsertUserInterest({
          userId,
          interest,
          confidence: 0.7,
          source: 'engagement'
        });
      }
    } catch (error) {
      console.error('[PersonalizedFeed] Error updating AI interests:', error);
    }
  }
}

export const personalizedFeedService = new PersonalizedFeedService();