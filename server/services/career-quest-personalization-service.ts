import { db } from '../db';
import { users, questDefinitions } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface UserProfile {
  industry: string;
  domain: string;
  name?: string;
  title?: string;
}

export class CareerQuestPersonalizationService {
  
  /**
   * Get personalized content for a specific quest type based on user profile
   */
  getPersonalizedQuestContent(questType: string, targetAction: string, userProfile: UserProfile | null): {
    title: string;
    description: string;
    muskTip: string;
  } {
    if (!userProfile || !userProfile.industry || !userProfile.domain) {
      return this.getDefaultContent(questType, targetAction);
    }

    const { industry, domain } = userProfile;
    
    switch (targetAction) {
      case 'add_skill':
        return this.getPersonalizedSkillContent(industry, domain);
      case 'add_new_skill':
        return this.getPersonalizedLearningContent(industry, domain);
      case 'add_connection':
        return this.getPersonalizedNetworkingContent(industry, domain);
      case 'find_mentor':
        return this.getPersonalizedMentorContent(industry, domain);
      case 'update_resume':
        return this.getPersonalizedResumeContent(industry, domain);
      case 'add_project':
        return this.getPersonalizedPortfolioContent(industry, domain);
      case 'create_content':
        return this.getPersonalizedContentContent(industry, domain);
      default:
        return this.getDefaultContent(questType, targetAction);
    }
  }

  private getPersonalizedSkillContent(industry: string, domain: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    const skillSuggestions = this.getIndustrySkills(industry, domain);
    
    return {
      title: "Industry Skill Mastery",
      description: `Add at least 3 skills specific to ${industry} with appropriate proficiency levels`,
      muskTip: `Add skills that are specific to your industry and accurately rate your proficiency. For ${industry}/${domain}, consider skills like ${skillSuggestions.slice(0, 3).map(skill => `'${skill}'`).join(', ')}.`
    };
  }

  private getPersonalizedLearningContent(industry: string, domain: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    const learningFocus = this.getIndustryLearningFocus(industry, domain);
    
    return {
      title: "Learn New Skill",
      description: `Add a new ${industry.toLowerCase()}-related skill you've learned recently`,
      muskTip: `Focus on in-demand skills in ${industry}. Current growth areas include ${learningFocus}.`
    };
  }

  private getPersonalizedNetworkingContent(industry: string, domain: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    return {
      title: "Connection Builder",
      description: `Connect with ${industry.toLowerCase()} professionals and ${domain.toLowerCase()} specialists`,
      muskTip: `Quality connections in ${industry} are more valuable than quantity. Focus on ${domain} professionals, hotel managers, travel coordinators, and industry suppliers.`
    };
  }

  private getPersonalizedMentorContent(industry: string, domain: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    return {
      title: "Mentor Finder",
      description: `Identify and connect with a ${industry.toLowerCase()} industry mentor specializing in ${domain.toLowerCase()}`,
      muskTip: `Look for mentors with ${industry} leadership experience. ${domain} veterans can provide insights into revenue management, client relations, and operational excellence.`
    };
  }

  private getPersonalizedResumeContent(industry: string, domain: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    return {
      title: "Resume Enhancement",
      description: `Update your resume highlighting ${industry.toLowerCase()} achievements and ${domain.toLowerCase()} expertise`,
      muskTip: `Quantify your ${industry} impact with specific metrics. Include guest satisfaction scores, booking efficiency improvements, or cost savings you've achieved in ${domain}.`
    };
  }

  private getPersonalizedPortfolioContent(industry: string, domain: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    return {
      title: "Portfolio Builder",
      description: `Add a project showcasing your ${industry.toLowerCase()} expertise or ${domain.toLowerCase()} solutions`,
      muskTip: `Include ${industry} projects that demonstrate your impact. Case studies of successful ${domain} initiatives, process improvements, or customer experience enhancements work well.`
    };
  }

  private getPersonalizedContentContent(industry: string, domain: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    return {
      title: "Content Creator",
      description: `Share professional insights about ${industry.toLowerCase()} trends or ${domain.toLowerCase()} best practices`,
      muskTip: `${industry} content creators who share ${domain} insights receive 3x more opportunities. Focus on industry challenges, innovative solutions, and market trends.`
    };
  }

