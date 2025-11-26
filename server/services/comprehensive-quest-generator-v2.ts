/**
 * Comprehensive Quest Generator V2
 * 
 * Generates REAL, ACHIEVABLE Brandentifier quests that map to actual platform features.
 * 
 * KEY CHANGES:
 * - Uses platform-activity-mapper to ensure quests are completable
 * - Checks profile completeness before generating profile_update quests
 * - Generates in-platform deliverables (pulses, portfolio projects, text fields)
 * - NO MORE EXTERNAL PDFS OR IMPOSSIBLE DELIVERABLES
 */

import { db } from '../db';
import { users, brandGoals } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { localAIService } from './local-ai-service';
import { 
  PLATFORM_ACTIVITIES, 
  PlatformActivity,
  getRecommendedQuestType 
} from './platform-activity-mapper';
import { ProfileCompletenessChecker, ProfileCompletenessResult, FieldAlignmentStatus } from './profile-completeness-checker';

export interface DetailedPersonalizedQuest {
  type: string;
  title: string;
  description: string;
  targetAction: string;
  xpReward: number;
  platform?: string;
  deliverableFormat: string;
  quantityValue: number;
  quantityType: string;
  platformConstraints: string;
  guidanceSnippet: string;
  estimatedTimeMinutes: number;
  muskTip: string;
  category: string;
  difficultyLevel: string;
}

export class ComprehensiveQuestGeneratorV2 {
  
  /**
   * Main entry point: Generate personalized quest based on profile and goals
   */
  async generatePersonalizedQuest(
    userId: number, 
    questDefinitionId: number,
    userProfile: any,
    selectedGoals: string[]
  ): Promise<DetailedPersonalizedQuest | null> {
    
    console.log(`[QuestGenV2] Generating quest for user ${userId} with definition ${questDefinitionId}`);
    
    // Step 1: Check profile completeness with enhanced alignment checking
    const profileCompleteness = await ProfileCompletenessChecker.checkProfileCompleteness(userId);
    console.log(`[QuestGenV2] Profile completeness: ${profileCompleteness.completionPercentage}%`, 
                `Missing: ${profileCompleteness.missingFields.join(', ')}`);
    
    // Step 2: Get quest definition to understand type
    const questDef = await this.getQuestDefinition(questDefinitionId);
    
    // Step 3: Determine appropriate quest type based on profile and goals
    const activityKey = `${questDef.type}_${questDef.targetAction}`;
    const activity = PLATFORM_ACTIVITIES[activityKey];
    
    if (!activity) {
      console.warn(`[QuestGenV2] No platform activity mapping found for ${activityKey}, using fallback`);
      return this.generateFallbackQuest(questDef, userProfile, selectedGoals);
    }
    
    // Step 4: Generate quest based on type (may return null if field is already satisfied)
    if (questDef.type === 'profile_update') {
      return this.generateProfileUpdateQuest(activity, userProfile, profileCompleteness, selectedGoals);
    } else if (questDef.type === 'pulse_creation') {
      return this.generatePulseCreationQuest(activity, userProfile, selectedGoals);
    } else if (questDef.type === 'portfolio') {
      return this.generatePortfolioQuest(activity, userProfile, selectedGoals);
    } else if (questDef.type === 'networking') {
      return this.generateNetworkingQuest(activity, userProfile, selectedGoals);
    } else {
      return this.generateGenericQuest(activity, userProfile, selectedGoals);
    }
  }
  
