/**
 * Social Quest AI Generator Service
 * 
 * Analyzes user profiles and generates personalized Social Quest tasks using Musk AI.
 * Prioritizes Brandentifier platform first, then external platforms based on user context.
 */

import { LocalAIService } from './local-ai-service';
import * as db from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface UserProfile {
  id: number;
  industry: string;
  domain: string;
  title: string;
  profileCompleted: number;
  lookingFor: string;
  location: string;
}

interface SocialQuestTask {
  platform: string;
  priority: number; // 1=primary, 2=secondary, 3=tertiary
  title: string;
  description: string;
  targetAction: string;
  xpReward: number;
  muskTip: string;
  aiGeneratedContent: string;
  platformRecommendationReason: string;
  platformSpecificData: any;
}

interface PlatformRecommendation {
  platform: string;
  priority: number;
  focus: number; // Percentage of focus (60% Brandentifier, 25% LinkedIn, 15% others)
  reason: string;
  suitability: number; // 0-1 score based on user profile
}

export class SocialQuestAIGenerator {
  private localAI: LocalAIService;

  constructor() {
    this.localAI = new LocalAIService();
  }

  /**
   * Generate personalized Social Quest tasks for a user
   */
  async generateSocialQuests(userId: number, weekNumber: number, year: number): Promise<SocialQuestTask[]> {
    console.log(`[Social Quest AI] Generating quests for user ${userId}, week ${weekNumber}`);

    try {
      // Get comprehensive user profile data
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error(`User profile not found for user ${userId}`);
      }

      // Get platform recommendations based on user analysis
      const platformRecommendations = await this.analyzePlatformRecommendations(userProfile);

      // Generate AI-powered tasks for each recommended platform
      const socialQuests: SocialQuestTask[] = [];

      for (const platformRec of platformRecommendations) {
        const tasks = await this.generatePlatformSpecificTasks(userProfile, platformRec, weekNumber);
        socialQuests.push(...tasks);
      }

      // Sort by priority and select top 5 tasks
      const prioritizedTasks = socialQuests
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 5);

