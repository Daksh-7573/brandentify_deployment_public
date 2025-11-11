/**
 * User Context Builder Service
 * 
 * Builds comprehensive user context for AI feed personalization
 * Extracts profile data, preferences, and engagement history
 */

import { DatabaseStorage } from '../storage.js';

export interface UserContext {
  userId: number;
  profile: {
    name: string;
    industry: string | null;
    domain: string | null;
    location: string | null;
    title: string | null;
    company: string | null;
  };
  careerGoals: {
    primaryAudience: string | null;
    secondaryAudience: string | null;
    brandGoals: string[];
  };
  engagement: {
    recentReactions: Array<{ pulseId: number; type: string; timestamp: Date }>;
    recentComments: Array<{ pulseId: number; timestamp: Date }>;
    topInterests: string[]; // Inferred from engagement
  };
  preferences: {
    preferredContentTypes: string[];
    activeIndustries: string[];
  };
}

export class UserContextBuilder {
  constructor(private storage: DatabaseStorage) {}

  /**
   * Build comprehensive user context for AI feed personalization
   */
  async buildContext(userId: number): Promise<UserContext | null> {
    try {
      console.log(`[UserContextBuilder] Building context for user ${userId}`);
      
      // 1. Get user profile
      const user = await this.storage.getUser(userId);
      if (!user) {
        console.error(`[UserContextBuilder] User ${userId} not found`);
        return null;
      }

      // 2. Get brand goals
      const brandGoals = await this.storage.getBrandGoalsByUserId(userId);
      const brandGoalsList = brandGoals.map(g => g.goal);

      // 3. Get recent reactions (last 50)
      const recentReactions = await this.getRecentReactions(userId, 50);

      // 4. Get recent comments (last 30)
      const recentComments = await this.getRecentComments(userId, 30);

      // 5. Infer interests from engagement
      const topInterests = this.inferInterests(recentReactions, recentComments);

      // 6. Determine preferred content types
      const preferredContentTypes = this.getPreferredContentTypes(recentReactions);

      // 7. Get active industries from engagement
      const activeIndustries = this.getActiveIndustries(recentReactions);

      const context: UserContext = {
        userId,
        profile: {
          name: user.name || 'User',
          industry: user.industry,
          domain: user.domain,
          location: user.location,
          title: user.title,
          company: user.company,
        },
        careerGoals: {
          primaryAudience: user.primaryAudience,
          secondaryAudience: user.secondaryAudience,
          brandGoals: brandGoalsList,
        },
        engagement: {
          recentReactions,
          recentComments,
          topInterests,
        },
        preferences: {
          preferredContentTypes,
          activeIndustries,
        },
      };

      console.log(`[UserContextBuilder] Context built successfully for user ${userId}`);
      return context;
    } catch (error) {
      console.error(`[UserContextBuilder] Error building context for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get recent reactions for a user
   */
  private async getRecentReactions(userId: number, limit: number): Promise<Array<{ pulseId: number; type: string; timestamp: Date }>> {
    try {
      const reactions = await this.storage.getUserReactions(userId, limit);
      return reactions.map(r => ({
        pulseId: r.pulseId,
        type: r.reactionType,
        timestamp: r.createdAt,
      }));
    } catch (error) {
      console.error('[UserContextBuilder] Error fetching reactions:', error);
      return [];
    }
  }

  /**
   * Get recent comments for a user
   */
  private async getRecentComments(userId: number, limit: number): Promise<Array<{ pulseId: number; timestamp: Date }>> {
    try {
      const comments = await this.storage.getUserComments(userId, limit);
      return comments.map(c => ({
        pulseId: c.pulseId,
        timestamp: c.createdAt,
      }));
    } catch (error) {
      console.error('[UserContextBuilder] Error fetching comments:', error);
      return [];
    }
  }

  /**
   * Infer user interests from engagement patterns
   */
  private inferInterests(
    reactions: Array<{ pulseId: number; type: string; timestamp: Date }>,
    comments: Array<{ pulseId: number; timestamp: Date }>
  ): string[] {
    // For now, return generic interests based on reaction types
    // In the future, we can analyze pulse content to extract topics
    const interestMap = new Map<string, number>();

    // Weight different engagement types
    reactions.forEach(r => {
      const interest = r.type;
      interestMap.set(interest, (interestMap.get(interest) || 0) + 1);
    });

    // Sort by frequency and return top 5
    return Array.from(interestMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([interest]) => interest);
  }

  /**
   * Get preferred content types based on engagement
   */
  private getPreferredContentTypes(reactions: Array<{ pulseId: number; type: string; timestamp: Date }>): string[] {
    // This would ideally join with pulse types to see which content types user engages with most
    // For now, return all types with equal weight
    return ['news-pulse', 'poll', 'project', 'media-pulse'];
  }

  /**
   * Get active industries from engagement
   */
  private getActiveIndustries(reactions: Array<{ pulseId: number; type: string; timestamp: Date }>): string[] {
    // This would ideally join with pulse industries to see which industries user engages with
    // For now, return empty (will be enhanced in future)
    return [];
  }

  /**
   * Format context for AI consumption (compact string representation)
   */
  formatForAI(context: UserContext): string {
    const { profile, careerGoals, engagement } = context;

    let summary = `User Profile:\n`;
    summary += `- Name: ${profile.name}\n`;
    if (profile.title) summary += `- Title: ${profile.title}\n`;
    if (profile.company) summary += `- Company: ${profile.company}\n`;
    if (profile.industry) summary += `- Industry: ${profile.industry}\n`;
    if (profile.domain) summary += `- Domain: ${profile.domain}\n`;
    if (profile.location) summary += `- Location: ${profile.location}\n`;

    if (careerGoals.brandGoals.length > 0) {
      summary += `\nCareer Goals:\n`;
      careerGoals.brandGoals.forEach(goal => {
        summary += `- ${goal}\n`;
      });
    }

    if (careerGoals.primaryAudience) {
      summary += `\nTarget Audience: ${careerGoals.primaryAudience}`;
      if (careerGoals.secondaryAudience) {
        summary += `, ${careerGoals.secondaryAudience}`;
      }
      summary += `\n`;
    }

    if (engagement.recentReactions.length > 0) {
      summary += `\nRecent Engagement: ${engagement.recentReactions.length} reactions, ${engagement.recentComments.length} comments\n`;
    }

    return summary;
  }
}
