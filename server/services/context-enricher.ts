/**
 * Context Enricher Service
 * 
 * Gathers and enriches user context data for enhanced Musk AI responses,
 * including profile analysis, conversation history, and proactive insights.
 */

import { MessageIntent } from './intent-classification';

export interface EnrichedContext {
  user: UserProfileContext;
  conversation: ConversationContext;
  insights: ProactiveInsights;
  recommendations: ContextualRecommendations;
  mood: UserMoodProfile;
}

export interface UserProfileContext {
  basicInfo: {
    name: string;
    title?: string;
    industry?: string;
    location?: string;
    experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
    lookingFor?: string;
  };
  professional: {
    skills: Array<{ name: string; level?: string; proficiency?: number }>;
    experiences: Array<{
      title: string;
      company: string;
      duration: string;
      domain?: string;
      achievements?: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      field?: string;
    }>;
    projects: Array<{
      title: string;
      description?: string;
      technologies?: string[];
    }>;
  };
  profileCompleteness: {
    score: number;
    missingAreas: string[];
    strengthAreas: string[];
  };
}

export interface ConversationContext {
  currentSession: {
    messageCount: number;
    sessionDuration: number;
    topicFocus: string[];
    intentHistory: MessageIntent[];
  };
  historicalPatterns: {
    preferredPersona?: string;
    commonTopics: string[];
    engagementLevel: 'low' | 'medium' | 'high';
    responseSatisfaction: number;
    communicationStyle: {
      preferencesForLength: 'brief' | 'detailed' | 'comprehensive';
      responseFormat: 'structured' | 'conversational' | 'mixed';
      tonePreference: 'professional' | 'casual' | 'motivational';
    };
  };
  recentInteractions: Array<{
    message: string;
    response: string;
    persona: string;
    satisfaction?: number;
    timestamp: Date;
  }>;
}

export interface ProactiveInsights {
  profileGaps: Array<{
    area: string;
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
    benefit: string;
  }>;
  skillRecommendations: Array<{
    skill: string;
    relevance: number;
    market_demand: 'growing' | 'stable' | 'declining';
    learning_path: string[];
  }>;
  careerOpportunities: Array<{
    role: string;
    match_percentage: number;
    required_skills: string[];
    growth_potential: 'high' | 'medium' | 'low';
  }>;
  networkingSuggestions: Array<{
    platform: string;
    action: string;
    expected_outcome: string;
  }>;
}

export interface ContextualRecommendations {
  immediate_actions: string[];
  this_week: string[];
  this_month: string[];
  learning_priorities: string[];
  networking_focus: string[];
}

export interface UserMoodProfile {
  current_confidence: 'low' | 'medium' | 'high';
  motivation_level: 'low' | 'medium' | 'high';
  stress_indicators: string[];
  positive_momentum: string[];
  support_needs: string[];
}

/**
 * Enrich user context with comprehensive profile and conversation analysis
 */
export async function enrichUserContext(
  userId: number,
  currentMessage: string,
  conversationHistory: Array<{ message: string; response?: string; timestamp: Date }> = [],
  userProfile: any,
  userExperiences: any[] = [],
  userSkills: any[] = [],
  userEducations: any[] = [],
  userProjects: any[] = []
): Promise<EnrichedContext> {

  // Build user profile context
  const user = buildUserProfileContext(userProfile, userExperiences, userSkills, userEducations, userProjects);
  
  // Analyze conversation patterns
  const conversation = analyzeConversationContext(conversationHistory, currentMessage);
  
  // Generate proactive insights
  const insights = generateProactiveInsights(user, conversation);
  
  // Create contextual recommendations
  const recommendations = generateContextualRecommendations(user, insights, currentMessage);
  
  // Assess user mood and state
  const mood = assessUserMood(currentMessage, conversationHistory, user);

  return {
    user,
    conversation,
    insights,
    recommendations,
    mood
  };
}

/**
 * Build comprehensive user profile context
 */
