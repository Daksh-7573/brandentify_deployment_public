// Platform Intelligence Engine - Dynamic platform recommendation system
// Analyzes user profile (goals, industry, domain, audience) to recommend optimal social platforms

import { UserProfile } from '../../shared/types';

export interface PlatformRecommendation {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'youtube';
  priority: number; // 1-4 (1 = highest priority)
  percentage: number; // 0-100 (percentage of total effort)
  reasoning: string; // Why this platform was recommended
  strategy: string; // Recommended strategy for this platform
  expectedROI: number; // 1-10 scale
  timeInvestment: number; // Minutes per week
  keyMetrics: string[]; // What to track for success
  contentFocus: string[]; // Types of content to create
  muskTip: string; // AI-generated tip for this platform
}

export interface UserPlatformProfile {
  goals: string; // career_advice, job_opportunities, networking, thought_leadership, business_growth
  industry: string;
  domain: string;
  lookingFor: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  contentPreference: 'visual' | 'written' | 'video' | 'mixed';
}

export class PlatformIntelligenceEngine {
  // Industry-Platform effectiveness mapping
  private industryPlatformMatrix: Record<string, Record<string, number>> = {
    'Technology': { linkedin: 0.85, twitter: 0.9, instagram: 0.3, youtube: 0.7 },
    'Healthcare': { linkedin: 0.9, twitter: 0.7, instagram: 0.4, youtube: 0.8 },
    'Finance': { linkedin: 0.95, twitter: 0.8, instagram: 0.2, youtube: 0.6 },
    'Hospitality': { linkedin: 0.75, twitter: 0.5, instagram: 0.9, youtube: 0.4 },
    'Education': { linkedin: 0.8, twitter: 0.6, instagram: 0.5, youtube: 0.9 },
    'Marketing': { linkedin: 0.8, twitter: 0.85, instagram: 0.9, youtube: 0.8 },
    'Sales': { linkedin: 0.95, twitter: 0.7, instagram: 0.6, youtube: 0.5 },
    'Creative': { linkedin: 0.6, twitter: 0.7, instagram: 0.95, youtube: 0.8 },
    'Real Estate': { linkedin: 0.8, twitter: 0.4, instagram: 0.9, youtube: 0.6 },
    'Consulting': { linkedin: 0.9, twitter: 0.8, instagram: 0.4, youtube: 0.9 },
  };

  // Goal-Platform priority mapping
  private goalPlatformMatrix: Record<string, Record<string, number>> = {
    'career_advice': { linkedin: 0.9, twitter: 0.6, instagram: 0.3, youtube: 0.7 },
    'job_opportunities': { linkedin: 0.95, twitter: 0.5, instagram: 0.2, youtube: 0.4 },
    'networking': { linkedin: 0.9, twitter: 0.8, instagram: 0.6, youtube: 0.5 },
    'thought_leadership': { linkedin: 0.8, twitter: 0.9, instagram: 0.4, youtube: 0.9 },
    'business_growth': { linkedin: 0.85, twitter: 0.7, instagram: 0.8, youtube: 0.7 },
  };

  // Domain-specific platform strengths
  private domainPlatformMatrix: Record<string, Record<string, number>> = {
    'Software Development': { linkedin: 0.8, twitter: 0.9, instagram: 0.2, youtube: 0.8 },
    'Digital Marketing': { linkedin: 0.7, twitter: 0.9, instagram: 0.9, youtube: 0.7 },
    'Corporate Travel': { linkedin: 0.8, twitter: 0.4, instagram: 0.8, youtube: 0.3 },
    'Product Management': { linkedin: 0.9, twitter: 0.8, instagram: 0.3, youtube: 0.7 },
    'Data Science': { linkedin: 0.8, twitter: 0.8, instagram: 0.2, youtube: 0.9 },
    'UX Design': { linkedin: 0.7, twitter: 0.6, instagram: 0.9, youtube: 0.6 },
  };

