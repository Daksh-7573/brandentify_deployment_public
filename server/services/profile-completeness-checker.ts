import { db } from '../db';
import { users, brandGoals, workExperiences, portfolios, skills } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface FieldAlignmentStatus {
  field: string;
  status: 'missing' | 'misaligned' | 'satisfied';
  reason?: string;
  currentValue?: string;
}

export interface ProfileCompletenessResult {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  focusArea: 'profile' | 'pulse';
  requiredFields: string[];
  fieldAlignments: FieldAlignmentStatus[];
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

      // Check which fields are missing AND check alignment with brand goals
      const missingFields: string[] = [];
      const fieldAlignments: FieldAlignmentStatus[] = [];

      for (const field of requiredFields) {
        if (field === 'work_experience') {
          const workExp = await db
            .select()
            .from(workExperiences)
            .where(eq(workExperiences.userId, userId))
            .limit(1);
          if (workExp.length === 0) {
            missingFields.push(field);
            fieldAlignments.push({ field, status: 'missing' });
          } else {
            fieldAlignments.push({ field, status: 'satisfied', currentValue: `${workExp.length} entries` });
          }
        } else if (field === 'portfolio') {
          const portfolio = await db
            .select()
            .from(portfolios)
            .where(eq(portfolios.userId, userId))
            .limit(1);
          if (portfolio.length === 0) {
            missingFields.push(field);
            fieldAlignments.push({ field, status: 'missing' });
          } else {
            fieldAlignments.push({ field, status: 'satisfied', currentValue: `${portfolio.length} projects` });
          }
        } else if (field === 'skills') {
          const userSkills = await db
            .select()
            .from(skills)
            .where(eq(skills.userId, userId))
            .limit(1);
          if (userSkills.length === 0) {
            missingFields.push(field);
            fieldAlignments.push({ field, status: 'missing' });
          } else {
            fieldAlignments.push({ field, status: 'satisfied', currentValue: `${userSkills.length} skills` });
          }
        } else {
          // Check user profile fields and validate alignment
          const fieldValue = (user as any)[field];
          if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
            missingFields.push(field);
            fieldAlignments.push({ field, status: 'missing' });
          } else {
            // Check if field aligns with brand goals
            const alignmentCheck = this.checkFieldAlignment(field, fieldValue, user, selectedGoals);
            fieldAlignments.push(alignmentCheck);
            if (alignmentCheck.status === 'misaligned') {
              missingFields.push(field); // Treat misaligned as missing
            }
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
        requiredFields,
        fieldAlignments
      };

    } catch (error) {
      console.error('[ProfileCompletenessChecker] Error:', error);
      return {
        isComplete: false,
        completionPercentage: 0,
        missingFields: ['error_checking_profile'],
        focusArea: 'profile',
        requiredFields: [],
        fieldAlignments: []
      };
    }
  }

  /**
   * Check if a profile field aligns with the user's brand goals
   */
  private static checkFieldAlignment(
    field: string,
    fieldValue: any,
    user: any,
    selectedGoals: string[]
  ): FieldAlignmentStatus {
    const valueStr = String(fieldValue).toLowerCase();
    const industry = user.industry?.toLowerCase() || '';
    const domain = user.domain?.toLowerCase() || '';
    const location = user.location?.toLowerCase() || '';
    const primaryAudience = user.primaryAudience?.toLowerCase() || '';
    
    // Extract keywords from field value
    const fieldTokens = valueStr.split(/[\s,]+/);
    
    // Check alignment for key profile fields
    if (field === 'uniqueValueProposition' || field === 'whatIOffer') {
      // UVP should mention industry OR domain
      const hasIndustry = industry && (valueStr.includes(industry) || fieldTokens.some(t => industry.includes(t) && t.length > 3));
      const hasDomain = domain && (valueStr.includes(domain) || fieldTokens.some(t => domain.includes(t) && t.length > 3));
      const hasLocation = location && valueStr.includes(location);
      
      if (!hasIndustry && !hasDomain) {
        return {
          field,
          status: 'misaligned',
          reason: `Should highlight your ${industry || domain} expertise`,
          currentValue: fieldValue.substring(0, 100)
        };
      }
    }
    
    if (field === 'visionStatement' || field === 'missionStatement') {
      // Vision should be relevant to audience or location
      const hasAudience = primaryAudience && valueStr.includes(primaryAudience);
      const hasLocation = location && valueStr.includes(location);
      const hasGoalKeywords = selectedGoals.some(goal => {
        const goalParts = goal.split('_');
        return goalParts.some(part => part.length > 4 && valueStr.includes(part));
      });
      
      if (!hasAudience && !hasLocation && !hasGoalKeywords) {
        return {
          field,
          status: 'misaligned',
          reason: `Should align with your target audience (${primaryAudience || 'not set'}) or goals`,
          currentValue: fieldValue.substring(0, 100)
        };
      }
    }
    
    if (field === 'title' || field === 'tagline') {
      // Title should mention industry or domain
      const hasIndustry = industry && valueStr.includes(industry);
      const hasDomain = domain && valueStr.includes(domain);
      
      if (!hasIndustry && !hasDomain && industry && domain) {
        return {
          field,
          status: 'misaligned',
          reason: `Should reflect your ${industry} or ${domain} focus`,
          currentValue: fieldValue.substring(0, 100)
        };
      }
    }
    
    // Field is satisfied if we reach here
    return {
      field,
      status: 'satisfied',
      currentValue: typeof fieldValue === 'string' ? fieldValue.substring(0, 50) : String(fieldValue)
    };
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