function buildUserProfileContext(
  userProfile: any,
  experiences: any[],
  skills: any[],
  educations: any[],
  projects: any[]
): UserProfileContext {
  
  // Determine experience level based on work history
  const totalYears = experiences.reduce((total, exp) => {
    const startYear = new Date(exp.startDate).getFullYear();
    const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : new Date().getFullYear();
    return total + (endYear - startYear);
  }, 0);

  const experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' = 
    totalYears < 3 ? 'entry' :
    totalYears < 7 ? 'mid' :
    totalYears < 12 ? 'senior' : 'executive';

  // Calculate profile completeness
  const profileCompleteness = calculateProfileCompleteness(userProfile, experiences, skills, educations, projects);

  return {
    basicInfo: {
      name: userProfile?.name || 'User',
      title: userProfile?.title,
      industry: userProfile?.industry,
      location: userProfile?.location,
      experienceLevel,
      lookingFor: userProfile?.lookingFor
    },
    professional: {
      skills: skills.map(skill => ({
        name: skill.name,
        level: skill.level,
        proficiency: skill.proficiency
      })),
      experiences: experiences.map(exp => ({
        title: exp.title,
        company: exp.company,
        duration: `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}`,
        domain: exp.domain,
        achievements: exp.keyResponsibilities || []
      })),
      education: educations.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        field: edu.fieldOfStudy
      })),
      projects: projects.map(proj => ({
        title: proj.title,
        description: proj.description,
        technologies: proj.technologies ? proj.technologies.split(',').map((t: string) => t.trim()) : []
      }))
    },
    profileCompleteness
  };
}

/**
 * Calculate profile completeness and identify gaps
 */
function calculateProfileCompleteness(
  profile: any,
  experiences: any[],
  skills: any[],
  educations: any[],
  projects: any[]
): { score: number; missingAreas: string[]; strengthAreas: string[] } {
  const sections = {
    basicInfo: profile?.name && profile?.title ? 1 : 0,
    workExperience: experiences.length > 0 ? 1 : 0,
    skills: skills.length > 2 ? 1 : 0,
    education: educations.length > 0 ? 1 : 0,
    projects: projects.length > 0 ? 1 : 0,
    aboutMe: profile?.aboutMe ? 1 : 0,
    industry: profile?.industry ? 1 : 0,
    location: profile?.location ? 1 : 0
  };

  const completedSections = Object.values(sections).filter(Boolean).length;
  const totalSections = Object.keys(sections).length;
  const score = Math.round((completedSections / totalSections) * 100);

  const missingAreas = Object.entries(sections)
    .filter(([_, completed]) => !completed)
    .map(([area, _]) => area);

  const strengthAreas = Object.entries(sections)
    .filter(([_, completed]) => completed)
    .map(([area, _]) => area);

  return { score, missingAreas, strengthAreas };
}

/**
 * Analyze conversation context and patterns
 */
function analyzeConversationContext(
  history: Array<{ message: string; response?: string; timestamp: Date }>,
  currentMessage: string
): ConversationContext {
  
  const sessionStart = history.length > 0 ? history[0].timestamp : new Date();
  const sessionDuration = Math.round((new Date().getTime() - sessionStart.getTime()) / 1000 / 60); // minutes

  // Extract topics from messages
  const allMessages = [...history.map(h => h.message), currentMessage];
  const topicKeywords = extractTopicKeywords(allMessages);

  // Determine engagement level based on message frequency and length
  const avgMessageLength = allMessages.reduce((sum, msg) => sum + msg.length, 0) / allMessages.length;
  const engagementLevel: 'low' | 'medium' | 'high' = 
    avgMessageLength > 100 && history.length > 3 ? 'high' :
    avgMessageLength > 50 || history.length > 1 ? 'medium' : 'low';

  return {
    currentSession: {
      messageCount: history.length + 1,
      sessionDuration,
      topicFocus: topicKeywords,
      intentHistory: [] // This would be populated with actual intent history
    },
    historicalPatterns: {
      commonTopics: topicKeywords,
      engagementLevel,
      responseSatisfaction: 0.8, // Default placeholder - would come from actual feedback
      communicationStyle: {
        preferencesForLength: avgMessageLength > 100 ? 'detailed' : 'brief',
        responseFormat: 'structured',
        tonePreference: 'professional'
      }
    },
    recentInteractions: history.slice(-5).map(h => ({
      message: h.message,
      response: h.response || '',
      persona: 'strategist', // Would be determined from actual conversation data
      timestamp: h.timestamp
    }))
  };
}

/**
 * Extract topic keywords from conversation messages
 */
function extractTopicKeywords(messages: string[]): string[] {
  const topicPatterns = {
    'career_planning': ['career', 'future', 'plan', 'goal', 'roadmap'],
    'skill_development': ['skill', 'learn', 'course', 'training', 'certification'],
    'job_search': ['job', 'position', 'application', 'interview', 'hiring'],
    'resume': ['resume', 'cv', 'portfolio', 'profile'],
    'networking': ['network', 'connection', 'linkedin', 'meet'],
    'industry_change': ['switch', 'transition', 'change', 'pivot'],
    'confidence': ['confidence', 'imposter', 'doubt', 'nervous', 'afraid'],
    'workplace': ['boss', 'manager', 'colleague', 'office', 'work']
  };

  const allText = messages.join(' ').toLowerCase();
  const detectedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(topicPatterns)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
}

/**
 * Generate proactive insights based on user context
 */