  /**
   * Generate personalized platform recommendations based on user profile
   */
  public generateRecommendations(userProfile: UserPlatformProfile): PlatformRecommendation[] {
    const platforms: Array<'linkedin' | 'twitter' | 'instagram' | 'youtube'> = 
      ['linkedin', 'twitter', 'instagram', 'youtube'];

    const recommendations: PlatformRecommendation[] = platforms.map(platform => {
      const score = this.calculatePlatformScore(platform, userProfile);
      const reasoning = this.generateReasoning(platform, userProfile, score);
      const strategy = this.generateStrategy(platform, userProfile);
      
      return {
        platform,
        priority: 0, // Will be set later
        percentage: 0, // Will be calculated based on scores
        reasoning,
        strategy,
        expectedROI: Math.round(score * 10),
        timeInvestment: this.calculateTimeInvestment(platform, userProfile),
        keyMetrics: this.getKeyMetrics(platform, userProfile),
        contentFocus: this.getContentFocus(platform, userProfile),
        muskTip: this.generateMuskTip(platform, userProfile),
        score // Internal score for sorting
      } as PlatformRecommendation & { score: number };
    });

    // Sort by score and assign priorities and percentages
    recommendations.sort((a, b) => (b as any).score - (a as any).score);
    
    // Assign priorities
    recommendations.forEach((rec, index) => {
      rec.priority = index + 1;
    });

    // Calculate percentages based on weighted scores
    const totalScore = recommendations.reduce((sum, rec) => sum + (rec as any).score, 0);
    let remainingPercentage = 100;
    
    recommendations.forEach((rec, index) => {
      if (index === recommendations.length - 1) {
        rec.percentage = remainingPercentage; // Assign remaining to last
      } else {
        const basePercentage = ((rec as any).score / totalScore) * 100;
        rec.percentage = Math.round(basePercentage);
        remainingPercentage -= rec.percentage;
      }
    });

    // Remove internal score property
    return recommendations.map(rec => {
      const { score, ...cleanRec } = rec as any;
      return cleanRec;
    });
  }

  /**
   * Calculate platform effectiveness score for user
   */
  private calculatePlatformScore(platform: string, userProfile: UserPlatformProfile): number {
    const industryScore = this.industryPlatformMatrix[userProfile.industry]?.[platform] || 0.5;
    const goalScore = this.goalPlatformMatrix[userProfile.lookingFor]?.[platform] || 0.5;
    const domainScore = this.domainPlatformMatrix[userProfile.domain]?.[platform] || 0.5;

    // Weighted combination: industry (40%), goals (40%), domain (20%)
    const weightedScore = (industryScore * 0.4) + (goalScore * 0.4) + (domainScore * 0.2);
    
    // Apply experience level multiplier
    const experienceMultiplier = this.getExperienceMultiplier(platform, userProfile.experienceLevel);
    
    return Math.min(1.0, weightedScore * experienceMultiplier);
  }

  /**
   * Generate reasoning for platform recommendation
   */
  private generateReasoning(platform: string, userProfile: UserPlatformProfile, score: number): string {
    const reasons = [];
    
    if (score > 0.8) {
      reasons.push(`Highly effective for ${userProfile.industry} professionals`);
    } else if (score > 0.6) {
      reasons.push(`Good fit for ${userProfile.industry} industry`);
    }

    if (userProfile.lookingFor === 'career_advice' && platform === 'linkedin') {
      reasons.push('Primary platform for career guidance and job opportunities');
    }
    
    if (userProfile.lookingFor === 'thought_leadership' && platform === 'twitter') {
      reasons.push('Ideal for sharing industry insights and building thought leadership');
    }

    if (userProfile.industry === 'Hospitality' && platform === 'instagram') {
      reasons.push('Visual platform perfect for showcasing hospitality experiences');
    }

    if (reasons.length === 0) {
      reasons.push(`Moderate effectiveness for your ${userProfile.goals} goals`);
    }

    return reasons.join('. ');
  }

