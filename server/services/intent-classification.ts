/**
 * Intent Classification Service
 * 
 * Analyzes user messages to determine intent, emotional state, and appropriate advisor persona
 * for enhanced Musk AI responses.
 */

export interface MessageIntent {
  type: IntentType;
  confidence: number;
  emotionalState: EmotionalState;
  advisorPersona: AdvisorPersona;
  urgency: UrgencyLevel;
  subCategories: string[];
}

export type IntentType = 
  | 'career_confusion'      // User is confused about career path/direction
  | 'skill_building'        // User wants to learn/improve specific skills
  | 'resume_help'          // User needs resume/CV assistance
  | 'confidence_issues'    // User has low confidence/imposter syndrome
  | 'industry_switch'      // User wants to change industries/roles
  | 'interview_prep'       // User preparing for interviews
  | 'networking'           // User needs networking advice
  | 'job_search'          // User actively looking for jobs
  | 'career_planning'     // Long-term career strategy
  | 'workplace_issues'    // Problems at current job
  | 'salary_negotiation'  // Compensation discussions
  | 'general_advice'      // General career guidance

export type EmotionalState = 
  | 'confident'      // User feels positive and assured
  | 'overwhelmed'    // User feels stressed or confused
  | 'frustrated'     // User is dealing with setbacks
  | 'excited'        // User is enthusiastic about opportunities
  | 'uncertain'      // User is unsure about decisions
  | 'determined'     // User is focused and goal-oriented
  | 'anxious'        // User is worried about outcomes

export type AdvisorPersona = 
  | 'strategist'     // Clear, structured, action-oriented
  | 'coach'          // Empathetic, supportive, motivational
  | 'expert'         // Data-driven, analytical, industry-focused

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface ClassificationContext {
  userProfile?: {
    currentRole?: string;
    industry?: string;
    experienceLevel?: string;
    lookingFor?: string;
  };
  conversationHistory?: Array<{
    message: string;
    timestamp: Date;
    intent?: MessageIntent;
  }>;
  previousIntent?: MessageIntent;
}

/**
 * Classify user message intent using pattern matching and keyword analysis
 */
export function classifyIntent(message: string, context?: ClassificationContext): MessageIntent {
  const lowerMessage = message.toLowerCase();
  
  // Intent classification patterns
  const intentPatterns = {
    career_confusion: [
      'confused', 'lost', 'don\'t know', 'unsure', 'what should i do',
      'not sure', 'direction', 'path', 'stuck', 'which way'
    ],
    skill_building: [
      'learn', 'skill', 'improve', 'course', 'certification', 'training',
      'develop', 'upskill', 'master', 'practice', 'build'
    ],
    resume_help: [
      'resume', 'cv', 'application', 'cover letter', 'portfolio',
      'profile', 'linkedin', 'experience section', 'summary', 'compelling',
      'showcase', 'highlight', 'present', 'demonstrate', 'enhance', 'improve'
    ],
    confidence_issues: [
      'imposter', 'not good enough', 'qualified', 'worthy', 'deserve',
      'self-doubt', 'confidence', 'afraid', 'scared', 'nervous'
    ],
    industry_switch: [
      'switch', 'transition', 'change industry', 'move to', 'pivot',
      'different field', 'new industry', 'career change'
    ],
    interview_prep: [
      'interview', 'preparation', 'questions', 'practice', 'mock',
      'behavioral', 'technical interview', 'case study'
    ],
    networking: [
      'network', 'connections', 'meet people', 'reach out', 'contacts',
      'linkedin', 'events', 'community', 'mentorship'
    ],
    job_search: [
      'job', 'position', 'opening', 'application', 'hiring', 'recruit',
      'opportunity', 'vacancy', 'employment'
    ],
    career_planning: [
      'future', 'plan', 'goal', 'roadmap', '5 year', 'long term',
      'strategy', 'growth', 'advancement', 'progression'
    ],
    workplace_issues: [
      'boss', 'manager', 'colleague', 'toxic', 'conflict', 'problem',
      'office politics', 'difficult', 'harassment', 'stress'
    ],
    salary_negotiation: [
      'salary', 'compensation', 'raise', 'promotion', 'negotiate',
      'pay', 'benefits', 'package', 'increase'
    ]
  };

  // Emotional state patterns
  const emotionalPatterns = {
    overwhelmed: ['overwhelmed', 'too much', 'stressed', 'pressure', 'burned out'],
    frustrated: ['frustrated', 'annoyed', 'fed up', 'disappointed', 'upset'],
    excited: ['excited', 'thrilled', 'amazing', 'fantastic', 'love'],
    uncertain: ['uncertain', 'maybe', 'perhaps', 'not sure', 'possibly'],
    determined: ['determined', 'focused', 'ready', 'committed', 'going to'],
    anxious: ['worried', 'nervous', 'anxious', 'concerned', 'afraid'],
    confident: ['confident', 'sure', 'ready', 'capable', 'strong']
  };

  // Urgency indicators
  const urgencyPatterns = {
    high: ['urgent', 'asap', 'immediately', 'deadline', 'tomorrow', 'today'],
    medium: ['soon', 'this week', 'next week', 'quickly'],
    low: ['eventually', 'someday', 'future', 'long term']
  };

  // Calculate intent scores
  const intentScores: Record<IntentType, number> = {} as any;
  
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    intentScores[intent as IntentType] = patterns.reduce((score, pattern) => {
      return score + (lowerMessage.includes(pattern) ? 1 : 0);
    }, 0);
  }

  // Determine primary intent
  const primaryIntent = Object.entries(intentScores).reduce((a, b) => 
    intentScores[a[0] as IntentType] > intentScores[b[0] as IntentType] ? a : b
  )[0] as IntentType;

  // Calculate confidence based on pattern matches
  const maxScore = Math.max(...Object.values(intentScores));
  const confidence = maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.3; // Default low confidence

  // Determine emotional state
  let emotionalState: EmotionalState = 'uncertain';
  for (const [emotion, patterns] of Object.entries(emotionalPatterns)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      emotionalState = emotion as EmotionalState;
      break;
    }
  }

  // Determine urgency
  let urgency: UrgencyLevel = 'medium';
  for (const [level, patterns] of Object.entries(urgencyPatterns)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      urgency = level as UrgencyLevel;
      break;
    }
  }

  // Map intent to advisor persona
  const advisorPersona = mapIntentToPersona(primaryIntent, emotionalState);

  // Extract sub-categories based on specific keywords
  const subCategories = extractSubCategories(lowerMessage, primaryIntent);

  return {
    type: primaryIntent,
    confidence,
    emotionalState,
    advisorPersona,
    urgency,
    subCategories
  };
}

