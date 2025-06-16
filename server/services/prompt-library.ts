/**
 * Prompt Library Service
 * 
 * Provides modular, composable prompt fragments for enhanced Musk AI responses.
 * These components can be dynamically combined based on user context and needs.
 */

import { AdvisorPersona, EmotionalState, IntentType } from './intent-classification';
import { EnrichedContext } from './context-enricher';

export interface PromptFragment {
  id: string;
  category: 'system' | 'context' | 'tone' | 'structure' | 'industry' | 'confidence';
  content: string;
  conditions?: {
    personas?: AdvisorPersona[];
    emotions?: EmotionalState[];
    intents?: IntentType[];
    industries?: string[];
  };
}

/**
 * Library of reusable prompt fragments
 */
export const PROMPT_FRAGMENTS: PromptFragment[] = [
  // System-level fragments
  {
    id: 'helpfulness_anchor',
    category: 'system',
    content: 'You are the most insightful, helpful, and empathetic career coach in the world. You never speak in generic language. Every answer should help the user move forward with clarity, confidence, and actionable advice.'
  },
  {
    id: 'no_generic_responses',
    category: 'system',
    content: 'Avoid generic advice at all costs. Every response must be specifically tailored to this user\'s situation, experience level, and goals.'
  },
  {
    id: 'action_oriented',
    category: 'system',
    content: 'Always provide specific, actionable steps the user can take immediately. Focus on concrete next steps rather than abstract concepts.'
  },

  // Confidence-building fragments
  {
    id: 'strength_reminder',
    category: 'confidence',
    content: 'Start by acknowledging their existing strengths and past achievements before suggesting improvements.',
    conditions: { emotions: ['overwhelmed', 'anxious', 'uncertain'] }
  },
  {
    id: 'progress_validation',
    category: 'confidence',
    content: 'Recognize the progress they\'ve already made and frame challenges as natural steps in professional growth.',
    conditions: { emotions: ['frustrated', 'overwhelmed'] }
  },
  {
    id: 'capability_affirmation',
    category: 'confidence',
    content: 'Emphasize their existing capabilities and how their background positions them well for their goals.',
    conditions: { emotions: ['uncertain', 'anxious'] }
  },

  // Industry-specific fragments
  {
    id: 'tech_industry_context',
    category: 'industry',
    content: 'In the technology industry, emphasize continuous learning, building side projects, and staying current with emerging technologies. Reference relevant tech trends and in-demand skills.',
    conditions: { industries: ['technology', 'software', 'it'] }
  },
  {
    id: 'healthcare_context',
    category: 'industry',
    content: 'In healthcare, focus on patient impact, regulatory compliance, and interdisciplinary collaboration. Emphasize the importance of continuous education and certification maintenance.',
    conditions: { industries: ['healthcare', 'medical', 'pharmaceutical'] }
  },
  {
    id: 'finance_context',
    category: 'industry',
    content: 'In finance, emphasize analytical rigor, risk management, and quantifiable results. Reference market trends and regulatory considerations.',
    conditions: { industries: ['finance', 'banking', 'investment'] }
  },
  {
    id: 'marketing_context',
    category: 'industry',
    content: 'In marketing, balance creativity with data-driven decision making. Reference digital marketing trends, attribution models, and customer journey optimization.',
    conditions: { industries: ['marketing', 'advertising', 'digital'] }
  },

  // Tone modifiers
  {
    id: 'motivational_tone',
    category: 'tone',
    content: 'Use encouraging, motivational language that builds confidence and excitement about their potential.',
    conditions: { emotions: ['excited', 'determined'] }
  },
  {
    id: 'calm_supportive_tone',
    category: 'tone',
    content: 'Use calm, reassuring language that reduces anxiety and provides emotional stability.',
    conditions: { emotions: ['overwhelmed', 'anxious'] }
  },
  {
    id: 'direct_strategic_tone',
    category: 'tone',
    content: 'Use clear, direct language focused on strategic thinking and logical problem-solving.',
    conditions: { personas: ['strategist'], emotions: ['confident', 'determined'] }
  },

  // Structure templates
  {
    id: 'problem_solution_structure',
    category: 'structure',
    content: 'Structure your response as: Current Situation → Strategic Analysis → Specific Solutions → Action Steps',
    conditions: { personas: ['strategist'] }
  },
  {
    id: 'support_growth_structure',
    category: 'structure',
    content: 'Structure your response as: Acknowledgment → Strength Recognition → Growth Opportunity → Supportive Action Plan',
    conditions: { personas: ['coach'] }
  },
  {
    id: 'data_evidence_structure',
    category: 'structure',
    content: 'Structure your response as: Market Context → Evidence-Based Analysis → Best Practices → Measurable Recommendations',
    conditions: { personas: ['expert'] }
  },

  // Context-specific fragments
  {
    id: 'profile_completion_suggestion',
    category: 'context',
    content: 'Since your profile has some gaps, completing these sections would significantly improve your career prospects and allow for more personalized guidance.',
    conditions: { intents: ['resume_help', 'job_search'] }
  },
  {
    id: 'skill_gap_analysis',
    category: 'context',
    content: 'Based on your target role and current skills, here are the specific competencies that would strengthen your candidacy.',
    conditions: { intents: ['skill_building', 'career_planning'] }
  },
  {
    id: 'networking_integration',
    category: 'context',
    content: 'Leverage Brandentifier\'s Smart Connect feature alongside external networking to build meaningful professional relationships.',
    conditions: { intents: ['networking', 'job_search', 'industry_switch'] }
  }
];