  /**
   * Generate platform-specific strategy
   */
  private generateStrategy(platform: string, userProfile: UserPlatformProfile): string {
    const strategies = {
      linkedin: {
        'career_advice': 'Connect with industry leaders, share professional updates, engage with career-focused content',
        'job_opportunities': 'Optimize profile for recruiters, apply to jobs, network with hiring managers',
        'networking': 'Join industry groups, attend virtual events, connect with peers',
        'thought_leadership': 'Publish articles, share industry insights, comment on trending topics',
        'business_growth': 'Share company updates, connect with potential clients, showcase expertise'
      },
      twitter: {
        'career_advice': 'Follow industry experts, share quick career tips, engage in professional discussions',
        'job_opportunities': 'Follow company accounts, engage with recruiters, share professional achievements',
        'networking': 'Join Twitter chats, engage with industry hashtags, connect with professionals',
        'thought_leadership': 'Share hot takes, comment on industry news, build a following through insights',
        'business_growth': 'Share company news, engage with prospects, participate in industry conversations'
      },
      instagram: {
        'career_advice': 'Share behind-the-scenes professional content, career journey stories',
        'job_opportunities': 'Showcase work visually, connect with creative recruiters',
        'networking': 'Share professional events, connect through visual storytelling',
        'thought_leadership': 'Create infographics, share visual insights, build personal brand',
        'business_growth': 'Showcase products/services visually, share customer success stories'
      },
      youtube: {
        'career_advice': 'Create career advice videos, share professional journey, interview experts',
        'job_opportunities': 'Build portfolio through videos, demonstrate skills',
        'networking': 'Collaborate with other creators, build community',
        'thought_leadership': 'Create educational content, establish expertise through tutorials',
        'business_growth': 'Create product demos, share customer testimonials, educational content'
      }
    };

    return strategies[platform as keyof typeof strategies]?.[userProfile.lookingFor] || 
           'Engage authentically with your professional network and share valuable insights';
  }

  /**
   * Calculate recommended time investment per platform
   */
  private calculateTimeInvestment(platform: string, userProfile: UserPlatformProfile): number {
    const baseTimes = { linkedin: 45, twitter: 30, instagram: 35, youtube: 90 };
    const experienceMultipliers = { entry: 1.2, mid: 1.0, senior: 0.8, executive: 0.6 };
    
    return Math.round(baseTimes[platform as keyof typeof baseTimes] * 
                     experienceMultipliers[userProfile.experienceLevel]);
  }

  /**
   * Get key metrics to track for each platform
   */
  private getKeyMetrics(platform: string, userProfile: UserPlatformProfile): string[] {
    const commonMetrics = ['engagement_rate', 'profile_views', 'connection_requests'];
    
    const platformSpecific = {
      linkedin: ['job_inquiries', 'recruiter_messages', 'article_views'],
      twitter: ['retweets', 'mentions', 'follower_growth'],
      instagram: ['story_views', 'saves', 'reach'],
      youtube: ['watch_time', 'subscribers', 'video_shares']
    };

    return [...commonMetrics, ...platformSpecific[platform as keyof typeof platformSpecific]];
  }

  /**
   * Get content focus areas for each platform
   */
  private getContentFocus(platform: string, userProfile: UserPlatformProfile): string[] {
    const contentMap = {
      linkedin: ['Professional updates', 'Industry insights', 'Career achievements', 'Thought leadership articles'],
      twitter: ['Industry news commentary', 'Quick tips', 'Professional opinions', 'Live event updates'],
      instagram: ['Behind-the-scenes content', 'Visual achievements', 'Professional lifestyle', 'Industry infographics'],
      youtube: ['Educational tutorials', 'Industry deep-dives', 'Professional storytelling', 'Skill demonstrations']
    };

    return contentMap[platform as keyof typeof contentMap];
  }

