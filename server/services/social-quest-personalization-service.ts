import { db } from '../db';
import { users, careerGoals, userHashtagFollows, hashtags } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface PersonalizedSocialQuest {
  title: string;
  description: string;
  muskTip: string;
}

export interface EnhancedUserProfile {
  industry?: string | null;
  domain?: string | null;
  title?: string | null;
  lookingFor?: string | null;
  name?: string | null;
  location?: string | null;
  goals?: Array<{
    id: number;
    title: string;
    goalType: string;
    targetRole?: string | null;
    targetIndustry?: string | null;
    timeframe?: number;
  }>;
  followedHashtags?: Array<{
    id: number;
    tag: string;
  }>;
}

// Keep legacy interface for backward compatibility
export interface UserProfile {
  industry?: string | null;
  domain?: string | null;
  title?: string | null;
  lookingFor?: string | null;
  name?: string | null;
}

class SocialQuestPersonalizationService {
  
  /**
   * Get enhanced user profile with goals, location, and followed hashtags
   */
  async getEnhancedUserProfile(userId: number): Promise<EnhancedUserProfile | null> {
    try {
      // Get user basic profile
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userResult.length === 0) return null;

      const user = userResult[0];
      
      // Get user's career goals
      const goalsResult = await db
        .select({
          id: careerGoals.id,
          title: careerGoals.title,
          goalType: careerGoals.goalType,
          targetRole: careerGoals.targetRole,
          targetIndustry: careerGoals.targetIndustry,
          timeframe: careerGoals.timeframe
        })
        .from(careerGoals)
        .where(eq(careerGoals.userId, userId));

      // Get followed hashtags
      const hashtagsResult = await db
        .select({
          id: hashtags.id,
          tag: hashtags.tag
        })
        .from(userHashtagFollows)
        .innerJoin(hashtags, eq(userHashtagFollows.hashtagId, hashtags.id))
        .where(eq(userHashtagFollows.userId, userId));

      return {
        industry: user.industry,
        domain: user.domain,
        title: user.title,
        lookingFor: user.lookingFor,
        name: user.name,
        location: user.location,
        goals: goalsResult,
        followedHashtags: hashtagsResult
      };
    } catch (error) {
      console.error(`[SocialQuest] Error getting enhanced profile for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Generate personalized social quest content based on enhanced user profile and platform
   */
  async generatePersonalizedSocialQuest(
    userId: number, 
    platform: string, 
    targetAction: string
  ): Promise<PersonalizedSocialQuest> {
    try {
      // Get enhanced user profile
      const userProfile = await this.getEnhancedUserProfile(userId);

      if (!userProfile || !userProfile.industry) {
        return this.getFallbackQuest(platform, targetAction);
      }

      return this.generateEnhancedSocialQuest(userProfile, platform, targetAction);

    } catch (error) {
      console.error('[SocialQuest] Error generating personalized quest:', error);
      return this.getFallbackQuest(platform, targetAction);
    }
  }

  /**
   * Generate enhanced social quest content using goals, location, and interests
   */
  private generateEnhancedSocialQuest(
    profile: EnhancedUserProfile, 
    platform: string, 
    targetAction: string
  ): PersonalizedSocialQuest {
    // Get base industry-specific content first
    const baseQuest = this.generateIndustrySpecificQuest(profile, platform, targetAction);
    
    // Enhance with goals context
    let enhancedDescription = baseQuest.description;
    let enhancedMuskTip = baseQuest.muskTip;
    
    if (profile.goals && profile.goals.length > 0) {
      const primaryGoal = profile.goals[0];
      const goalContext = primaryGoal.targetRole || primaryGoal.title;
      
      if (goalContext) {
        enhancedDescription += ` Focus on content that positions you as a future ${goalContext}`;
        enhancedMuskTip += ` Share insights that demonstrate your readiness for ${goalContext} roles.`;
      }
    }
    
    // Enhance with location context for networking/local content
    if (profile.location && platform.toLowerCase() === 'linkedin') {
      enhancedDescription += ` Consider mentioning ${profile.location} market trends or local industry insights`;
      enhancedMuskTip += ` Include ${profile.location} context to attract local connections.`;
    }
    
    // Enhance with hashtag interests
    if (profile.followedHashtags && profile.followedHashtags.length > 0) {
      const relevantHashtags = profile.followedHashtags
        .slice(0, 3)
        .map(h => `#${h.tag}`)
        .join(' ');
      enhancedMuskTip += ` Suggested hashtags based on your interests: ${relevantHashtags}`;
    }
    
    return {
      title: baseQuest.title,
      description: enhancedDescription,
      muskTip: enhancedMuskTip
    };
  }

