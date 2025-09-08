import { storage } from '../storage';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface HashtagSuggestion {
  hashtags: string[];
  platform: string;
  reasoning: string;
}

class HashtagSuggestionService {
  
  /**
   * Generate personalized hashtags based on user profile and platform
   */
  async generateHashtags(userId: number, platform: string, targetAction: string): Promise<HashtagSuggestion> {
    try {
      console.log(`[Hashtags] Generating hashtags for user ${userId}, platform ${platform}`);
      
      // Get user profile data using db directly
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) {
        return this.getFallbackHashtags(platform);
      }
      const userData = user[0];

      // Generate hashtags based on user's industry, domain, and platform
      const hashtags = this.generatePersonalizedHashtags(userData, platform, targetAction);
      
      return {
        hashtags,
        platform,
        reasoning: this.getHashtagReasoning(userData, platform)
      };

    } catch (error) {
      console.error('[Hashtags] Error generating hashtags:', error);
      return this.getFallbackHashtags(platform);
    }
  }

  /**
   * Generate personalized hashtags based on user profile
   */
  private generatePersonalizedHashtags(user: any, platform: string, targetAction: string): string[] {
    const hashtags: string[] = [];
    
    // Platform-specific base hashtags
    const platformHashtags = this.getPlatformSpecificHashtags(platform);
    hashtags.push(...platformHashtags);

    // Industry-specific hashtags
    if (user.industry) {
      const industryHashtags = this.getIndustryHashtags(user.industry);
      hashtags.push(...industryHashtags);
    }

    // Domain-specific hashtags
    if (user.domain) {
      const domainHashtags = this.getDomainHashtags(user.domain);
      hashtags.push(...domainHashtags);
    }

    // Role-specific hashtags
    if (user.lookingFor) {
      const roleHashtags = this.getRoleHashtags(user.lookingFor);
      hashtags.push(...roleHashtags);
    }

    // Action-specific hashtags
    const actionHashtags = this.getActionHashtags(targetAction);
    hashtags.push(...actionHashtags);

    // Remove duplicates and limit to 8-12 hashtags
    const uniqueHashtags = Array.from(new Set(hashtags));
    return uniqueHashtags.slice(0, 12);
  }

  /**
   * Get platform-specific hashtags
   */
  private getPlatformSpecificHashtags(platform: string): string[] {
    const platformMap: { [key: string]: string[] } = {
      'LinkedIn': ['#professionals', '#career', '#networking', '#leadership', '#growth'],
      'Twitter': ['#tech', '#innovation', '#insights', '#trends', '#startup'],
      'Instagram': ['#lifestyle', '#motivation', '#inspiration', '#success', '#entrepreneur'],
      'YouTube': ['#education', '#tutorial', '#knowledge', '#learning', '#howto'],
      'TikTok': ['#viral', '#trending', '#tips', '#career', '#professional'],
      'Facebook': ['#community', '#business', '#professional', '#networking', '#career']
    };
    
    return platformMap[platform] || ['#professional', '#career'];
  }

  /**
   * Get industry-specific hashtags
   */
  private getIndustryHashtags(industry: string): string[] {
    const industryMap: { [key: string]: string[] } = {
      'Technology': ['#tech', '#software', '#innovation', '#digital', '#AI'],
      'Healthcare': ['#healthcare', '#medical', '#wellness', '#patient', '#biotech'],
      'Finance': ['#finance', '#fintech', '#banking', '#investment', '#money'],
      'Education': ['#education', '#teaching', '#learning', '#students', '#knowledge'],
      'Marketing': ['#marketing', '#branding', '#digital', '#content', '#strategy'],
      'Sales': ['#sales', '#business', '#revenue', '#customers', '#growth'],
      'Engineering': ['#engineering', '#technical', '#innovation', '#development', '#design'],
      'Design': ['#design', '#creative', '#UX', '#UI', '#visual'],
      'Consulting': ['#consulting', '#strategy', '#business', '#advisory', '#growth'],
      'Hospitality': ['#hospitality', '#service', '#travel', '#hotels', '#customerservice'],
      'Manufacturing': ['#manufacturing', '#production', '#industry', '#automation', '#quality'],
      'Retail': ['#retail', '#ecommerce', '#shopping', '#consumer', '#brands'],
      'Real Estate': ['#realestate', '#property', '#investment', '#housing', '#development'],
      'Legal': ['#legal', '#law', '#compliance', '#justice', '#attorney'],
      'Media': ['#media', '#journalism', '#content', '#news', '#communication']
    };
    
    return industryMap[industry] || ['#industry', '#professional'];
  }

  /**
   * Get domain-specific hashtags
   */
  private getDomainHashtags(domain: string): string[] {
    const domainMap: { [key: string]: string[] } = {
      'B2B': ['#B2B', '#enterprise', '#business', '#corporate', '#solutions'],
      'B2C': ['#B2C', '#consumer', '#retail', '#customers', '#market'],
      'SaaS': ['#SaaS', '#software', '#cloud', '#subscription', '#platform'],
      'E-commerce': ['#ecommerce', '#online', '#retail', '#shopping', '#digital'],
      'FinTech': ['#fintech', '#finance', '#digital', '#payments', '#blockchain'],
      'HealthTech': ['#healthtech', '#medical', '#digital', '#telemedicine', '#innovation'],
      'EdTech': ['#edtech', '#education', '#learning', '#online', '#digital'],
      'AI/ML': ['#AI', '#ML', '#artificialintelligence', '#machinelearning', '#data'],
      'Cybersecurity': ['#cybersecurity', '#security', '#privacy', '#protection', '#cyber'],
      'Mobile': ['#mobile', '#apps', '#iOS', '#Android', '#development'],
      'Web Development': ['#webdev', '#frontend', '#backend', '#fullstack', '#coding'],
      'Data Science': ['#datascience', '#analytics', '#bigdata', '#insights', '#statistics'],
      'IoT': ['#IoT', '#connected', '#smart', '#sensors', '#technology'],
      'Blockchain': ['#blockchain', '#crypto', '#web3', '#decentralized', '#bitcoin'],
      'Gaming': ['#gaming', '#esports', '#videogames', '#entertainment', '#gamedev']
    };
    
    return domainMap[domain] || ['#domain', '#specialization'];
  }

  /**
   * Get role-specific hashtags
   */
  private getRoleHashtags(lookingFor: string): string[] {
    const roleMap: { [key: string]: string[] } = {
      'new_job': ['#jobsearch', '#hiring', '#opportunities', '#career', '#newjob'],
      'career_advice': ['#careeradvice', '#mentorship', '#guidance', '#careercoach', '#development'],
      'networking': ['#networking', '#connections', '#relationships', '#community', '#professionals'],
      'skill_development': ['#skills', '#learning', '#development', '#upskilling', '#training'],
      'promotion': ['#promotion', '#advancement', '#leadership', '#growth', '#careergoals'],
      'industry_insights': ['#insights', '#trends', '#industry', '#analysis', '#knowledge'],
      'mentorship': ['#mentorship', '#mentor', '#guidance', '#coaching', '#development'],
      'freelancing': ['#freelance', '#contractor', '#independent', '#gig', '#remote'],
      'startup': ['#startup', '#entrepreneur', '#innovation', '#venture', '#founder'],
      'investment': ['#investment', '#funding', '#venture', '#capital', '#growth']
    };
    
    return roleMap[lookingFor] || ['#professional', '#career'];
  }

  /**
   * Get action-specific hashtags
   */
  private getActionHashtags(targetAction: string): string[] {
    const actionMap: { [key: string]: string[] } = {
      'post_linkedin_suggestion': ['#thoughtleadership', '#professionalinsights', '#industrytips'],
      'post_twitter_suggestion': ['#quicktips', '#industryupdates', '#trendingnow'],
      'post_instagram_suggestion': ['#behind_the_scenes', '#dayinthelife', '#motivation'],
      'post_youtube_suggestion': ['#educational', '#tutorial', '#knowledgesharing'],
      'post_tiktok_suggestion': ['#careertips', '#professionallife', '#worklife'],
      'post_facebook_suggestion': ['#community', '#discussion', '#businessinsights']
    };
    
    return actionMap[targetAction] || ['#content', '#sharing'];
  }

  /**
   * Get reasoning for hashtag suggestions
   */
  private getHashtagReasoning(user: any, platform: string): string {
    const reasons = [];
    
    if (user.industry) {
      reasons.push(`${user.industry} industry focus`);
    }
    
    if (user.domain) {
      reasons.push(`${user.domain} domain expertise`);
    }
    
    if (user.lookingFor) {
      reasons.push(`${user.lookingFor.replace('_', ' ')} goals`);
    }
    
    reasons.push(`${platform} platform optimization`);
    
    return `Based on ${reasons.join(', ')}`;
  }

  /**
   * Fallback hashtags when user data is unavailable
   */
  private getFallbackHashtags(platform: string): HashtagSuggestion {
    const fallbackMap: { [key: string]: string[] } = {
      'LinkedIn': ['#professional', '#career', '#networking', '#business', '#growth', '#leadership'],
      'Twitter': ['#professional', '#insights', '#career', '#business', '#innovation', '#trends'],
      'Instagram': ['#professional', '#career', '#success', '#motivation', '#business', '#entrepreneur'],
      'YouTube': ['#professional', '#education', '#career', '#tutorial', '#knowledge', '#learning'],
      'TikTok': ['#professional', '#career', '#tips', '#business', '#success', '#motivation'],
      'Facebook': ['#professional', '#business', '#career', '#networking', '#community', '#growth']
    };

    return {
      hashtags: fallbackMap[platform] || ['#professional', '#career', '#business'],
      platform,
      reasoning: 'Generic professional hashtags'
    };
  }

  /**
   * Format hashtags for display in Musk tips
   */
  formatHashtagsForTip(hashtags: string[]): string {
    if (hashtags.length === 0) return '';
    
    const topHashtags = hashtags.slice(0, 6); // Show top 6 hashtags in tips
    return `Recommended hashtags: ${topHashtags.join(' ')}`;
  }
}

export const hashtagSuggestionService = new HashtagSuggestionService();