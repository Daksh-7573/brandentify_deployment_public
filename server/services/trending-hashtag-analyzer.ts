import { strategicHashtagGenerator } from './strategic-hashtag-generator';

export interface TrendingHashtagData {
  hashtag: string;
  postVolume: number;
  engagementRate: number;
  reachPotential: 'high' | 'medium' | 'low';
  trendingScore: number;
  industryRelevance: number;
}

export interface TrendingHashtagSuggestion {
  hashtags: string[];
  trendingData: TrendingHashtagData[];
  reasoning: string;
  platform: string;
}

/**
 * Analyzes hashtag trends and suggests hashtags based on:
 * - Post volume (how many posts use this hashtag)
 * - Trending keywords in the industry
 * - Engagement rates and reach potential
 * - Industry relevance scores
 */
class TrendingHashtagAnalyzer {

  /**
   * Generate trending-based hashtag suggestions
   */
  async generateTrendingHashtags(
    userId: number,
    platform: string,
    industry: string,
    domain: string
  ): Promise<TrendingHashtagSuggestion> {
    try {
      console.log(`[Trending Hashtags] Analyzing trends for ${industry}/${domain} on ${platform}`);
      
      // Get strategic hashtags as base
      const strategicData = await strategicHashtagGenerator.generateStrategicHashtags(userId, platform, {
        industry,
        domain,
        contentType: 'trending_analysis',
        audienceSeniority: 'senior'
      });
      
      // Analyze trending data for each hashtag
      const trendingData = this.analyzeTrendingData(strategicData.hashtags, industry, domain, platform);
      
      // Select best performing hashtags based on trending metrics
      const optimizedHashtags = this.selectOptimalHashtags(trendingData, platform);
      
      return {
        hashtags: optimizedHashtags.map(data => data.hashtag),
        trendingData: optimizedHashtags,
        reasoning: this.getTrendingReasoning(optimizedHashtags, industry, platform),
        platform
      };

    } catch (error) {
      console.error('[Trending Hashtags] Error:', error);
      return this.getFallbackTrendingHashtags(platform);
    }
  }

  /**
   * Analyze trending data for hashtags
   */
  private analyzeTrendingData(
    hashtags: string[], 
    industry: string, 
    domain: string, 
    platform: string
  ): TrendingHashtagData[] {
    return hashtags.map(hashtag => {
      const analysis = this.analyzeHashtagMetrics(hashtag, industry, domain, platform);
      return {
        hashtag,
        postVolume: analysis.postVolume,
        engagementRate: analysis.engagementRate,
        reachPotential: analysis.reachPotential,
        trendingScore: analysis.trendingScore,
        industryRelevance: analysis.industryRelevance
      };
    });
  }

  /**
   * Analyze individual hashtag metrics
   */
  private analyzeHashtagMetrics(
    hashtag: string, 
    industry: string, 
    domain: string, 
    platform: string
  ) {
    // Simulate real-world trending data (in production, this would fetch from APIs)
    const industryKey = `${industry.toLowerCase()}_${domain.toLowerCase().replace(/\s+/g, '')}`;
    
    // High-performing hashtags for Hospitality/Corporate Travel
    const highPerformingHashtags = {
      'hospitality_corporatetravel': {
        'Hospitality': { volume: 2500000, engagement: 4.2, trending: 85 },
        'CorporateTravel': { volume: 890000, engagement: 6.8, trending: 92 },
        'BusinessTravel': { volume: 1200000, engagement: 5.4, trending: 78 },
        'TravelTech': { volume: 450000, engagement: 7.2, trending: 95 },
        'TravelManagement': { volume: 320000, engagement: 8.1, trending: 88 },
        'ExecutiveLeadership': { volume: 780000, engagement: 5.9, trending: 72 },
        'EnterpriseStrategy': { volume: 340000, engagement: 6.5, trending: 81 },
        'ThoughtLeadership': { volume: 950000, engagement: 4.8, trending: 75 }
      }
    };
    
    // Platform-specific multipliers
    const platformMultipliers = {
      'LinkedIn': { volume: 1.0, engagement: 1.0 },
      'Twitter': { volume: 1.5, engagement: 0.8 },
      'Instagram': { volume: 2.0, engagement: 1.2 },
      'YouTube': { volume: 0.3, engagement: 1.8 },
      'TikTok': { volume: 3.0, engagement: 1.5 }
    };

    const industryData = highPerformingHashtags[industryKey] || {};
    const hashtagData = industryData[hashtag] || { volume: 100000, engagement: 3.5, trending: 50 };
    const multiplier = platformMultipliers[platform] || { volume: 1.0, engagement: 1.0 };

    const postVolume = Math.floor(hashtagData.volume * multiplier.volume);
    const engagementRate = hashtagData.engagement * multiplier.engagement;
    const trendingScore = hashtagData.trending;
    
    // Calculate industry relevance (0-100)
    const industryRelevance = this.calculateIndustryRelevance(hashtag, industry, domain);
    
    // Determine reach potential
    const reachPotential = postVolume > 800000 && engagementRate > 6.0 ? 'high' :
                          postVolume > 400000 && engagementRate > 4.0 ? 'medium' : 'low';

    return {
      postVolume,
      engagementRate: parseFloat(engagementRate.toFixed(1)),
      reachPotential,
      trendingScore,
      industryRelevance
    };
  }

