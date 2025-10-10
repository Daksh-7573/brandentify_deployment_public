import { db } from '../db';
import { users, brandGoals, workExperiences, portfolios, skills } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface ProfileCompletenessResult {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  focusArea: 'profile' | 'pulse';
  requiredFields: string[];
}

export class ProfileCompletenessChecker {
  /**
   * Checks if user's profile is complete enough for Brand Goals
   * Returns focus area: 'profile' (build profile) or 'pulse' (create content)
   */
  static async checkProfileCompleteness(userId: number): Promise<ProfileCompletenessResult> {
    try {
      // Fetch user profile
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          isComplete: false,
          completionPercentage: 0,
          missingFields: ['user_not_found'],
          focusArea: 'profile',
          requiredFields: []
        };
      }

      // Fetch user's Brand Goals
      const [userGoals] = await db
        .select()
        .from(brandGoals)
        .where(eq(brandGoals.userId, userId))
        .limit(1);

      const selectedGoals = userGoals?.selectedGoals || [];

      // Determine required fields based on Brand Goals
      const requiredFields = this.getRequiredFieldsForGoals(selectedGoals);

      // Check which fields are missing
      const missingFields: string[] = [];

      for (const field of requiredFields) {
        if (field === 'work_experience') {
          const workExp = await db
            .select()
            .from(workExperiences)
            .where(eq(workExperiences.userId, userId))
            .limit(1);
          if (workExp.length === 0) missingFields.push(field);
        } else if (field === 'portfolio') {
          const portfolio = await db
            .select()
            .from(portfolios)
            .where(eq(portfolios.userId, userId))
            .limit(1);
          if (portfolio.length === 0) missingFields.push(field);
        } else if (field === 'skills') {
          const userSkills = await db
            .select()
            .from(skills)
            .where(eq(skills.userId, userId))
            .limit(1);
          if (userSkills.length === 0) missingFields.push(field);
        } else {
          // Check user profile fields
          const fieldValue = (user as any)[field];
          if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
            missingFields.push(field);
          }
        }
      }

      // Calculate completion percentage
      const completionPercentage = requiredFields.length > 0
        ? Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
        : 100;

      // Determine focus area
      // Profile is "complete" if 70% or more required fields are filled
      const isComplete = completionPercentage >= 70;
      const focusArea: 'profile' | 'pulse' = isComplete ? 'pulse' : 'profile';

      return {
        isComplete,
        completionPercentage,
        missingFields,
        focusArea,
        requiredFields
      };

    } catch (error) {
      console.error('[ProfileCompletenessChecker] Error:', error);
      return {
        isComplete: false,
        completionPercentage: 0,
        missingFields: ['error_checking_profile'],
        focusArea: 'profile',
        requiredFields: []
      };
    }
  }

  /**
   * Determines required profile fields based on selected Brand Goals
   */
  private static getRequiredFieldsForGoals(selectedGoals: string[]): string[] {
    // Core fields needed for ALL goals
    const coreFields = [
      'title',
      'industry', 
      'domain',
      'aboutMe',
      'whatIOffer',
      'location'
    ];

    const additionalFields = new Set<string>();

    selectedGoals.forEach(goalId => {
      // Visibility goals → Need strong online presence
      if (goalId.startsWith('visibility_')) {
        additionalFields.add('photoURL');
        additionalFields.add('tagline');
        additionalFields.add('primaryAudience');
      }

      // Professional goals → Need authority credentials
      if (goalId.startsWith('professional_')) {
        additionalFields.add('visionStatement');
        additionalFields.add('uniqueValueProposition');
        additionalFields.add('work_experience');
        additionalFields.add('skills');
      }

      // Engagement goals → Need community building
      if (goalId.startsWith('engagement_')) {
        additionalFields.add('missionStatement');
        additionalFields.add('coreValues');
        additionalFields.add('primaryAudience');
        additionalFields.add('secondaryAudience');
      }

      // Monetization goals → Need portfolio/proof
      if (goalId.startsWith('monetization_')) {
        additionalFields.add('portfolio');
        additionalFields.add('uniqueValueProposition');
        additionalFields.add('work_experience');
      }
    });

    return [...coreFields, ...Array.from(additionalFields)];
  }
}