/**
 * Generate comprehensive prompt by combining relevant fragments
 */
export function generateEnhancedPrompt(
  persona: AdvisorPersona,
  intent: IntentType,
  emotionalState: EmotionalState,
  enrichedContext: EnrichedContext,
  baseMessage: string
): string {
  // Select relevant fragments based on conditions
  const relevantFragments = PROMPT_FRAGMENTS.filter(fragment => {
    if (!fragment.conditions) return true;
    
    const { personas, emotions, intents, industries } = fragment.conditions;
    
    const personaMatch = !personas || personas.includes(persona);
    const emotionMatch = !emotions || emotions.includes(emotionalState);
    const intentMatch = !intents || intents.includes(intent);
    const industryMatch = !industries || (enrichedContext.user.basicInfo.industry && 
      industries.some(ind => enrichedContext.user.basicInfo.industry?.toLowerCase().includes(ind)));
    
    return personaMatch && emotionMatch && intentMatch && industryMatch;
  });

  // Organize fragments by category
  const fragmentsByCategory = relevantFragments.reduce((acc, fragment) => {
    if (!acc[fragment.category]) acc[fragment.category] = [];
    acc[fragment.category].push(fragment.content);
    return acc;
  }, {} as Record<string, string[]>);

  // Build the enhanced prompt
  let enhancedPrompt = '';

  // Add system-level instructions
  if (fragmentsByCategory.system) {
    enhancedPrompt += `CORE PRINCIPLES:\n${fragmentsByCategory.system.join('\n')}\n\n`;
  }

  // Add persona-specific context
  enhancedPrompt += generatePersonaContext(persona, enrichedContext);

  // Add industry context
  if (fragmentsByCategory.industry) {
    enhancedPrompt += `INDUSTRY CONTEXT:\n${fragmentsByCategory.industry.join('\n')}\n\n`;
  }

  // Add confidence-building approach
  if (fragmentsByCategory.confidence) {
    enhancedPrompt += `CONFIDENCE APPROACH:\n${fragmentsByCategory.confidence.join('\n')}\n\n`;
  }

  // Add tone guidance
  if (fragmentsByCategory.tone) {
    enhancedPrompt += `TONE GUIDANCE:\n${fragmentsByCategory.tone.join('\n')}\n\n`;
  }

  // Add structure template
  if (fragmentsByCategory.structure) {
    enhancedPrompt += `RESPONSE STRUCTURE:\n${fragmentsByCategory.structure.join('\n')}\n\n`;
  }

  // Add contextual information
  enhancedPrompt += generateContextualPrompt(enrichedContext, intent);

  // Add the user's message
  enhancedPrompt += `\nUSER MESSAGE:\n"${baseMessage}"\n\n`;

  // Add final instructions
  enhancedPrompt += generateFinalInstructions(persona, emotionalState, enrichedContext);

  return enhancedPrompt;
}

