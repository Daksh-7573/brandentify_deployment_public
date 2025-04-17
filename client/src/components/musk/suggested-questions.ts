/**
 * Musk AI Suggested Questions
 * Intelligent algorithm to provide contextual question suggestions based on user profile
 */

import { User } from '@/types/user';

// Define types for suggested questions
export interface SuggestedQuestion {
  id: string;
  text: string;
  category: 'career' | 'skills' | 'networking' | 'industry' | 'profile' | 'content';
  relevanceScore: number;
  isNew?: boolean;
}

// Question pools organized by "lookingFor" values
const questionPools: Record<string, SuggestedQuestion[]> = {
  'A Career Mentor': [
    { id: 'mentor-1', text: 'What skills should I focus on developing next?', category: 'career', relevanceScore: 0.9 },
    { id: 'mentor-2', text: 'How can I transition to a leadership role in my field?', category: 'career', relevanceScore: 0.85 },
    { id: 'mentor-3', text: 'What career path options do I have with my background?', category: 'career', relevanceScore: 0.8 },
    { id: 'mentor-4', text: 'How do I find a mentor in my industry?', category: 'networking', relevanceScore: 0.75 },
    { id: 'mentor-5', text: 'What\'s the best way to prepare for my next performance review?', category: 'career', relevanceScore: 0.7 },
    { id: 'mentor-6', text: 'How can I negotiate a promotion successfully?', category: 'career', relevanceScore: 0.65 },
    { id: 'mentor-7', text: 'What books or resources should I read to advance my career?', category: 'skills', relevanceScore: 0.6 },
  ],
  'A New Job': [
    { id: 'job-1', text: 'Where in the world should I apply for jobs?', category: 'career', relevanceScore: 0.9 },
    { id: 'job-2', text: 'Which companies are hiring for my skillset this month?', category: 'industry', relevanceScore: 0.85 },
    { id: 'job-3', text: 'How should I tailor my resume for my target role?', category: 'career', relevanceScore: 0.8 },
    { id: 'job-4', text: 'What roles are in demand in my industry?', category: 'industry', relevanceScore: 0.75 },
    { id: 'job-5', text: 'How can I stand out in job interviews?', category: 'career', relevanceScore: 0.7 },
    { id: 'job-6', text: 'Should I try remote or hybrid for better growth?', category: 'career', relevanceScore: 0.65 },
    { id: 'job-7', text: 'What salary should I expect for my next role?', category: 'career', relevanceScore: 0.6 },
  ],
  'Business Partners': [
    { id: 'partner-1', text: 'How can I find potential business partners with complementary skills?', category: 'networking', relevanceScore: 0.9 },
    { id: 'partner-2', text: 'What should I look for in a business partner?', category: 'networking', relevanceScore: 0.85 },
    { id: 'partner-3', text: 'How do I structure a fair partnership agreement?', category: 'networking', relevanceScore: 0.8 },
    { id: 'partner-4', text: 'What are the warning signs of a bad business partnership?', category: 'networking', relevanceScore: 0.75 },
    { id: 'partner-5', text: 'How can I pitch my business idea to potential partners?', category: 'networking', relevanceScore: 0.7 },
  ],
  'Expand My Network': [
    { id: 'network-1', text: 'How can I become more visible in my industry?', category: 'networking', relevanceScore: 0.9 },
    { id: 'network-2', text: 'What kind of posts should I share to build thought leadership?', category: 'content', relevanceScore: 0.85 },
    { id: 'network-3', text: 'Which events in my industry are worth attending?', category: 'networking', relevanceScore: 0.8 },
    { id: 'network-4', text: 'How can I connect with industry leaders authentically?', category: 'networking', relevanceScore: 0.75 },
    { id: 'network-5', text: 'What\'s the best approach to cold outreach on professional platforms?', category: 'networking', relevanceScore: 0.7 },
    { id: 'network-6', text: 'Write a Pulse post for me based on today\'s trend in my field', category: 'content', relevanceScore: 0.65 },
  ],
  'Learn New Skills': [
    { id: 'skills-1', text: 'What skills are most in-demand in my industry?', category: 'skills', relevanceScore: 0.9 },
    { id: 'skills-2', text: 'Which certifications would be most valuable for my career?', category: 'skills', relevanceScore: 0.85 },
    { id: 'skills-3', text: 'How can I demonstrate new skills in my portfolio?', category: 'skills', relevanceScore: 0.8 },
    { id: 'skills-4', text: 'What\'s the best learning path for advancing in my field?', category: 'skills', relevanceScore: 0.75 },
    { id: 'skills-5', text: 'How can I balance skill development with my current workload?', category: 'skills', relevanceScore: 0.7 },
  ],
  'Industry Insights': [
    { id: 'industry-1', text: 'What are the biggest trends in my industry right now?', category: 'industry', relevanceScore: 0.9 },
    { id: 'industry-2', text: 'How is AI affecting roles in my field?', category: 'industry', relevanceScore: 0.85 },
    { id: 'industry-3', text: 'Which companies are leading innovation in my industry?', category: 'industry', relevanceScore: 0.8 },
    { id: 'industry-4', text: 'What regulatory changes might impact my field?', category: 'industry', relevanceScore: 0.75 },
    { id: 'industry-5', text: 'How are consumer behaviors changing in my industry?', category: 'industry', relevanceScore: 0.7 },
  ],
  'default': [
    { id: 'default-1', text: 'How can I improve my professional profile?', category: 'profile', relevanceScore: 0.9 },
    { id: 'default-2', text: 'What career opportunities should I be exploring?', category: 'career', relevanceScore: 0.85 },
    { id: 'default-3', text: 'How can I stand out in my industry?', category: 'networking', relevanceScore: 0.8 },
    { id: 'default-4', text: 'Which portfolio layout is best for my profile?', category: 'profile', relevanceScore: 0.75 },
    { id: 'default-5', text: 'What skills should I develop to advance my career?', category: 'skills', relevanceScore: 0.7 },
  ]
};