  /**
   * Generate industry-specific quest content (legacy method enhanced)
   */
  private generateIndustrySpecificQuest(
    profile: UserProfile | EnhancedUserProfile, 
    platform: string, 
    targetAction: string
  ): PersonalizedSocialQuest {
    const industry = profile.industry?.toLowerCase() || '';
    const domain = profile.domain?.toLowerCase() || '';

    // Get industry-specific trends and tips
    const industryData = this.getIndustrySpecificContent(industry, domain);
    const platformData = this.getPlatformSpecificStructure(platform);

    // Generate personalized description
    const description = this.buildPersonalizedDescription(
      industryData, 
      platformData, 
      platform, 
      profile
    );

    // Generate personalized Musk tip
    const muskTip = this.generatePersonalizedMuskTip(
      industryData, 
      platform, 
      profile
    );

    return {
      title: platformData.title,
      description,
      muskTip
    };
  }

  /**
   * Get industry-specific trends, tips, and topics
   */
  private getIndustrySpecificContent(industry: string, domain: string): {
    trends: string[];
    professionalTips: string[];
    keyTopics: string[];
    examples: string[];
  } {
    // Hospitality/Corporate Travel Content
    if (industry.includes('hospitality') || domain.includes('travel') || domain.includes('corporate')) {
      return {
        trends: [
          'corporate travel cost optimization strategies',
          'hybrid work impact on business travel',
          'sustainable travel initiatives',
          'AI-powered booking technology',
          'remote work travel policies',
          'travel expense management automation'
        ],
        professionalTips: [
          'negotiating corporate hotel rates',
          'implementing travel approval workflows',
          'tracking ROI on business travel',
          'managing travel risk and compliance',
          'optimizing travel booking platforms',
          'developing travel policy guidelines'
        ],
        keyTopics: [
          'guest experience innovation',
          'revenue management strategies',
          'hospitality technology trends',
          'customer service excellence',
          'hotel operations efficiency',
          'travel industry recovery'
        ],
        examples: [
          'reducing travel costs by 30% through strategic vendor partnerships',
          'implementing mobile check-in to improve guest satisfaction',
          'using data analytics to optimize room pricing'
        ]
      };
    }

    // Technology Content
    if (industry.includes('technology') || industry.includes('software')) {
      return {
        trends: [
          'AI integration in business processes',
          'cloud migration strategies',
          'cybersecurity best practices',
          'remote development workflows',
          'DevOps automation trends',
          'low-code/no-code platforms'
        ],
        professionalTips: [
          'optimizing API performance',
          'implementing CI/CD pipelines',
          'database optimization techniques',
          'code review best practices',
          'agile project management',
          'technical debt management'
        ],
        keyTopics: [
          'software architecture patterns',
          'user experience design',
          'data privacy compliance',
          'scalability planning',
          'team collaboration tools',
          'emerging tech frameworks'
        ],
        examples: [
          'reducing deployment time by 80% with automated pipelines',
          'improving user retention through A/B testing',
          'scaling applications to handle 10x traffic growth'
        ]
      };
    }

    // Healthcare Content
    if (industry.includes('healthcare') || industry.includes('medical')) {
      return {
        trends: [
          'telemedicine adoption strategies',
          'patient data privacy regulations',
          'AI in medical diagnostics',
          'digital health technology',
          'value-based care models',
          'electronic health records optimization'
        ],
        professionalTips: [
          'improving patient engagement',
          'streamlining clinical workflows',
          'implementing quality metrics',
          'managing healthcare costs',
          'enhancing care coordination',
          'compliance with healthcare regulations'
        ],
        keyTopics: [
          'patient safety initiatives',
          'healthcare innovation',
          'medical research advances',
          'clinical decision support',
          'population health management',
          'healthcare accessibility'
        ],
        examples: [
          'reducing readmission rates by 25% through care coordination',
          'improving patient satisfaction scores with digital tools',
          'implementing AI to enhance diagnostic accuracy'
        ]
      };
    }

    // Finance Content
    if (industry.includes('finance') || industry.includes('banking')) {
      return {
        trends: [
          'fintech disruption strategies',
          'digital banking transformation',
          'cryptocurrency regulation updates',
          'AI in fraud detection',
          'sustainable finance initiatives',
          'open banking API adoption'
        ],
        professionalTips: [
          'risk assessment methodologies',
          'portfolio diversification strategies',
          'regulatory compliance management',
          'financial modeling techniques',
          'client relationship building',
          'investment analysis frameworks'
        ],
        keyTopics: [
          'market analysis insights',
          'financial planning strategies',
          'regulatory changes impact',
          'investment opportunities',
          'risk management practices',
          'digital transformation'
        ],
        examples: [
          'reducing operational costs by 40% through process automation',
          'improving customer onboarding with digital identity verification',
          'enhancing investment decisions with predictive analytics'
        ]
      };
    }

    // Generic fallback for other industries
    return {
      trends: [
        'digital transformation initiatives',
        'remote work optimization',
        'customer experience improvement',
        'data-driven decision making',
        'sustainability practices',
        'automation and efficiency'
      ],
      professionalTips: [
        'effective team management',
        'project planning strategies',
        'communication best practices',
        'performance optimization',
        'stakeholder engagement',
        'continuous learning approaches'
      ],
      keyTopics: [
        'industry best practices',
        'innovation strategies',
        'market trends analysis',
        'competitive advantages',
        'operational efficiency',
        'professional development'
      ],
      examples: [
        'improving team productivity by 50% with new workflows',
        'increasing customer satisfaction through process improvements',
        'reducing costs while maintaining quality standards'
      ]
    };
  }