function generateProactiveInsights(user: UserProfileContext, conversation: ConversationContext): ProactiveInsights {
  const profileGaps: Array<{ area: string; impact: 'high' | 'medium' | 'low'; suggestion: string; benefit: string }> = [];
  
  // Check for missing profile areas
  if (user.profileCompleteness.missingAreas.includes('projects')) {
    profileGaps.push({
      area: 'Project Portfolio',
      impact: 'high',
      suggestion: 'Add 2-3 key projects that showcase your skills and impact',
      benefit: 'Demonstrates practical experience and problem-solving abilities to potential employers'
    });
  }

  if (user.professional.skills.length < 3) {
    profileGaps.push({
      area: 'Skills Documentation',
      impact: 'medium',
      suggestion: 'List your technical and soft skills with proficiency levels',
      benefit: 'Improves profile searchability and helps with job matching'
    });
  }

  // Generate skill recommendations based on current role and industry
  const skillRecommendations = generateSkillRecommendations(user);
  
  // Generate career opportunities based on profile
  const careerOpportunities = generateCareerOpportunities(user);
  
  // Generate networking suggestions
  const networkingSuggestions = generateNetworkingSuggestions(user);

  return {
    profileGaps,
    skillRecommendations,
    careerOpportunities,
    networkingSuggestions
  };
}

/**
 * Generate skill recommendations based on user profile
 */
function generateSkillRecommendations(user: UserProfileContext): Array<{
  skill: string;
  relevance: number;
  market_demand: 'growing' | 'stable' | 'declining';
  learning_path: string[];
}> {
  const currentSkills = user.professional.skills.map(s => s.name.toLowerCase());
  const industry = user.basicInfo.industry?.toLowerCase();
  
  const skillSuggestions: Record<string, any> = {
    technology: [
      { skill: 'AI/Machine Learning', relevance: 0.9, market_demand: 'growing', learning_path: ['Python', 'TensorFlow', 'Data Analysis'] },
      { skill: 'Cloud Computing', relevance: 0.8, market_demand: 'growing', learning_path: ['AWS', 'Docker', 'Kubernetes'] },
      { skill: 'Cybersecurity', relevance: 0.7, market_demand: 'growing', learning_path: ['Security Fundamentals', 'Ethical Hacking', 'Compliance'] }
    ],
    marketing: [
      { skill: 'Digital Analytics', relevance: 0.9, market_demand: 'growing', learning_path: ['Google Analytics', 'Data Visualization', 'A/B Testing'] },
      { skill: 'Content Strategy', relevance: 0.8, market_demand: 'stable', learning_path: ['SEO', 'Content Creation', 'Brand Messaging'] },
      { skill: 'Marketing Automation', relevance: 0.7, market_demand: 'growing', learning_path: ['HubSpot', 'Email Marketing', 'Lead Scoring'] }
    ]
  };

  const defaultSkills = [
    { skill: 'Leadership', relevance: 0.8, market_demand: 'stable', learning_path: ['Team Management', 'Communication', 'Strategic Thinking'] },
    { skill: 'Data Analysis', relevance: 0.7, market_demand: 'growing', learning_path: ['Excel', 'SQL', 'Visualization Tools'] }
  ];

  const recommendations = skillSuggestions[industry || ''] || defaultSkills;
  
  // Filter out skills user already has
  return recommendations.filter(rec => 
    !currentSkills.some(skill => skill.includes(rec.skill.toLowerCase()))
  );
}

/**
 * Generate career opportunities based on user profile
 */