// Industry-specific questions to augment the base pools
const industryQuestions: Record<string, SuggestedQuestion[]> = {
  'Technology': [
    { id: 'tech-1', text: 'Which tech stack should I learn next?', category: 'skills', relevanceScore: 0.9 },
    { id: 'tech-2', text: 'How can I transition from coding to product management?', category: 'career', relevanceScore: 0.85 },
    { id: 'tech-3', text: 'What\'s the best way to showcase my coding projects?', category: 'profile', relevanceScore: 0.8 },
    { id: 'tech-4', text: 'How do I stay relevant with rapidly changing technologies?', category: 'skills', relevanceScore: 0.75 },
  ],
  'Healthcare': [
    { id: 'health-1', text: 'How is digital transformation changing healthcare careers?', category: 'industry', relevanceScore: 0.9 },
    { id: 'health-2', text: 'What telehealth skills are most valuable in today\'s market?', category: 'skills', relevanceScore: 0.85 },
    { id: 'health-3', text: 'How can I transition between different healthcare specialties?', category: 'career', relevanceScore: 0.8 },
  ],
  'Finance': [
    { id: 'finance-1', text: 'How is fintech disrupting traditional finance roles?', category: 'industry', relevanceScore: 0.9 },
    { id: 'finance-2', text: 'What regulatory knowledge is most valuable in finance today?', category: 'skills', relevanceScore: 0.85 },
    { id: 'finance-3', text: 'How can I transition from traditional banking to fintech?', category: 'career', relevanceScore: 0.8 },
  ],
  'Marketing': [
    { id: 'marketing-1', text: 'What digital marketing skills are most in demand?', category: 'skills', relevanceScore: 0.9 },
    { id: 'marketing-2', text: 'How can I build a portfolio that showcases my marketing campaigns?', category: 'profile', relevanceScore: 0.85 },
    { id: 'marketing-3', text: 'What metrics should I highlight in my marketing experience?', category: 'profile', relevanceScore: 0.8 },
  ]
};