  /**
   * Get platform-specific structure and formatting
   */
  private getPlatformSpecificStructure(platform: string) {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return {
          title: 'LinkedIn Industry Leadership',
          format: 'professional insights and thought leadership',
          style: 'detailed professional analysis',
          length: 'comprehensive post with key takeaways'
        };
      case 'twitter':
        return {
          title: 'Twitter Industry Insights',
          format: 'quick tips and trend analysis',
          style: 'concise, actionable content',
          length: 'thread-worthy insights'
        };
      case 'instagram':
        return {
          title: 'Instagram Professional Story',
          format: 'behind-the-scenes professional content',
          style: 'visual storytelling with context',
          length: 'engaging visual narrative'
        };
      case 'youtube':
        return {
          title: 'YouTube Knowledge Share',
          format: 'educational video content',
          style: 'tutorial or explanation format',
          length: '5-minute focused topic'
        };
      case 'facebook':
        return {
          title: 'Facebook Professional Network',
          format: 'career milestones and achievements',
          style: 'personal professional journey',
          length: 'story-driven content'
        };
      case 'tiktok':
        return {
          title: 'TikTok Career Tips',
          format: 'quick career advice',
          style: 'engaging, relatable tips',
          length: '60-second actionable content'
        };
      default:
        return {
          title: 'Social Media Presence',
          format: 'professional content sharing',
          style: 'industry-relevant insights',
          length: 'platform-appropriate content'
        };
    }
  }

  /**
   * Build personalized description with specific trends and tips
   */
  private buildPersonalizedDescription(
    industryData: any,
    platformData: any,
    platform: string,
    profile: UserProfile
  ): string {
    // Randomly select from industry-specific content
    const selectedTrend = this.getRandomElement(industryData.trends);
    const selectedTip = this.getRandomElement(industryData.professionalTips);
    const selectedTopic = this.getRandomElement(industryData.keyTopics);

    // Build description based on platform
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return `Share insights about ${selectedTrend} or detailed analysis of ${selectedTopic} trends in ${profile.industry}`;
      
      case 'twitter':
        return `Share industry trends about ${selectedTrend} or quick professional tips on ${selectedTip} for ${profile.industry} professionals`;
      
      case 'instagram':
        return `Post behind-the-scenes content about ${selectedTopic} or workspace insights related to ${selectedTip} in ${profile.industry}`;
      
      case 'youtube':
        return `Create educational content explaining ${selectedTrend} or tutorial on ${selectedTip} for ${profile.industry} professionals`;
      
      case 'facebook':
        return `Share professional milestones related to ${selectedTopic} or career insights about ${selectedTrend} in ${profile.industry}`;
      
      case 'tiktok':
        return `Create quick tips about ${selectedTip} or myth-busting content about ${selectedTrend} in ${profile.industry}`;
      
      default:
        return `Share professional insights about ${selectedTrend} or expertise on ${selectedTip} relevant to ${profile.industry}`;
    }
  }

  /**
   * Generate personalized Musk tip
   */
  private generatePersonalizedMuskTip(
    industryData: any,
    platform: string,
    profile: UserProfile
  ): string {
    const example = this.getRandomElement(industryData.examples);
    const tip = this.getRandomElement(industryData.professionalTips);

    const platformTips: { [key: string]: string } = {
      linkedin: `LinkedIn posts with industry-specific insights get 5x more engagement. Share real examples like "${example}" and include 3-5 relevant hashtags.`,
      twitter: `Twitter threads with actionable tips perform best. Break down complex topics like "${tip}" into 3-4 digestible tweets with visual elements.`,
      instagram: `Instagram professional content works when you show process, not just results. Document your approach to "${tip}" with behind-the-scenes content.`,
      youtube: `YouTube tutorials get discovered through search. Title your video "How to [${tip}]" and include timestamps for key sections.`,
      facebook: `Facebook posts with personal career stories get more engagement. Share your journey with "${tip}" and lessons learned.`,
      tiktok: `TikTok career content performs with quick, practical advice. Create "Day in the life" or "Quick tip" content about "${tip}".`
    };

    return platformTips[platform.toLowerCase()] || `Share authentic insights about ${tip} specific to ${profile.industry}. Use real examples and be specific about outcomes.`;
  }

  /**
   * Get random element from array
   */
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Fallback quest for users without profile data
   */
  private getFallbackQuest(platform: string, targetAction: string): PersonalizedSocialQuest {
    const platformData = this.getPlatformSpecificStructure(platform);
    
    return {
      title: platformData.title,
      description: `Share professional insights, industry trends, or career tips relevant to your expertise on ${platform}`,
      muskTip: `Authentic, specific content outperforms generic posts. Share your unique perspective and real examples from your experience.`
    };
  }
}

export const socialQuestPersonalizationService = new SocialQuestPersonalizationService();