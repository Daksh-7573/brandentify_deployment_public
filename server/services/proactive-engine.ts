/**
 * Proactive Engagement Engine for Musk AI
 * 
 * This module generates contextual suggestions and proactive guidance
 * based on user behavior, profile gaps, and career opportunities.
 */

import { storage } from '../storage';

export interface ProactiveInsight {
  type: 'profile_improvement' | 'skill_gap' | 'career_opportunity' | 'networking' | 'learning_path';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  timeline: string;
  impact: 'immediate' | 'short_term' | 'long_term';
}

export interface ProactiveContext {
  userId: number;
  userProfile: any;
  recentActivity: any[];
  careerGoals: any[];
  industryTrends: any[];
  profileCompleteness: number;
}

/**
 * Generate proactive insights based on user context
 */
export async function generateProactiveInsights(context: ProactiveContext): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];
  
  // Profile improvement suggestions
  const profileInsights = await analyzeProfileGaps(context);
  insights.push(...profileInsights);
  
  // Skill gap analysis
  const skillInsights = await identifySkillGaps(context);
  insights.push(...skillInsights);
  
  // Career opportunities
  const careerInsights = await suggestCareerOpportunities(context);
  insights.push(...careerInsights);
  
  // Networking recommendations
  const networkingInsights = await generateNetworkingRecommendations(context);
  insights.push(...networkingInsights);
  
  // Learning path suggestions
  const learningInsights = await suggestLearningPaths(context);
  insights.push(...learningInsights);
  
  // Sort by priority and relevance
  return insights
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    })
    .slice(0, 5); // Return top 5 insights
}

/**
 * Analyze profile completeness and suggest improvements
 */
async function analyzeProfileGaps(context: ProactiveContext): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];
  const { userProfile, profileCompleteness } = context;
  
  if (profileCompleteness < 80) {
    const missingFields = [];
    
    if (!userProfile?.aboutMe || userProfile.aboutMe.length < 100) {
      missingFields.push('detailed about me section');
    }
    
    if (!userProfile?.skills || userProfile.skills.length < 3) {
      missingFields.push('key skills');
    }
    
    if (!userProfile?.whatIOffer || userProfile.whatIOffer.length < 50) {
      missingFields.push('value proposition');
    }
    
    if (missingFields.length > 0) {
      insights.push({
        type: 'profile_improvement',
        priority: 'high',
        title: 'Complete Your Professional Profile',
        description: `Your profile is ${profileCompleteness}% complete. Adding missing sections will increase visibility and help me provide better guidance.`,
        actionItems: missingFields.map(field => `Add ${field}`),
        timeline: '15 minutes',
        impact: 'immediate'
      });
    }
  }
  
  return insights;
}

/**
 * Identify skill gaps based on industry trends and career goals
 */
async function identifySkillGaps(context: ProactiveContext): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];
  const { userProfile } = context;
  
  const industrySkills = getIndustryTrendingSkills(userProfile?.industry);
  const currentSkills = (context.userProfile?.skills || []).map((s: any) => s.name?.toLowerCase());
  
  const missingSkills = industrySkills.filter(skill => 
    !currentSkills.some((current: string) => current.includes(skill.toLowerCase()))
  ).slice(0, 3);
  
  if (missingSkills.length > 0) {
    insights.push({
      type: 'skill_gap',
      priority: 'medium',
      title: 'High-Demand Skills in Your Industry',
      description: `These skills are trending in ${userProfile?.industry || 'your field'} and could boost your career prospects.`,
      actionItems: missingSkills.map(skill => `Learn ${skill}`),
      timeline: '3-6 months',
      impact: 'long_term'
    });
  }
  
  return insights;
}

/**
 * Suggest career advancement opportunities
 */