  private getIndustrySkills(industry: string, domain: string): string[] {
    // Map industries to relevant skills
    const industrySkillMap: Record<string, string[]> = {
      'Hospitality': [
        'Customer Service Excellence', 'Revenue Management', 'Hotel Operations',
        'Guest Relations', 'Food & Beverage Management', 'Event Planning',
        'Hospitality Technology', 'Quality Assurance', 'Staff Training',
        'Property Management Systems', 'Booking System Management'
      ],
      'Technology': [
        'Software Development', 'Data Analysis', 'Cloud Computing',
        'Machine Learning', 'API Development', 'Database Management',
        'DevOps', 'Cybersecurity', 'Mobile Development'
      ],
      'Finance': [
        'Financial Analysis', 'Risk Management', 'Investment Planning',
        'Portfolio Management', 'Compliance', 'Financial Modeling'
      ],
      'Healthcare': [
        'Clinical Research', 'Medical Device Development', 'Regulatory Compliance',
        'Patient Care', 'Healthcare IT', 'Medical Analysis'
      ],
      'Marketing': [
        'Digital Marketing', 'Content Strategy', 'SEO/SEM', 'Social Media Marketing',
        'Marketing Analytics', 'Brand Management', 'Campaign Management'
      ]
    };

    // Map domains to additional specialized skills
    const domainSkillMap: Record<string, string[]> = {
      'Corporate Travel': [
        'Travel Planning', 'Expense Management', 'Vendor Negotiation',
        'Travel Policy Implementation', 'Cost Optimization', 'Risk Assessment',
        'Travel Technology Systems', 'Corporate Account Management'
      ],
      'Software Development': [
        'React', 'Node.js', 'Python', 'JavaScript', 'Database Design',
        'API Integration', 'Testing', 'Version Control'
      ],
      'Data Science': [
        'Python', 'R', 'SQL', 'Machine Learning', 'Statistical Analysis',
        'Data Visualization', 'Big Data', 'Predictive Modeling'
      ]
    };

    const industrySkills = industrySkillMap[industry] || [];
    const domainSkills = domainSkillMap[domain] || [];
    
    return [...industrySkills, ...domainSkills];
  }

  private getIndustryLearningFocus(industry: string, domain: string): string {
    const focusMap: Record<string, Record<string, string>> = {
      'Hospitality': {
        'Corporate Travel': 'travel technology integration, expense management automation, and sustainable travel practices',
        'default': 'digital guest experience, revenue optimization, and hospitality technology'
      },
      'Technology': {
        'Software Development': 'AI integration, cloud-native development, and microservices architecture',
        'default': 'artificial intelligence, cloud computing, and cybersecurity'
      },
      'Finance': {
        'default': 'fintech, cryptocurrency, and automated trading systems'
      }
    };

    return focusMap[industry]?.[domain] || focusMap[industry]?.['default'] || 'emerging technologies and industry best practices';
  }

  private getDefaultContent(questType: string, targetAction: string): {
    title: string;
    description: string;
    muskTip: string;
  } {
    // Fallback to original generic content
    const defaultContent: Record<string, any> = {
      'add_skill': {
        title: "Industry Skill Mastery",
        description: "Add at least 3 skills specific to your industry with appropriate proficiency levels",
        muskTip: "Add skills that are specific to your industry and accurately rate your proficiency levels."
      },
      'add_new_skill': {
        title: "Learn New Skill",
        description: "Add a new skill you've learned recently",
        muskTip: "Focus on in-demand skills in your industry that can set you apart from competitors."
      }
    };

    return defaultContent[targetAction] || {
      title: "Career Quest",
      description: "Complete this career development milestone",
      muskTip: "Focus on continuous improvement and professional growth."
    };
  }

  /**
   * Update existing quest definitions with personalized content for a specific user
   */
  async updateQuestDefinitionsForUser(userId: number): Promise<void> {
    try {
      // Get user profile
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const userProfile = userResult.length > 0 ? {
        industry: userResult[0].industry || '',
        domain: userResult[0].domain || '',
        name: userResult[0].name || '',
        title: userResult[0].title || ''
      } : null;

      if (!userProfile) {
        console.log(`[CareerQuest] No user profile found for user ${userId}`);
        return;
      }

      console.log(`[CareerQuest] Personalizing quests for ${userProfile.name} - ${userProfile.industry}/${userProfile.domain}`);

      // Get career quest definitions that need personalization
      const careerQuestTypes = ['profile_update', 'learning', 'networking', 'resume', 'portfolio', 'pulse_creation'];
      
      // Update specific problematic quest
      const skillQuests = await db.select().from(questDefinitions).where(eq(questDefinitions.targetAction, 'add_skill'));
      
      if (skillQuests.length > 0) {
          const personalizedContent = this.getPersonalizedQuestContent('profile_update', 'add_skill', userProfile);
          
          await db.update(questDefinitions)
            .set({
              title: personalizedContent.title,
              description: personalizedContent.description,
              muskTip: personalizedContent.muskTip
            })
            .where(eq(questDefinitions.targetAction, 'add_skill'));
            
          console.log(`[CareerQuest] Updated skill mastery quest with ${userProfile.industry}/${userProfile.domain} content`);
        }

      console.log(`[CareerQuest] Successfully personalized career quests for user ${userId}`);
    } catch (error) {
      console.error(`[CareerQuest] Error personalizing quests for user ${userId}:`, error);
    }
  }
}

export const careerQuestPersonalizationService = new CareerQuestPersonalizationService();