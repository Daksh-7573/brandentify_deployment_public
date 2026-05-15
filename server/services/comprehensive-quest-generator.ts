/**
 * Comprehensive Quest Generator
 * 
 * Generates fully detailed, personalized quests for ALL quest types:
 * - pulse_creation
 * - portfolio
 * - resume
 * - learning
 * - social_quest
 * 
 * Each quest includes:
 * - Personalized title/description based on user profile
 * - Detailed deliverable specifications
 * - Specific quantities (# of images, slides, bullet points, etc.)
 * - Platform constraints and requirements
 * - Step-by-step guidance
 * - AI-generated Musk tip
 */

import { db } from '../db';
import { users, brandGoals } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { localAIService } from './local-ai-service';

export interface DetailedPersonalizedQuest {
  // Core quest data
  type: string;
  title: string;
  description: string;
  targetAction: string;
  xpReward: number;
  platform?: string;
  
  // Detailed specifications (like social quests)
  deliverableFormat: string;        // e.g., "3 images with captions, 600×400px each"
  quantityValue: number;            // e.g., 3
  quantityType: string;             // e.g., "images"
  platformConstraints: string;      // Specific requirements
  guidanceSnippet: string;          // Step-by-step guidance
  estimatedTimeMinutes: number;     // Time estimate
  
  // AI-generated content
  muskTip: string;                  // Personalized Musk tip
  
  // Metadata
  category: string;                 // 'career' or 'social'
  difficultyLevel: string;          // 'beginner' | 'intermediate' | 'advanced'
}

export class ComprehensiveQuestGenerator {
  
  /**
   * Generate fully detailed career quest (pulse_creation type) using AI
   */
  private async generatePulseCreationQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your area';
    const name = userProfile.name || 'professional';
    
    // Determine if this is an authority-building goal
    const isAuthorityGoal = brandGoals.includes('professional_1');
    const isVisibilityGoal = brandGoals.some(g => g.startsWith('visibility_'));
    
    // Determine brand goal label
    const brandGoalLabel = isAuthorityGoal ? 'Position myself as an authority in my niche' :
                           isVisibilityGoal ? 'Increase my professional visibility' :
                           'Build my professional brand';
    
    // Primary audience (simplified from user profile)
    const primaryAudience = userProfile.primaryAudience || 'industry professionals';
    