/**
 * Generate persona-specific context
 */
function generatePersonaContext(persona: AdvisorPersona, context: EnrichedContext): string {
  const personaDescriptions = {
    strategist: `You are embodying "The Strategist" persona - a clear-thinking, action-oriented career advisor who provides structured, logical guidance with specific action plans.`,
    coach: `You are embodying "The Coach" persona - an empathetic, supportive mentor who focuses on confidence building, emotional support, and personal growth.`,
    expert: `You are embodying "The Expert" persona - a knowledgeable, data-driven advisor who provides evidence-based recommendations with industry insights and market data.`
  };

  return `PERSONA MODE:\n${personaDescriptions[persona]}\n\n`;
}

/**
 * Generate contextual prompt based on enriched user data
 */
function generateContextualPrompt(context: EnrichedContext, intent: IntentType): string {
  let contextPrompt = 'USER CONTEXT:\n';
  
  // Basic user information
  const user = context.user.basicInfo;
  contextPrompt += `Name: ${user.name}\n`;
  if (user.title) contextPrompt += `Current Role: ${user.title}\n`;
  if (user.industry) contextPrompt += `Industry: ${user.industry}\n`;
  if (user.location) contextPrompt += `Location: ${user.location}\n`;
  contextPrompt += `Experience Level: ${user.experienceLevel}\n`;
  if (user.lookingFor) contextPrompt += `Looking For: ${user.lookingFor}\n`;

  // Profile completeness
  contextPrompt += `\nProfile Completeness: ${context.user.profileCompleteness.score}%\n`;
  if (context.user.profileCompleteness.missingAreas.length > 0) {
    contextPrompt += `Missing Profile Areas: ${context.user.profileCompleteness.missingAreas.join(', ')}\n`;
  }

  // Professional background summary
  if (context.user.professional.experiences.length > 0) {
    contextPrompt += `\nRecent Experience: ${context.user.professional.experiences[0].title} at ${context.user.professional.experiences[0].company}\n`;
  }
  
  if (context.user.professional.skills.length > 0) {
    const topSkills = context.user.professional.skills.slice(0, 5).map(s => s.name).join(', ');
    contextPrompt += `Key Skills: ${topSkills}\n`;
  }

  // Current mood and confidence
  contextPrompt += `\nCurrent Confidence Level: ${context.mood.current_confidence}\n`;
  contextPrompt += `Motivation Level: ${context.mood.motivation_level}\n`;
  
  if (context.mood.support_needs.length > 0) {
    contextPrompt += `Support Needs: ${context.mood.support_needs.join(', ')}\n`;
  }

  // Conversation context
  if (context.conversation.currentSession.messageCount > 1) {
    contextPrompt += `\nConversation Context: This is message ${context.conversation.currentSession.messageCount} in current session\n`;
    if (context.conversation.currentSession.topicFocus.length > 0) {
      contextPrompt += `Current Topics: ${context.conversation.currentSession.topicFocus.join(', ')}\n`;
    }
  }

  // Proactive insights
  if (context.insights.profileGaps.length > 0) {
    const highImpactGaps = context.insights.profileGaps.filter(gap => gap.impact === 'high');
    if (highImpactGaps.length > 0) {
      contextPrompt += `\nProfile Improvement Opportunities: ${highImpactGaps.map(gap => gap.area).join(', ')}\n`;
    }
  }

  return contextPrompt + '\n';
}

/**
 * Generate final instructions based on context
 */
