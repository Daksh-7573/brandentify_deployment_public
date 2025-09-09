import { db } from '../db';
import { users, skills } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface UltraSpecificQuest {
  title: string;
  description: string;
  muskTip: string;
}

export interface DetailedUserProfile {
  industry?: string | null;
  domain?: string | null;
  title?: string | null;
  name?: string | null;
  lookingFor?: string | null;
  whatIOffer?: string | null;
  aboutMe?: string | null;
  userSkills?: string[];
  topExpertiseAreas?: string[];
}

class UltraSpecificQuestGenerator {
  
  /**
   * Generate ultra-specific social quest using actual user profile data
   */
  async generateUltraSpecificQuest(
    userId: number, 
    platform: string, 
    targetAction: string
  ): Promise<UltraSpecificQuest> {
    try {
      console.log(`[UltraSpecific] Generating for user ${userId}, platform ${platform}`);
      
      // Get detailed user profile with skills
      const userProfile = await this.getDetailedUserProfile(userId);
      
      if (!userProfile || !userProfile.industry) {
        return this.getFallbackQuest(platform);
      }

      console.log(`[UltraSpecific] Profile: ${userProfile.industry}/${userProfile.domain}, Skills: ${userProfile.userSkills?.length || 0}`);
      
      return this.generatePlatformSpecificQuest(userProfile, platform, targetAction);

    } catch (error) {
      console.error('[UltraSpecific] Error generating quest:', error);
      return this.getFallbackQuest(platform);
    }
  }

