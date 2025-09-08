import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface PlatformRecommendation {
  platform: string;
  targetAction: string;
  priority: number; // 1-5, where 5 is highest priority
  reason: string;
}

export interface UserProfile {
  industry?: string | null;
  domain?: string | null;
  lookingFor?: string | null;
  whatIOffer?: string | null;
  aboutMe?: string | null;
  title?: string | null;
  location?: string | null;
}

class PlatformRecommendationService {
  
  /**
   * Analyzes user profile and recommends optimal social platforms
   */
  async getRecommendedPlatforms(userId: number): Promise<PlatformRecommendation[]> {
    try {
      // Fetch user profile
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) {
        return this.getDefaultRecommendations();
      }

      const profile = user[0];
      const recommendations: PlatformRecommendation[] = [];

      // Analyze profile and build recommendations
      recommendations.push(...this.analyzeLinkedInFit(profile));
      recommendations.push(...this.analyzeTwitterFit(profile));
      recommendations.push(...this.analyzeInstagramFit(profile));
      recommendations.push(...this.analyzeYouTubeFit(profile));
      recommendations.push(...this.analyzeFacebookFit(profile));
      recommendations.push(...this.analyzeTikTokFit(profile));

      // Sort by priority (highest first) and return top platforms
      return recommendations
        .filter(rec => rec.priority >= 2) // Only include platforms with decent fit
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3); // Max 3 platforms to avoid overwhelming users

    } catch (error) {
      console.error('Error getting platform recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Analyze LinkedIn fit based on user profile
   */
  private analyzeLinkedInFit(profile: UserProfile): PlatformRecommendation[] {
    let priority = 3; // Base priority for LinkedIn
    let reasons: string[] = [];

    // Industry analysis
    const professionalIndustries = [
      'technology', 'software', 'finance', 'consulting', 'healthcare', 
      'biotechnology', 'education', 'manufacturing', 'engineering',
      'business', 'marketing', 'sales', 'hospitality'
    ];
    
    if (profile.industry && professionalIndustries.some(ind => 
      profile.industry!.toLowerCase().includes(ind.toLowerCase())
    )) {
      priority += 1;
      reasons.push('professional industry');
    }

    // Role analysis
    const professionalRoles = [
      'manager', 'director', 'executive', 'consultant', 'analyst',
      'engineer', 'developer', 'designer', 'product', 'strategy',
      'business', 'sales', 'marketing'
    ];
    
    if (profile.title && professionalRoles.some(role => 
      profile.title!.toLowerCase().includes(role.toLowerCase())
    )) {
      priority += 1;
      reasons.push('leadership/professional role');
    }

    // Goal analysis
    if (profile.lookingFor) {
      const jobSearchGoals = ['job', 'career', 'opportunity', 'networking'];
      if (jobSearchGoals.some(goal => 
        profile.lookingFor!.toLowerCase().includes(goal.toLowerCase())
      )) {
        priority += 1;
        reasons.push('job search focused');
      }
    }

    // B2B domain boost
    const b2bDomains = ['corporate', 'enterprise', 'business', 'b2b'];
    if (profile.domain && b2bDomains.some(domain => 
      profile.domain!.toLowerCase().includes(domain.toLowerCase())
    )) {
      priority += 1;
      reasons.push('B2B domain');
    }

    return [{
      platform: 'LinkedIn',
      targetAction: 'post_linkedin_suggestion',
      priority: Math.min(priority, 5), // Cap at 5
      reason: `Ideal for ${reasons.join(', ')}`
    }];
  }

  /**
   * Analyze Twitter fit based on user profile
   */
  private analyzeTwitterFit(profile: UserProfile): PlatformRecommendation[] {
    let priority = 2; // Base priority for Twitter
    let reasons: string[] = ['industry insights'];

    // Tech industry boost
    const techKeywords = ['technology', 'software', 'developer', 'engineer', 'ai', 'startup'];
    if (profile.industry && techKeywords.some(keyword => 
      profile.industry!.toLowerCase().includes(keyword.toLowerCase())
    )) {
      priority += 2;
      reasons.push('tech industry engagement');
    }

    // Thought leadership indicators
    const thoughtLeaderRoles = ['ceo', 'founder', 'director', 'manager', 'consultant', 'analyst'];
    if (profile.title && thoughtLeaderRoles.some(role => 
      profile.title!.toLowerCase().includes(role.toLowerCase())
    )) {
      priority += 1;
      reasons.push('thought leadership potential');
    }

    // Innovation-focused domains
    const innovationDomains = ['ai', 'machine learning', 'blockchain', 'fintech', 'biotech'];
    if (profile.domain && innovationDomains.some(domain => 
      profile.domain!.toLowerCase().includes(domain.toLowerCase())
    )) {
      priority += 1;
      reasons.push('innovation-focused domain');
    }

    return [{
      platform: 'Twitter',
      targetAction: 'post_twitter_suggestion',
      priority: Math.min(priority, 5),
      reason: `Good for ${reasons.join(', ')}`
    }];
  }

  /**
   * Analyze Instagram fit based on user profile
   */
  private analyzeInstagramFit(profile: UserProfile): PlatformRecommendation[] {
    let priority = 1; // Low base priority for Instagram
    let reasons: string[] = [];

    // Visual/creative industries
    const visualIndustries = [
      'design', 'creative', 'marketing', 'advertising', 'fashion', 
      'photography', 'art', 'media', 'entertainment', 'food', 'travel'
    ];
    
    if (profile.industry && visualIndustries.some(ind => 
      profile.industry!.toLowerCase().includes(ind.toLowerCase())
    )) {
      priority += 2;
      reasons.push('visual industry');
    }

    // Creative roles
    const creativeRoles = [
      'designer', 'creative', 'photographer', 'artist', 'marketer',
      'brand', 'content creator', 'influencer'
    ];
    
    if (profile.title && creativeRoles.some(role => 
      profile.title!.toLowerCase().includes(role.toLowerCase())
    )) {
      priority += 1;
      reasons.push('creative role');
    }

    // Consumer-facing domains
    const consumerDomains = ['retail', 'consumer', 'lifestyle', 'wellness', 'beauty'];
    if (profile.domain && consumerDomains.some(domain => 
      profile.domain!.toLowerCase().includes(domain.toLowerCase())
    )) {
      priority += 1;
      reasons.push('consumer-facing domain');
    }

    // If still low priority, probably not a good fit
    if (priority < 3) {
      return [{
        platform: 'Instagram',
        targetAction: 'post_instagram_suggestion', 
        priority: 1,
        reason: 'Limited professional value for your industry'
      }];
    }

    return [{
      platform: 'Instagram',
      targetAction: 'post_instagram_suggestion',
      priority: Math.min(priority, 5),
      reason: `Suitable for ${reasons.join(', ')}`
    }];
  }

  /**
   * Analyze YouTube fit based on user profile
   */
  private analyzeYouTubeFit(profile: UserProfile): PlatformRecommendation[] {
    let priority = 2; // Base priority for YouTube
    let reasons: string[] = [];

    // Education/training focused roles
    const educatorRoles = [
      'trainer', 'teacher', 'educator', 'consultant', 'coach',
      'speaker', 'instructor', 'mentor'
    ];
    
    if (profile.title && educatorRoles.some(role => 
      profile.title!.toLowerCase().includes(role.toLowerCase())
    )) {
      priority += 2;
      reasons.push('educational content creation');
    }

    // Knowledge sharing indicators
    if (profile.whatIOffer && 
        ['teach', 'train', 'mentor', 'share', 'expertise'].some(keyword => 
          profile.whatIOffer!.toLowerCase().includes(keyword.toLowerCase())
        )) {
      priority += 1;
      reasons.push('knowledge sharing focus');
    }

    return [{
      platform: 'YouTube',
      targetAction: 'post_youtube_suggestion',
      priority: Math.min(priority, 5),
      reason: reasons.length ? `Good for ${reasons.join(', ')}` : 'Content creation opportunity'
    }];
  }

  /**
   * Analyze Facebook fit based on user profile
   */
  private analyzeFacebookFit(profile: UserProfile): PlatformRecommendation[] {
    return [{
      platform: 'Facebook',
      targetAction: 'post_facebook_suggestion',
      priority: 1, // Generally low priority for professional content
      reason: 'Limited professional networking value'
    }];
  }

  /**
   * Analyze TikTok fit based on user profile
   */
  private analyzeTikTokFit(profile: UserProfile): PlatformRecommendation[] {
    let priority = 1; // Base priority for TikTok
    let reasons: string[] = [];

    // Youth-oriented or creative industries
    const youthIndustries = ['education', 'entertainment', 'social media', 'marketing'];
    if (profile.industry && youthIndustries.some(ind => 
      profile.industry!.toLowerCase().includes(ind.toLowerCase())
    )) {
      priority += 1;
      reasons.push('youth engagement');
    }

    // Early career professionals
    if (profile.title && ['student', 'junior', 'entry', 'intern'].some(level => 
      profile.title!.toLowerCase().includes(level.toLowerCase())
    )) {
      priority += 1;
      reasons.push('early career audience');
    }

    return [{
      platform: 'TikTok',
      targetAction: 'post_tiktok_suggestion',
      priority: Math.min(priority, 5),
      reason: reasons.length ? `Suitable for ${reasons.join(', ')}` : 'Limited professional impact'
    }];
  }

  /**
   * Fallback recommendations when user profile is unavailable
   */
  private getDefaultRecommendations(): PlatformRecommendation[] {
    return [
      {
        platform: 'LinkedIn',
        targetAction: 'post_linkedin_suggestion',
        priority: 4,
        reason: 'Professional networking standard'
      },
      {
        platform: 'Twitter',
        targetAction: 'post_twitter_suggestion',
        priority: 3,
        reason: 'Industry insights and thought leadership'
      }
    ];
  }

  /**
   * Get platform-specific quest titles and descriptions
   */
  getPlatformQuestData(targetAction: string): { title: string; description: string; muskTip: string } {
    const questData: { [key: string]: { title: string; description: string; muskTip: string } } = {
      'post_linkedin_suggestion': {
        title: "LinkedIn Thought Leadership",
        description: "Share an AI-suggested professional insight or industry update on LinkedIn",
        muskTip: "LinkedIn posts with personal insights get 3x more engagement than generic content. Use industry keywords and add your unique perspective."
      },
      'post_twitter_suggestion': {
        title: "Twitter Industry Insights", 
        description: "Share an AI-suggested industry trend or quick professional tip on Twitter",
        muskTip: "Twitter threads perform 3x better than single tweets. Break complex ideas into digestible parts with relevant hashtags."
      },
      'post_instagram_suggestion': {
        title: "Instagram Professional Story",
        description: "Share an AI-suggested behind-the-scenes or workspace content on Instagram", 
        muskTip: "Visual storytelling on Instagram helps humanize your brand. Show your workspace, tools, or daily professional routine."
      },
      'post_youtube_suggestion': {
        title: "YouTube Knowledge Share",
        description: "Create AI-suggested video content about your expertise or career journey",
        muskTip: "YouTube videos with clear thumbnails and industry-specific titles get 10x more views. Keep videos under 5 minutes for better engagement."
      },
      'post_facebook_suggestion': {
        title: "Facebook Professional Network",
        description: "Share AI-suggested career achievements or professional milestones on Facebook",
        muskTip: "Facebook posts work best when you share personal career wins and lessons learned. Be authentic and relatable."
      },
      'post_tiktok_suggestion': {
        title: "TikTok Career Tips",
        description: "Create AI-suggested short-form content about your industry or career advice",
        muskTip: "TikTok career content performs best with quick tips, day-in-the-life videos, and industry myth-busting. Use trending sounds."
      }
    };

    return questData[targetAction] || {
      title: "Social Media Content",
      description: "Create AI-suggested content for your chosen platform",
      muskTip: "Authentic, value-driven content always performs better than generic posts."
    };
  }
}

export const platformRecommendationService = new PlatformRecommendationService();