    try {
      console.log(`[ComprehensiveQuestGenerator] Generating AI-detailed pulse creation quest for ${name} in ${location}`);
      
      // Call Ollama AI to generate personalized quest
      const aiQuest = await localAIService.generateCareerQuest({
        questType: 'pulse_creation',
        baseTitle: `Share ${location} ${industry} Success Story`,
        baseDescription: `Create a pulse showcasing a ${domain} project with metrics and insights`,
        userProfile: {
          name,
          title: userProfile.title || 'Professional',
          industry,
          domain,
          location
        },
        brandGoal: brandGoalLabel,
        primaryAudience,
        variables: { isAuthorityGoal, isVisibilityGoal }
      });
      
      return {
        type: 'pulse_creation',
        title: aiQuest.personalizedTitle,
        description: aiQuest.personalizedDescription,
        muskTip: aiQuest.personalizedMuskTip,
        deliverableFormat: aiQuest.deliverableFormat,
        quantityValue: aiQuest.quantityValue,
        quantityType: aiQuest.quantityType,
        platformConstraints: aiQuest.platformConstraints,
        guidanceSnippet: aiQuest.guidanceSnippet,
        estimatedTimeMinutes: aiQuest.estimatedTime,
        targetAction: 'create_pulse',
        xpReward: 60,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
      
    } catch (error) {
      console.error('[ComprehensiveQuestGenerator] AI generation failed, using fallback:', error);
      // Fallback to template-based generation
      return {
        type: 'pulse_creation',
        title: `Share ${location} ${industry} Success Story with Data`,
        description: `Create a Brandentify pulse sharing a recent ${domain} success story from your work in ${location}. Include specific metrics, before/after results, and lessons learned.`,
        muskTip: `The best pulses show receipts, not claims. Lead with "${location} ${domain} project: [BIG METRIC]" in your opening line.`,
        deliverableFormat: `1 pulse post with 3 professional images (800×600px each)`,
        quantityValue: 3,
        quantityType: "images",
        platformConstraints: `Brandentify pulse format with actual project data`,
        guidanceSnippet: `Structure: Hook → Challenge → Solution → Results → Learning`,
        estimatedTimeMinutes: 35,
        targetAction: 'create_pulse',
        xpReward: 60,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
    }
  }
  
  /**
   * Generate fully detailed portfolio quest using AI
   */
  private async generatePortfolioQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your region';
    const name = userProfile.name || 'professional';
    
    const brandGoalLabel = brandGoals.includes('professional_1') ? 'Position myself as an authority in my niche' : 'Build my professional brand';
    const primaryAudience = userProfile.primaryAudience || 'industry professionals';
    
    try {
      console.log(`[ComprehensiveQuestGenerator] Generating AI-detailed portfolio quest for ${name}`);
      
      const aiQuest = await localAIService.generateCareerQuest({
        questType: 'portfolio',
        baseTitle: `Build Authority Portfolio: ${location} ${industry} Case Study`,
        baseDescription: `Create comprehensive case study showcasing ${domain} project with detailed strategy, execution, and results`,
        userProfile: {
          name,
          title: userProfile.title || 'Professional',
          industry,
          domain,
          location
        },
        brandGoal: brandGoalLabel,
        primaryAudience,
        variables: { projectFocus: domain }
      });
      
      return {
        type: 'portfolio',
        title: aiQuest.personalizedTitle,
        description: aiQuest.personalizedDescription,
        muskTip: aiQuest.personalizedMuskTip,
        deliverableFormat: aiQuest.deliverableFormat,
        quantityValue: aiQuest.quantityValue,
        quantityType: aiQuest.quantityType,
        platformConstraints: aiQuest.platformConstraints,
        guidanceSnippet: aiQuest.guidanceSnippet,
        estimatedTimeMinutes: aiQuest.estimatedTime,
        targetAction: 'create_portfolio',
        xpReward: 80,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'advanced'
      };
      
    } catch (error) {
      console.error('[ComprehensiveQuestGenerator] AI generation failed for portfolio, using fallback:', error);
      return {
        type: 'portfolio',
        title: `Build Authority Portfolio: ${location} ${industry} Case Study`,
        description: `Create a comprehensive case study showcasing your best ${domain} project from ${location}.`,
        muskTip: `Portfolio pieces that hide results hide weakness. Lead with your biggest number.`,
        deliverableFormat: `1 comprehensive case study with 7 sections`,
        quantityValue: 7,
        quantityType: "sections",
        platformConstraints: `Must include metrics, timeline, and stakeholder testimonials`,
        guidanceSnippet: `Structure: Summary → Challenge → Strategy → Timeline → Results → Testimonials → Lessons`,
        estimatedTimeMinutes: 45,
        targetAction: 'create_portfolio',
        xpReward: 80,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'advanced'
      };
    }
  }
  
  /**
   * Generate fully detailed resume quest using AI
   */
  private async generateResumeQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your region';
    const name = userProfile.name || 'professional';
    
    const brandGoalLabel = 'Demonstrate quantifiable professional impact';
    const primaryAudience = 'Recruiters and hiring managers';
    