// Career stage specific questions
const careerStageQuestions: Record<string, SuggestedQuestion[]> = {
  'entry': [
    { id: 'entry-1', text: 'How can I gain experience when most jobs require experience?', category: 'career', relevanceScore: 0.9 },
    { id: 'entry-2', text: 'What projects can I build to demonstrate my skills?', category: 'skills', relevanceScore: 0.85 },
    { id: 'entry-3', text: 'How do I make the most of my internship or first job?', category: 'career', relevanceScore: 0.8 },
  ],
  'mid': [
    { id: 'mid-1', text: 'How can I avoid the mid-career plateau?', category: 'career', relevanceScore: 0.9 },
    { id: 'mid-2', text: 'Should I specialize further or develop broader skills?', category: 'skills', relevanceScore: 0.85 },
    { id: 'mid-3', text: 'How do I position myself for a senior role?', category: 'career', relevanceScore: 0.8 },
  ],
  'senior': [
    { id: 'senior-1', text: 'How can I transition into leadership while maintaining technical skills?', category: 'career', relevanceScore: 0.9 },
    { id: 'senior-2', text: 'What\'s the best way to mentor junior team members?', category: 'career', relevanceScore: 0.85 },
    { id: 'senior-3', text: 'How can I influence organizational strategy from my position?', category: 'career', relevanceScore: 0.8 },
  ],
  'executive': [
    { id: 'exec-1', text: 'How can I build a stronger executive presence?', category: 'career', relevanceScore: 0.9 },
    { id: 'exec-2', text: 'What boards or advisory roles should I consider?', category: 'networking', relevanceScore: 0.85 },
    { id: 'exec-3', text: 'How can I position myself as a thought leader in my industry?', category: 'networking', relevanceScore: 0.8 },
  ]
};

// Profile completion questions
const profileCompletionQuestions: SuggestedQuestion[] = [
  { id: 'profile-1', text: 'How can I make my professional profile more compelling?', category: 'profile', relevanceScore: 0.9 },
  { id: 'profile-2', text: 'What elements should I add to my profile to stand out?', category: 'profile', relevanceScore: 0.85 },
  { id: 'profile-3', text: 'Which portfolio layout is best for my experience level?', category: 'profile', relevanceScore: 0.8 },
  { id: 'profile-4', text: 'How can I highlight my achievements effectively?', category: 'profile', relevanceScore: 0.75 },
];

/**
 * Infer career stage from job title
 */
function inferCareerStage(title: string | null): 'entry' | 'mid' | 'senior' | 'executive' {
  if (!title) return 'mid'; // Default to mid-level if no title
  
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('chief') || 
      lowerTitle.includes('ceo') || 
      lowerTitle.includes('cto') || 
      lowerTitle.includes('cfo') || 
      lowerTitle.includes('coo') || 
      lowerTitle.includes('vp') || 
      lowerTitle.includes('vice president') || 
      lowerTitle.includes('director') || 
      lowerTitle.includes('head of')) {
    return 'executive';
  }
  
  if (lowerTitle.includes('senior') || 
      lowerTitle.includes('lead') || 
      lowerTitle.includes('principal') || 
      lowerTitle.includes('staff') || 
      lowerTitle.includes('manager')) {
    return 'senior';
  }
  
  if (lowerTitle.includes('junior') || 
      lowerTitle.includes('intern') || 
      lowerTitle.includes('associate') || 
      lowerTitle.includes('trainee') || 
      lowerTitle.includes('assistant')) {
    return 'entry';
  }
  
  return 'mid'; // Default to mid-level for most other titles
}

/**
 * Get base questions for the user's lookingFor value
 */
function getQuestionsForLookingFor(lookingFor: string | null): SuggestedQuestion[] {
  if (!lookingFor) return questionPools['default'];
  
  // Try to match exactly first
  if (questionPools[lookingFor]) {
    return questionPools[lookingFor];
  }
  
  // If no exact match, try to find a partial match
  for (const key of Object.keys(questionPools)) {
    if (lookingFor.includes(key) || key.includes(lookingFor)) {
      return questionPools[key];
    }
  }
  
  // Default questions if no match found
  return questionPools['default'];
}

