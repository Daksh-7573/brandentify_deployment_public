import { db } from '../db';
import { users, personalBrandVariables, skills, workExperiences, educations, projects, questDefinitions } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface GeneratedCareerQuest {
  title: string;
  description: string;
  muskTip: string;
  questType: string;
  variablesUsed: Record<string, any>;
  xpReward: number;
  difficulty: string;
  questDefinitionId: number;
}

/**
 * AI-Powered Career Quest Generator
 * Uses Ollama AI to generate personalized career development quests
 */
export class AICareerQuestGenerator {
  
  /**
   * Generate a personalized career quest using AI
   */
  async generatePersonalizedCareerQuest(userId: number): Promise<GeneratedCareerQuest | null> {
    console.log(`[AICareerQuestGenerator] Generating personalized career quest for user ${userId}`);
    
    // 1. Get user profile data
    const userData = await this.getUserProfileData(userId);
    if (!userData.user) {
      console.log(`[AICareerQuestGenerator] User ${userId} not found`);
      return null;
    }

    // 2. Get brand variables
    const brandVars = await this.getBrandVariables(userId);
    
    // 3. Analyze profile completion
    const profileAnalysis = this.analyzeProfileCompletion(userData);
    
    // 4. Determine quest focus
    const questFocus = this.determineQuestFocus(profileAnalysis, userData);
    
    // 5. Generate AI-personalized quest
    const aiQuest = await this.generateAIQuest(userData, brandVars, questFocus, profileAnalysis);
    
    return aiQuest;
  }