  /**
   * Generate profile update quest (text fields only)
   */
  private async generateProfileUpdateQuest(
    activity: PlatformActivity,
    userProfile: any,
    profileCompleteness: ProfileCompletenessResult,
    brandGoals: string[]
  ): Promise<DetailedPersonalizedQuest | null> {
    
    // Map targetAction to profile field name
    const fieldMapping: Record<string, string> = {
      'add_uvp': 'uniqueValueProposition',
      'add_vision_statement': 'visionStatement',
      'add_mission_statement': 'missionStatement',
      'add_core_values': 'coreValues',
      'add_tagline': 'tagline',
      'add_title': 'title',
      'add_about_me': 'aboutMe',
      'add_what_i_offer': 'whatIOffer',
    };
    
    const targetField = fieldMapping[activity.targetAction] || activity.targetAction.replace('add_', '');
    
    // Check if this field is already satisfied (filled AND aligned with brand goals)
    const fieldAlignment = profileCompleteness.fieldAlignments.find(f => f.field === targetField);
    
    // If satisfied, ask them to IMPROVE/REFINE instead of skipping
    const isRefinementQuest = fieldAlignment?.status === 'satisfied';
    if (isRefinementQuest) {
      console.log(`[QuestGenV2] Generating REFINEMENT quest for ${targetField} - user's field is satisfied, ask to improve`);
    }
    
    const name = userProfile.name || 'professional';
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your area';
    const primaryAudience = userProfile.primaryAudience?.[0] || 'industry professionals';
    
    const brandGoalLabel = brandGoals.includes('professional_1') 
      ? 'Position myself as an authority in my niche' 
      : 'Build my professional brand';
    
    // Check if field is misaligned - if so, inject context about what needs updating
    const misalignmentContext = fieldAlignment?.status === 'misaligned'
      ? `\n\nCURRENT VALUE ISSUE: ${fieldAlignment.reason}\nCurrent value: "${fieldAlignment.currentValue}"\n\nGenerate a quest that asks them to UPDATE this field to better align with their brand goals.`
      : '';
    
    // Build prompt that ENFORCES text field constraints
    const questAction = isRefinementQuest ? 'IMPROVE & REFINE' : (fieldAlignment?.status === 'misaligned' ? 'UPDATE' : 'fill');
    const prompt = `You are Musk, a career strategist. Generate a quest for ${name} to ${isRefinementQuest ? 'refine their existing' : 'complete their'} Brandentifier profile.

PROFILE:
- Name: ${name}
- Industry: ${industry}
- Domain: ${domain}
- Location: ${location}
- Primary Audience: ${primaryAudience}
- Brand Goal: ${brandGoalLabel}

QUEST TASK: ${activity.completionMethod}
CHARACTER LIMIT: ${activity.characterLimit || 'N/A'}
PLATFORM LOCATION: ${activity.platformFeature}${isRefinementQuest ? `\n\nCURRENT STATUS: User already has content here. Ask them to ENHANCE it, add more detail, or make it more compelling for their target audience.` : ''}${misalignmentContext}

Generate a quest that asks them to ${questAction} this profile field. Return ONLY valid JSON:

{
  "personalizedTitle": "Craft Your ${activity.targetAction.replace('add_', '').replace('_', ' ').toUpperCase()}",
  "personalizedDescription": "Write a ${activity.characterLimit}-character ${activity.targetAction.replace('add_', '')} for your Brandentifier profile that positions you as a ${domain} expert in ${location}. Target: ${primaryAudience}. Example: [provide specific example]. Keep it concise, impactful, and aligned with your goal: ${brandGoalLabel}.",
  "personalizedMuskTip": "Listen, ${name}. ${activity.characterLimit} characters. That's it. Make every word count. Focus on what makes you different as a ${domain} professional in ${location}. ${primaryAudience} don't have time for fluff—give them a reason to care. Be bold.",
  "deliverableFormat": "${activity.deliverableFormat}",
  "guidanceSnippet": "1. Think about your unique value as a ${domain} professional\\n2. Consider what ${primaryAudience} need to know\\n3. Draft 2-3 versions\\n4. Keep under ${activity.characterLimit} characters\\n5. Save to your profile",
  "estimatedTime": 15
}`;

    try {
      const response = await localAIService.generateNewsContent(prompt);
      const parsed = this.parseAIResponse(response);
      
      return {
        type: activity.questType,
        title: parsed.personalizedTitle,
        description: parsed.personalizedDescription,
        muskTip: parsed.personalizedMuskTip,
        deliverableFormat: activity.deliverableFormat,
        quantityValue: 1,
        quantityType: 'text_field',
        platformConstraints: activity.constraints,
        guidanceSnippet: parsed.guidanceSnippet,
        estimatedTimeMinutes: parsed.estimatedTime || 15,
        targetAction: activity.targetAction,
        xpReward: 30,
        platform: 'Brandentifier',
        category: 'career',
        difficultyLevel: 'beginner'
      };
    } catch (error) {
      console.error('[QuestGenV2] AI generation failed:', error);
      return this.profileUpdateFallback(activity, userProfile);
    }
  }
  
