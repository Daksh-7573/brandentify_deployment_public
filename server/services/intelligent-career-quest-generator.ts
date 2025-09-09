import { UserProfileData } from '../decision-engine/context/context-enricher';

export interface PersonalizedQuest {
  title: string;
  description: string;
  type: string;
  targetAction: string;
  mediaSpecific: string;
  xpReward: number;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ProfileCompletionData {
  score: number;
  percentage: number;
  missingFields: string[];
  strengths: string[];
  isComplete: boolean;
}

/**
 * Calculate comprehensive profile completion score
 */
export function calculateProfileCompletion(userData: any, skills: any[] = [], experiences: any[] = [], educations: any[] = [], projects: any[] = []): ProfileCompletionData {
  let score = 0;
  let totalFactors = 10; // Total possible completion factors
  const missingFields: string[] = [];
  const strengths: string[] = [];

  // Core profile information (5 factors)
  if (userData?.name) {
    score++;
    strengths.push('Personal information');
  } else {
    missingFields.push('Full name');
  }

  if (userData?.title) {
    score++;
    strengths.push('Professional title');
  } else {
    missingFields.push('Professional title');
  }

  if (userData?.location) {
    score++;
    strengths.push('Location details');
  } else {
    missingFields.push('Location');
  }

  if (userData?.industry) {
    score++;
    strengths.push('Industry specialization');
  } else {
    missingFields.push('Industry');
  }

  if (userData?.aboutMe && userData.aboutMe.length > 50) {
    score++;
    strengths.push('Detailed bio');
  } else {
    missingFields.push('Comprehensive about me section');
  }

  // Professional data (5 factors)
  if (userData?.photoURL) {
    score++;
    strengths.push('Professional photo');
  } else {
    missingFields.push('Profile photo');
  }

  if (experiences?.length > 0) {
    score++;
    strengths.push('Work experience');
  } else {
    missingFields.push('Work experience');
  }

  if (educations?.length > 0) {
    score++;
    strengths.push('Educational background');
  } else {
    missingFields.push('Education details');
  }

  if (skills?.length >= 3) {
    score++;
    strengths.push('Skill portfolio');
  } else {
    missingFields.push('At least 3 professional skills');
  }

  if (projects?.length > 0) {
    score++;
    strengths.push('Project portfolio');
  } else {
    missingFields.push('Project showcase');
  }

  const percentage = Math.round((score / totalFactors) * 100);
  
  return {
    score,
    percentage,
    missingFields,
    strengths,
    isComplete: percentage >= 80
  };
}

/**
 * Generate industry-specific career quests based on user profile
 */
export function generateIntelligentCareerQuests(
  userData: any,
  skills: any[] = [],
  experiences: any[] = [],
  educations: any[] = [],
  projects: any[] = []
): PersonalizedQuest[] {
  const quests: PersonalizedQuest[] = [];
  const profileCompletion = calculateProfileCompletion(userData, skills, experiences, educations, projects);
  
  // If profile is incomplete, add specific completion quests
  if (!profileCompletion.isComplete) {
    quests.push(...generateProfileCompletionQuests(profileCompletion.missingFields));
  }

  // Generate industry-specific content quests
  const industry = userData?.industry?.toLowerCase();
  const domain = userData?.domain?.toLowerCase();
  
  if (industry && domain) {
    quests.push(...generateIndustrySpecificQuests(industry, domain, userData));
  }

  // Add general professional development quests
  quests.push(...generateProfessionalDevelopmentQuests(userData, skills, experiences));

  return quests.slice(0, 5); // Return top 5 prioritized quests
}

/**
 * Generate specific quests for missing profile fields
 */
function generateProfileCompletionQuests(missingFields: string[]): PersonalizedQuest[] {
  const quests: PersonalizedQuest[] = [];
  
  for (const field of missingFields.slice(0, 2)) { // Focus on top 2 missing fields
    if (field.includes('skills')) {
      quests.push({
        title: 'Showcase Your Expertise',
        description: 'Add your top 5 professional skills to highlight your capabilities to potential employers and collaborators',
        type: 'profile_update',
        targetAction: 'add_skills',
        mediaSpecific: 'skills list: Add technologies, tools, and competencies you use professionally',
        xpReward: 40,
        priority: 'high',
        difficulty: 'beginner'
      });
    } else if (field.includes('experience')) {
      quests.push({
        title: 'Build Your Professional Story',
        description: 'Add your work experience to show your career progression and achievements',
        type: 'profile_update',
        targetAction: 'add_experience',
        mediaSpecific: 'work history: Include job titles, companies, dates, and key accomplishments',
        xpReward: 50,
        priority: 'high',
        difficulty: 'beginner'
      });
    } else if (field.includes('about me')) {
      quests.push({
        title: 'Craft Your Professional Summary',
        description: 'Write a compelling bio that showcases your background, goals, and what makes you unique',
        type: 'profile_update',
        targetAction: 'update_bio',
        mediaSpecific: 'professional summary: 3-4 sentences highlighting your expertise and career aspirations',
        xpReward: 35,
        priority: 'high',
        difficulty: 'intermediate'
      });
    }
  }
  
  return quests;
}

/**
 * Generate quests based on user's industry and domain
 */
function generateIndustrySpecificQuests(industry: string, domain: string, userData: any): PersonalizedQuest[] {
  const quests: PersonalizedQuest[] = [];
  const name = userData?.name || 'Professional';
  
  // Hospitality + Corporate Travel specific quests
  if (industry.includes('hospitality') && domain.includes('corporate travel')) {
    quests.push(
      {
        title: 'Travel Cost Optimization Insights',
        description: `Share your expertise on reducing corporate travel expenses. Create a detailed analysis of cost-saving strategies in ${domain}`,
        type: 'pulse_creation',
        targetAction: 'create_travel_insight',
        mediaSpecific: 'infographic: Travel expense comparison chart, cost-saving breakdown, or ROI analysis showing before/after optimization results',
        xpReward: 85,
        priority: 'high',
        difficulty: 'intermediate'
      },
      {
        title: 'Corporate Travel Policy Guide',
        description: 'Document best practices for corporate travel management based on your hospitality industry experience',
        type: 'pulse_creation',
        targetAction: 'create_policy_guide',
        mediaSpecific: 'document: Travel policy template, compliance checklist, or vendor comparison spreadsheet',
        xpReward: 75,
        priority: 'medium',
        difficulty: 'advanced'
      },
      {
        title: 'Hospitality Technology Showcase',
        description: 'Highlight innovative technologies transforming the hospitality and travel management industry',
        type: 'pulse_creation',
        targetAction: 'showcase_tech_innovation',
        mediaSpecific: 'image: Screenshots of travel booking platforms, expense management tools, or hospitality software demos',
        xpReward: 70,
        priority: 'medium',
        difficulty: 'intermediate'
      }
    );
  }
  
  // Healthcare industry quests
  else if (industry.includes('healthcare') || industry.includes('medical')) {
    quests.push(
      {
        title: 'Healthcare Innovation Spotlight',
        description: 'Share insights on latest medical technologies or treatment innovations in your field',
        type: 'pulse_creation',
        targetAction: 'create_healthcare_insight',
        mediaSpecific: 'image: Medical equipment photos, treatment workflow diagrams, or healthcare technology screenshots',
        xpReward: 80,
        priority: 'high',
        difficulty: 'intermediate'
      },
      {
        title: 'Patient Care Case Study',
        description: 'Document a successful patient outcome or care improvement initiative (anonymized)',
        type: 'pulse_creation',
        targetAction: 'create_case_study',
        mediaSpecific: 'document: Care improvement metrics, patient satisfaction data, or treatment protocol flowchart',
        xpReward: 90,
        priority: 'high',
        difficulty: 'advanced'
      }
    );
  }
  
  // Technology industry quests
  else if (industry.includes('technology') || industry.includes('software')) {
    quests.push(
      {
        title: 'Technical Solution Deep-Dive',
        description: 'Share a detailed breakdown of a technical challenge you solved and the approach you used',
        type: 'pulse_creation',
        targetAction: 'create_tech_solution',
        mediaSpecific: 'image: Code snippets, architecture diagrams, performance benchmarks, or before/after metrics',
        xpReward: 85,
        priority: 'high',
        difficulty: 'advanced'
      },
      {
        title: 'Industry Tool Comparison',
        description: 'Create a comprehensive comparison of tools or frameworks in your technology domain',
        type: 'pulse_creation',
        targetAction: 'create_tool_comparison',
        mediaSpecific: 'document: Feature comparison table, performance benchmarks, or implementation guide',
        xpReward: 75,
        priority: 'medium',
        difficulty: 'intermediate'
      }
    );
  }
  
  return quests;
}

/**
 * Generate general professional development quests
 */
function generateProfessionalDevelopmentQuests(userData: any, skills: any[], experiences: any[]): PersonalizedQuest[] {
  const quests: PersonalizedQuest[] = [];
  
  // If user has extensive experience, suggest thought leadership
  if (experiences?.length >= 2) {
    quests.push({
      title: 'Industry Trend Analysis',
      description: 'Share your perspective on emerging trends in your industry and their potential impact',
      type: 'pulse_creation',
      targetAction: 'create_trend_analysis',
      mediaSpecific: 'image: Market trend charts, industry statistics infographic, or future predictions timeline',
      xpReward: 80,
      priority: 'medium',
      difficulty: 'intermediate'
    });
  }
  
  // If user has many skills, suggest skill-sharing content
  if (skills?.length >= 5) {
    quests.push({
      title: 'Skill Development Tutorial',
      description: 'Create educational content teaching one of your core professional skills to others',
      type: 'pulse_creation',
      targetAction: 'create_tutorial',
      mediaSpecific: 'document: Step-by-step guide, tutorial video script, or skill assessment checklist',
      xpReward: 70,
      priority: 'medium',
      difficulty: 'intermediate'
    });
  }
  
  return quests;
}

/**
 * Update user's profile completion in database
 */
export async function updateUserProfileCompletion(userId: number, completionData: ProfileCompletionData) {
  try {
    // This would be implemented to update the database
    console.log(`Updating profile completion for user ${userId}: ${completionData.percentage}%`);
    return {
      success: true,
      percentage: completionData.percentage,
      message: `Profile completion updated to ${completionData.percentage}%`
    };
  } catch (error) {
    console.error('Error updating profile completion:', error);
    return {
      success: false,
      error: 'Failed to update profile completion'
    };
  }
}