  /**
   * Get detailed user profile including skills
   */
  private async getDetailedUserProfile(userId: number): Promise<DetailedUserProfile | null> {
    try {
      // Get user basic profile
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userResult.length === 0) return null;
      
      const user = userResult[0];

      // For now, we'll use profile data to determine skills
      // TODO: Implement proper user skills retrieval when schema is available
      const skillNames: string[] = [];
      
      // Extract skills from profile data if available
      if (user.whatIOffer) {
        // Parse skills from whatIOffer field if it contains skill-related keywords
        const skillKeywords = ['management', 'optimization', 'planning', 'service', 'revenue', 'travel', 'hospitality'];
        skillKeywords.forEach(keyword => {
          if (user.whatIOffer!.toLowerCase().includes(keyword)) {
            skillNames.push(keyword);
          }
        });
      }

      // Get top expertise areas based on industry/domain
      const topExpertiseAreas = this.getTopExpertiseAreas(user.industry, user.domain, skillNames);

      return {
        industry: user.industry,
        domain: user.domain,
        title: user.title,
        name: user.name,
        lookingFor: user.lookingFor,
        whatIOffer: user.whatIOffer,
        aboutMe: user.aboutMe,
        userSkills: skillNames,
        topExpertiseAreas
      };

    } catch (error) {
      console.error('[UltraSpecific] Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Generate platform-specific ultra-detailed quest
   */
  private generatePlatformSpecificQuest(
    profile: DetailedUserProfile, 
    platform: string, 
    targetAction: string
  ): UltraSpecificQuest {
    
    const industryData = this.getIndustrySpecificData(profile.industry!, profile.domain!);
    const expertiseAreas = profile.topExpertiseAreas || [];
    const skills = profile.userSkills || [];

    switch (platform.toLowerCase()) {
      case 'linkedin':
        return this.generateLinkedInQuest(profile, industryData, expertiseAreas);
      case 'twitter':
        return this.generateTwitterQuest(profile, industryData, expertiseAreas);
      case 'instagram':
        return this.generateInstagramQuest(profile, industryData, expertiseAreas);
      case 'youtube':
        return this.generateYouTubeQuest(profile, industryData, expertiseAreas);
      case 'facebook':
        return this.generateFacebookQuest(profile, industryData, expertiseAreas);
      case 'tiktok':
        return this.generateTikTokQuest(profile, industryData, expertiseAreas);
      default:
        return this.generateGenericQuest(profile, industryData, expertiseAreas, platform);
    }
  }

  /**
   * Generate ultra-specific LinkedIn quest
   */
  private generateLinkedInQuest(
    profile: DetailedUserProfile, 
    industryData: any, 
    expertiseAreas: string[]
  ): UltraSpecificQuest {
    const expertise = expertiseAreas.length > 0 ? expertiseAreas.slice(0, 2).join(' and ') : `${profile.industry} operations`;
    const specificTrend = industryData.currentTrends[0];
    const specificStrategy = industryData.strategies[0];

    return {
      title: `${profile.industry} Leadership Insights`,
      description: `Share professional insights about your expertise in ${expertise}, analysis of ${specificTrend}, or strategic perspectives on ${specificStrategy} specific to ${profile.industry}/${profile.domain}`,
      muskTip: `LinkedIn posts with specific expertise like "${expertise}" get 400% more engagement. Include data, case studies, or real examples from your ${profile.domain} experience.`
    };
  }

  /**
   * Generate ultra-specific Twitter quest
   */
  private generateTwitterQuest(
    profile: DetailedUserProfile, 
    industryData: any, 
    expertiseAreas: string[]
  ): UltraSpecificQuest {
    const expertise = expertiseAreas.length > 0 ? expertiseAreas[0] : `${profile.industry} best practices`;
    const quickTip = industryData.quickTips[0];
    const trendTopic = industryData.trendingTopics[0];

    return {
      title: `${profile.industry} Quick Insights`,
      description: `Tweet quick professional tips about ${expertise}, share insights on ${trendTopic}, or break down ${quickTip} for ${profile.industry} professionals`,
      muskTip: `Twitter threads about specific expertise like "${expertise}" perform 300% better. Use 3-4 tweets with actionable advice and industry hashtags.`
    };
  }

  /**
   * Generate ultra-specific Instagram quest
   */
  private generateInstagramQuest(
    profile: DetailedUserProfile, 
    industryData: any, 
    expertiseAreas: string[]
  ): UltraSpecificQuest {
    const expertise = expertiseAreas.length > 0 ? expertiseAreas[0] : `${profile.industry} workflow`;
    const behindScenes = industryData.visualContent[0];
    const dailyTask = industryData.dailyTasks[0];

    return {
      title: `${profile.industry} Behind-the-Scenes`,
      description: `Post behind-the-scenes content showing your ${expertise} process, workspace moments while working on ${behindScenes}, or day-in-the-life content featuring ${dailyTask} in ${profile.industry}`,
      muskTip: `Instagram content showing specific processes like "${expertise}" gets 250% more engagement. Use Stories for daily updates and posts for key insights.`
    };
  }

  /**
   * Generate ultra-specific YouTube quest
   */
  private generateYouTubeQuest(
    profile: DetailedUserProfile, 
    industryData: any, 
    expertiseAreas: string[]
  ): UltraSpecificQuest {
    const primaryExpertise = expertiseAreas.length > 0 ? expertiseAreas[0] : `${profile.industry} fundamentals`;
    const secondaryExpertise = expertiseAreas.length > 1 ? expertiseAreas[1] : industryData.skillAreas[0];
    const tutorialTopic = industryData.tutorialTopics[0];

    return {
      title: `${profile.industry} Education Content`,
      description: `Create educational video content about your expertise in ${primaryExpertise}, step-by-step tutorials on ${tutorialTopic}, or career guidance specifically for ${profile.domain} professionals in ${profile.industry}`,
      muskTip: `YouTube videos with specific expertise like "${primaryExpertise}" get discovered through search. Title it "How to Master ${primaryExpertise}" and include timestamps for key sections.`
    };
  }

  /**
   * Generate ultra-specific Facebook quest
   */
  private generateFacebookQuest(
    profile: DetailedUserProfile, 
    industryData: any, 
    expertiseAreas: string[]
  ): UltraSpecificQuest {
    const expertise = expertiseAreas.length > 0 ? expertiseAreas[0] : `${profile.industry} operations`;
    const milestone = industryData.milestones[0];
    const lesson = industryData.careerLessons[0];

    return {
      title: `${profile.industry} Professional Journey`,
      description: `Share career achievements related to ${expertise}, professional milestones in ${milestone}, or lessons learned about ${lesson} during your ${profile.domain} career in ${profile.industry}`,
      muskTip: `Facebook posts with personal career stories about "${expertise}" get more engagement. Share specific outcomes and what you learned.`
    };
  }

  /**
   * Generate ultra-specific TikTok quest
   */
  private generateTikTokQuest(
    profile: DetailedUserProfile, 
    industryData: any, 
    expertiseAreas: string[]
  ): UltraSpecificQuest {
    const expertise = expertiseAreas.length > 0 ? expertiseAreas[0] : `${profile.industry} tips`;
    const quickTip = industryData.quickTips[0];
    const myth = industryData.industryMyths[0];

    return {
      title: `${profile.industry} Quick Tips`,
      description: `Create short-form content with quick tips about ${expertise}, myth-busting videos about ${myth}, or day-in-the-life content showing ${quickTip} in action for ${profile.industry} professionals`,
      muskTip: `TikTok career content about specific skills like "${expertise}" performs best. Keep it under 60 seconds with clear, actionable advice.`
    };
  }

  /**
   * Generate generic quest for unknown platforms
   */
  private generateGenericQuest(
    profile: DetailedUserProfile, 
    industryData: any, 
    expertiseAreas: string[], 
    platform: string
  ): UltraSpecificQuest {
    const expertise = expertiseAreas.length > 0 ? expertiseAreas[0] : `${profile.industry} knowledge`;

    return {
      title: `${profile.industry} Professional Content`,
      description: `Share content about your expertise in ${expertise}, insights specific to ${profile.domain}, or professional advice for ${profile.industry} professionals on ${platform}`,
      muskTip: `Content with specific expertise like "${expertise}" always outperforms generic posts. Share real examples and actionable insights.`
    };
  }

  /**
   * Get top expertise areas based on industry, domain, and skills
   */
  private getTopExpertiseAreas(industry?: string | null, domain?: string | null, skills?: string[]): string[] {
    const areas: string[] = [];

    // Industry + Domain specific expertise
    if (industry?.toLowerCase().includes('hospitality') && domain?.toLowerCase().includes('travel')) {
      areas.push('corporate travel management', 'revenue optimization strategies', 'guest experience enhancement', 'travel cost control', 'vendor relationship management');
    } else if (industry?.toLowerCase().includes('technology')) {
      areas.push('software development', 'system architecture', 'project management', 'technical leadership', 'innovation strategy');
    } else if (industry?.toLowerCase().includes('healthcare')) {
      areas.push('patient care optimization', 'healthcare technology', 'clinical workflow', 'medical compliance', 'healthcare innovation');
    }

    // Add skills-based expertise
    if (skills && skills.length > 0) {
      skills.slice(0, 3).forEach(skill => {
        if (!areas.includes(skill.toLowerCase())) {
          areas.push(skill.toLowerCase());
        }
      });
    }

    // Fallback to generic expertise
    if (areas.length === 0 && industry) {
      areas.push(`${industry.toLowerCase()} operations`, `${industry.toLowerCase()} best practices`);
    }

    return areas.slice(0, 4); // Return top 4 expertise areas
  }

  /**
   * Get industry-specific data with detailed content
   */
  private getIndustrySpecificData(industry: string, domain: string) {
    const baseIndustry = industry.toLowerCase();
    const baseDomain = domain.toLowerCase();

    if (baseIndustry.includes('hospitality') || baseDomain.includes('travel')) {
      return {
        currentTrends: [
          'hybrid work impact on corporate travel policies',
          'sustainable travel initiatives in corporate settings',
          'AI-powered travel booking optimization',
          'travel expense management automation'
        ],
        strategies: [
          'corporate travel cost reduction strategies',
          'vendor consolidation for travel savings',
          'travel policy compliance frameworks',
          'sustainable corporate travel programs'
        ],
        quickTips: [
          'corporate hotel rate negotiation techniques',
          'travel expense tracking automation',
          'emergency travel policy protocols',
          'vendor relationship optimization'
        ],
        trendingTopics: [
          'business travel recovery trends',
          'corporate travel technology adoption',
          'travel risk management updates',
          'sustainable business travel practices'
        ],
        visualContent: [
          'corporate travel booking workflows',
          'travel expense management dashboards',
          'vendor meeting negotiations',
          'travel policy implementation'
        ],
        dailyTasks: [
          'corporate travel booking processes',
          'vendor performance reviews',
          'travel expense auditing',
          'client travel consultation'
        ],
        tutorialTopics: [
          'optimizing corporate travel costs',
          'implementing travel approval workflows',
          'managing multi-vendor travel programs',
          'building sustainable travel policies'
        ],
        milestones: [
          'reducing travel costs by 30%',
          'implementing new travel technology',
          'achieving vendor consolidation goals',
          'launching sustainable travel initiatives'
        ],
        careerLessons: [
          'vendor relationship management',
          'travel program optimization',
          'cost control strategies',
          'stakeholder communication'
        ],
        skillAreas: [
          'vendor management',
          'cost optimization',
          'policy development',
          'technology implementation'
        ],
        industryMyths: [
          'that business travel is always expensive',
          'that all hotels charge the same rates',
          'that travel policies limit productivity',
          'that sustainable travel costs more'
        ]
      };
    }

    // Technology industry data
    if (baseIndustry.includes('technology') || baseIndustry.includes('software')) {
      return {
        currentTrends: ['AI integration strategies', 'cloud migration patterns', 'DevOps automation', 'microservices architecture'],
        strategies: ['scalable system design', 'technical debt management', 'team productivity optimization', 'code quality frameworks'],
        quickTips: ['API optimization', 'database performance tuning', 'CI/CD best practices', 'security implementation'],
        trendingTopics: ['machine learning adoption', 'cloud-native development', 'cybersecurity trends', 'remote development'],
        visualContent: ['development workflows', 'system architecture diagrams', 'code review processes', 'deployment pipelines'],
        dailyTasks: ['code reviews', 'system monitoring', 'team standups', 'architecture planning'],
        tutorialTopics: ['building scalable APIs', 'implementing CI/CD', 'optimizing database queries', 'security best practices'],
        milestones: ['successful product launches', 'system performance improvements', 'team leadership achievements', 'technology adoption'],
        careerLessons: ['technical leadership', 'project management', 'team collaboration', 'problem-solving approaches'],
        skillAreas: ['software development', 'system design', 'project management', 'technical leadership'],
        industryMyths: ['that all code needs to be perfect', 'that newer technology is always better', 'that documentation is optional', 'that testing slows development']
      };
    }

    // Generic fallback
    return {
      currentTrends: ['industry digital transformation', 'remote work optimization', 'automation adoption', 'customer experience enhancement'],
      strategies: ['operational efficiency', 'cost optimization', 'quality improvement', 'team productivity'],
      quickTips: ['process optimization', 'stakeholder communication', 'quality assurance', 'project management'],
      trendingTopics: ['industry innovations', 'best practices', 'technology adoption', 'market trends'],
      visualContent: ['daily workflows', 'team processes', 'project outcomes', 'workplace culture'],
      dailyTasks: ['project planning', 'team coordination', 'quality reviews', 'client communication'],
      tutorialTopics: ['industry best practices', 'process optimization', 'team management', 'quality improvement'],
      milestones: ['project completions', 'team achievements', 'process improvements', 'client successes'],
      careerLessons: ['leadership development', 'communication skills', 'problem-solving', 'continuous learning'],
      skillAreas: ['project management', 'communication', 'analysis', 'leadership'],
      industryMyths: ['that experience is everything', 'that processes slow things down', 'that quality costs more', 'that innovation is risky']
    };
  }

  /**
   * Fallback quest for users without sufficient profile data
   */
  private getFallbackQuest(platform: string): UltraSpecificQuest {
    return {
      title: `Professional ${platform.charAt(0).toUpperCase() + platform.slice(1)} Content`,
      description: `Share professional insights, industry expertise, or career guidance relevant to your field on ${platform}`,
      muskTip: `Specific, experience-based content always outperforms generic posts. Share real examples and actionable insights.`
    };
  }
}

export const ultraSpecificQuestGenerator = new UltraSpecificQuestGenerator();