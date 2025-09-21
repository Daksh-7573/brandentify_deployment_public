import { db } from '../db';
import { 
  users, 
  workExperiences, 
  careerGoals, 
  socialQuestTemplates,
  socialQuestTemplateCategories,
  personalBrandVariables,
  templateAssignmentRules,
  generatedSocialQuests,
  questDefinitions
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface PersonalBrandData {
  uniqueExpertise: string;
  quantifiedAchievements: string[];
  signatureMethodology: string;
  careerStory: string;
  personalMission: string;
  targetAudience: string;
  competitiveAdvantage: string;
  coreValues: string[];
  contentThemes: string[];
  industryInsights: string[];
}

export interface GeneratedQuest {
  title: string;
  description: string;
  muskTip: string;
  platform: string;
  targetAction: string;
  brandImpact: string;
  callToAction: string;
  xpReward: number;
  estimatedTimeMinutes: number;
  templateId: number;
  variablesUsed: Record<string, any>;
}

export class SocialQuestTemplateEngine {

  /**
   * Extract and cache personal brand variables from user profile
   */
  async extractPersonalBrandVariables(userId: number): Promise<PersonalBrandData | null> {
    try {
      // Check if we already have cached brand variables
      const existingVars = await db
        .select()
        .from(personalBrandVariables)
        .where(eq(personalBrandVariables.userId, userId))
        .limit(1);

      if (existingVars.length > 0 && existingVars[0].isComplete) {
        console.log(`[TemplateEngine] Using cached brand variables for user ${userId}`);
        return {
          uniqueExpertise: existingVars[0].uniqueExpertise || '',
          quantifiedAchievements: existingVars[0].quantifiedAchievements as string[] || [],
          signatureMethodology: existingVars[0].signatureMethodology || '',
          careerStory: existingVars[0].careerStory || '',
          personalMission: existingVars[0].personalMission || '',
          targetAudience: existingVars[0].targetAudience || '',
          competitiveAdvantage: existingVars[0].competitiveAdvantage || '',
          coreValues: existingVars[0].coreValues as string[] || [],
          contentThemes: existingVars[0].contentThemes as string[] || [],
          industryInsights: existingVars[0].industryInsights as string[] || []
        };
      }

      // Get user profile data
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) return null;
      
      const userProfile = user[0];

      // Get work experiences
      const experiences = await db
        .select()
        .from(workExperiences)
        .where(eq(workExperiences.userId, userId))
        .orderBy(desc(workExperiences.startDate));

      // Get career goals
      const goals = await db
        .select()
        .from(careerGoals)
        .where(eq(careerGoals.userId, userId));

      // Extract brand variables using AI-like logic
      const brandData = await this.analyzeProfileForBrandVariables(userProfile, experiences, goals);

      // Cache the extracted variables
      if (existingVars.length > 0) {
        await db
          .update(personalBrandVariables)
          .set({
            ...brandData,
            lastUpdated: new Date(),
            isComplete: true
          })
          .where(eq(personalBrandVariables.userId, userId));
      } else {
        await db.insert(personalBrandVariables).values({
          userId,
          ...brandData,
          isComplete: true
        });
      }

      return brandData;

    } catch (error) {
      console.error(`[TemplateEngine] Error extracting brand variables for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Analyze user profile to extract personal brand variables
   */
  private async analyzeProfileForBrandVariables(
    user: any, 
    experiences: any[], 
    goals: any[]
  ): Promise<PersonalBrandData> {
    // Create unique expertise combination
    const uniqueExpertise = this.generateUniqueExpertise(user, experiences);
    
    // Extract quantified achievements from experiences
    const quantifiedAchievements = this.extractQuantifiedAchievements(experiences);
    
    // Generate signature methodology based on skills and experience
    const signatureMethodology = this.generateSignatureMethodology(user, experiences);
    
    // Create career story narrative
    const careerStory = this.generateCareerStory(user, experiences);
    
    // Define personal mission
    const personalMission = this.generatePersonalMission(user, goals);
    
    // Identify target audience
    const targetAudience = this.identifyTargetAudience(user, experiences);
    
    // Determine competitive advantage
    const competitiveAdvantage = this.generateCompetitiveAdvantage(user, experiences);
    
    // Extract core values
    const coreValues = this.extractCoreValues(user, goals);
    
    // Determine content themes
    const contentThemes = this.generateContentThemes(user, experiences);
    
    // Generate industry insights
    const industryInsights = this.generateIndustryInsights(user, experiences);

    return {
      uniqueExpertise,
      quantifiedAchievements,
      signatureMethodology,
      careerStory,
      personalMission,
      targetAudience,
      competitiveAdvantage,
      coreValues,
      contentThemes,
      industryInsights
    };
  }

  /**
   * Generate personalized quest using template and user brand variables
   */
  async generatePersonalizedQuest(
    userId: number, 
    platform: string
  ): Promise<GeneratedQuest | null> {
    try {
      // Get user's brand variables
      const brandData = await this.extractPersonalBrandVariables(userId);
      if (!brandData) return null;

      // Get user profile for template selection
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) return null;

      // Find appropriate template for this user and platform
      const template = await this.selectBestTemplate(user[0], platform);
      if (!template) return null;

      // Generate personalized content by replacing template variables
      const personalizedQuest = this.generateQuestFromTemplate(template, brandData, user[0]);

      return personalizedQuest;

    } catch (error) {
      console.error(`[TemplateEngine] Error generating personalized quest:`, error);
      return null;
    }
  }

  /**
   * Select the best template for a user based on profile and rules
   */
  private async selectBestTemplate(user: any, platform: string): Promise<any | null> {
    try {
      // Get templates for this platform
      const templates = await db
        .select({
          template: socialQuestTemplates,
          category: socialQuestTemplateCategories
        })
        .from(socialQuestTemplates)
        .innerJoin(
          socialQuestTemplateCategories, 
          eq(socialQuestTemplates.categoryId, socialQuestTemplateCategories.id)
        )
        .where(
          and(
            eq(socialQuestTemplates.platform, platform),
            eq(socialQuestTemplates.isActive, true),
            eq(socialQuestTemplateCategories.isActive, true)
          )
        );

      if (!templates.length) return null;

      // Score templates based on user profile compatibility
      let bestTemplate = null;
      let bestScore = 0;

      for (const { template, category } of templates) {
        const score = this.scoreTemplateForUser(template, category, user);
        if (score > bestScore) {
          bestScore = score;
          bestTemplate = { template, category };
        }
      }

      return bestTemplate;

    } catch (error) {
      console.error('[TemplateEngine] Error selecting template:', error);
      return null;
    }
  }

  /**
   * Score template compatibility with user profile
   */
  private scoreTemplateForUser(template: any, category: any, user: any): number {
    let score = category.priority || 3; // Base score from category priority

    // Boost score based on user's profile completion
    if (user.profileCompleted >= (category.minProfileCompletion || 50)) {
      score += 2;
    }

    // Industry/domain specific scoring
    if (user.industry && template.requiredUserData) {
      const requiredData = template.requiredUserData as string[];
      if (requiredData.includes('industry') && user.industry) score += 1;
      if (requiredData.includes('domain') && user.domain) score += 1;
    }

    return score;
  }

  /**
   * Generate final quest content from template and brand data
   */
  private generateQuestFromTemplate(
    templateData: any, 
    brandData: PersonalBrandData, 
    user: any
  ): GeneratedQuest {
    const { template, category } = templateData;
    const variables = template.variables as string[] || [];

    // Create variable substitution map
    const substitutions: Record<string, string> = {
      unique_expertise: brandData.uniqueExpertise,
      signature_methodology: brandData.signatureMethodology,
      career_story: brandData.careerStory,
      personal_mission: brandData.personalMission,
      target_audience: brandData.targetAudience,
      competitive_advantage: brandData.competitiveAdvantage,
      quantified_achievements: brandData.quantifiedAchievements[0] || 'significant results',
      platform: template.platform,
      user_name: user.name || 'professional',
      industry: user.industry || 'your industry',
      domain: user.domain || 'your field'
    };

    // Replace template variables in content
    const personalizedTitle = this.replaceTemplateVariables(template.title, substitutions);
    const personalizedDescription = this.replaceTemplateVariables(template.description, substitutions);
    const personalizedMuskTip = this.replaceTemplateVariables(template.muskTip, substitutions);

    return {
      title: personalizedTitle,
      description: personalizedDescription,
      muskTip: personalizedMuskTip,
      platform: template.platform,
      targetAction: template.targetAction,
      brandImpact: template.brandImpactDescription,
      callToAction: template.callToAction,
      xpReward: template.xpReward || 50,
      estimatedTimeMinutes: template.estimatedTimeMinutes || 15,
      templateId: template.id,
      variablesUsed: substitutions
    };
  }

  /**
   * Replace template variables with actual values
   */
  private replaceTemplateVariables(template: string, substitutions: Record<string, string>): string {
    let result = template;
    
    for (const [variable, value] of Object.entries(substitutions)) {
      const regex = new RegExp(`{${variable}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  // Helper methods for brand variable extraction
  private generateUniqueExpertise(user: any, experiences: any[]): string {
    if (user.industry && user.domain) {
      return `${user.domain} + ${user.industry} expertise`;
    }
    return user.title || 'Professional expertise';
  }

  private extractQuantifiedAchievements(experiences: any[]): string[] {
    const achievements: string[] = [];
    
    experiences.forEach(exp => {
      if (exp.description) {
        // Look for numbers and percentages in descriptions
        const matches = exp.description.match(/\d+%|\d+\+|\$\d+|\d+ years/gi);
        if (matches) {
          achievements.push(`${matches[0]} improvement in ${exp.title}`);
        }
      }
    });

    if (achievements.length === 0) {
      achievements.push('proven track record of results');
    }

    return achievements.slice(0, 3); // Top 3 achievements
  }

  private generateSignatureMethodology(user: any, experiences: any[]): string {
    if (experiences.length > 0) {
      return `proven ${experiences[0].title} methodology`;
    }
    return `systematic ${user.domain || 'professional'} approach`;
  }

  private generateCareerStory(user: any, experiences: any[]): string {
    if (experiences.length > 1) {
      const start = experiences[experiences.length - 1];
      const current = experiences[0];
      return `journey from ${start.title} to ${current.title}`;
    }
    return `professional growth in ${user.industry || 'my field'}`;
  }

  private generatePersonalMission(user: any, goals: any[]): string {
    if (goals.length > 0) {
      return `helping others achieve ${goals[0].title}`;
    }
    return `advancing ${user.domain || 'professional'} excellence`;
  }

  private identifyTargetAudience(user: any, experiences: any[]): string {
    return `${user.industry || 'professional'} leaders in ${user.location || 'my region'}`;
  }

  private generateCompetitiveAdvantage(user: any, experiences: any[]): string {
    const yearsExp = experiences.length;
    return `${yearsExp}+ years of specialized ${user.domain || 'professional'} expertise`;
  }

  private extractCoreValues(user: any, goals: any[]): string[] {
    const values = ['excellence', 'innovation', 'integrity'];
    if (user.aboutMe?.includes('help')) values.push('service');
    if (goals.some((g: any) => g.title.includes('team'))) values.push('collaboration');
    return values.slice(0, 3);
  }

  private generateContentThemes(user: any, experiences: any[]): string[] {
    const themes = [];
    if (user.industry) themes.push(`${user.industry} insights`);
    if (user.domain) themes.push(`${user.domain} strategies`);
    themes.push('professional development', 'industry trends');
    return themes.slice(0, 4);
  }

  private generateIndustryInsights(user: any, experiences: any[]): string[] {
    const insights = [];
    if (user.industry) {
      insights.push(`${user.industry} transformation trends`);
      insights.push(`emerging ${user.industry} technologies`);
    }
    insights.push('market evolution patterns', 'professional growth strategies');
    return insights.slice(0, 4);
  }
}

// Export singleton instance
export const socialQuestTemplateEngine = new SocialQuestTemplateEngine();