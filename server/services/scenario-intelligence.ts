/**
 * Scenario-Based Intelligence System for Musk AI Career Assistant
 * This module provides a structured approach to career guidance based on
 * specific user scenarios and intents.
 */

export interface ScenarioIntelligence {
  intentTag: string;
  title: string;
  description: string;
  requiredFields: string[];
  engines: string[];
  followUpQuestions: string[];
  suggestedOutput: string;
}

/**
 * Map of advice types to scenario intelligence configurations
 */
export const SCENARIO_MAP: Record<string, ScenarioIntelligence> = {
  // Career Direction - "What should I do next?"
  'explore_options': {
    intentTag: '#careerdirection',
    title: 'Career Direction Explorer',
    description: 'Analyzes current skills and experience to suggest optimal career paths',
    requiredFields: ['skills', 'work_experience', 'education', 'industry'],
    engines: ['Skill Map Engine', 'Career Outcome Predictor', 'Brandentifier Linker'],
    followUpQuestions: [
      'Are you open to relocating for the right opportunity?',
      'What matters most to you now: growth, income, purpose, or freedom?',
      'Do you prefer working in large organizations or smaller teams?'
    ],
    suggestedOutput: 'A multi-path career plan with 3-4 viable directions based on current profile'
  },
  
  // Industry Shift - "How can I switch industries?"
  'switch_industry': {
    intentTag: '#industryswitch',
    title: 'Industry Transition Map',
    description: 'Creates pathways to transition between industries based on transferable skills',
    requiredFields: ['skills', 'work_experience', 'industry', 'education'],
    engines: ['Skill Map Engine', 'Learning Engine', 'Resume Optimizer'],
    followUpQuestions: [
      'What industries are you most interested in exploring?',
      'Are you willing to take a step back in seniority to switch industries?',
      'Have you had any exposure to your target industry through projects or education?'
    ],
    suggestedOutput: 'Industry match analysis with 3-4 viable transition paths, difficulty ratings, and step-by-step transition plans'
  },
  
  // Growth Planning - "What should I learn for future roles?"
  'build_skills': {
    intentTag: '#growthplan',
    title: 'Future Skills Roadmap',
    description: 'Identifies key skills to develop for future career growth',
    requiredFields: ['skills', 'work_experience', 'industry', 'education'],
    engines: ['Skill Map Engine', 'Learning Engine', 'Career Outcome Predictor'],
    followUpQuestions: [
      'Are you looking to advance in your current path or pivot to something new?',
      'What timeframe are you considering for your skill development (6 months, 1 year, 3 years)?',
      'Do you prefer technical skills or leadership/soft skills development?'
    ],
    suggestedOutput: 'Personalized learning roadmap with core skills, recommended resources, and timeline'
  },
  
  // Certifications - "What certification should I get?"
  'get_certifications': {
    intentTag: '#certifications',
    title: 'Certification Advisor',
    description: 'Recommends high-value certifications based on career goals',
    requiredFields: ['skills', 'work_experience', 'industry', 'education'],
    engines: ['Learning Engine', 'Career Outcome Predictor', 'Brandentifier Linker'],
    followUpQuestions: [
      'What is your primary goal with getting certified (career advancement, new role, credibility)?',
      'How much time can you dedicate to certification preparation?',
      'Are you looking for technical certifications or management/methodology certifications?'
    ],
    suggestedOutput: 'Ranked list of relevant certifications with ROI analysis, difficulty, and timeline'
  },
  
  // Job Readiness - "Why am I not getting interviews?"
  'prepare_interviews': {
    intentTag: '#jobreadiness',
    title: 'Interview Readiness Coach',
    description: 'Prepares candidates for successful job interviews',
    requiredFields: ['skills', 'work_experience', 'industry'],
    engines: ['Resume Optimizer', 'Skill Map Engine'],
    followUpQuestions: [
      'What types of roles are you applying for?',
      'At what stage in the interview process are you struggling?',
      'Have you received any feedback from previous interviews?'
    ],
    suggestedOutput: 'Interview preparation guide with resume optimization, common questions, and presentation strategy'
  },
  
  // Freelance/Startup - "Should I freelance/start something?"
  'launch_startup': {
    intentTag: '#entrepreneurship',
    title: 'Startup Readiness Evaluator',
    description: 'Assesses readiness and provides guidance for entrepreneurship',
    requiredFields: ['skills', 'work_experience', 'industry'],
    engines: ['Skill Map Engine', 'Career Outcome Predictor', 'Brandentifier Linker'],
    followUpQuestions: [
      'Do you have a specific business idea or service in mind?',
      'What is your risk tolerance (financial runway, family obligations)?',
      'Have you ever worked in a startup environment before?'
    ],
    suggestedOutput: 'Founder readiness assessment with concrete startup plan or freelancing strategy'
  },
  
  // Global Career - "I want to work abroad."
  'international': {
    intentTag: '#globalcareer',
    title: 'International Career Navigator',
    description: 'Guides professionals seeking international career opportunities',
    requiredFields: ['skills', 'work_experience', 'education', 'industry'],
    engines: ['Location Fit Engine', 'Skill Map Engine', 'Brandentifier Linker'],
    followUpQuestions: [
      'Do you have any target countries or regions in mind?',
      'Are you looking for short-term assignments or permanent relocation?',
      'What languages do you speak or are willing to learn?'
    ],
    suggestedOutput: 'Country-specific opportunities with visa guidance, cultural insights, and job market analysis'
  },
  
  // Custom Request - For any other career advice
  'custom': {
    intentTag: '#customadvice',
    title: 'Personalized Career Guidance',
    description: 'Provides tailored advice for unique career situations',
    requiredFields: ['skills', 'work_experience', 'industry'],
    engines: ['Skill Map Engine', 'Career Outcome Predictor', 'Brandentifier Linker'],
    followUpQuestions: [
      'Can you share more specific details about your current situation?',
      'What are your main career goals in the next 1-2 years?',
      'What specific aspects of your career are you looking to improve?'
    ],
    suggestedOutput: 'Personalized guidance based on the specific request with actionable next steps'
  }
};

