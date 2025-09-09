import { storage } from '../storage';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface StrategicHashtagSuggestion {
  hashtags: string[];
  platform: string;
  reasoning: string;
  targetMarket: string;
  trendingKeywords: string[];
  targetAudience: string;
}

/**
 * Strategic hashtag generator that creates context-aware hashtags based on:
 * - Post's target industry and domain
 * - Target market analysis  
 * - Related trending keywords
 * - Target audience demographics
 */
class StrategicHashtagGenerator {
  
  /**
   * Generate strategic hashtags based on post context and user profile
   */
  async generateStrategicHashtags(
    userId: number, 
    platform: string, 
    postContext: {
      industry?: string;
      domain?: string;
      targetMarket?: string;
      contentType?: string;
      audienceSeniority?: string; // 'entry', 'mid', 'senior', 'executive'
      businessSize?: string; // 'startup', 'SMB', 'enterprise'
    }
  ): Promise<StrategicHashtagSuggestion> {
    try {
      console.log(`[Strategic Hashtags] Generating for user ${userId}, platform ${platform}, context:`, postContext);
      
      // Get user profile data
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) {
        return this.getFallbackStrategicHashtags(platform);
      }
      const userData = user[0];

      // Determine target market and audience
      const targetMarket = this.determineTargetMarket(userData, postContext);
      const targetAudience = this.determineTargetAudience(userData, postContext);
      
      // Generate trending keywords for the industry/domain
      const trendingKeywords = this.getTrendingKeywords(
        postContext.industry || userData.industry,
        postContext.domain || userData.domain,
        platform
      );
      
      // Generate strategic hashtags
      const hashtags = this.generateContextAwareHashtags(
        userData, 
        platform, 
        postContext, 
        targetMarket, 
        targetAudience,
        trendingKeywords
      );
      
      return {
        hashtags,
        platform,
        reasoning: this.getStrategicReasoning(userData, postContext, targetMarket, targetAudience),
        targetMarket,
        trendingKeywords,
        targetAudience
      };

    } catch (error) {
      console.error('[Strategic Hashtags] Error generating hashtags:', error);
      return this.getFallbackStrategicHashtags(platform);
    }
  }

  /**
   * Determine target market based on user profile and post context
   */
  private determineTargetMarket(user: any, postContext: any): string {
    // If explicitly provided in post context
    if (postContext.targetMarket) {
      return postContext.targetMarket;
    }
    
    // Determine based on industry and domain combination
    const industry = postContext.industry || user.industry;
    const domain = postContext.domain || user.domain;
    
    // Hospitality + Corporate Travel = Corporate Travel Managers
    if (industry?.toLowerCase().includes('hospitality') && domain?.toLowerCase().includes('travel')) {
      return 'Corporate Travel Managers & Business Travel Stakeholders';
    }
    
    // Technology combinations
    if (industry?.toLowerCase().includes('technology')) {
      if (domain?.toLowerCase().includes('saas')) return 'SaaS Decision Makers & Tech Leaders';
      if (domain?.toLowerCase().includes('fintech')) return 'Financial Services & Fintech Professionals';
      return 'Technology Professionals & Innovation Leaders';
    }
    
    // Healthcare combinations
    if (industry?.toLowerCase().includes('healthcare')) {
      if (domain?.toLowerCase().includes('biotech')) return 'Biotech Researchers & Healthcare Innovators';
      return 'Healthcare Professionals & Medical Decision Makers';
    }
    
    // Finance combinations
    if (industry?.toLowerCase().includes('finance')) {
      return 'Financial Services Professionals & Investment Community';
    }
    
    // Default based on user's looking for
    if (user.lookingFor?.includes('job')) return 'Hiring Managers & HR Professionals';
    if (user.lookingFor?.includes('network')) return 'Industry Professionals & Thought Leaders';
    
    return `${industry} Professionals & Industry Leaders`;
  }

  /**
   * Determine target audience based on user profile and post context  
   */
  private determineTargetAudience(user: any, postContext: any): string {
    const audienceSeniority = postContext.audienceSeniority;
    const businessSize = postContext.businessSize;
    const industry = postContext.industry || user.industry;
    
    let audience = '';
    
    // Seniority level
    if (audienceSeniority === 'executive') {
      audience = 'C-Suite Executives & Senior Leaders';
    } else if (audienceSeniority === 'senior') {
      audience = 'Senior Professionals & Department Heads';
    } else if (audienceSeniority === 'mid') {
      audience = 'Mid-Level Managers & Specialists';
    } else if (audienceSeniority === 'entry') {
      audience = 'Entry-Level Professionals & Recent Graduates';
    } else {
      // Default based on user's career stage
      audience = 'Professional Network & Industry Peers';
    }
    
    // Add business size context
    if (businessSize === 'enterprise') {
      audience += ' at Enterprise Companies';
    } else if (businessSize === 'startup') {
      audience += ' in Startup Ecosystem';
    } else if (businessSize === 'SMB') {
      audience += ' at Small-Medium Businesses';
    }
    
    return audience;
  }

  /**
   * Get trending keywords for industry/domain/platform combination
   */
  private getTrendingKeywords(industry: string, domain: string, platform: string): string[] {
    const trendingMap: { [key: string]: string[] } = {
      // Hospitality + Corporate Travel trending
      'hospitality_corporatetravel': [
        'TravelTech', 'ExpenseManagement', 'BusinessTravel2024', 'TravelPolicy', 
        'CorporateWellness', 'SustainableTravel', 'TravelROI', 'RemoteWork'
      ],
      
      // Technology trending
      'technology_saas': [
        'CloudFirst', 'DigitalTransformation', 'SaaS2024', 'ProductLed', 
        'CustomerSuccess', 'APIFirst', 'DataDriven', 'Automation'
      ],
      'technology_fintech': [
        'Fintech2024', 'DigitalPayments', 'Blockchain', 'Cryptocurrency', 
        'RegTech', 'InsurTech', 'OpenBanking', 'FinancialInclusion'
      ],
      
      // Healthcare trending
      'healthcare_biotech': [
        'Biotech2024', 'PrecisionMedicine', 'GenomicMedicine', 'ClinicalTrials',
        'DrugDiscovery', 'MedTech', 'HealthcareInnovation', 'PersonalizedMedicine'
      ],
      
      // General business trending
      'general': [
        'FutureOfWork', 'Leadership2024', 'Innovation', 'Sustainability',
        'DigitalTransformation', 'CareerGrowth', 'ProfessionalDevelopment', 'Networking'
      ]
    };
    
    // Create key for lookup
    const key = `${industry?.toLowerCase()}_${domain?.toLowerCase().replace(/\s+/g, '')}`;
    
    // Platform-specific trending additions
    const platformTrending: { [key: string]: string[] } = {
      'LinkedIn': ['ThoughtLeadership', 'ProfessionalGrowth', 'IndustryInsights'],
      'Twitter': ['TechTwitter', 'IndustryChat', 'TrendingNow'],
      'Instagram': ['BehindTheScenes', 'WorkLifeBalance', 'ProfessionalLife'],
      'YouTube': ['EducationalContent', 'HowTo', 'IndustryTutorial'],
      'TikTok': ['CareerTips', 'WorkHacks', 'ProfessionalAdvice']
    };
    
    const keywords = [
      ...(trendingMap[key] || trendingMap['general']),
      ...(platformTrending[platform] || [])
    ];
    
    return keywords.slice(0, 6); // Return top 6 trending keywords
  }

  /**
   * Generate context-aware hashtags
   */
  private generateContextAwareHashtags(
    user: any, 
    platform: string, 
    postContext: any,
    targetMarket: string,
    targetAudience: string,
    trendingKeywords: string[]
  ): string[] {
    const hashtags: string[] = [];
    
    // 1. Industry-specific core hashtags (2-3 hashtags)
    const industry = postContext.industry || user.industry;
    if (industry?.toLowerCase().includes('hospitality')) {
      hashtags.push('Hospitality', 'HospitalityIndustry');
    } else if (industry?.toLowerCase().includes('technology')) {
      hashtags.push('Technology', 'TechIndustry');
    } else if (industry?.toLowerCase().includes('healthcare')) {
      hashtags.push('Healthcare', 'HealthcareInnovation');
    } else if (industry) {
      hashtags.push(industry.replace(/\s+/g, ''));
    }
    
    // 2. Domain-specific hashtags (2-3 hashtags)
    const domain = postContext.domain || user.domain;
    if (domain?.toLowerCase().includes('corporate travel')) {
      hashtags.push('CorporateTravel', 'BusinessTravel', 'TravelManagement');
    } else if (domain?.toLowerCase().includes('saas')) {
      hashtags.push('SaaS', 'CloudSoftware', 'ProductManagement');
    } else if (domain?.toLowerCase().includes('fintech')) {
      hashtags.push('Fintech', 'FinancialTech', 'DigitalPayments');
    } else if (domain) {
      hashtags.push(domain.replace(/\s+/g, ''));
    }
    
    // 3. Platform-optimized hashtags (1-2 hashtags)
    const platformOptimized = this.getPlatformOptimizedHashtags(platform, postContext.contentType);
    hashtags.push(...platformOptimized);
    
    // 4. Trending keywords (2-3 hashtags)
    hashtags.push(...trendingKeywords.slice(0, 3));
    
    // 5. Target audience hashtags (1-2 hashtags)
    if (targetAudience.includes('Executive')) {
      hashtags.push('ExecutiveLeadership', 'CSuite');
    } else if (targetAudience.includes('Manager')) {
      hashtags.push('ManagerTips', 'LeadershipDevelopment');
    } else if (targetAudience.includes('Professional')) {
      hashtags.push('ProfessionalGrowth', 'CareerDevelopment');
    }
    
    // 6. Business context hashtags (1 hashtag)
    if (postContext.businessSize === 'startup') {
      hashtags.push('StartupLife');
    } else if (postContext.businessSize === 'enterprise') {
      hashtags.push('EnterpriseStrategy');
    }
    
    // Remove duplicates and format properly
    const uniqueHashtags = Array.from(new Set(hashtags))
      .filter(tag => tag && tag.length > 0)
      .map(tag => tag.replace(/[^a-zA-Z0-9]/g, '')) // Remove special characters
      .slice(0, 10); // Limit to 10 hashtags max
    
    return uniqueHashtags;
  }

  /**
   * Get platform-optimized hashtags based on content type
   */
  private getPlatformOptimizedHashtags(platform: string, contentType?: string): string[] {
    const platformMap: { [key: string]: { [key: string]: string[] } } = {
      'LinkedIn': {
        'thought_leadership': ['ThoughtLeadership', 'IndustryInsights'],
        'career_advice': ['CareerAdvice', 'ProfessionalGrowth'],
        'company_update': ['CompanyNews', 'TeamUpdate'],
        'default': ['LinkedInTips', 'NetworkingTips']
      },
      'Twitter': {
        'thread': ['TwitterThread', 'IndustryChat'],
        'quick_tip': ['QuickTips', 'ProTips'],
        'news_commentary': ['IndustryNews', 'TrendAlert'],
        'default': ['TwitterTips', 'IndustryInsights']
      },
      'Instagram': {
        'behind_scenes': ['BehindTheScenes', 'WorkLifeBalance'],
        'day_in_life': ['DayInTheLife', 'ProfessionalLife'],
        'motivational': ['Motivation', 'CareerInspiration'],
        'default': ['WorkLife', 'ProfessionalJourney']
      },
      'YouTube': {
        'tutorial': ['Tutorial', 'HowTo'],
        'educational': ['EducationalContent', 'LearningResource'],
        'interview': ['IndustryInterview', 'ExpertTalk'],
        'default': ['YouTubeTips', 'VideoContent']
      },
      'TikTok': {
        'career_tips': ['CareerTips', 'WorkHacks'],
        'day_in_life': ['WorkLife', 'ProfessionalTikTok'],
        'educational': ['LearnOnTikTok', 'EducationalContent'],
        'default': ['CareerAdvice', 'ProfessionalTips']
      }
    };
    
    const platformHashtags = platformMap[platform] || platformMap['LinkedIn'];
    return platformHashtags[contentType || 'default'] || platformHashtags['default'];
  }

  /**
   * Get strategic reasoning for hashtag selection
   */
  private getStrategicReasoning(user: any, postContext: any, targetMarket: string, targetAudience: string): string {
    const industry = postContext.industry || user.industry;
    const domain = postContext.domain || user.domain;
    
    return `Strategic hashtags targeting ${targetMarket} in ${industry} industry, ` +
           `specifically ${domain} domain. Focused on ${targetAudience} with ` +
           `trending keywords for maximum reach and engagement.`;
  }

  /**
   * Fallback hashtags when user data is unavailable
   */
  private getFallbackStrategicHashtags(platform: string): StrategicHashtagSuggestion {
    return {
      hashtags: ['Professional', 'Career', 'Industry', 'Growth', 'Leadership'],
      platform,
      reasoning: 'Generic professional hashtags due to insufficient user context',
      targetMarket: 'General Professional Network',
      trendingKeywords: ['ProfessionalGrowth', 'CareerDevelopment', 'Industry'],
      targetAudience: 'Professional Network'
    };
  }
}

export const strategicHashtagGenerator = new StrategicHashtagGenerator();