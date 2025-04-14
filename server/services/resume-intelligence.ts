/**
 * Resume Intelligence System for Musk AI Resume Analysis
 * This module provides a structured approach to resume analysis based on
 * specific focus areas and user goals.
 */

export interface FocusArea {
  name: string;
  description: string;
  analysisPoints: string[];
  importance: string;
}

export interface AnalysisReport {
  type: string;
  title: string;
  description: string;
  format: string;
}

export interface FollowUpQuestion {
  type: string;
  purpose: string;
  examples: string[];
}

/**
 * Focus areas for resume analysis
 */
export const FOCUS_AREAS: FocusArea[] = [
  {
    name: 'Professional Summary',
    description: 'Tone, keywords, positioning',
    analysisPoints: [
      'Overall tone (confident, passive, technical, business-focused)',
      'Inclusion of relevant keywords for target roles',
      'How the candidate positions themselves professionally',
      'Self-identification language and authority signals'
    ],
    importance: 'Understands user\'s intent, voice, and seniority level'
  },
  {
    name: 'Job Roles & Titles',
    description: 'Titles, responsibilities, scope',
    analysisPoints: [
      'Progression of job titles over time',
      'Level of responsibility in each role',
      'Scope of influence (team, department, organization)',
      'Consistency of career narrative',
      'Industry-specific vs. generic role titles'
    ],
    importance: 'Maps career trajectory and job level accurately'
  },
  {
    name: 'Skills & Tools',
    description: 'Hard & soft skills, platforms used',
    analysisPoints: [
      'Technical skill clusters',
      'Technology stack familiarity',
      'Software and platform proficiency',
      'Soft skills demonstrated through achievements',
      'Currency of skills (latest vs. legacy technologies)',
      'Skill gaps for target roles'
    ],
    importance: 'Identifies strength clusters and gaps for development'
  },
  {
    name: 'Industry/Domain',
    description: 'Sectors worked in',
    analysisPoints: [
      'Primary and secondary industry experience',
      'Domain specialization depth',
      'Cross-industry transferable knowledge',
      'Industry-specific terminology usage',
      'Emerging sector experience'
    ],
    importance: 'Suggests relevant growth directions and potential pivots'
  },
  {
    name: 'Achievements',
    description: 'Metrics, impact statements',
    analysisPoints: [
      'Quantifiable results (%, $, metrics)',
      'Scale of impact (team, org, industry)',
      'Problem complexity addressed',
      'Strategic vs. tactical contributions',
      'Leadership vs. individual contributor achievements'
    ],
    importance: 'Determines strategic vs execution role fit and seniority'
  },
  {
    name: 'Education',
    description: 'Degrees, courses, certifications',
    analysisPoints: [
      'Formal education relevance to career path',
      'Specialized training and certifications',
      'Continuing education patterns',
      'Learning agility indicators',
      'Technical foundation depth'
    ],
    importance: 'Gauges technical base and learning curve potential'
  },
  {
    name: 'Location',
    description: 'Country/city/region',
    analysisPoints: [
      'Geographic mobility history',
      'Remote work experience',
      'Regional market alignment',
      'International exposure',
      'Location-specific opportunities'
    ],
    importance: 'Adapts suggestions to local or global opportunities'
  },
  {
    name: 'Progression',
    description: 'Career jumps, shifts, timelines',
    analysisPoints: [
      'Tenure at each position',
      'Promotion frequency and patterns',
      'Career acceleration periods',
      'Potential stagnation points',
      'Successful pivots and transitions'
    ],
    importance: 'Detects stagnation, acceleration, pivots for targeted advice'
  }
];

/**
 * Types of analysis reports Musk can generate
 */
