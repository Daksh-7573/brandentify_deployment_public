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
      'Self-identification language and authority signals',
      'Tone & intent (passive vs. confident vs. aspirational)',
      'Buzzword vs. impactful language'
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
      'Industry-specific vs. generic role titles',
      'Job hopping patterns (instability vs. fast-growth)',
      'Titles vs. actual responsibilities alignment'
    ],
    importance: 'Maps career trajectory and job level accurately'
  },
  {
    name: 'Skills & Tools',
    description: 'Hard & soft skills, platforms used',
    analysisPoints: [
      'Technical skill clusters',
      'Technology stack familiarity',
      'Software and platform proficiency levels',
      'Soft skills demonstrated through achievements',
      'Currency of skills (latest vs. legacy technologies)',
      'Skill gaps for target roles',
      'Cross-functional capabilities (e.g., marketing + analytics = growth potential)',
      'Stack experience with proficiency indicators'
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
      'Emerging sector experience',
      'Current market demand alignment',
      'Future industry trends positioning'
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
      'Leadership vs. individual contributor achievements',
      'Accomplishment vs. responsibility classification',
      'Action verb strength analysis'
    ],
    importance: 'Determines strategic vs execution role fit and seniority'
  },
  {
    name: 'Career Gaps & Patterns',
    description: 'Timeline analysis, progression',
    analysisPoints: [
      'Career gap detection and explanation opportunities',
      'Tenure at each position',
      'Promotion frequency and patterns',
      'Career acceleration periods',
      'Potential stagnation points',
      'Job-hopping patterns and narrative'
    ],
    importance: 'Identifies career pattern strengths and challenges to address'
  },
  {
    name: 'Education & Learning',
    description: 'Degrees, courses, certifications',
    analysisPoints: [
      'Formal education relevance to career path',
      'Specialized training and certifications',
      'Continuing education patterns',
      'Learning agility indicators',
      'Technical foundation depth',
      'Certifications vs. short courses distinction',
      'Education timeline alignment with career'
    ],
    importance: 'Gauges technical base and learning curve potential'
  },
  {
    name: 'ATS Optimization',
    description: 'Applicant Tracking System compatibility',
    analysisPoints: [
      'Keyword optimization for target roles',
      'Standard section headings usage',
      'Parsing-friendly formatting',
      'Clean, machine-readable structure',
      'Modern resume best practices alignment',
      'Graphics/tables/complex elements that confuse ATS'
    ],
    importance: 'Essential for getting past automated screening systems'
  },
  {
    name: 'Format & Presentation',
    description: 'Visual structure and readability',
    analysisPoints: [
      'Length appropriateness (1-2 pages)',
      'Formatting consistency',
      'White space utilization',
      'Section order and prominence',
      'Readability for human reviewers',
      'Design elements effectiveness'
    ],
    importance: 'Creates strong first impression and enhances content readability'
  },
  {
    name: 'Market Positioning',
    description: 'Competitive job market alignment',
    analysisPoints: [
      'Current job market demand matching',
      'Comparison to top performer resumes in same industry',
      'Modern best practices alignment',
      'Career style indicators (Climber, Explorer, Stable)',
      'Role direction (Specialist vs. Generalist)',
      'Global readiness signals'
    ],
    importance: 'Positions candidate optimally for current market opportunities'
  },
  {
    name: 'Personal Traits',
    description: 'Character and work style indicators',
    analysisPoints: [
      'Personality type indicators (Builder, Thinker, Seller, Leader)',
      'Leadership potential signals',
      'Teamwork and collaboration evidence',
      'Communication style indicators',
      'Problem-solving approach clues',
      'Work ethic and motivation signals'
    ],
    importance: 'Reveals cultural fit and personal success factors'
  },
  {
    name: 'Global Mobility',
    description: 'Geographic flexibility indicators',
    analysisPoints: [
      'Geographic mobility history',
      'Remote work experience',
      'Regional market alignment',
      'International exposure',
      'Location-specific opportunities',
      'Language skills and cultural adaptability'
    ],
    importance: 'Adapts suggestions to local or global opportunities'
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
  },
  {
    type: 'career_pattern',
    title: 'Career Pattern Intelligence',
    description: 'Analysis of career gaps, job-hopping, and progression patterns',
    format: 'Pattern detection with explanations and strategic recommendations'
  },
  {
    type: 'persona_profile',
    title: 'Professional Persona Profile',
    description: 'Career style, role direction, and personality type indicators',
    format: 'Persona identification with strengths and growth opportunities'
  },
  {
    type: 'market_comparison',
    title: 'Market Comparison Analysis',
    description: 'How this resume compares to top performers in same industry',
    format: 'Gap analysis with specific recommendations to meet market standards'
  },
  {
    type: 'ats_optimization',
    title: 'ATS Compatibility Score',
    description: 'How well the resume works with Applicant Tracking Systems',
    format: 'Technical assessment with specific formatting and keyword recommendations'
  },
  {
    type: 'impact_enhancement',
    title: 'Achievement Impact Enhancement',
    description: 'Converting responsibilities to quantifiable accomplishments',
    format: 'Before/after examples transforming duties into measurable results'
  },
  {
    type: 'tone_analysis',
    title: 'Language & Tone Analysis',
    description: 'Assessment of confidence level and language effectiveness',
    format: 'Language pattern evaluation with specific phrasing improvements'
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
  },
  {
    type: 'career_gaps',
    purpose: 'Understand career gap context for better recommendations',
    examples: [
      'I noticed a gap in your employment between [dates]. Would you like advice on how to address this effectively?',
      'How did you stay current with industry trends during your career break?',
      'Did you pursue any informal learning or personal projects during your time away from formal employment?'
    ]
  },
  {
    type: 'job_hopping',
    purpose: 'Address potential concerns with multiple short-term roles',
    examples: [
      'I notice you\'ve held several positions in a relatively short timeframe. Was this part of a deliberate growth strategy?',
      'How would you like to frame your diverse experience to employers who might be concerned about job stability?',
      'What key skills did you gain from making multiple career moves that might benefit potential employers?'
    ]
  },
  {
    type: 'career_direction',
    purpose: 'Clarify preferred career trajectory',
    examples: [
      'Based on your resume, I see potential for both specialist and generalist paths. Which direction interests you more?',
      'Are you more interested in deepening your technical expertise or moving toward management roles?',
      'Would you characterize your ideal career as more of a steady climb, an explorer path, or stability-focused?'
    ]
  },
  {
    type: 'resume_rewrite',
    purpose: 'Determine focus areas for resume enhancement',
    examples: [
      'Which section of your resume would you like to prioritize improving first?',
      'Are you interested in a complete resume rewrite or targeted improvements to key sections?',
      'Would you prefer your resume to emphasize your technical skills or leadership capabilities?'
    ]
  },
  {
    type: 'ats_optimization',
    purpose: 'Address applicant tracking system compatibility',
    examples: [
      'Have you been applying through online job portals or applicant tracking systems?',
      'Are there specific job descriptions or roles you\'d like your resume optimized for?',
      'Have you had challenges getting past the initial screening stage in applications?'
    ]
  },
  {
    type: 'achievement_focus',
    purpose: 'Help transform responsibilities into achievements',
    examples: [
      'Could you share any metrics or quantifiable results from your recent roles that aren\'t currently in your resume?',
      'What specific project outcomes are you most proud of in your career?',
      'Would you like guidance on how to quantify and highlight your achievements more effectively?'
    ]
  },
  {
    type: 'cross_functional',
    purpose: 'Identify multi-skill potential',
    examples: [
      'I notice you have experience in both [skill area 1] and [skill area 2]. Would you like to explore roles that combine these skill sets?',
      'Have you considered positions that bridge your technical abilities with your business knowledge?',
      'Which of your cross-functional skill combinations do you think is most valuable in today\'s job market?'
    ]
  }
];