/**
 * Get scenario intelligence for a specific advice type
 * @param adviceType The type of career advice
 * @returns The scenario intelligence configuration
 */
export function getScenarioIntelligence(adviceType: string): ScenarioIntelligence {
  // Convert to lowercase and normalize
  const normalizedType = adviceType.toLowerCase().trim();
  
  // Return the matching scenario or the default one
  return SCENARIO_MAP[normalizedType] || SCENARIO_MAP['custom'];
}

/**
 * Get system prompt for OpenAI based on scenario intelligence
 * @param scenario The scenario intelligence configuration
 * @param userName The user's name
 * @returns A system prompt for the AI model
 */
export function generateSystemPrompt(scenario: ScenarioIntelligence, userName: string): string {
  return `You are Musk, an expert career advisor within the Brandentifier platform specializing in ${scenario.title.toLowerCase()}.
  
Intent: ${scenario.intentTag}
Objective: ${scenario.description}

For ${userName}, you need to provide highly personalized career guidance using:
1. Analysis of their skills, experience, and background
2. Industry-specific insights and trends
3. Actionable next steps with clear milestones
4. Relevant Brandentifier features that can help them

Your response should be formatted with markdown headings, bullet points, and tables where appropriate.
Always maintain a confident, supportive tone while being direct and honest about challenges.

Key areas to address in your response:
- Current situation analysis
- Future opportunities mapping
- Concrete action steps (5-7 recommendations)
- Timeline with milestones
- Brandentifier platform features that support their goals

Ensure your advice is highly tailored to ${userName}'s specific circumstances, not generic career advice.`;
}

/**
 * Generate follow-up questions based on scenario
 * @param scenario The scenario intelligence configuration
 * @returns A list of follow-up questions
 */
export function getFollowUpQuestions(scenario: ScenarioIntelligence): string[] {
  return scenario.followUpQuestions;
}