/**
 * Map intent and emotional state to appropriate advisor persona
 */
function mapIntentToPersona(intent: IntentType, emotional: EmotionalState): AdvisorPersona {
  // If user is overwhelmed, frustrated, or anxious, use coach persona
  if (['overwhelmed', 'frustrated', 'anxious'].includes(emotional)) {
    return 'coach';
  }

  // Map specific intents to personas
  const intentPersonaMap: Record<IntentType, AdvisorPersona> = {
    career_confusion: 'coach',
    skill_building: 'strategist',
    resume_help: 'expert',
    confidence_issues: 'coach',
    industry_switch: 'strategist',
    interview_prep: 'expert',
    networking: 'strategist',
    job_search: 'expert',
    career_planning: 'strategist',
    workplace_issues: 'coach',
    salary_negotiation: 'expert',
    general_advice: 'strategist'
  };

  return intentPersonaMap[intent] || 'strategist';
}

/**
 * Extract specific sub-categories from the message
 */
function extractSubCategories(message: string, intent: IntentType): string[] {
  const categories: string[] = [];
  
  // Technology-related keywords
  const techKeywords = ['javascript', 'python', 'react', 'node', 'ai', 'ml', 'data science'];
  if (techKeywords.some(keyword => message.includes(keyword))) {
    categories.push('technology');
  }

  // Management keywords
  const managementKeywords = ['management', 'leadership', 'team', 'manager', 'lead'];
  if (managementKeywords.some(keyword => message.includes(keyword))) {
    categories.push('management');
  }

  // Design keywords
  const designKeywords = ['design', 'ux', 'ui', 'creative', 'visual'];
  if (designKeywords.some(keyword => message.includes(keyword))) {
    categories.push('design');
  }

  // Sales/Marketing keywords
  const salesKeywords = ['sales', 'marketing', 'business development', 'growth'];
  if (salesKeywords.some(keyword => message.includes(keyword))) {
    categories.push('sales_marketing');
  }

  return categories;
}

/**
 * Analyze conversation context to improve classification accuracy
 */
export function analyzeConversationContext(
  currentMessage: string,
  conversationHistory: Array<{ message: string; intent?: MessageIntent }>
): { 
  contextualIntent: MessageIntent;
  conversationFlow: string;
  topicContinuity: boolean;
} {
  const currentIntent = classifyIntent(currentMessage);
  
  if (conversationHistory.length === 0) {
    return {
      contextualIntent: currentIntent,
      conversationFlow: 'new_conversation',
      topicContinuity: false
    };
  }

  const lastIntent = conversationHistory[conversationHistory.length - 1]?.intent;
  const topicContinuity = lastIntent ? lastIntent.type === currentIntent.type : false;

  // Adjust confidence based on conversation continuity
  if (topicContinuity && lastIntent) {
    currentIntent.confidence = Math.min(currentIntent.confidence + 0.2, 1.0);
  }

  // Determine conversation flow
  const flowPatterns = {
    deepening: topicContinuity && conversationHistory.length > 2,
    pivoting: !topicContinuity && conversationHistory.length > 0,
    exploring: conversationHistory.length > 3 && !topicContinuity
  };

  const conversationFlow = Object.entries(flowPatterns).find(([_, condition]) => condition)?.[0] || 'continuing';

  return {
    contextualIntent: currentIntent,
    conversationFlow,
    topicContinuity
  };
}