async function suggestCareerOpportunities(context: ProactiveContext): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];
  const { userProfile } = context;
  
  const currentTitle = userProfile?.title || '';
  const experienceLevel = determineExperienceLevel(context);
  
  if (experienceLevel === 'mid' || experienceLevel === 'senior') {
    const nextRoles = suggestNextCareerSteps(currentTitle, userProfile?.industry);
    
    if (nextRoles.length > 0) {
      insights.push({
        type: 'career_opportunity',
        priority: 'medium',
        title: 'Career Advancement Opportunities',
        description: 'Based on your experience and industry trends, consider these growth paths.',
        actionItems: nextRoles.map(role => `Explore ${role} positions`),
        timeline: '6-12 months',
        impact: 'long_term'
      });
    }
  }
  
  return insights;
}

/**
 * Generate networking recommendations
 */
async function generateNetworkingRecommendations(context: ProactiveContext): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];
  const { userProfile } = context;
  
  const networkingOpportunities = getNetworkingOpportunities(userProfile?.industry, userProfile?.location);
  
  if (networkingOpportunities.length > 0) {
    insights.push({
      type: 'networking',
      priority: 'low',
      title: 'Networking Opportunities',
      description: 'Expand your professional network with these targeted activities.',
      actionItems: networkingOpportunities,
      timeline: 'Ongoing',
      impact: 'long_term'
    });
  }
  
  return insights;
}

/**
 * Suggest personalized learning paths
 */
async function suggestLearningPaths(context: ProactiveContext): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];
  const { userProfile } = context;
  
  const learningPaths = getPersonalizedLearningPaths(userProfile?.industry, userProfile?.title);
  
  if (learningPaths.length > 0) {
    insights.push({
      type: 'learning_path',
      priority: 'medium',
      title: 'Personalized Learning Recommendations',
      description: 'Structured learning paths to advance your career goals.',
      actionItems: learningPaths,
      timeline: '3-6 months',
      impact: 'long_term'
    });
  }
  
  return insights;
}

/**
 * Helper functions for industry-specific recommendations
 */
function getIndustryTrendingSkills(industry: string): string[] {
  const skillMap: { [key: string]: string[] } = {
    'Technology': ['AI/Machine Learning', 'Cloud Computing', 'DevOps', 'Cybersecurity'],
    'Healthcare': ['Digital Health', 'Data Analytics', 'Telemedicine', 'Regulatory Compliance'],
    'Finance': ['FinTech', 'Blockchain', 'Risk Management', 'Data Science'],
    'Marketing': ['Digital Marketing', 'Content Strategy', 'SEO/SEM', 'Marketing Analytics'],
    'Hospitality': ['Digital Transformation', 'Customer Experience', 'Revenue Management', 'Sustainability'],
    'Education': ['EdTech', 'Online Learning', 'Curriculum Design', 'Learning Analytics']
  };
  
  return skillMap[industry] || ['Leadership', 'Communication', 'Project Management', 'Data Analysis'];
}

function determineExperienceLevel(context: ProactiveContext): string {
  const experiences = context.userProfile?.experiences || [];
  const totalYears = experiences.reduce((total: number, exp: any) => {
    const years = calculateExperienceYears(exp);
    return total + years;
  }, 0);
  
  if (totalYears < 3) return 'entry';
  if (totalYears < 7) return 'mid';
  if (totalYears < 12) return 'senior';
  return 'executive';
}

function calculateExperienceYears(experience: any): number {
  if (!experience.startDate) return 0;
  
  const startDate = new Date(experience.startDate);
  const endDate = experience.endDate ? new Date(experience.endDate) : new Date();
  const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
  
  return Math.max(0, yearsDiff);
}

function suggestNextCareerSteps(currentTitle: string, industry: string): string[] {
  const careerProgression: { [key: string]: string[] } = {
    'Manager': ['Senior Manager', 'Director', 'VP'],
    'Director': ['Senior Director', 'VP', 'Executive Director'],
    'Analyst': ['Senior Analyst', 'Lead Analyst', 'Manager'],
    'Developer': ['Senior Developer', 'Lead Developer', 'Engineering Manager'],
    'Designer': ['Senior Designer', 'Lead Designer', 'Design Manager']
  };
  
  for (const [role, nextSteps] of Object.entries(careerProgression)) {
    if (currentTitle.toLowerCase().includes(role.toLowerCase())) {
      return nextSteps;
    }
  }
  
  return ['Senior ' + currentTitle, 'Lead ' + currentTitle];
}