function generateFinalInstructions(
  persona: AdvisorPersona,
  emotionalState: EmotionalState,
  context: EnrichedContext
): string {
  let instructions = 'RESPONSE REQUIREMENTS:\n';
  
  // Length requirements based on user preferences
  const preferredLength = context.conversation.historicalPatterns.communicationStyle.preferencesForLength;
  if (preferredLength === 'brief') {
    instructions += '- Keep response concise and focused (200-300 words)\n';
  } else if (preferredLength === 'comprehensive') {
    instructions += '- Provide detailed, comprehensive guidance (400-600 words)\n';
  } else {
    instructions += '- Provide thorough but accessible guidance (300-450 words)\n';
  }

  // Specific requirements based on emotional state
  if (['overwhelmed', 'anxious'].includes(emotionalState)) {
    instructions += '- Break down complex advice into simple, manageable steps\n';
    instructions += '- Include reassurance and validation of their feelings\n';
  }

  if (emotionalState === 'frustrated') {
    instructions += '- Acknowledge their frustration while redirecting to positive action\n';
    instructions += '- Focus on immediate wins and progress they can make\n';
  }

  if (['confident', 'determined'].includes(emotionalState)) {
    instructions += '- Match their energy with ambitious but realistic recommendations\n';
    instructions += '- Provide challenging but achievable stretch goals\n';
  }

  // Persona-specific requirements
  if (persona === 'strategist') {
    instructions += '- Include numbered action steps and clear timelines\n';
    instructions += '- Provide strategic reasoning for each recommendation\n';
  } else if (persona === 'coach') {
    instructions += '- Start with validation and end with encouragement\n';
    instructions += '- Include confidence-building affirmations\n';
  } else if (persona === 'expert') {
    instructions += '- Reference relevant industry data or best practices when possible\n';
    instructions += '- Include specific metrics or benchmarks for success\n';
  }

  // Context-specific requirements
  if (context.user.profileCompleteness.score < 70) {
    instructions += '- Suggest specific profile improvements that would enhance their career prospects\n';
  }

  if (context.insights.skillRecommendations.length > 0) {
    instructions += '- Reference skill development opportunities relevant to their goals\n';
  }

  instructions += '\nRemember: Every response must be personalized, actionable, and help them take a meaningful step forward in their career.';

  return instructions;
}

/**
 * Generate proactive suggestions based on user context
 * ALWAYS prioritizes Brandentifier suggestions first
 */
