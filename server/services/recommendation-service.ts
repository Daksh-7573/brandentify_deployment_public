import { db } from '../db';
import { platformActivityInsights } from '@shared/schema';
import { eq, and, isNull } from 'drizzle-orm';

interface PostingTimeRecommendation {
  recommendedPostTime: string; // Format: "14:00-16:00 UTC"
  recommendationSource: string; // "heuristic", "model", "telemetry"
  confidenceScore: number; // 0-100
}

class RecommendationService {
  /**
   * Get optimal posting time for a quest based on platform, industry, and domain
   */
  async getOptimalPostingTime(
    platform: string,
    industry?: string,
    domain?: string
  ): Promise<PostingTimeRecommendation> {
    try {
      // Try to find the most specific match first (platform + industry + domain)
      if (industry && domain) {
        const specificMatch = await db
          .select()
          .from(platformActivityInsights)
          .where(
            and(
              eq(platformActivityInsights.platform, platform),
              eq(platformActivityInsights.industry, industry),
              eq(platformActivityInsights.domain, domain)
            )
          )
          .limit(1);

        if (specificMatch.length > 0) {
          return this.formatRecommendation(specificMatch[0]);
        }
      }

      // Try platform + industry match
      if (industry) {
        const industryMatch = await db
          .select()
          .from(platformActivityInsights)
          .where(
            and(
              eq(platformActivityInsights.platform, platform),
              eq(platformActivityInsights.industry, industry),
              isNull(platformActivityInsights.domain)
            )
          )
          .limit(1);

        if (industryMatch.length > 0) {
          return this.formatRecommendation(industryMatch[0]);
        }
      }

      // Fallback to platform-only match
      const platformMatch = await db
        .select()
        .from(platformActivityInsights)
        .where(
          and(
            eq(platformActivityInsights.platform, platform),
            isNull(platformActivityInsights.industry),
            isNull(platformActivityInsights.domain)
          )
        )
        .limit(1);

      if (platformMatch.length > 0) {
        return this.formatRecommendation(platformMatch[0]);
      }

      // Ultimate fallback - default posting time
      return this.getDefaultRecommendation(platform);
    } catch (error) {
      console.error('[RecommendationService] Error getting optimal posting time:', error);
      return this.getDefaultRecommendation(platform);
    }
  }

  /**
   * Format database result into recommendation object
   */
  private formatRecommendation(insight: any): PostingTimeRecommendation {
    return {
      recommendedPostTime: `${insight.optimalWindowStart}-${insight.optimalWindowEnd} UTC`,
      recommendationSource: insight.dataSource || 'heuristic',
      confidenceScore: insight.confidenceScore || 70
    };
  }

  /**
   * Get default recommendation when no data is available
   */
  private getDefaultRecommendation(platform: string): PostingTimeRecommendation {
    // Default posting times based on common best practices
    const defaults: { [key: string]: { start: string; end: string } } = {
      brandentifier: { start: '09:00', end: '11:00' },
      linkedin: { start: '08:00', end: '10:00' },
      twitter: { start: '09:00', end: '11:00' },
      instagram: { start: '11:00', end: '13:00' },
      facebook: { start: '09:00', end: '10:00' }
    };

    const defaultTime = defaults[platform.toLowerCase()] || { start: '09:00', end: '11:00' };

    return {
      recommendedPostTime: `${defaultTime.start}-${defaultTime.end} UTC`,
      recommendationSource: 'heuristic',
      confidenceScore: 60 // Lower confidence for defaults
    };
  }

  /**
   * Get multiple posting time windows for a platform (morning, afternoon, evening)
   */
  async getAllPostingWindows(
    platform: string,
    industry?: string,
    domain?: string
  ): Promise<PostingTimeRecommendation[]> {
    try {
      const query = db
        .select()
        .from(platformActivityInsights)
        .where(eq(platformActivityInsights.platform, platform));

      // Filter by industry and domain if provided
      const results = await query;

      const filteredResults = results.filter(r => {
        if (industry && r.industry && r.industry !== industry) return false;
        if (domain && r.domain && r.domain !== domain) return false;
        return true;
      });

      if (filteredResults.length > 0) {
        return filteredResults.map(r => this.formatRecommendation(r));
      }

      // Fallback to default
      return [this.getDefaultRecommendation(platform)];
    } catch (error) {
      console.error('[RecommendationService] Error getting all posting windows:', error);
      return [this.getDefaultRecommendation(platform)];
    }
  }

  /**
   * Get recommendation for career quest (Brandentifier platform)
   */
  async getCareerQuestRecommendation(
    industry?: string,
    domain?: string
  ): Promise<PostingTimeRecommendation> {
    return this.getOptimalPostingTime('brandentifier', industry, domain);
  }

  /**
   * Get recommendation for social quest based on platform
   */
  async getSocialQuestRecommendation(
    platform: string,
    industry?: string,
    domain?: string
  ): Promise<PostingTimeRecommendation> {
    return this.getOptimalPostingTime(platform, industry, domain);
  }
}

export const recommendationService = new RecommendationService();