    try {
      console.log(`[ComprehensiveQuestGenerator] Generating AI-detailed resume quest for ${name}`);
      
      const aiQuest = await localAIService.generateCareerQuest({
        questType: 'resume',
        baseTitle: `Quantify ${domain} Impact: Add Metric-Driven Achievements`,
        baseDescription: `Transform resume bullets into metric-driven achievement statements with ${domain} methodologies and ${location} context`,
        userProfile: {
          name,
          title: userProfile.title || 'Professional',
          industry,
          domain,
          location
        },
        brandGoal: brandGoalLabel,
        primaryAudience,
        variables: { focus: 'metrics and results' }
      });
      
      return {
        type: 'resume',
        title: aiQuest.personalizedTitle,
        description: aiQuest.personalizedDescription,
        muskTip: aiQuest.personalizedMuskTip,
        deliverableFormat: aiQuest.deliverableFormat,
        quantityValue: aiQuest.quantityValue,
        quantityType: aiQuest.quantityType,
        platformConstraints: aiQuest.platformConstraints,
        guidanceSnippet: aiQuest.guidanceSnippet,
        estimatedTimeMinutes: aiQuest.estimatedTime,
        targetAction: 'update_resume',
        xpReward: 50,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
      
    } catch (error) {
      console.error('[ComprehensiveQuestGenerator] AI generation failed for resume, using fallback:', error);
      return {
        type: 'resume',
        title: `Quantify ${domain} Impact: Add 5 Metric-Driven Achievements`,
        description: `Transform 5 resume bullet points into metric-driven statements with ${domain} methodologies.`,
        muskTip: `Recruiters spend 7 seconds on resumes - metrics are the only thing they remember.`,
        deliverableFormat: `5 quantified achievement bullets with metrics`,
        quantityValue: 5,
        quantityType: "achievements",
        platformConstraints: `Each bullet must include action verb, methodology, and quantified result`,
        guidanceSnippet: `Transform: Soft claim → Method → Metric → Context`,
        estimatedTimeMinutes: 25,
        targetAction: 'update_resume',
        xpReward: 50,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
    }
  }
  
  /**
   * Generate fully detailed learning quest using AI
   */
  private async generateLearningQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your region';
    const name = userProfile.name || 'professional';
    
    const brandGoalLabel = 'Stay ahead of industry trends and demonstrate thought leadership';
    const primaryAudience = `${industry} professionals in ${location}`;
    
    try {
      console.log(`[ComprehensiveQuestGenerator] Generating AI-detailed learning quest for ${name}`);
      
      const aiQuest = await localAIService.generateCareerQuest({
        questType: 'learning',
        baseTitle: `Research ${location} ${industry} Trends: Competitive Analysis`,
        baseDescription: `Conduct research on emerging ${industry} trends impacting ${location}, synthesize insights for ${domain} professionals`,
        userProfile: {
          name,
          title: userProfile.title || 'Professional',
          industry,
          domain,
          location
        },
        brandGoal: brandGoalLabel,
        primaryAudience,
        variables: { researchFocus: `${location} market trends` }
      });
      
      return {
        type: 'learning',
        title: aiQuest.personalizedTitle,
        description: aiQuest.personalizedDescription,
        muskTip: aiQuest.personalizedMuskTip,
        deliverableFormat: aiQuest.deliverableFormat,
        quantityValue: aiQuest.quantityValue,
        quantityType: aiQuest.quantityType,
        platformConstraints: aiQuest.platformConstraints,
        guidanceSnippet: aiQuest.guidanceSnippet,
        estimatedTimeMinutes: aiQuest.estimatedTime,
        targetAction: 'trend_research',
        xpReward: 40,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
      
    } catch (error) {
      console.error('[ComprehensiveQuestGenerator] AI generation failed for learning, using fallback:', error);
      return {
        type: 'learning',
        title: `Research ${location} ${industry} Trends: Competitive Analysis`,
        description: `Conduct competitive intelligence research on emerging ${industry} trends in ${location}.`,
        muskTip: `Generic trend reports are noise. Make yours specific to ${location} with local data.`,
        deliverableFormat: `1 research summary with 3 source analyses`,
        quantityValue: 3,
        quantityType: "sources",
        platformConstraints: `Sources must be recent, credible, and ${location}-specific`,
        guidanceSnippet: `Structure: Overview → Source analyses → Implications → Prediction`,
        estimatedTimeMinutes: 30,
        targetAction: 'trend_research',
        xpReward: 40,
        platform: 'Brandentify',
        category: 'career',
        difficultyLevel: 'intermediate'
      };
    }
  }
  
  /**
   * Generate AI-personalized career quests for a user
   */
  async generateDetailedCareerQuests(userId: number, count: number = 2): Promise<DetailedPersonalizedQuest[]> {
    try {
      // Get user profile
      const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
      if (!userProfile) {
        console.log('[ComprehensiveQuestGenerator] User not found');
        return [];
      }
      
      // Get user's brand goals
      const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));
      const selectedGoals = userBrandGoals?.selectedGoals || [];
      
      // Generate different quest types
      const quests: DetailedPersonalizedQuest[] = [];
      
      // Generate one of each type, then select based on count
      const [pulseQuest, portfolioQuest, resumeQuest, learningQuest] = await Promise.all([
        this.generatePulseCreationQuest(userProfile, selectedGoals),
        this.generatePortfolioQuest(userProfile, selectedGoals),
        this.generateResumeQuest(userProfile, selectedGoals),
        this.generateLearningQuest(userProfile, selectedGoals)
      ]);
      
      // Priority order based on brand goals
      if (selectedGoals.includes('professional_1')) {
        // Authority building - prioritize portfolio and pulse
        quests.push(portfolioQuest, pulseQuest, resumeQuest, learningQuest);
      } else if (selectedGoals.some(g => g.startsWith('visibility_'))) {
        // Visibility - prioritize pulse and learning
        quests.push(pulseQuest, learningQuest, portfolioQuest, resumeQuest);
      } else {
        // Default priority
        quests.push(pulseQuest, resumeQuest, learningQuest, portfolioQuest);
      }
      
      console.log(`[ComprehensiveQuestGenerator] Generated ${quests.length} detailed career quests for user ${userId}`);
      return quests.slice(0, count);
      
    } catch (error) {
      console.error('[ComprehensiveQuestGenerator] Error:', error);
      return [];
    }
  }
}

export const comprehensiveQuestGenerator = new ComprehensiveQuestGenerator();