  /**
   * Generate pulse creation quest (post on Brandentifier)
   */
  private async generatePulseCreationQuest(
    activity: PlatformActivity,
    userProfile: any,
    brandGoals: string[]
  ): Promise<DetailedPersonalizedQuest> {
    
    const name = userProfile.name || 'professional';
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your area';
    const primaryAudience = userProfile.primaryAudience?.[0] || 'industry professionals';
    
    const brandGoalLabel = brandGoals.includes('professional_1') 
      ? 'Position myself as an authority in my niche' 
      : 'Increase my professional visibility';
    
    const prompt = `You are Musk, a content strategist. Generate a quest for ${name} to create a Brandentifier pulse (post).

PROFILE:
- Name: ${name}
- Industry: ${industry}
- Domain: ${domain}
- Location: ${location}
- Primary Audience: ${primaryAudience}
- Brand Goal: ${brandGoalLabel}

QUEST TASK: ${activity.completionMethod}
DELIVERABLE: ${activity.deliverableFormat}
PLATFORM: ${activity.platformFeature} (Brandentifier Industry Pulse feed)

Generate a quest that asks them to POST content on Brandentifier. Return ONLY valid JSON:

{
  "personalizedTitle": "Share ${location} ${domain} Success Story on Brandentifier",
  "personalizedDescription": "Create and publish a pulse post on Brandentifier's Industry Pulse feed. Share a recent ${domain} project or achievement from ${location}. Include: Problem you solved, your approach, measurable results, and lessons learned. Target: ${primaryAudience}. Format: 400-600 words + 2-3 professional images. This positions you as a ${domain} authority and supports your goal: ${brandGoalLabel}.",
  "personalizedMuskTip": "Real talk, ${name}. ${primaryAudience} don't care about theory—they want results. Lead with your biggest metric from ${location}: '50% revenue increase' or '100K impressions in 30 days'. Show the receipts. Post it on Brandentifier where it matters.",
  "deliverableFormat": "1 pulse post (400-600 words) + 2-3 images on Brandentifier Industry Pulse",
  "guidanceSnippet": "1. Open Brandentifier Industry Pulse\\n2. Click 'Create Pulse'\\n3. Write your success story (400-600 words)\\n4. Add 2-3 professional images\\n5. Include metrics and results\\n6. Publish publicly",
  "estimatedTime": 30
}`;

    try {
      const response = await localAIService.generateNewsContent(prompt);
      const parsed = this.parseAIResponse(response);
      
      return {
        type: activity.questType,
        title: parsed.personalizedTitle,
        description: parsed.personalizedDescription,
        muskTip: parsed.personalizedMuskTip,
        deliverableFormat: parsed.deliverableFormat || activity.deliverableFormat,
        quantityValue: 1,
        quantityType: 'pulse_post',
        platformConstraints: 'Must be published on Brandentifier Industry Pulse',
        guidanceSnippet: parsed.guidanceSnippet,
        estimatedTimeMinutes: parsed.estimatedTime || 30,
        targetAction: activity.targetAction,
        xpReward: 60,
        platform: 'Brandentifier',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
    } catch (error) {
      console.error('[QuestGenV2] AI generation failed:', error);
      return this.pulseCreationFallback(activity, userProfile);
    }
  }
  
  /**
   * Generate portfolio quest (add project to portfolio)
   */
  private async generatePortfolioQuest(
    activity: PlatformActivity,
    userProfile: any,
    brandGoals: string[]
  ): Promise<DetailedPersonalizedQuest> {
    
    const name = userProfile.name || 'professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your area';
    const primaryAudience = userProfile.primaryAudience?.[0] || 'industry professionals';
    
    const prompt = `You are Musk, a portfolio strategist. Generate a quest for ${name} to add a project to their Brandentifier portfolio.

PROFILE:
- Name: ${name}
- Domain: ${domain}
- Location: ${location}
- Primary Audience: ${primaryAudience}

QUEST TASK: ${activity.completionMethod}
DELIVERABLE: ${activity.deliverableFormat}
PLATFORM: ${activity.platformFeature}

Generate a quest that asks them to add a portfolio project on Brandentifier. Return ONLY valid JSON:

{
  "personalizedTitle": "Showcase ${location} ${domain} Project in Portfolio",
  "personalizedDescription": "Add a ${domain} project to your Brandentifier portfolio. Choose a recent project from ${location} that demonstrates your expertise to ${primaryAudience}. Include: Project title, description (300-500 words), challenge faced, your solution, measurable results, technologies/methods used, and 3-5 high-quality images.",
  "personalizedMuskTip": "${name}, portfolios separate talkers from doers. Show a real ${domain} project from ${location} with actual results. ${primaryAudience} want proof you can execute. Add it to Brandentifier where they'll see it.",
  "deliverableFormat": "1 portfolio project entry: title + 300-500 word description + 3-5 images + tech stack",
  "guidanceSnippet": "1. Go to Brandentifier Portfolio section\\n2. Click 'Add Project'\\n3. Enter project title and description\\n4. Upload 3-5 project images\\n5. List technologies/methods used\\n6. Include measurable outcomes\\n7. Publish project",
  "estimatedTime": 40
}`;

    try {
      const response = await localAIService.generateNewsContent(prompt);
      const parsed = this.parseAIResponse(response);
      
      return {
        type: activity.questType,
        title: parsed.personalizedTitle,
        description: parsed.personalizedDescription,
        muskTip: parsed.personalizedMuskTip,
        deliverableFormat: parsed.deliverableFormat || activity.deliverableFormat,
        quantityValue: 1,
        quantityType: 'portfolio_project',
        platformConstraints: 'Must be added to Brandentifier Portfolio section',
        guidanceSnippet: parsed.guidanceSnippet,
        estimatedTimeMinutes: parsed.estimatedTime || 40,
        targetAction: activity.targetAction,
        xpReward: 70,
        platform: 'Brandentifier',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
    } catch (error) {
      console.error('[QuestGenV2] AI generation failed:', error);
      return this.portfolioFallback(activity, userProfile);
    }
  }
  
  /**
   * Generate networking quest (engage with users)
   */
  private async generateNetworkingQuest(
    activity: PlatformActivity,
    userProfile: any,
    brandGoals: string[]
  ): Promise<DetailedPersonalizedQuest> {
    
    const name = userProfile.name || 'professional';
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    
    return {
      type: activity.questType,
      title: `Engage with ${industry} Professionals`,
      description: `${activity.completionMethod}. Find relevant posts in your industry and add value through thoughtful engagement. Focus on building meaningful connections with professionals in ${domain}.`,
      muskTip: `${name}, engagement isn't about likes—it's about adding value. Comment on ${industry} posts with real insights, not fluff. Build relationships that matter.`,
      deliverableFormat: activity.deliverableFormat,
      quantityValue: activity.targetAction.includes('comment') ? 1 : 5,
      quantityType: activity.targetAction.includes('comment') ? 'comment' : 'reactions',
      platformConstraints: activity.constraints,
      guidanceSnippet: `1. Browse Brandentifier Industry Pulse\\n2. Find ${industry} posts\\n3. ${activity.completionMethod}\\n4. Add thoughtful value`,
      estimatedTimeMinutes: 10,
      targetAction: activity.targetAction,
      xpReward: 20,
      platform: 'Brandentifier',
      category: 'career',
      difficultyLevel: 'beginner'
    };
  }
  
  /**
   * Generate generic quest for other types
   */
  private async generateGenericQuest(
    activity: PlatformActivity,
    userProfile: any,
    brandGoals: string[]
  ): Promise<DetailedPersonalizedQuest> {
    
    return {
      type: activity.questType,
      title: activity.platformFeature,
      description: activity.completionMethod,
      muskTip: `Complete this task on Brandentifier to level up your professional brand.`,
      deliverableFormat: activity.deliverableFormat,
      quantityValue: 1,
      quantityType: 'task',
      platformConstraints: activity.constraints,
      guidanceSnippet: activity.completionMethod,
      estimatedTimeMinutes: 20,
      targetAction: activity.targetAction,
      xpReward: 40,
      platform: 'Brandentifier',
      category: 'career',
      difficultyLevel: 'intermediate'
    };
  }
  
  /**
   * Parse AI response (handles JSON extraction)
   */
  private parseAIResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found');
    } catch (error) {
      console.error('[QuestGenV2] Failed to parse AI response:', error);
      return {
        personalizedTitle: 'Complete Your Profile',
        personalizedDescription: 'Fill in your profile details',
        personalizedMuskTip: 'Get it done.',
        deliverableFormat: 'Profile field',
        guidanceSnippet: '1. Go to profile\\n2. Fill the field\\n3. Save',
        estimatedTime: 15
      };
    }
  }
  
