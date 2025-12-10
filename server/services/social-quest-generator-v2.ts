/**
 * Social Quest Generator V2
 * 
 * AI-powered social quest generation for external platforms (LinkedIn, Twitter, Instagram, etc.)
 * Uses same V2 architecture as career quests with platform-specific guidance
 * 
 * KEY FEATURES:
 * - AI-generated content using FREE local Ollama
 * - Platform-specific guidance (LinkedIn vs Twitter vs Instagram)
 * - Audience-based platform selection (uses user's primary/secondary audiences)
 * - Goal-aligned content generation
 * - Same database structure as template system (no UI changes needed)
 */

import { db } from '../db';
import { users, brandGoals, questDefinitions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { localAIService } from './local-ai-service';

export interface DetailedSocialQuest {
  templateId: number;
  platform: string;
  personalizedTitle: string;
  personalizedDescription: string;
  personalizedMuskTip: string;
  variablesUsed: Record<string, any>;
}

/**
 * Platform-specific content guidelines
 */
const PLATFORM_GUIDELINES = {
  linkedin: {
    tone: 'professional and authoritative',
    contentLength: '1000-2000 characters',
    contentType: 'industry insights, professional achievements, thought leadership',
    imageSpec: 'Professional headshots, infographics, industry visuals',
    hashtagCount: '3-5 professional hashtags',
    postingTips: 'Post during business hours (9am-5pm), Tuesday-Thursday optimal'
  },
  twitter: {
    tone: 'concise and engaging',
    contentLength: '200-280 characters',
    contentType: 'quick insights, hot takes, industry commentary, threads',
    imageSpec: 'Eye-catching visuals, charts, memes',
    hashtagCount: '1-3 trending hashtags',
    postingTips: 'Post during peak hours (12pm-3pm, 5pm-6pm), real-time engagement'
  },
  instagram: {
    tone: 'visual and authentic',
    contentLength: '100-300 characters caption',
    contentType: 'behind-the-scenes, visual storytelling, personal brand',
    imageSpec: 'High-quality photos, carousels, Stories-ready content',
    hashtagCount: '10-20 relevant hashtags',
    postingTips: 'Post at 11am-2pm or 7pm-9pm, focus on visual quality'
  },
  youtube: {
    tone: 'educational and engaging',
    contentLength: '8-15 minute video',
    contentType: 'tutorials, insights, case studies, vlogs',
    imageSpec: 'Thumbnail with text overlay, 1280×720',
    hashtagCount: '5-8 searchable hashtags',
    postingTips: 'Upload Friday-Sunday, optimize title and description for SEO'
  },
  facebook: {
    tone: 'conversational and community-focused',
    contentLength: '40-80 characters (short posts perform best)',
    contentType: 'community engagement, events, behind-the-scenes',
    imageSpec: 'Engaging photos, videos, live streams',
    hashtagCount: '2-3 hashtags',
    postingTips: 'Post 1pm-3pm, Wednesday-Friday optimal'
  },
  tiktok: {
    tone: 'authentic and entertaining',
    contentLength: '15-60 second video',
    contentType: 'quick tips, trends, behind-the-scenes, storytelling',
    imageSpec: 'Vertical video 9:16, eye-catching first 3 seconds',
    hashtagCount: '3-5 trending hashtags',
    postingTips: 'Post 6am-10am or 7pm-11pm, leverage trending sounds'
  },
  medium: {
    tone: 'thoughtful and in-depth',
    contentLength: '1000-2000 words',
    contentType: 'long-form articles, case studies, insights',
    imageSpec: 'Featured image 1400×700, inline images',
    hashtagCount: '5 relevant tags',
    postingTips: 'Publish Monday-Thursday, optimize for SEO'
  },
  pinterest: {
    tone: 'inspirational and actionable',
    contentLength: '100-200 character description',
    contentType: 'infographics, guides, visual inspiration',
    imageSpec: 'Vertical pins 1000×1500, text overlay',
    hashtagCount: '5-10 searchable hashtags',
    postingTips: 'Pin daily, Saturday-Sunday peak engagement'
  }
};

export class SocialQuestGeneratorV2 {
  
  /**
   * Generate multiple social quests for a user (called by timezone-aware scheduler)
   * CRITICAL FIX: This method was missing, causing Social Quests not to generate daily
   */
  async generateQuestsForUser(
    userId: number,
    count: number,
    category: string
  ): Promise<any[]> {
    
    console.log(`[SocialQuestV2] Generating ${count} social quests for user ${userId}`);
    
    try {
      // Get user profile to determine platforms
      const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!userProfile) {
        console.error(`[SocialQuestV2] User ${userId} not found`);
        return [];
      }
      
      // Get social quest definitions (non-career quests)
      const socialQuestDefs = await db
        .select()
        .from(questDefinitions)
        .where(eq(questDefinitions.type, 'social'));
      
      if (socialQuestDefs.length === 0) {
        console.warn(`[SocialQuestV2] No social quest definitions found`);
        return [];
      }
      
      const generatedQuests: any[] = [];
      const platformsList = ['LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Medium', 'Pinterest'];
      
      // Generate requested number of social quests
      for (let i = 0; i < Math.min(count, socialQuestDefs.length); i++) {
        try {
          const questDef = socialQuestDefs[i % socialQuestDefs.length];
          // Rotate through platforms for variety
          const platform = platformsList[i % platformsList.length];
          
          console.log(`[SocialQuestV2] Generating quest ${i + 1}/${count} for ${platform}`);
          
          // Generate individual social quest
          const socialQuest = await this.generateSocialQuest(userId, questDef.id, platform);
          generatedQuests.push({
            ...socialQuest,
            questDefinitionId: questDef.id,
            category: 'social'
          });
          
        } catch (questError) {
          console.error(`[SocialQuestV2] Error generating quest ${i + 1}:`, questError);
          // Continue with next quest instead of failing entirely
          continue;
        }
      }
      
      console.log(`[SocialQuestV2] ✅ Generated ${generatedQuests.length} social quests for user ${userId}`);
      return generatedQuests;
      
    } catch (error) {
      console.error(`[SocialQuestV2] Fatal error in generateQuestsForUser:`, error);
      return [];
    }
  }
  
  /**
   * Generate AI-powered social quest for a specific platform
   */
  async generateSocialQuest(
    userId: number,
    questDefinitionId: number,
    platform: string
  ): Promise<DetailedSocialQuest> {
    
    console.log(`[SocialQuestV2] Generating AI quest for user ${userId} on ${platform}`);
    
    // Get user profile and brand goals
    const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
    const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));
    const [questDef] = await db.select().from(questDefinitions).where(eq(questDefinitions.id, questDefinitionId));
    
    if (!userProfile || !questDef) {
      throw new Error(`Missing user profile or quest definition`);
    }
    
    const platformKey = platform.toLowerCase() as keyof typeof PLATFORM_GUIDELINES;
    const platformGuideline = PLATFORM_GUIDELINES[platformKey] || PLATFORM_GUIDELINES.linkedin;
    
    // Generate platform-specific quest using AI
    const quest = await this.generatePlatformSpecificQuest(
      userProfile,
      userBrandGoals?.selectedGoals || [],
      platform,
      platformGuideline,
      questDef
    );
    
    return quest;
  }
  
  /**
   * Generate platform-specific quest content using AI
   */
  private async generatePlatformSpecificQuest(
    userProfile: any,
    brandGoals: string[],
    platform: string,
    guideline: any,
    questDef: any
  ): Promise<DetailedSocialQuest> {
    
    const name = userProfile.name || 'professional';
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your area';
    const primaryAudience = userProfile.primaryAudience?.[0] || 'industry professionals';
    
    const brandGoalLabel = brandGoals.includes('professional_1') 
      ? 'Position myself as an authority in my niche' 
      : brandGoals.includes('professional_2')
      ? 'Build thought leadership'
      : 'Build my professional brand';
    
    // Build AI prompt for platform-specific content
    const prompt = `You are Musk, a social media strategist. Generate a quest for ${name} to post on ${platform.toUpperCase()}.

PROFILE:
- Name: ${name}
- Industry: ${industry}
- Domain: ${domain}
- Location: ${location}
- Primary Audience: ${primaryAudience}
- Brand Goal: ${brandGoalLabel}

PLATFORM GUIDELINES FOR ${platform.toUpperCase()}:
- Tone: ${guideline.tone}
- Content Length: ${guideline.contentLength}
- Content Type: ${guideline.contentType}
- Image Spec: ${guideline.imageSpec}
- Hashtags: ${guideline.hashtagCount}
- Best Time: ${guideline.postingTips}

QUEST TYPE: ${questDef.targetAction || 'post'}

Generate a quest that asks them to create content for ${platform}. The quest should be achievable and platform-specific. Return ONLY valid JSON:

{
  "personalizedTitle": "Short, action-oriented title (e.g., 'Share Your ${domain} Expertise on ${platform}')",
  "personalizedDescription": "Detailed description that explains WHAT to post, WHY it matters for their ${brandGoalLabel}, and HOW it will reach ${primaryAudience}. Include specific content suggestions based on their ${domain} expertise in ${location}. Mention the ${guideline.contentLength} and ${guideline.imageSpec} requirements. Make it actionable.",
  "personalizedMuskTip": "Listen, ${name}. ${platform} is where ${primaryAudience} are. You're a ${domain} expert in ${location}. Don't just post—${guideline.tone}. ${guideline.postingTips}. Make it count.",
  "contentIdeas": ["Specific idea 1 based on ${domain}", "Specific idea 2 for ${primaryAudience}", "Specific idea 3 related to ${location}"]
}`;

    try {
      const response = await localAIService.generateNewsContent(prompt);
      const parsed = this.parseAIResponse(response);
      
      return {
        templateId: 1, // Default template ID (required by schema, but not used)
        platform: platform,
        personalizedTitle: parsed.personalizedTitle,
        personalizedDescription: parsed.personalizedDescription,
        personalizedMuskTip: parsed.personalizedMuskTip,
        variablesUsed: {
          user_name: name,
          user_industry: industry,
          user_domain: domain,
          user_location: location,
          primary_audience: primaryAudience,
          brand_goals: brandGoals,
          platform: platform,
          content_ideas: parsed.contentIdeas || [],
          platform_guidelines: guideline
        }
      };
      
    } catch (error) {
      console.error(`[SocialQuestV2] AI generation failed for ${platform}:`, error);
      return this.getFallbackQuest(userProfile, platform, questDef);
    }
  }
  
  /**
   * Parse AI response (handles various JSON formats)
   */
  private parseAIResponse(response: string): any {
    try {
      // Try direct JSON parse
      const trimmed = response.trim();
      
      // Remove markdown code blocks if present
      let jsonStr = trimmed;
      if (trimmed.startsWith('```json')) {
        jsonStr = trimmed.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (trimmed.startsWith('```')) {
        jsonStr = trimmed.replace(/```\n?/g, '');
      }
      
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[SocialQuestV2] JSON parse failed:', parseError);
      
      // Try to extract JSON from text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('[SocialQuestV2] Fallback parse failed:', e);
        }
      }
      
      throw new Error('Failed to parse AI response');
    }
  }
  
  /**
   * Fallback quest when AI fails
   */
  private getFallbackQuest(userProfile: any, platform: string, questDef: any): DetailedSocialQuest {
    const name = userProfile.name || 'professional';
    const domain = userProfile.domain || 'your field';
    
    return {
      templateId: 1,
      platform: platform,
      personalizedTitle: `Share Your Expertise on ${platform}`,
      personalizedDescription: `Post valuable content on ${platform} that showcases your ${domain} expertise. Share insights, tips, or behind-the-scenes content that your audience will find valuable.`,
      personalizedMuskTip: `${name}, ${platform} is your stage. Show them what you know about ${domain}. Be authentic, be bold.`,
      variablesUsed: {
        user_name: name,
        platform: platform,
        fallback: true
      }
    };
  }
}

// Export singleton instance
export const socialQuestGeneratorV2 = new SocialQuestGeneratorV2();