/**
 * Apply industry context to questions
 */
function applyIndustryContext(questions: SuggestedQuestion[], industry: string | null): SuggestedQuestion[] {
  if (!industry) return questions;
  
  const industryKey = Object.keys(industryQuestions).find(
    key => key.toLowerCase() === industry.toLowerCase() || 
    industry.toLowerCase().includes(key.toLowerCase())
  );
  
  if (!industryKey) return questions;
  
  // Add industry-specific questions to the pool, ensuring no duplicates by ID
  const combined = [...questions];
  for (const q of industryQuestions[industryKey]) {
    if (!combined.some(existing => existing.id === q.id)) {
      combined.push({...q, isNew: true});
    }
  }
  
  return combined;
}

/**
 * Apply career stage context to questions
 */
function applyCareerStageContext(questions: SuggestedQuestion[], careerStage: string): SuggestedQuestion[] {
  // Add career stage specific questions to the pool
  const stageQuestions = careerStageQuestions[careerStage] || [];
  
  // Add career stage questions to the pool, ensuring no duplicates by ID
  const combined = [...questions];
  for (const q of stageQuestions) {
    if (!combined.some(existing => existing.id === q.id)) {
      combined.push({...q, isNew: true});
    }
  }
  
  return combined;
}

/**
 * Add profile completion questions if profile is incomplete
 */
function addProfileCompletionQuestions(questions: SuggestedQuestion[], profileCompletion: number): SuggestedQuestion[] {
  if (profileCompletion >= 80) return questions;
  
  // Calculate how many profile questions to add based on completion percentage
  const numToAdd = Math.ceil((100 - profileCompletion) / 20);
  const profileQuestions = profileCompletionQuestions.slice(0, numToAdd);
  
  // Add profile questions to the pool, ensuring no duplicates by ID
  const combined = [...questions];
  for (const q of profileQuestions) {
    if (!combined.some(existing => existing.id === q.id)) {
      combined.push({...q, isNew: true});
    }
  }
  
  return combined;
}

/**
 * Select final questions with weighted probability
 */
function selectFinalQuestions(
  questions: SuggestedQuestion[], 
  engagementHistory: Record<string, number> = {}, 
  count: number = 5
): SuggestedQuestion[] {
  // Sort by relevance score first, then adjust for engagement history
  const sortedQuestions = [...questions].sort((a, b) => {
    // Start with base relevance score
    let scoreA = a.relevanceScore;
    let scoreB = b.relevanceScore;
    
    // Adjust for engagement history if we have it
    if (engagementHistory[a.category]) {
      scoreA += 0.1 * engagementHistory[a.category];
    }
    if (engagementHistory[b.category]) {
      scoreB += 0.1 * engagementHistory[b.category];
    }
    
    // Boost new questions slightly
    if (a.isNew) scoreA += 0.05;
    if (b.isNew) scoreB += 0.05;
    
    return scoreB - scoreA;
  });
  
  // Return top N questions
  return sortedQuestions.slice(0, count);
}

/**
 * Main function to get suggested questions based on user data
 */
export function getSuggestedQuestions(
  userData: User | null, 
  engagementHistory: Record<string, number> = {},
  count: number = 5
): SuggestedQuestion[] {
  if (!userData) {
    return questionPools['default'].slice(0, count);
  }
  
  // Extract user profile data
  const { lookingFor, industry, title, profileCompleted = 0 } = userData;
  
  // Get base question pool filtered by lookingFor
  let questionPool = getQuestionsForLookingFor(lookingFor);
  
  // Apply industry context filter
  questionPool = applyIndustryContext(questionPool, industry);
  
  // Apply career stage filter
  const careerStage = inferCareerStage(title);
  questionPool = applyCareerStageContext(questionPool, careerStage);
  
  // Apply profile completion filter
  questionPool = addProfileCompletionQuestions(questionPool, profileCompleted);
  
  // Select final questions with weighted probability
  return selectFinalQuestions(questionPool, engagementHistory, count);
}