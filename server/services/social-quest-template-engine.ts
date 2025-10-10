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
   * Intelligent platform selection based on user profile and Brand Goals
   * Returns 2-3 optimal platforms (NO BRANDENTIFIER)
   */
  async selectOptimalPlatforms(userId: number): Promise<string[]> {
    try {
      // Get user profile data
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) return ['linkedin', 'twitter']; // Default fallback

      const userProfile = user[0];

      // Get career goals for additional context
      const goals = await db
        .select()
        .from(careerGoals)
        .where(eq(careerGoals.userId, userId));

      // Platform-audience mapping based on industry, domain, Brand Goals
      const platformMapping = this.createPlatformMapping(userProfile, goals);
      
      // Select 2-3 most relevant platforms based on scores
      // Always include at least 2 platforms for diversity
      const topPlatforms = platformMapping.slice(0, 3);
      return topPlatforms.length >= 2 ? topPlatforms : [...topPlatforms, 'linkedin'];

    } catch (error) {
      console.error('[TemplateEngine] Error selecting platforms:', error);
      return ['linkedin', 'twitter']; // Safe fallback
    }
  }

  /**
   * Create intelligent platform mapping based on user profile
   * NO BRANDENTIFIER - only external platforms
   */
  private createPlatformMapping(user: any, goals: any[]): string[] {
    const platformScores: { [platform: string]: number } = {
      linkedin: 0,
      instagram: 0,
      twitter: 0,
      youtube: 0,
      facebook: 0,
      tiktok: 0,
      pinterest: 0,
      medium: 0,
      reddit: 0,
      google: 0  // Google My Business
    };

    // Industry-based platform preferences (NO BRANDENTIFIER)
    const industryPlatforms: { [industry: string]: string[] } = {
      'Technology': ['linkedin', 'twitter', 'reddit', 'medium', 'youtube'],
      'Healthcare': ['linkedin', 'medium', 'facebook', 'youtube', 'google'],
      'Finance': ['linkedin', 'twitter', 'medium', 'reddit'],
      'Hospitality': ['instagram', 'google', 'facebook', 'linkedin', 'pinterest'],
      'Real Estate': ['instagram', 'facebook', 'google', 'linkedin', 'youtube'],
      'Education': ['linkedin', 'medium', 'youtube', 'twitter', 'facebook'],
      'Marketing': ['instagram', 'linkedin', 'twitter', 'pinterest', 'tiktok'],
      'Design': ['instagram', 'pinterest', 'linkedin', 'medium', 'twitter'],
      'Retail': ['instagram', 'facebook', 'google', 'tiktok', 'pinterest'],
      'Media': ['instagram', 'twitter', 'tiktok', 'youtube', 'reddit'],
      'Consulting': ['linkedin', 'medium', 'twitter', 'google'],
      'Non-profit': ['facebook', 'instagram', 'linkedin', 'medium', 'twitter'],
      'Agriculture': ['facebook', 'instagram', 'youtube', 'linkedin', 'google'],
      'Manufacturing': ['linkedin', 'youtube', 'google', 'twitter', 'facebook'],
      'Legal': ['linkedin', 'medium', 'twitter', 'google'],
      'Arts': ['instagram', 'tiktok', 'pinterest', 'youtube', 'twitter']
    };

    // Domain-based platform preferences (NO BRANDENTIFIER)
    const domainPlatforms: { [domain: string]: string[] } = {
      'UX Design': ['instagram', 'pinterest', 'linkedin', 'medium', 'twitter'],
      'Software Development': ['twitter', 'reddit', 'linkedin', 'medium', 'youtube'],
      'Marketing': ['instagram', 'linkedin', 'twitter', 'pinterest', 'facebook'],
      'Sales': ['linkedin', 'twitter', 'facebook', 'google'],
      'Project Management': ['linkedin', 'medium', 'twitter', 'facebook'],
      'Content Creation': ['instagram', 'youtube', 'tiktok', 'medium', 'twitter'],
      'Data Science': ['linkedin', 'twitter', 'reddit', 'medium', 'youtube'],
      'HR': ['linkedin', 'facebook', 'medium', 'twitter'],
      'Customer Service': ['linkedin', 'twitter', 'facebook', 'reddit'],
      'Finance': ['linkedin', 'twitter', 'medium', 'reddit'],
      'Product Management': ['linkedin', 'twitter', 'medium', 'reddit'],
      'DevOps': ['twitter', 'reddit', 'linkedin', 'medium', 'youtube'],
      'Cybersecurity': ['linkedin', 'twitter', 'reddit', 'medium'],
      'AI/ML': ['twitter', 'reddit', 'linkedin', 'medium', 'youtube']
    };

    // Goal-based platform alignment (NO BRANDENTIFIER)
    const goalPlatforms: { [goal: string]: string[] } = {
      'networking': ['linkedin', 'twitter', 'facebook', 'reddit'],
      'job_search': ['linkedin', 'twitter', 'google'],
      'thought_leadership': ['linkedin', 'medium', 'twitter', 'youtube'],
      'brand_building': ['instagram', 'linkedin', 'pinterest', 'tiktok'],
      'skill_development': ['linkedin', 'youtube', 'medium', 'reddit'],
      'business_growth': ['linkedin', 'instagram', 'facebook', 'google'],
      'content_creation': ['instagram', 'youtube', 'tiktok', 'medium', 'twitter']
    };

    // Score platforms based on industry
    if (user.industry && industryPlatforms[user.industry]) {
      industryPlatforms[user.industry].forEach((platform, index) => {
        platformScores[platform] += (4 - index); // Higher score for earlier platforms
      });
    }

    // Score platforms based on domain
    if (user.domain && domainPlatforms[user.domain]) {
      domainPlatforms[user.domain].forEach((platform, index) => {
        platformScores[platform] += (4 - index);
      });
    }

    // Score platforms based on career goals
    goals.forEach(goal => {
      const goalType = this.categorizeGoal(goal.title);
      if (goalPlatforms[goalType]) {
        goalPlatforms[goalType].forEach((platform, index) => {
          platformScores[platform] += (3 - index);
        });
      }
    });

    // Always give LinkedIn a baseline score (it's universally valuable for professionals)
    platformScores.linkedin += 2;

    // Convert scores to sorted platform list
    return Object.entries(platformScores)
      .sort(([, a], [, b]) => b - a)
      .map(([platform]) => platform)
      .filter(platform => platformScores[platform] > 0);
  }

  /**
   * Categorize career goal into platform-relevant category
   */
  private categorizeGoal(goalTitle: string): string {
    const title = goalTitle.toLowerCase();
    
    if (title.includes('network') || title.includes('connect')) return 'networking';
    if (title.includes('job') || title.includes('career') || title.includes('position')) return 'job_search';
    if (title.includes('lead') || title.includes('expert') || title.includes('authority')) return 'thought_leadership';
    if (title.includes('brand') || title.includes('visibility') || title.includes('recognition')) return 'brand_building';
    if (title.includes('skill') || title.includes('learn') || title.includes('develop')) return 'skill_development';
    if (title.includes('business') || title.includes('revenue') || title.includes('client')) return 'business_growth';
    if (title.includes('content') || title.includes('create') || title.includes('publish')) return 'content_creation';
    
    return 'networking'; // Default fallback
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