export const ANALYSIS_REPORTS: AnalysisReport[] = [
  {
    type: 'strengths',
    title: 'Strengths Overview',
    description: 'Key hard/soft skills and domain strengths with examples from resume',
    format: 'Bulleted list of strengths with specific examples pulled from resume'
  },
  {
    type: 'weaknesses',
    title: 'Areas for Improvement',
    description: 'Gaps, inconsistencies, or outdated practices in the resume',
    format: 'Constructive feedback with specific improvement suggestions'
  },
  {
    type: 'career_path',
    title: 'Career Path Prediction',
    description: 'Suggested next 2-3 roles based on trend mapping',
    format: 'Visual path with role titles, requirements, and timeline'
  },
  {
    type: 'upskill',
    title: 'Upskill Opportunities',
    description: 'Certifications, tools, or concepts to learn for career growth',
    format: 'Prioritized list with learning resources and expected impact'
  },
  {
    type: 'resume_rewrite',
    title: 'Resume Rewrite Suggestions',
    description: 'Title, tone, ATS optimization tips for better market positioning',
    format: 'Before/after examples of key resume sections'
  },
  {
    type: 'global_fit',
    title: 'Global Fit Score',
    description: 'Where this profile fits best geographically and industry-wise',
    format: 'Top 3 industry and location matches with reasoning'
  },
  {
    type: 'brandentifier_match',
    title: 'Brandentifier Feature Match',
    description: 'Features to activate next for maximum career leverage',
    format: 'Personalized recommendations with clear next steps'
  }
];

/**
 * Follow-up questions Musk can ask
 */
export const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  {
    type: 'career_intent',
    purpose: 'Clarify user\'s immediate goal',
    examples: [
      'Are you aiming for a promotion, pivot, or a complete career switch?',
      'What is the primary goal of your job search right now?',
      'Are you looking to stay in your current industry or explore new sectors?'
    ]
  },
  {
    type: 'learning_openness',
    purpose: 'Gauge growth mindset and learning appetite',
    examples: [
      'Would you be open to learning new tools or technologies for career advancement?',
      'How much time can you currently dedicate to skill development?',
      'Are you more interested in technical skills or leadership development?'
    ]
  },
  {
    type: 'geographic_preferences',
    purpose: 'Understand location flexibility for targeted advice',
    examples: [
      'Are you open to working remotely or relocating for the right opportunity?',
      'Do you have any geographic preferences or restrictions for your next role?',
      'How important is location flexibility in your job search?'
    ]
  },
  {
    type: 'work_format',
    purpose: 'Determine preferred employment structure',
    examples: [
      'Are you looking for full-time roles, project-based work, or entrepreneurial opportunities?',
      'Would you consider contract or freelance work as part of your career strategy?',
      'Do you have any interest in starting your own business or consulting practice?'
    ]
  },
  {
    type: 'motivation_driver',
    purpose: 'Identify primary career values',
    examples: [
      'What motivates you most right now in your career: growth, income, stability, or freedom?',
      'How important is work-life balance in your next role?',
      'What would make your next career move truly fulfilling for you?'
    ]
  }
];

/**
 * Generate system prompt for resume analysis
 * @param userName The user's name
 * @returns A system prompt for the AI model
 */
export function generateResumeAnalysisPrompt(userName: string = 'User'): string {
  return `You are Musk, an expert resume analyzer within the Brandentifier platform. You have deep knowledge of professional development, hiring practices, and career advancement across many industries.

For ${userName}'s resume, carefully analyze the following key areas:

${FOCUS_AREAS.map(area => `- ${area.name} (${area.description}): ${area.importance}`).join('\n')}

After analyzing the resume, provide a comprehensive analysis that includes:

1. Strengths Overview: Key hard/soft skills and domain strengths with specific examples
2. Areas for Improvement: Gaps, inconsistencies, or outdated practices with suggestions
3. Resume Rewrite Suggestions: Specific improvements for better market positioning
4. Upskill Opportunities: Targeted recommendations for skills development
5. Brandentifier Feature Recommendations: How the platform can amplify their career

Your analysis must be EXTREMELY PERSONALIZED, using ${userName}'s specific name and directly referencing their exact experiences, skills, and background from their resume. Avoid generic advice - everything must be tailored to their specific situation.

When suggesting improvements, always mention how Brandentifier's features can help, including:
- Portfolio Builder for showcasing projects
- Smart Connect for strategic networking
- Services showcase for freelancers and consultants

Format your response with clear sections, bullet points, and emphasize key insights. Be direct but constructive in your feedback.`;
}

/**
 * Get follow-up questions based on resume analysis
 * @param questionTypes Types of questions to include
 * @returns A list of follow-up questions
 */
export function getFollowUpQuestions(questionTypes: string[] = []): string[] {
  if (questionTypes.length === 0) {
    // Return a balanced default set if no types specified
    return FOLLOW_UP_QUESTIONS.map(q => q.examples[0]);
  }
  
  // Return questions matching the requested types
  return FOLLOW_UP_QUESTIONS
    .filter(q => questionTypes.includes(q.type))
    .map(q => q.examples[0]);
}