  /**
   * Calculate industry relevance score
   */
  private calculateIndustryRelevance(hashtag: string, industry: string, domain: string): number {
    const hashtagLower = hashtag.toLowerCase();
    const industryLower = industry.toLowerCase();
    const domainLower = domain.toLowerCase();
    
    let relevance = 0;
    
    // Direct industry/domain matches get high scores
    if (hashtagLower.includes(industryLower) || hashtagLower.includes(domainLower)) {
      relevance += 40;
    }
    
    // Hospitality/Corporate Travel specific scoring
    if (industryLower.includes('hospitality') && domainLower.includes('travel')) {
      const hospitalityTerms = ['hospitality', 'travel', 'corporate', 'business', 'management'];
      hospitalityTerms.forEach(term => {
        if (hashtagLower.includes(term)) relevance += 15;
      });
    }
    
    // Platform and engagement terms
    const engagementTerms = ['leadership', 'strategy', 'tech', 'insights', 'optimization'];
    engagementTerms.forEach(term => {
      if (hashtagLower.includes(term)) relevance += 10;
    });
    
    return Math.min(relevance, 100);
  }

  /**
   * Select optimal hashtags based on trending metrics
   */
  private selectOptimalHashtags(
    trendingData: TrendingHashtagData[], 
    platform: string
  ): TrendingHashtagData[] {
    // Score each hashtag based on multiple factors
    const scoredHashtags = trendingData.map(data => ({
      ...data,
      overallScore: this.calculateOverallScore(data, platform)
    }));
    
    // Sort by overall score and return top performers
    return scoredHashtags
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 8); // Return top 8 hashtags
  }

  /**
   * Calculate overall hashtag performance score
   */
  private calculateOverallScore(data: TrendingHashtagData, platform: string): number {
    let score = 0;
    
    // Post volume scoring (0-25 points)
    if (data.postVolume > 1000000) score += 25;
    else if (data.postVolume > 500000) score += 20;
    else if (data.postVolume > 200000) score += 15;
    else score += 10;
    
    // Engagement rate scoring (0-25 points)
    if (data.engagementRate > 7.0) score += 25;
    else if (data.engagementRate > 5.0) score += 20;
    else if (data.engagementRate > 3.5) score += 15;
    else score += 10;
    
    // Trending score (0-25 points)
    score += Math.floor(data.trendingScore * 0.25);
    
    // Industry relevance (0-25 points)
    score += Math.floor(data.industryRelevance * 0.25);
    
    // Platform-specific bonuses
    if (platform === 'LinkedIn' && data.hashtag.includes('Leadership')) score += 5;
    if (platform === 'Twitter' && data.hashtag.includes('Tech')) score += 5;
    if (platform === 'Instagram' && data.hashtag.includes('Life')) score += 5;
    
    return score;
  }

  /**
   * Generate reasoning for trending hashtag selection
   */
  private getTrendingReasoning(
    optimizedHashtags: TrendingHashtagData[], 
    industry: string, 
    platform: string
  ): string {
    const highVolumeHashtags = optimizedHashtags.filter(h => h.postVolume > 800000);
    const highEngagementHashtags = optimizedHashtags.filter(h => h.engagementRate > 6.0);
    const trendingHashtags = optimizedHashtags.filter(h => h.trendingScore > 85);
    
    return `Selected hashtags based on trending analysis: ${highVolumeHashtags.length} high-volume tags (800K+ posts), ` +
           `${highEngagementHashtags.length} high-engagement tags (6.0%+ rate), and ${trendingHashtags.length} trending tags (85+ score) ` +
           `optimized for ${industry} professionals on ${platform}.`;
  }

  /**
   * Fallback trending hashtags when analysis fails
   */
  private getFallbackTrendingHashtags(platform: string): TrendingHashtagSuggestion {
    const fallbackHashtags = ['Professional', 'Career', 'Industry', 'Growth', 'Leadership'];
    const fallbackData: TrendingHashtagData[] = fallbackHashtags.map(hashtag => ({
      hashtag,
      postVolume: 500000,
      engagementRate: 4.0,
      reachPotential: 'medium' as const,
      trendingScore: 60,
      industryRelevance: 50
    }));
    
    return {
      hashtags: fallbackHashtags,
      trendingData: fallbackData,
      reasoning: 'Using fallback hashtags due to analysis error',
      platform
    };
  }
}

export const trendingHashtagAnalyzer = new TrendingHashtagAnalyzer();