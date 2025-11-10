import { generateIntelligentCareerQuests, PersonalizedQuest, ProfileCompletionData } from './intelligent-career-quest-generator';
import { careerQuestPersonalizationService } from './career-quest-personalization-service';
import { db } from '../db';
import { users, skills, workExperiences, educations, projects } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Simple AI Quest Generator
 * Generates personalized AI quests without complex dependencies
 */
export class SimpleAIQuestGenerator {
  
  /**
   * Generate AI-personalized career quests for a user
   */
  async generateCareerQuests(userId: number): Promise<PersonalizedQuest[]> {
    try {
      // Get user profile data
      const [userData] = await db.select().from(users).where(eq(users.id, userId));
      if (!userData) {
        console.log('[SimpleAIQuestGenerator] User not found');
        return [];
      }

      // Get user skills, experiences, education, and projects
      const userSkills = await db.select().from(skills).where(eq(skills.userId, userId));
      const userExperiences = await db.select().from(workExperiences).where(eq(workExperiences.userId, userId));
      const userEducations = await db.select().from(educations).where(eq(educations.userId, userId));
      const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));

      // Generate intelligent career quests using the existing generator
      const quests = generateIntelligentCareerQuests(
        userData,
        userSkills,
        userExperiences,
        userEducations,
        userProjects
      );

      console.log(`[SimpleAIQuestGenerator] Generated ${quests.length} AI career quests for user ${userId}`);
      return quests;
      
    } catch (error) {
      console.error('[SimpleAIQuestGenerator] Error generating career quests:', error);
      return [];
    }
  }

  /**
   * Generate AI-personalized social quests for a user
   */
  async generateSocialQuests(userId: number): Promise<PersonalizedQuest[]> {
    try {
      // Get user profile
      const [userData] = await db.select().from(users).where(eq(users.id, userId));
      if (!userData) {
        return [];
      }

      // Generate simple social quest suggestions based on user profile
      const quests: PersonalizedQuest[] = [];
      
      const userProfile = {
        industry: userData.industry || 'Professional',
        domain: userData.domain || 'General',
        name: userData.name,
        title: userData.title
      };

      // LinkedIn post quest
      const linkedInContent = await careerQuestPersonalizationService.getPersonalizedQuestContent(
        'social_post',
        'linkedin_post',
        userProfile
      );

      quests.push({
        title: linkedInContent.title,
        description: linkedInContent.description,
        type: 'social_post',
        targetAction: 'linkedin_post',
        mediaSpecific: 'LinkedIn',
        xpReward: 50,
        priority: 'high',
        difficulty: 'intermediate'
      });

      // Brandentifier pulse quest
      const pulseContent = await careerQuestPersonalizationService.getPersonalizedQuestContent(
        'pulse_creation',
        'create_pulse',
        userProfile
      );

      quests.push({
        title: pulseContent.title || 'Share Industry Insights',
        description: pulseContent.description || `Create a Brandentifier pulse sharing your insights on ${userProfile.industry}`,
        type: 'pulse_creation',
        targetAction: 'create_pulse',
        mediaSpecific: 'Brandentifier',
        xpReward: 40,
        priority: 'medium',
        difficulty: 'beginner'
      });

      console.log(`[SimpleAIQuestGenerator] Generated ${quests.length} AI social quests for user ${userId}`);
      return quests;
      
    } catch (error) {
      console.error('[SimpleAIQuestGenerator] Error generating social quests:', error);
      return [];
    }
  }

  /**
   * Get a mix of AI-generated career and social quests
   */
  async generateMixedQuests(userId: number, careerCount: number = 1, socialCount: number = 1): Promise<{
    career: PersonalizedQuest[];
    social: PersonalizedQuest[];
  }> {
    const [careerQuests, socialQuests] = await Promise.all([
      this.generateCareerQuests(userId),
      this.generateSocialQuests(userId)
    ]);

    return {
      career: careerQuests.slice(0, careerCount),
      social: socialQuests.slice(0, socialCount)
    };
  }
}

export const simpleAIQuestGenerator = new SimpleAIQuestGenerator();