  /**
   * Fallback generators for each type
   */
  private profileUpdateFallback(activity: PlatformActivity, userProfile: any): DetailedPersonalizedQuest {
    return {
      type: activity.questType,
      title: `Complete Your ${activity.targetAction.replace('add_', '').toUpperCase()}`,
      description: activity.completionMethod,
      muskTip: `Fill in your ${activity.targetAction.replace('add_', '')}. Keep it under ${activity.characterLimit} characters.`,
      deliverableFormat: activity.deliverableFormat,
      quantityValue: 1,
      quantityType: 'text_field',
      platformConstraints: activity.constraints,
      guidanceSnippet: `1. Go to ${activity.platformFeature}\\n2. Fill the field\\n3. Stay under ${activity.characterLimit} characters\\n4. Save`,
      estimatedTimeMinutes: 15,
      targetAction: activity.targetAction,
      xpReward: 30,
      platform: 'Brandentifier',
      category: 'career',
      difficultyLevel: 'beginner'
    };
  }
  
  private pulseCreationFallback(activity: PlatformActivity, userProfile: any): DetailedPersonalizedQuest {
    const domain = userProfile.domain || 'professional';
    return {
      type: activity.questType,
      title: `Share Your ${domain} Success Story`,
      description: `Post a pulse on Brandentifier sharing a recent ${domain} achievement. Include metrics and lessons learned.`,
      muskTip: `Show results, not claims. Post it on Brandentifier where your network can see it.`,
      deliverableFormat: '1 pulse post (400-600 words) + 2-3 images',
      quantityValue: 1,
      quantityType: 'pulse_post',
      platformConstraints: 'Published on Brandentifier Industry Pulse',
      guidanceSnippet: '1. Open Industry Pulse\\n2. Click Create Pulse\\n3. Write 400-600 words\\n4. Add images\\n5. Publish',
      estimatedTimeMinutes: 30,
      targetAction: activity.targetAction,
      xpReward: 60,
      platform: 'Brandentifier',
      category: 'career',
      difficultyLevel: 'intermediate'
    };
  }
  