/**
 * Generate system prompt for resume analysis
 * @param userName The user's name
 * @returns A system prompt for the AI model
 */
export function generateResumeAnalysisPrompt(userName: string = 'User'): string {
  return `You are Musk, an expert resume analyzer within the Brandentifier platform. You have deep knowledge of professional development, hiring practices, and career advancement across many industries. You're equipped with advanced pattern recognition and contextual intelligence capabilities.

For ${userName}'s resume, carefully analyze the following key areas:

${FOCUS_AREAS.map(area => `- ${area.name} (${area.description}): ${area.importance}`).join('\n')}

After analyzing the resume, provide a comprehensive analysis with VERY STRUCTURED FORMATTING as follows:

# Resume Analysis for ${userName}

## 1. Strengths Overview (Score: X/100)
- ✅ [Strength 1]: Specific example from their resume
- ✅ [Strength 2]: Specific example from their resume
- ✅ [Strength 3]: Specific example from their resume
(Include 4-6 specific strengths with clear examples from their resume)

## 2. Areas for Improvement (Score: X/100)
- 🔹 [Improvement Area 1]:
  - Current issue: What's currently in their resume
  - Suggestion: Specific improvement recommendation
  - Example: Before/after example

- 🔹 [Improvement Area 2]:
  - Current issue: What's currently in their resume
  - Suggestion: Specific improvement recommendation
  - Example: Before/after example
(Include 3-5 improvement areas with clear examples)

## 3. Resume Rewrite Suggestions
- 📝 [Section to Revise 1]:
  ❌ Current version: "..." (use actual text from resume)
  ✅ Improved version: "..." (your suggested revision)

- 📝 [Section to Revise 2]:
  ❌ Current version: "..." (use actual text from resume)
  ✅ Improved version: "..." (your suggested revision)
(Include 2-3 specific sections with before/after examples)

## 4. Career Pattern Insights
- 📊 [Pattern 1]: What this pattern reveals about their career trajectory
- 📊 [Pattern 2]: What this pattern suggests about their professional style 
(Include insights on career gaps, job-hopping patterns, specialist vs. generalist trends, or leadership trajectory)

## 5. Market Position Assessment
- 🌍 Current Market Alignment: How their resume compares to industry expectations
- 🌍 Competitive Edge: Their unique value compared to others in similar roles
- 🌍 Future Positioning: How market trends affect their career opportunities

## 6. Upskill Opportunities
- 🌟 [Priority Skill 1]: Justification and specific learning resource
- 🌟 [Priority Skill 2]: Justification and specific learning resource
- 🌟 [Priority Skill 3]: Justification and specific learning resource
(Include 3-4 skills with specific learning resources)

## 7. Persona Indicators
- 👤 Career Style: Climber, Explorer, or Stable based on their patterns
- 👤 Role Direction: Specialist, Generalist, or Hybrid trajectory
- 👤 Work Type: Builder, Thinker, Seller, or Leader tendencies

## 8. Brandentifier Features to Leverage
- 📱 Portfolio Builder: How to showcase specific projects/skills from their resume
- 📱 Smart Connect: Specific networking recommendations based on their background
- 📱 Services Showcase: How to position their expertise as services

## 9. Quick Wins (30-Day Plan)
1. [Quick Win 1]: Specific action with expected outcome
2. [Quick Win 2]: Specific action with expected outcome
3. [Quick Win 3]: Specific action with expected outcome

Your analysis must be EXTREMELY PERSONALIZED, using ${userName}'s specific name and directly referencing their exact experiences, skills, and background from their resume. Avoid generic advice - everything must be tailored to their specific situation.

For behavioral nudging, adapt your opening tone based on resume quality:
- For resumes with weak or no quantifiable achievements: "Let's give your CV a power-up!"
- For resumes with passive wording: "You've done more than your resume shows. Let me fix that."
- For resumes with solid experience but poor formatting: "Your experience is solid, but the design might be hurting you."
- For resumes showing high impact but suggesting low compensation: "You might be undercharging based on your results."

Use emoji bullet points (✅, 🔹, 📝, 🌟, etc.) consistently to create visual hierarchy. Create clear, visually distinct sections with proper Markdown formatting (# for main headings, ## for subheadings). Use bold for emphasis on key points.

After your analysis, suggest 1-2 appropriate follow-up questions based on what you detected in their resume (e.g., career gaps, job-hopping patterns, cross-functional skills).

Be direct but constructive in your feedback. Format each section exactly as shown above with proper spacing and hierarchy.`;
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