function generateCareerOpportunities(user: UserProfileContext): Array<{
  role: string;
  match_percentage: number;
  required_skills: string[];
  growth_potential: 'high' | 'medium' | 'low';
}> {
  const userSkills = user.professional.skills.map(s => s.name);
  const experienceLevel = user.basicInfo.experienceLevel;
  
  const opportunityTemplates = {
    technology: [
      { role: 'Senior Software Engineer', required_skills: ['JavaScript', 'React', 'Node.js'], growth_potential: 'high' },
      { role: 'Product Manager', required_skills: ['Product Strategy', 'User Research', 'Analytics'], growth_potential: 'high' },
      { role: 'DevOps Engineer', required_skills: ['AWS', 'Docker', 'CI/CD'], growth_potential: 'medium' }
    ]
  };

  const baseOpportunities = opportunityTemplates[user.basicInfo.industry?.toLowerCase() as keyof typeof opportunityTemplates] || [];
  
  return baseOpportunities.map(opp => {
    const matchingSkills = opp.required_skills.filter(skill => 
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    const match_percentage = Math.round((matchingSkills.length / opp.required_skills.length) * 100);
    
    return {
      role: opp.role,
      match_percentage,
      required_skills: opp.required_skills,
      growth_potential: opp.growth_potential as 'high' | 'medium' | 'low'
    };
  });
}

/**
 * Generate networking suggestions
 */
function generateNetworkingSuggestions(user: UserProfileContext): Array<{
  platform: string;
  action: string;
  expected_outcome: string;
}> {
  return [
    {
      platform: 'LinkedIn',
      action: 'Connect with 5 professionals in your industry weekly',
      expected_outcome: 'Expand professional network and increase visibility'
    },
    {
      platform: 'Brandentifier',
      action: 'Use Smart Connect to find professionals with similar backgrounds',
      expected_outcome: 'Find mentors and collaboration opportunities'
    },
    {
      platform: 'Industry Events',
      action: 'Attend virtual or local meetups in your field',
      expected_outcome: 'Build relationships and stay current with trends'
    }
  ];
}

/**
 * Generate contextual recommendations
 */
function generateContextualRecommendations(
  user: UserProfileContext,
  insights: ProactiveInsights,
  currentMessage: string
): ContextualRecommendations {
  const immediate_actions: string[] = [];
  const this_week: string[] = [];
  const this_month: string[] = [];
  const learning_priorities: string[] = [];
  const networking_focus: string[] = [];

  // Based on profile gaps
  if (insights.profileGaps.length > 0) {
    immediate_actions.push('Complete your profile by adding missing sections');
    this_week.push('Upload a professional photo and write a compelling about section');
  }

  // Based on current message context
  if (currentMessage.toLowerCase().includes('resume')) {
    immediate_actions.push('Review your current resume for gaps and outdated information');
    this_week.push('Update resume with quantified achievements from recent experiences');
  }

  // Default recommendations based on experience level
  if (user.basicInfo.experienceLevel === 'entry') {
    learning_priorities.push('Focus on building foundational skills in your field');
    networking_focus.push('Connect with senior professionals and potential mentors');
  } else if (user.basicInfo.experienceLevel === 'senior') {
    learning_priorities.push('Develop leadership and strategic thinking skills');
    networking_focus.push('Build relationships with industry leaders and potential collaborators');
  }

  return {
    immediate_actions,
    this_week,
    this_month,
    learning_priorities,
    networking_focus
  };
}

/**
 * Assess user mood and emotional state
 */
function assessUserMood(
  currentMessage: string,
  conversationHistory: Array<{ message: string; timestamp: Date }>,
  user: UserProfileContext
): UserMoodProfile {
  const allMessages = [...conversationHistory.map(h => h.message), currentMessage].join(' ').toLowerCase();
  
  // Confidence indicators
  const confidenceIndicators = {
    high: ['confident', 'ready', 'excited', 'sure', 'capable'],
    medium: ['think', 'believe', 'probably', 'should'],
    low: ['nervous', 'unsure', 'scared', 'doubt', 'worried', 'confused']
  };

  const current_confidence = Object.entries(confidenceIndicators).find(([level, indicators]) =>
    indicators.some(indicator => allMessages.includes(indicator))
  )?.[0] as 'low' | 'medium' | 'high' || 'medium';

  // Motivation indicators
  const motivationIndicators = {
    high: ['determined', 'motivated', 'passionate', 'driven', 'goal'],
    medium: ['want', 'need', 'should', 'planning'],
    low: ['tired', 'overwhelmed', 'stuck', 'burned out', 'frustrated']
  };

  const motivation_level = Object.entries(motivationIndicators).find(([level, indicators]) =>
    indicators.some(indicator => allMessages.includes(indicator))
  )?.[0] as 'low' | 'medium' | 'high' || 'medium';

  // Identify stress indicators
  const stress_indicators: string[] = [];
  const stressKeywords = ['pressure', 'deadline', 'stress', 'overwhelmed', 'too much', 'difficult'];
  stressKeywords.forEach(keyword => {
    if (allMessages.includes(keyword)) {
      stress_indicators.push(keyword);
    }
  });

  // Identify positive momentum
  const positive_momentum: string[] = [];
  const positiveKeywords = ['progress', 'achievement', 'success', 'growth', 'improvement', 'opportunity'];
  positiveKeywords.forEach(keyword => {
    if (allMessages.includes(keyword)) {
      positive_momentum.push(keyword);
    }
  });

  // Determine support needs
  const support_needs: string[] = [];
  if (current_confidence === 'low') support_needs.push('confidence building');
  if (motivation_level === 'low') support_needs.push('motivation');
  if (stress_indicators.length > 0) support_needs.push('stress management');
  if (user.profileCompleteness.score < 50) support_needs.push('profile development');

  return {
    current_confidence,
    motivation_level,
    stress_indicators,
    positive_momentum,
    support_needs
  };
}