  private portfolioFallback(activity: PlatformActivity, userProfile: any): DetailedPersonalizedQuest {
    return {
      type: activity.questType,
      title: 'Add Project to Portfolio',
      description: 'Add a professional project to your Brandentifier portfolio with description, images, and tech stack.',
      muskTip: 'Portfolios prove competence. Add a real project with measurable results.',
      deliverableFormat: '1 portfolio project: title + description + 3-5 images',
      quantityValue: 1,
      quantityType: 'portfolio_project',
      platformConstraints: 'Added to Brandentifier Portfolio',
      guidanceSnippet: '1. Go to Portfolio\\n2. Add Project\\n3. Fill details\\n4. Upload images\\n5. Publish',
      estimatedTimeMinutes: 40,
      targetAction: activity.targetAction,
      xpReward: 70,
      platform: 'Brandentifier',
      category: 'career',
      difficultyLevel: 'intermediate'
    };
  }
  
  private generateFallbackQuest(questDef: any, userProfile: any, brandGoals: string[]): DetailedPersonalizedQuest {
    return {
      type: questDef.type,
      title: questDef.title || 'Complete Quest',
      description: questDef.description || 'Complete this quest to earn XP',
      muskTip: 'Get it done.',
      deliverableFormat: 'Complete the task',
      quantityValue: 1,
      quantityType: 'task',
      platformConstraints: 'On Brandentifier platform',
      guidanceSnippet: 'Follow the quest instructions',
      estimatedTimeMinutes: 20,
      targetAction: questDef.targetAction || 'complete_task',
      xpReward: questDef.xpReward || 40,
      platform: 'Brandentifier',
      category: 'career',
      difficultyLevel: 'intermediate'
    };
  }
  
  /**
   * Get quest definition from database
   */
  private async getQuestDefinition(questDefinitionId: number): Promise<any> {
    const { questDefinitions } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const questDef = await db.query.questDefinitions.findFirst({
      where: eq(questDefinitions.id, questDefinitionId)
    });
    
    if (!questDef) {
      throw new Error(`Quest definition ${questDefinitionId} not found`);
    }
    
    return questDef;
  }
}

// Export singleton instance
export const comprehensiveQuestGeneratorV2 = new ComprehensiveQuestGeneratorV2();