  /**
   * Generate Musk-style tips for each platform
   */
  private generateMuskTip(platform: string, userProfile: UserPlatformProfile): string {
    const muskTips = {
      linkedin: [
        'Be authentic, not corporate. People connect with humans, not job titles.',
        'Comment before you post. Engagement builds relationships faster than broadcasting.',
        'Share failures alongside successes. Vulnerability creates stronger professional bonds.',
        'Quality over quantity. One meaningful connection beats 100 superficial ones.'
      ],
      twitter: [
        'Tweet like you\'re talking to a friend, not giving a presentation.',
        'Engage in conversations, don\'t just broadcast. Twitter rewards interaction.',
        'Be consistent but not predictable. Surprise your audience occasionally.',
        'Use threads to tell stories. People love narrative more than one-liners.'
      ],
      instagram: [
        'Show the process, not just the outcome. People love behind-the-scenes content.',
        'Use Stories for real-time engagement. It\'s where authentic connections happen.',
        'Consistency in posting beats perfection every time.',
        'Captions matter more than you think. Tell stories, don\'t just describe.'
      ],
      youtube: [
        'Value first, promotion second. Solve problems before selling solutions.',
        'Consistency builds momentum. Better to post weekly than sporadically.',
        'Engage with comments like your business depends on it. Because it does.',
        'Perfect is the enemy of done. Start before you feel ready.'
      ]
    };

    const tips = muskTips[platform as keyof typeof muskTips];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Get experience level multiplier for platform effectiveness
   */
  private getExperienceMultiplier(platform: string, experienceLevel: string): number {
    const multipliers = {
      linkedin: { entry: 1.1, mid: 1.0, senior: 1.2, executive: 1.3 },
      twitter: { entry: 0.8, mid: 1.0, senior: 1.1, executive: 1.0 },
      instagram: { entry: 1.0, mid: 0.9, senior: 0.8, executive: 0.7 },
      youtube: { entry: 0.7, mid: 1.0, senior: 1.2, executive: 1.1 }
    };

    return multipliers[platform as keyof typeof multipliers]?.[experienceLevel as keyof typeof multipliers.linkedin] || 1.0;
  }

  /**
   * Get platform recommendations for specific industry-domain combination
   */
  public getIndustryDomainRecommendations(industry: string, domain: string): Record<string, number> {
    const industryScores = this.industryPlatformMatrix[industry] || {};
    const domainScores = this.domainPlatformMatrix[domain] || {};
    
    const platforms = ['linkedin', 'twitter', 'instagram', 'youtube'];
    const recommendations: Record<string, number> = {};
    
    platforms.forEach(platform => {
      const industryScore = industryScores[platform] || 0.5;
      const domainScore = domainScores[platform] || 0.5;
      recommendations[platform] = (industryScore + domainScore) / 2;
    });
    
    return recommendations;
  }

  /**
   * Analyze user profile and return best platforms
   */
  public analyzeUserProfile(userProfile: UserPlatformProfile): {
    primaryPlatform: string;
    secondaryPlatform: string;
    platformDistribution: Record<string, number>;
    reasoning: string;
  } {
    const recommendations = this.generateRecommendations(userProfile);
    
    return {
      primaryPlatform: recommendations[0].platform,
      secondaryPlatform: recommendations[1].platform,
      platformDistribution: recommendations.reduce((acc, rec) => {
        acc[rec.platform] = rec.percentage;
        return acc;
      }, {} as Record<string, number>),
      reasoning: `Based on your ${userProfile.industry} background and ${userProfile.lookingFor} goals, ${recommendations[0].platform} is your primary platform (${recommendations[0].percentage}%) with ${recommendations[1].platform} as secondary (${recommendations[1].percentage}%).`
    };
  }
}

// Export singleton instance
export const platformIntelligenceEngine = new PlatformIntelligenceEngine();