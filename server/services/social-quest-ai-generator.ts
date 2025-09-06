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
import { platformIntelligenceEngine, UserPlatformProfile } from './platform-intelligence-engine';

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
   * Analyze user profile and recommend optimal platforms using Platform Intelligence Engine
   * Dynamic strategy based on user's goals, industry, domain, and audience
   */
  private async analyzePlatformRecommendations(userProfile: UserProfile): Promise<PlatformRecommendation[]> {
    console.log(`[Social Quest AI] Analyzing platform recommendations for user ${userProfile.id}`);

    try {
      // Convert user profile to platform intelligence format
      const platformProfile: UserPlatformProfile = {
        goals: userProfile.lookingFor || 'career_advice',
        industry: userProfile.industry || 'Technology',
        domain: userProfile.domain || 'Software Development',
        lookingFor: userProfile.lookingFor || 'career_advice',
        experienceLevel: this.determineExperienceLevel(userProfile),
        contentPreference: 'mixed' // Default to mixed content
      };

      console.log(`[Platform Intelligence] Analyzing profile:`, {
        industry: platformProfile.industry,
        domain: platformProfile.domain,
        goals: platformProfile.goals,
        experienceLevel: platformProfile.experienceLevel
      });

      // Get dynamic platform recommendations from intelligence engine
      const intelligenceRecommendations = platformIntelligenceEngine.generateRecommendations(platformProfile);
      
      // Convert to our internal format
      const recommendations: PlatformRecommendation[] = intelligenceRecommendations.map(rec => ({
        platform: rec.platform,
        priority: rec.priority,
        focus: rec.percentage,
        reason: rec.reasoning,
        suitability: rec.expectedROI / 10 // Convert 1-10 scale to 0-1
      }));

      console.log(`[Platform Intelligence] Generated ${recommendations.length} dynamic recommendations:`, 
        recommendations.map(r => `${r.platform}: ${r.focus}% (${r.reason})`));

      // Filter to only valid external platforms and limit to top 3
      const validRecommendations = recommendations
        .filter(rec => ['linkedin', 'twitter', 'instagram', 'youtube'].includes(rec.platform.toLowerCase()))
        .slice(0, 3);

      return validRecommendations;
      
    } catch (error) {
      console.error('[Social Quest AI] Error in platform analysis:', error);
      // Fallback to simple strategy if intelligence engine fails
      return [
        {
          platform: 'linkedin',
          priority: 1,
          focus: 70,
          reason: 'Primary professional platform (fallback strategy)',
          suitability: 0.9
        },
        {
          platform: 'twitter',
          priority: 2,
          focus: 30,
          reason: 'Industry engagement and networking (fallback strategy)',
          suitability: 0.7
        }
      ];
    }
  }

  /**
   * Determine user experience level based on profile data
   */
  private determineExperienceLevel(userProfile: UserProfile): 'entry' | 'mid' | 'senior' | 'executive' {
    const title = userProfile.title?.toLowerCase() || '';
    
    if (title.includes('ceo') || title.includes('cto') || title.includes('vp') || title.includes('director')) {
      return 'executive';
    } else if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
      return 'senior';
    } else if (title.includes('junior') || title.includes('intern') || title.includes('assistant')) {
      return 'entry';
    } else {
      return 'mid'; // Default for most professionals
    }
  }

  /**
   * Legacy AI-based platform analysis (kept as fallback)
   */
  private async analyzePlatformRecommendationsAI(userProfile: UserProfile): Promise<PlatformRecommendation[]> {
    const analysisPrompt = `
You are a career strategy AI analyzing a professional's profile to recommend EXTERNAL social media platforms for cross-promotion.

IMPORTANT: This is for EXTERNAL platforms only - Brandentifier activities are handled separately in Brand Quests.

PRIORITY SYSTEM (CRITICAL):
1. LinkedIn: PRIMARY external platform (65% focus) - professional networking and achievement sharing
2. Twitter/X: Secondary platform (20% focus) - thought leadership and industry insights  
3. Instagram: Tertiary platform (10% focus) - visual professional content
4. YouTube: Tertiary platform (5% focus) - educational content creation

USER PROFILE:
- Industry: ${userProfile.industry}
- Domain: ${userProfile.domain}  
- Title: ${userProfile.title}
- Profile Completion: ${userProfile.profileCompleted}%
- Career Focus: ${userProfile.lookingFor}
- Location: ${userProfile.location}

Analyze and recommend EXTERNAL platforms with the following JSON structure:
{
  "platforms": [
    {
      "platform": "linkedin", 
      "priority": 1,
      "focus": 65,
      "reason": "Primary external platform for cross-promoting Brandentifier achievements",
      "suitability": 1.0
    },
    {
      "platform": "twitter", 
      "priority": 2,
      "focus": 20,
      "reason": "Share industry insights and drive traffic to Brandentifier profile",
      "suitability": 0.8
    }
  ]
}

Focus on external platforms that complement the user's Brandentifier profile. Consider industry-specific preferences (visual industries = Instagram, tech = Twitter, etc.).
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
      // Clean JSON response (remove markdown code blocks)
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanedResponse);
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
      // Clean JSON response (remove markdown code blocks)
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const taskData = JSON.parse(cleanedResponse);
      
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
        platform: 'linkedin',
        priority: 1,
        focus: 65,
        reason: `Primary external platform for cross-promoting achievements in ${userProfile.industry}`,
        suitability: 1.0
      },
      {
        platform: 'twitter',
        priority: 2,
        focus: 20,
        reason: `Share industry insights and drive traffic to your Brandentifier profile`,
        suitability: 0.8
      },
      {
        platform: this.getIndustrySpecificPlatform(userProfile.industry),
        priority: 3,
        focus: 15,
        reason: `Industry-specific external content sharing for ${userProfile.industry}`,
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
        platform: 'linkedin',
        priority: 1,
        title: 'LinkedIn Ambassador',
        description: 'Share your latest Brandentifier achievement or project on LinkedIn',
        targetAction: 'cross_promote_achievement',
        xpReward: 100,
        muskTip: 'Your external network needs to see your growth. Cross-promotion amplifies your brand.',
        aiGeneratedContent: 'Share a recent project or milestone with a link back to your Brandentifier profile.',
        platformRecommendationReason: 'Primary external platform for professional cross-promotion',
        platformSpecificData: { post_type: 'achievement_share', include_brandentifier_link: true }
      },
      {
        platform: 'twitter',
        priority: 2,
        title: 'Industry Voice',
        description: 'Share 3 valuable insights about your industry on Twitter/X',
        targetAction: 'share_insights',
        xpReward: 75,
        muskTip: 'Twitter is perfect for quick, valuable insights that drive traffic to your main profile.',
        aiGeneratedContent: 'Tweet short, valuable tips or observations from your professional experience.',
        platformRecommendationReason: 'External platform for thought leadership and profile traffic',
        platformSpecificData: { tweet_count: 3, include_profile_link: true }
      }
    ];
  }

  /**
   * Fallback platform-specific tasks
   */
  private getFallbackPlatformTasks(platform: string, userProfile: UserProfile): SocialQuestTask[] {
    const templates = {
      linkedin: [
        {
          title: 'Network Expander',
          description: 'Connect with 3 professionals in your industry and share your Brandentifier profile',
          targetAction: 'expand_network',
          xpReward: 75
        }
      ],
      twitter: [
        {
          title: 'Insight Sharer',
          description: `Share valuable insights about ${userProfile.industry} trends`,
          targetAction: 'share_industry_insights',
          xpReward: 60
        }
      ]
    };

    const template = templates[platform as keyof typeof templates]?.[0];
    if (!template) return [];

    return [{
      ...template,
      platform,
      priority: platform === 'linkedin' ? 1 : 2,
      muskTip: 'Focus on quality connections and meaningful content that drives traffic to your Brandentifier profile.',
      aiGeneratedContent: 'Template-based external platform task - cross-promote your Brandentifier achievements.',
      platformRecommendationReason: `${platform} selected for ${userProfile.industry} professionals to amplify their Brandentifier presence`,
      platformSpecificData: { include_brandentifier_reference: true }
    }];
  }

}