function getNetworkingOpportunities(industry: string, location: string): string[] {
  return [
    `Join ${industry} professional associations`,
    'Attend industry conferences and events',
    'Participate in local networking meetups',
    'Engage with thought leaders on LinkedIn',
    'Join relevant online communities and forums'
  ];
}

function getPersonalizedLearningPaths(industry: string, title: string): string[] {
  const basePaths = [
    'Complete leadership development program',
    'Earn industry-relevant certification',
    'Attend professional workshops',
    'Take advanced courses in your field'
  ];
  
  if (industry === 'Technology') {
    basePaths.push('Learn emerging technologies', 'Get cloud certifications');
  }
  
  if (title?.toLowerCase().includes('manager')) {
    basePaths.push('Advanced management training', 'Strategic planning courses');
  }
  
  return basePaths.slice(0, 3);
}

/**
 * Generate contextual suggestions for immediate action
 * Always prioritizes Brandentifier-related suggestions first
 */
export function generateImmediateSuggestions(
  message: string, 
  userProfile: any, 
  profileCompleteness: number
): string[] {
  const suggestions: string[] = [];
  
  // ALWAYS start with Brandentifier-related suggestions
  const brandentifierSuggestions = generateBrandentifierSuggestions(message, userProfile, profileCompleteness);
  suggestions.push(...brandentifierSuggestions);
  
  // Profile completion suggestions
  if (profileCompleteness < 70) {
    suggestions.push('Complete your profile to get more personalized advice');
  }
  
  // Message-specific suggestions
  if (message.toLowerCase().includes('skill') || message.toLowerCase().includes('learn')) {
    suggestions.push('I can create a personalized learning roadmap for you');
  }
  
  if (message.toLowerCase().includes('career') || message.toLowerCase().includes('job')) {
    suggestions.push('Would you like me to analyze career opportunities in your field?');
  }
  
  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connect')) {
    suggestions.push('I can suggest networking strategies for your industry');
  }
  
  // Industry-specific suggestions
  if (userProfile?.industry) {
    const industrySkills = getIndustryTrendingSkills(userProfile.industry);
    if (industrySkills.length > 0) {
      suggestions.push(`Based on trends in ${userProfile.industry}, consider learning ${industrySkills[0]}`);
    }
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions (Brandentifier first)
}

/**
 * Generate Brandentifier-specific suggestions that always appear first
 */
function generateBrandentifierSuggestions(
  message: string, 
  userProfile: any, 
  profileCompleteness: number
): string[] {
  const brandSuggestions: string[] = [];
  
  // Profile enhancement suggestions
  if (profileCompleteness < 80) {
    brandSuggestions.push('Enhance your Brandentifier profile to unlock more career opportunities');
  }
  
  // Feature-specific suggestions based on message content
  if (message.toLowerCase().includes('skill') || message.toLowerCase().includes('learn')) {
    brandSuggestions.push('Use Brandentifier\'s skill tracking to showcase your learning progress');
  } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connect')) {
    brandSuggestions.push('Discover professionals in your field through Brandentifier\'s networking features');
  } else if (message.toLowerCase().includes('project') || message.toLowerCase().includes('portfolio')) {
    brandSuggestions.push('Showcase your work with Brandentifier\'s project portfolio features');
  } else if (message.toLowerCase().includes('goal') || message.toLowerCase().includes('plan')) {
    brandSuggestions.push('Set and track career goals using Brandentifier\'s career planning tools');
  } else if (message.toLowerCase().includes('job') || message.toLowerCase().includes('opportunity')) {
    brandSuggestions.push('Explore career opportunities through Brandentifier\'s job matching system');
  } else {
    // Default Brandentifier suggestion
    brandSuggestions.push('Maximize your career potential with Brandentifier\'s comprehensive professional tools');
  }
  
  return brandSuggestions.slice(0, 1); // Always return exactly 1 Brandentifier suggestion
}