  /**
   * Get user profile data including skills, experience, education, projects
   */
  private async getUserProfileData(userId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    const userSkills = await db.select().from(skills).where(eq(skills.userId, userId));
    const experiences = await db.select().from(workExperiences).where(eq(workExperiences.userId, userId));
    const userEducations = await db.select().from(educations).where(eq(educations.userId, userId));
    const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));

    return { user, skills: userSkills, experiences, educations: userEducations, projects: userProjects };
  }

  /**
   * Get personal brand variables for user
   */
  private async getBrandVariables(userId: number) {
    const [brandVars] = await db
      .select()
      .from(personalBrandVariables)
      .where(eq(personalBrandVariables.userId, userId));
    
    return brandVars || null;
  }

  /**
   * Analyze profile completion to identify gaps
   */
  private analyzeProfileCompletion(userData: any) {
    const { user, skills, experiences, educations, projects } = userData;
    
    const missingElements = [];
    const completedElements = [];
    
    if (!user.title || user.title.length < 3) missingElements.push('professional_title');
    else completedElements.push('professional_title');
    
    if (!user.aboutMe || user.aboutMe.length < 50) missingElements.push('bio');
    else completedElements.push('bio');
    
    if (skills.length < 3) missingElements.push('skills');
    else completedElements.push('skills');
    
    if (experiences.length === 0) missingElements.push('experience');
    else completedElements.push('experience');
    
    if (educations.length === 0) missingElements.push('education');
    else completedElements.push('education');
    
    if (projects.length === 0) missingElements.push('projects');
    else completedElements.push('projects');
    
    const completionPercentage = Math.round((completedElements.length / 6) * 100);
    
    return {
      completionPercentage,
      missingElements,
      completedElements,
      isComplete: completionPercentage >= 80
    };
  }

  /**
   * Determine quest focus based on profile analysis
   */
  private determineQuestFocus(profileAnalysis: any, userData: any) {
    // If profile is incomplete, prioritize completion
    if (profileAnalysis.missingElements.length > 0) {
      return {
        type: 'profile_update',
        focus: profileAnalysis.missingElements[0],
        priority: 'high'
      };
    }
    
    // If profile is complete, focus on content creation
    const { user } = userData;
    if (user.industry && user.domain) {
      return {
        type: 'pulse_creation',
        focus: 'industry_insight',
        priority: 'medium'
      };
    }
    
    // Default to skill development
    return {
      type: 'skill_development',
      focus: 'professional_growth',
      priority: 'medium'
    };
  }

  /**
   * Generate AI-personalized quest using Ollama
   */
  private async generateAIQuest(
    userData: any,
    brandVars: any,
    questFocus: any,
    profileAnalysis: any
  ): Promise<GeneratedCareerQuest | null> {
    const { user } = userData;
    
    // Get matching quest definition
    const questDef = await this.getMatchingQuestDefinition(questFocus.type);
    if (!questDef) {
      console.log(`[AICareerQuestGenerator] No matching quest definition for type: ${questFocus.type}`);
      return null;
    }

    // Build context
    const context = {
      name: user.name || 'Professional',
      title: user.title || 'Professional',
      industry: user.industry || 'your industry',
      domain: user.domain || 'your field',
      location: user.location || 'your location',
      expertiseArea: brandVars?.uniqueExpertise || user.title || 'your field',
      uniqueValue: brandVars?.competitiveAdvantage || 'your unique skills',
      targetAudience: brandVars?.targetAudience || 'professionals in your network',
      questType: questFocus.type,
      focusArea: questFocus.focus,
      missingElements: profileAnalysis.missingElements.join(', '),
      completionPercentage: profileAnalysis.completionPercentage
    };

    // Generate personalized quest using templates
    return this.generatePersonalizedQuest(context, questFocus, questDef);
  }

  /**
   * Generate personalized quest using templates and context
   */
  private generatePersonalizedQuest(context: any, questFocus: any, questDef: any): GeneratedCareerQuest {
    const templates = this.getQuestTemplates(questFocus.type);
    const template = templates[questFocus.focus] || templates.default;
    
    // Personalize the template with user context
    const title = this.personalizeText(template.title, context);
    const description = this.personalizeText(template.description, context);
    const muskTip = this.personalizeText(template.muskTip, context);
    
    return {
      title,
      description,
      muskTip,
      questType: questDef.type,
      variablesUsed: context,
      xpReward: template.xpReward || questDef.xpReward || 50,
      difficulty: template.difficulty || questDef.difficulty || 'intermediate',
      questDefinitionId: questDef.id
    };
  }

  /**
   * Get quest templates for different quest types
   */
  private getQuestTemplates(questType: string): Record<string, any> {
    const templates: Record<string, any> = {
      profile_update: {
        professional_title: {
          title: "Define Your Professional Identity",
          description: "Add your current professional title to establish credibility and help your network understand what you do. Your title is often the first thing people see - make it count.",
          muskTip: "No title = no authority. Fix that. Now.",
          xpReward: 40,
          difficulty: 'beginner'
        },
        bio: {
          title: "Craft Your Professional Story",
          description: "Write a compelling bio that showcases your background, expertise, and career goals. A strong bio is your elevator pitch - it needs to hook people in the first sentence.",
          muskTip: "Boring bios get ignored. Write like you're pitching your value in 30 seconds.",
          xpReward: 50,
          difficulty: 'intermediate'
        },
        skills: {
          title: "Showcase Your Expertise",
          description: "Add at least 3 professional skills that highlight your capabilities. Skills make you discoverable and help potential employers or collaborators understand what you bring to the table.",
          muskTip: "No skills listed = invisible to recruiters. Simple math.",
          xpReward: 40,
          difficulty: 'beginner'
        },
        experience: {
          title: "Build Your Career Timeline",
          description: "Add your work experience to show your career progression and achievements. Your experience tells the story of your professional journey - make it compelling.",
          muskTip: "Empty work history screams amateur. Add your wins.",
          xpReward: 60,
          difficulty: 'intermediate'
        },
        education: {
          title: "Document Your Foundation",
          description: "Add your educational background to establish your qualifications. Education builds credibility, especially early in your career.",
          muskTip: "Credentials matter. List them or get overlooked.",
          xpReward: 40,
          difficulty: 'beginner'
        },
        projects: {
          title: "Prove Your Impact",
          description: "Showcase a project that demonstrates your skills in action. Projects show you can execute, not just talk about ideas.",
          muskTip: "Talk is cheap. Show what you've built.",
          xpReward: 70,
          difficulty: 'advanced'
        },
        default: {
          title: "Complete Your Profile",
          description: "Strengthen your professional profile by adding missing information. A complete profile increases your visibility and credibility.",
          muskTip: "Incomplete profiles look unprofessional. Fix it.",
          xpReward: 50,
          difficulty: 'intermediate'
        }
      },
      pulse_creation: {
        industry_insight: {
          title: "Share {domain} Expertise",
          description: "Write an article sharing your insights on current trends in {industry}. Position yourself as a thought leader by teaching what you know to {targetAudience}.",
          muskTip: "Thought leaders teach. Followers stay quiet. Pick one.",
          xpReward: 85,
          difficulty: 'advanced'
        },
        default: {
          title: "Create Value-Driven Content",
          description: "Share content that provides real value to your professional network. Quality content builds your reputation faster than anything else.",
          muskTip: "Create or get forgotten. Your choice.",
          xpReward: 75,
          difficulty: 'intermediate'
        }
      },
      skill_development: {
        default: {
          title: "Expand Your Capabilities",
          description: "Add a new skill that aligns with {industry} demands. Continuous learning is the only way to stay relevant in a rapidly changing market.",
          muskTip: "Stagnate or evolve. The market doesn't wait.",
          xpReward: 60,
          difficulty: 'intermediate'
        }
      }
    };

    return templates[questType] || { default: templates.skill_development.default };
  }

  /**
   * Personalize template text with user context
   */
  private personalizeText(template: string, context: any): string {
    return template
      .replace(/{name}/g, context.name)
      .replace(/{title}/g, context.title)
      .replace(/{industry}/g, context.industry)
      .replace(/{domain}/g, context.domain)
      .replace(/{expertiseArea}/g, context.expertiseArea)
      .replace(/{targetAudience}/g, context.targetAudience)
      .replace(/{location}/g, context.location);
  }

  /**
   * Get matching quest definition from database
   */
  private async getMatchingQuestDefinition(questType: string) {
    const [questDef] = await db
      .select()
      .from(questDefinitions)
      .where(eq(questDefinitions.type, questType))
      .limit(1);
    
    return questDef || null;
  }
}

export const aiCareerQuestGenerator = new AICareerQuestGenerator();