      console.log(`[Social Quest AI] Generated ${prioritizedTasks.length} tasks for user ${userId}`);
      return prioritizedTasks;

    } catch (error) {
      console.error(`[Social Quest AI] Error generating quests for user ${userId}:`, error);
      // Fallback to template-based tasks
      return await this.generateFallbackTasks(userId);
    }
  }

  /**
   * Analyze user profile and recommend platforms with priorities
   */
  private async analyzePlatformRecommendations(userProfile: UserProfile): Promise<PlatformRecommendation[]> {
    const analysisPrompt = `
You are a career strategy AI analyzing a professional's profile to recommend social media platforms.

PRIORITY SYSTEM (CRITICAL):
1. Brandentifier: ALWAYS primary platform (60% focus) - internal professional network
2. LinkedIn: Secondary platform (25% focus) - external professional amplifier  
3. Other platforms: Tertiary (15% focus) - supporting channels

USER PROFILE:
- Industry: ${userProfile.industry}
- Domain: ${userProfile.domain}  
- Title: ${userProfile.title}
- Profile Completion: ${userProfile.profileCompleted}%
- Career Focus: ${userProfile.lookingFor}
- Location: ${userProfile.location}

Analyze and recommend platforms with the following JSON structure:
{
  "platforms": [
    {
      "platform": "brandentifier",
      "priority": 1,
      "focus": 60,
      "reason": "Primary professional hub for profile building and networking",
      "suitability": 1.0
    },
    {
      "platform": "linkedin", 
      "priority": 2,
      "focus": 25,
      "reason": "Industry-specific external amplification",
      "suitability": 0.9
    }
  ]
}

Consider industry-specific platform preferences (visual industries = Instagram, tech = Twitter, etc.) but ALWAYS prioritize Brandentifier first.
`;

    try {
      const response = await this.localAI.generateCareerAdvice({
        user: { industry: userProfile.industry, domain: userProfile.domain },
        workExperiences: [],
        skills: [],
        educations: [],
        adviceType: 'platform-analysis',
        customAdviceText: analysisPrompt
      });
      const analysis = JSON.parse(response);
      return analysis.platforms as PlatformRecommendation[];
    } catch (error) {
      console.error('[Social Quest AI] Error in platform analysis:', error);
      return this.getDefaultPlatformRecommendations(userProfile);
    }
  }

  /**
   * Generate platform-specific tasks using AI
   */
  private async generatePlatformSpecificTasks(
    userProfile: UserProfile,
    platformRec: PlatformRecommendation,
    weekNumber: number
  ): Promise<SocialQuestTask[]> {
    
    const taskPrompt = `
You are Musk, a career development AI creating personalized Social Quest tasks.

USER CONTEXT:
- Industry: ${userProfile.industry}
- Domain: ${userProfile.domain}
- Title: ${userProfile.title}
- Career Goal: ${userProfile.lookingFor}

PLATFORM: ${platformRec.platform.toUpperCase()}
PRIORITY: ${platformRec.priority === 1 ? 'Primary' : platformRec.priority === 2 ? 'Secondary' : 'Tertiary'}
FOCUS: ${platformRec.focus}%

PLATFORM-SPECIFIC GUIDELINES:
${this.getPlatformGuidelines(platformRec.platform)}

Generate 2-3 specific, actionable tasks for this platform. Return JSON:
{
  "tasks": [
    {
      "title": "Task title (max 50 chars)",
      "description": "Detailed description with specific actions",
      "targetAction": "Specific measurable action",
      "xpReward": 50-100,
      "muskTip": "Personal tip from Musk about completing this task",
      "aiGeneratedContent": "Specific content suggestion or template",
      "platformSpecificData": {"any": "platform-specific metadata"}
    }
  ]
}

Make tasks:
1. Industry-relevant to ${userProfile.industry}
2. Specific to their ${userProfile.domain} domain
3. Aligned with their goal of ${userProfile.lookingFor}
4. Appropriate for week ${weekNumber} (consider seasonal relevance)
`;

    try {
      const response = await this.localAI.generateCareerAdvice({
        user: { industry: userProfile.industry, domain: userProfile.domain },
        workExperiences: [],
        skills: [],
        educations: [],
        adviceType: 'social-quest-generation',
        customAdviceText: taskPrompt
      });
      const taskData = JSON.parse(response);
      
      return taskData.tasks.map((task: any) => ({
        ...task,
        platform: platformRec.platform,
        priority: platformRec.priority,
        platformRecommendationReason: platformRec.reason
      }));

    } catch (error) {
      console.error(`[Social Quest AI] Error generating ${platformRec.platform} tasks:`, error);
      return this.getFallbackPlatformTasks(platformRec.platform, userProfile);
    }
  }

  /**
   * Get platform-specific guidelines for AI task generation
   */
  private getPlatformGuidelines(platform: string): string {
    const guidelines = {
      brandentifier: `
PRIMARY PLATFORM FOCUS:
- Profile completion and optimization
- High-quality pulse creation with industry insights
- Meaningful networking within your industry  
- Project showcase and portfolio development
- Community engagement and thought leadership
- Building your professional brand foundation`,

      linkedin: `
SECONDARY PLATFORM FOCUS:
- Cross-promote Brandentifier achievements
- Industry thought leadership content
- Professional network expansion
- Share insights that drive traffic to Brandentifier
- Comment meaningfully on industry discussions
- Use LinkedIn to amplify your Brandentifier presence`,

      instagram: `
TERTIARY PLATFORM FOCUS:
- Behind-the-scenes professional content
- Visual storytelling of career journey
- Industry-related visual content
- Professional lifestyle and workspace
- Link back to Brandentifier profile
- Show personality behind the professional`,

      twitter: `
TERTIARY PLATFORM FOCUS:
- Industry commentary and hot takes
- Real-time engagement with trends
- Short-form thought leadership
- Community building through conversations
- Share quick insights and observations
- Drive engagement back to Brandentifier`,

      youtube: `
TERTIARY PLATFORM FOCUS:
- Educational content about your expertise
- Industry tutorials and explanations
- Career journey storytelling
- Professional skill demonstrations
- Long-form content that showcases expertise
- Reference your Brandentifier profile`
    };

    return guidelines[platform as keyof typeof guidelines] || 'General professional content creation';
  }

  /**
   * Get comprehensive user profile for analysis
   */
  private async getUserProfile(userId: number): Promise<UserProfile | null> {
    try {
      // Get user data using the database connection directly
      const [user] = await db.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!user) return null;

      return {
        id: user.id,
        industry: user.industry || 'General',
        domain: user.domain || 'General',
        title: user.title || 'Professional',
        profileCompleted: user.profileCompleted || 0,
        lookingFor: user.lookingFor || 'career_advice',
        location: user.location || 'Global'
      };
    } catch (error) {
      console.error(`[Social Quest AI] Error fetching user profile:`, error);
      return null;
    }
  }

  /**
   * Default platform recommendations if AI analysis fails
   */
  private getDefaultPlatformRecommendations(userProfile: UserProfile): PlatformRecommendation[] {
    return [
      {
        platform: 'brandentifier',
        priority: 1,
        focus: 60,
        reason: 'Primary professional hub for profile building and networking',
        suitability: 1.0
      },
      {
        platform: 'linkedin',
        priority: 2,
        focus: 25,
        reason: `Professional networking in ${userProfile.industry} industry`,
        suitability: 0.9
      },
      {
        platform: this.getIndustrySpecificPlatform(userProfile.industry),
        priority: 3,
        focus: 15,
        reason: `Industry-specific content sharing for ${userProfile.industry}`,
        suitability: 0.7
      }
    ];
  }

  /**
   * Get industry-appropriate tertiary platform
   */
  private getIndustrySpecificPlatform(industry: string): string {
    const industryPlatformMap: { [key: string]: string } = {
      'technology': 'twitter',
      'design': 'instagram',
      'marketing': 'instagram',
      'hospitality': 'instagram',
      'healthcare': 'linkedin',
      'finance': 'twitter',
      'education': 'youtube',
      'media': 'instagram'
    };

    return industryPlatformMap[industry.toLowerCase()] || 'instagram';
  }

  /**
   * Fallback template-based tasks if AI generation fails completely
   */
  private async generateFallbackTasks(userId: number): Promise<SocialQuestTask[]> {
    console.log(`[Social Quest AI] Using fallback tasks for user ${userId}`);
    
    return [
      {
        platform: 'brandentifier',
        priority: 1,
        title: 'Profile Maximizer',
        description: 'Complete your professional profile to 100% with industry insights',
        targetAction: 'update_profile_sections',
        xpReward: 100,
        muskTip: 'A complete profile is the foundation of your professional brand. Every section tells your story.',
        aiGeneratedContent: 'Focus on adding specific achievements and skills relevant to your industry.',
        platformRecommendationReason: 'Primary platform for professional brand building',
        platformSpecificData: { sections_to_complete: ['about', 'skills', 'projects'] }
      },
      {
        platform: 'brandentifier',
        priority: 1,
        title: 'Community Builder',
        description: 'Engage meaningfully with 5 professionals in your industry',
        targetAction: 'engage_with_community',
        xpReward: 75,
        muskTip: 'Authentic engagement builds lasting professional relationships. Quality over quantity.',
        aiGeneratedContent: 'Look for pulses related to your industry and add thoughtful, helpful comments.',
        platformRecommendationReason: 'Build your network within the Brandentifier community',
        platformSpecificData: { engagement_target: 5, interaction_types: ['comment', 'reaction'] }
      }
    ];
  }

  /**
   * Fallback platform-specific tasks
   */
  private getFallbackPlatformTasks(platform: string, userProfile: UserProfile): SocialQuestTask[] {
    const templates = {
      brandentifier: [
        {
          title: 'Pulse Creator',
          description: `Share insights about ${userProfile.industry} trends`,
          targetAction: 'create_pulse',
          xpReward: 75
        }
      ],
      linkedin: [
        {
          title: 'Network Expander',
          description: 'Connect with 3 professionals in your industry',
          targetAction: 'expand_network',
          xpReward: 60
        }
      ]
    };

    const template = templates[platform as keyof typeof templates]?.[0];
    if (!template) return [];

    return [{
      ...template,
      platform,
      priority: platform === 'brandentifier' ? 1 : 2,
      muskTip: 'Focus on quality connections and meaningful content.',
      aiGeneratedContent: 'Template-based task - personalize based on your goals.',
      platformRecommendationReason: `${platform} selected for ${userProfile.industry} professionals`,
      platformSpecificData: {}
    }];
  }

}