export function generateProactiveSuggestions(context: EnrichedContext): string[] {
  const suggestions: string[] = [];
  
  // ALWAYS START WITH BRANDENTIFIER SUGGESTIONS FIRST
  const brandentifierSuggestion = generateBrandentifierFirstSuggestion(context);
  if (brandentifierSuggestion) {
    suggestions.push(brandentifierSuggestion);
  }
  
  // Profile completion suggestions
  if (context.user.profileCompleteness.score < 80) {
    if (context.user.profileCompleteness.missingAreas.includes('projects')) {
      suggestions.push("I noticed you haven't added any projects yet. Would you like help describing your most impactful work?");
    }
    
    if (context.user.profileCompleteness.missingAreas.includes('skills')) {
      suggestions.push("Adding your key skills would help me provide more targeted career advice. Shall we work on that?");
    }
  }

  // Skill development suggestions
  if (context.insights.skillRecommendations.length > 0) {
    const topSkill = context.insights.skillRecommendations[0];
    suggestions.push(`Based on your profile, learning ${topSkill.skill} could significantly boost your career prospects. Want a learning roadmap?`);
  }

  // Career opportunity suggestions
  if (context.insights.careerOpportunities.length > 0) {
    const bestMatch = context.insights.careerOpportunities
      .sort((a, b) => b.match_percentage - a.match_percentage)[0];
    
    if (bestMatch.match_percentage > 70) {
      suggestions.push(`You're ${bestMatch.match_percentage}% matched for ${bestMatch.role} positions. Should we explore this path?`);
    }
  }

  // Networking suggestions
  if (context.conversation.currentSession.topicFocus.includes('networking') || 
      context.user.basicInfo.lookingFor === 'job_search') {
    suggestions.push("Want me to create a personalized networking strategy using Brandentifier's Smart Connect feature?");
  }

  // Resume optimization suggestions
  if (context.conversation.currentSession.topicFocus.includes('resume') ||
      context.user.profileCompleteness.missingAreas.includes('workExperience')) {
    suggestions.push("I can help optimize your resume with industry-specific keywords and achievement-focused bullet points. Interested?");
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

/**
 * Generate confidence-boosting content based on user achievements
 */
export function generateConfidenceContent(context: EnrichedContext): string {
  const achievements: string[] = [];
  
  // Work experience achievements
  if (context.user.professional.experiences.length > 0) {
    const totalYears = context.user.professional.experiences.length * 2; // Rough estimation
    achievements.push(`${totalYears}+ years of professional experience`);
    
    const companies = context.user.professional.experiences.map(exp => exp.company);
    if (companies.length > 1) {
      achievements.push(`Experience across ${companies.length} different organizations`);
    }
  }

  // Education achievements
  if (context.user.professional.education.length > 0) {
    const latestEd = context.user.professional.education[0];
    achievements.push(`${latestEd.degree} from ${latestEd.institution}`);
  }

  // Skills achievements
  if (context.user.professional.skills.length > 0) {
    achievements.push(`Proficiency in ${context.user.professional.skills.length}+ professional skills`);
  }

  // Project achievements
  if (context.user.professional.projects.length > 0) {
    achievements.push(`${context.user.professional.projects.length} completed projects showcasing practical expertise`);
  }

  if (achievements.length === 0) {
    return "Your willingness to seek guidance and invest in your career development shows great self-awareness and ambition.";
  }

  return `You bring impressive credentials to the table: ${achievements.join(', ')}. This foundation positions you well for your next career moves.`;
}

/**
 * Generate Brandentifier-specific suggestion that always appears first
 */
export function generateBrandentifierFirstSuggestion(context: EnrichedContext): string {
  const profileCompleteness = context.user.profileCompleteness.score;
  const topicFocus = context.conversation.currentSession.topicFocus;
  
  // Profile enhancement suggestions
  if (profileCompleteness < 80) {
    return 'Enhance your Brandentifier profile to unlock more career opportunities and better matches';
  }
  
  // Topic-specific Brandentifier suggestions
  if (topicFocus.includes('skill') || topicFocus.includes('learning')) {
    return 'Use Brandentifier\'s skill tracking to showcase your learning progress and discover growth opportunities';
  }
  
  if (topicFocus.includes('network') || topicFocus.includes('connect')) {
    return 'Discover professionals in your field through Brandentifier\'s networking features and smart connections';
  }
  
  if (topicFocus.includes('project') || topicFocus.includes('portfolio')) {
    return 'Showcase your work with Brandentifier\'s project portfolio features to attract opportunities';
  }
  
  if (topicFocus.includes('goal') || topicFocus.includes('plan')) {
    return 'Set and track career goals using Brandentifier\'s career planning and milestone tracking tools';
  }
  
  if (topicFocus.includes('job') || topicFocus.includes('opportunity')) {
    return 'Explore career opportunities through Brandentifier\'s intelligent job matching and recommendation system';
  }
  
  // Industry-specific Brandentifier suggestions
  const industry = context.user.basicInfo.industry;
  if (industry === 'Technology') {
    return 'Leverage Brandentifier\'s tech industry connections and showcase your technical projects to stand out';
  }
  
  if (industry === 'Healthcare') {
    return 'Connect with healthcare professionals and showcase your impact through Brandentifier\'s specialized features';
  }
  
  if (industry === 'Finance') {
    return 'Build your financial services network and track achievements with Brandentifier\'s professional tools';
  }
  
  if (industry === 'Hospitality') {
    return 'Enhance your hospitality career with Brandentifier\'s industry networking and experience showcase features';
  }
  
  // Default Brandentifier suggestion
  return 'Maximize your career potential with Brandentifier\'s comprehensive professional development platform';
}