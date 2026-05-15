/**
 * Follow-Up Intelligence Layer (FIL)
 * 
 * Generates purposeful, outcome-focused follow-up questions that:
 * - Reduce uncertainty
 * - Create actionable steps
 * - Unlock missing context
 * - Move toward measurable outcomes
 */

import { MuskContext } from './musk-intelligence-system';

// Follow-up question purpose classification
export enum FollowUpPurpose {
  CLARIFY = 'clarify',      // Resolve ambiguity
  EXPAND = 'expand',        // Provide additional context
  DECIDE = 'decide',        // Help user make a decision
  EXECUTE = 'execute',      // Move toward action
  VALIDATE = 'validate',    // Confirm alignment with goals
  REFLECT = 'reflect'       // Encourage self-assessment
}

// Conversation memory to track continuity
export interface ConversationMemory {
  lastResolvedTopic?: string;
  lastUnresolvedQuestion?: string;
  recentIntents: string[];
  topicContinuity: string[];
}

// Profile gap with enhanced impact scoring
export interface ProfileGap {
  field: string;
  isEmpty: boolean;
  importanceWeight: number;  // 1-10 scale
  relevanceToIntent: number; // 0-1 scale
  careerStageMultiplier: number; // Career stage context
  timeUrgencyMultiplier: number; // How soon this gap matters
  impactScore: number;
}

// User confidence detection with refined levels
export interface ConfidenceSignals {
  confidenceLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  indicators: string[];
  recommendedTone: 'gentle_guide' | 'supportive' | 'neutral' | 'strategic' | 'power_user';
  emotionalState?: 'confused' | 'uncertain' | 'exploring' | 'determined' | 'ambitious';
}

// Template enrichment system
export interface FollowUpTemplate {
  template: string;
  slots: Record<string, string>;
  confidence: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  purpose: FollowUpPurpose;
}

// Follow-up bundle for UI organization (Phase 3)
export interface FollowUpBundle {
  category: string;
  icon?: string;
  followUps: Array<{ text: string; purpose: FollowUpPurpose; tone: string }>;
  priority: 'high' | 'medium' | 'low';
}

// Smart silence detection (Phase 3)
export interface SilenceSignal {
  isLowEffortResponse: boolean;
  responseType: 'acknowledgment' | 'uncertain' | 'engaged' | 'action_ready';
  suggestedAction?: string;
}

/**
 * Detect user confidence from message content and patterns (Phase 2: Enhanced)
 */
export function detectUserConfidence(message: string): ConfidenceSignals {
  const lowercaseMsg = message.toLowerCase();

  // Enhanced confidence indicators with emotional cues
  const veryLowIndicators = ['confused', 'completely lost', 'no idea', 'overwhelmed', 'stuck'];
  const lowIndicators = ['not sure', 'i think', 'maybe', 'uncertain', 'unsure', 'help me', 'stuck', '?'];
  const highIndicators = ['i want to', "i'm planning", "i've done", 'i know', 'definitely', 'let\'s'];
  const veryHighIndicators = ['absolutely', "i'm determined", 'i will', 'ready to', 'excited to', 'motivated', 'i\'m going to'];

  let veryLowCount = 0, lowCount = 0, highCount = 0, veryHighCount = 0;
  const detected: string[] = [];
  let emotionalState: 'confused' | 'uncertain' | 'exploring' | 'determined' | 'ambitious' = 'exploring';

  // Count indicators
  veryLowIndicators.forEach(ind => {
    if (lowercaseMsg.includes(ind)) {
      veryLowCount++;
      detected.push(ind);
      emotionalState = 'confused';
    }
  });

  lowIndicators.forEach(ind => {
    if (lowercaseMsg.includes(ind)) {
      lowCount++;
      detected.push(ind);
      if (emotionalState === 'exploring') emotionalState = 'uncertain';
    }
  });

  highIndicators.forEach(ind => {
    if (lowercaseMsg.includes(ind)) {
      highCount++;
      detected.push(ind);
      emotionalState = 'determined';
    }
  });

  veryHighIndicators.forEach(ind => {
    if (lowercaseMsg.includes(ind)) {
      veryHighCount++;
      detected.push(ind);
      emotionalState = 'ambitious';
    }
  });

  // Determine refined confidence level
  let confidenceLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' = 'medium';
  let recommendedTone: 'gentle_guide' | 'supportive' | 'neutral' | 'strategic' | 'power_user' = 'neutral';

  if (veryLowCount > 0) {
    confidenceLevel = 'very_low';
    recommendedTone = 'gentle_guide';
  } else if (lowCount >= 2) {
    confidenceLevel = 'low';
    recommendedTone = 'supportive';
  } else if (veryHighCount > 0) {
    confidenceLevel = 'very_high';
    recommendedTone = 'power_user';
  } else if (highCount >= 2) {
    confidenceLevel = 'high';
    recommendedTone = 'strategic';
  }

  // Message length analysis
  if (message.length < 15 && confidenceLevel === 'medium') {
    confidenceLevel = 'low';
    recommendedTone = 'supportive';
  }

  return {
    confidenceLevel,
    indicators: detected,
    recommendedTone,
    emotionalState
  };
}

/**
 * Identify and score profile gaps by impact (Phase 2: Enhanced with contextual multipliers)
 */
export function identifyProfileGaps(context: MuskContext, intent: string): ProfileGap[] {
  const gaps: ProfileGap[] = [];

  // Define gap importance weights based on intent
  const gapWeights: Record<string, Record<string, number>> = {
    profile_optimization: {
      title: 10,
      projects: 9,
      headline: 8,
      aboutMe: 7,
      skills: 7,
      experiences: 6
    },
    career_growth: {
      experiences: 10,
      skills: 9,
      projects: 8,
      title: 7
    },
    networking: {
      title: 9,
      industry: 8,
      location: 7,
      skills: 6
    },
    skill_development: {
      skills: 10,
      experiences: 8,
      projects: 7
    },
    default: {
      title: 8,
      projects: 8,
      experiences: 7,
      skills: 7,
      aboutMe: 6,
      headline: 5
    }
  };

  const weights = gapWeights[intent] || gapWeights.default;

  // Determine career stage for multiplier
  const careerStage = determineCareerStageFromContext(context);
  const careerStageMultipliers: Record<string, number> = {
    entry_level: 1.2,  // Entry-level needs more urgency
    early_career: 1.15,
    mid_career: 1.0,
    senior_level: 0.9   // Senior doesn't need as much urgency
  };

  const careerMultiplier = careerStageMultipliers[careerStage] || 1.0;

  // Check each potential gap
  const hasTitle = context.userData?.title && context.userData.title.trim().length > 0;
  const hasWhatIOffer = (context.userData as any)?.whatIOffer && (context.userData as any).whatIOffer.trim().length > 0;
  const hasProjects = (context.projects?.length || 0) > 0;
  const hasExperiences = (context.experiences?.length || 0) > 0;
  const hasSkills = (context.skills?.length || 0) > 0;

  if (!hasTitle) {
    const timeUrgency = 1.3; // Title is critical immediately
    gaps.push({
      field: 'title',
      isEmpty: true,
      importanceWeight: weights.title || 8,
      relevanceToIntent: 0.9,
      careerStageMultiplier: careerMultiplier,
      timeUrgencyMultiplier: timeUrgency,
      impactScore: (weights.title || 8) * 0.9 * careerMultiplier * timeUrgency
    });
  }

  if (!hasProjects) {
    const timeUrgency = 1.2;
    gaps.push({
      field: 'projects',
      isEmpty: true,
      importanceWeight: weights.projects || 8,
      relevanceToIntent: 0.85,
      careerStageMultiplier: careerMultiplier,
      timeUrgencyMultiplier: timeUrgency,
      impactScore: (weights.projects || 8) * 0.85 * careerMultiplier * timeUrgency
    });
  }

  if (!hasExperiences) {
    const timeUrgency = careerStage === 'entry_level' ? 1.3 : 1.0;
    gaps.push({
      field: 'experiences',
      isEmpty: true,
      importanceWeight: weights.experiences || 7,
      relevanceToIntent: 0.8,
      careerStageMultiplier: careerMultiplier,
      timeUrgencyMultiplier: timeUrgency,
      impactScore: (weights.experiences || 7) * 0.8 * careerMultiplier * timeUrgency
    });
  }

  if (!hasSkills) {
    const timeUrgency = 1.1;
    gaps.push({
      field: 'skills',
      isEmpty: true,
      importanceWeight: weights.skills || 7,
      relevanceToIntent: 0.75,
      careerStageMultiplier: careerMultiplier,
      timeUrgencyMultiplier: timeUrgency,
      impactScore: (weights.skills || 7) * 0.75 * careerMultiplier * timeUrgency
    });
  }

  if (!hasWhatIOffer) {
    const timeUrgency = 0.9;
    gaps.push({
      field: 'what_i_offer',
      isEmpty: true,
      importanceWeight: weights.aboutMe || 6,
      relevanceToIntent: 0.7,
      careerStageMultiplier: careerMultiplier,
      timeUrgencyMultiplier: timeUrgency,
      impactScore: (weights.aboutMe || 6) * 0.7 * careerMultiplier * timeUrgency
    });
  }

  // Sort by impact score (highest first)
  return gaps.sort((a, b) => b.impactScore - a.impactScore);
}

/**
 * Helper: Determine career stage from context
 */
function determineCareerStageFromContext(context: MuskContext): string {
  const experienceCount = context.experiences?.length || 0;
  if (experienceCount === 0) return 'entry_level';
  if (experienceCount <= 2) return 'early_career';
  if (experienceCount <= 5) return 'mid_career';
  return 'senior_level';
}

/**
 * Extract conversation topics and memory hooks
 */
export function extractConversationMemory(messages: Array<{ content: string; sender: 'user' | 'musk' }>): ConversationMemory {
  const memory: ConversationMemory = {
    recentIntents: [],
    topicContinuity: []
  };

  if (!messages || messages.length === 0) {
    return memory;
  }

  // Extract the last few user messages
  const userMessages = messages.filter(m => m.sender === 'user').slice(-3);

  // Simple topic extraction from messages
  const allText = userMessages.map(m => m.content.toLowerCase()).join(' ');

  // Track unresolved questions (ending with ?)
  const unresolvedMatches = allText.match(/[^.!?]*\?/g);
  if (unresolvedMatches && unresolvedMatches.length > 0) {
    memory.lastUnresolvedQuestion = unresolvedMatches[unresolvedMatches.length - 1].trim();
  }

  // Extract common topics
  const topics = ['profile', 'career', 'skills', 'projects', 'experiences', 'linkedin', 'resume', 'interview', 'networking', 'salary'];
  topics.forEach(topic => {
    if (allText.includes(topic)) {
      memory.topicContinuity.push(topic);
    }
  });

  return memory;
}

/**
 * Generate outcome-anchored follow-up questions
 */
export function generateOutcomeAnchoredFollowUps(context: MuskContext, intent: string): Array<{ text: string; purpose: FollowUpPurpose }> {
  const outcomes: Array<{ text: string; purpose: FollowUpPurpose }> = [];

  const hasExperiences = (context.experiences?.length || 0) > 0;
  const hasSkills = (context.skills?.length || 0) > 0;
  const hasProjects = (context.projects?.length || 0) > 0;
  const userTitle = context.userData?.title;
  const userIndustry = context.userData?.industry;

  // Generate based on intent with outcome focus
  switch (intent) {
    case 'profile_optimization':
      if (!hasProjects) {
        outcomes.push({
          text: "Want a 30-day plan to showcase your top 3 projects and attract recruiters?",
          purpose: FollowUpPurpose.EXECUTE
        });
      }
      outcomes.push({
        text: "Should we focus on improving your headline or your about section first for maximum impact?",
        purpose: FollowUpPurpose.DECIDE
      });
      break;

    case 'career_growth':
      if (hasExperiences) {
        outcomes.push({
          text: "Want a structured 90-day roadmap to land your next role?",
          purpose: FollowUpPurpose.EXECUTE
        });
      }
      outcomes.push({
        text: "Are you aiming for a promotion in your current role or exploring new opportunities?",
        purpose: FollowUpPurpose.CLARIFY
      });
      break;

    case 'skill_development':
      outcomes.push({
        text: "Should we prioritize skills for your current role or for your next career move?",
        purpose: FollowUpPurpose.DECIDE
      });
      outcomes.push({
        text: "Want a 60-day skill-building plan with concrete milestones?",
        purpose: FollowUpPurpose.EXECUTE
      });
      break;

    case 'networking':
      outcomes.push({
        text: "Do you want to improve visibility in your industry or expand into a new sector?",
        purpose: FollowUpPurpose.DECIDE
      });
      outcomes.push({
        text: "Want a list of 10 key professionals to connect with this month?",
        purpose: FollowUpPurpose.EXECUTE
      });
      break;

    case 'interview_prep':
      outcomes.push({
        text: "Want me to create a personalized interview guide based on your target roles?",
        purpose: FollowUpPurpose.EXECUTE
      });
      outcomes.push({
        text: "Should we focus on technical questions, behavioral questions, or both?",
        purpose: FollowUpPurpose.CLARIFY
      });
      break;

    default:
      outcomes.push({
        text: "What specific outcome would you like to achieve in the next 30 days?",
        purpose: FollowUpPurpose.CLARIFY
      });
      outcomes.push({
        text: "Want me to create an action plan based on your goals?",
        purpose: FollowUpPurpose.EXECUTE
      });
  }

  return outcomes;
}

/**
 * Template enrichment system for dynamic follow-ups with error handling
 */
function fillFollowUpTemplate(template: string, slots: Record<string, string>): string | null {
  try {
    let filled = template;
    const originalFilled = filled;

    // Fill all slots
    Object.entries(slots).forEach(([key, value]) => {
      filled = filled.replace(`{{${key}}}`, value);
    });

    // Check if there are unfilled slots remaining (indicates missing slot data)
    const unfilledSlots = filled.match(/\{\{(\w+)\}\}/g);
    if (unfilledSlots && unfilledSlots.length > 0) {
      console.warn(`[FIL] Unfilled slots detected: ${unfilledSlots.join(', ')} - Falling back to original`);
      return null; // Signal failure to fall back
    }

    // Check if result is reasonable length (catch extremely short results)
    if (filled.trim().length < 10) {
      console.warn(`[FIL] Template result too short: "${filled}" - Falling back to original`);
      return null;
    }

    return filled;
  } catch (error) {
    console.error(`[FIL] Template filling error: ${error instanceof Error ? error.message : String(error)}`);
    return null; // Signal failure to fall back
  }
}

/**
 * Get tone-specific follow-up templates
 */
function getFollowUpTemplates(confidence: ConfidenceSignals): Record<FollowUpPurpose, string[]> {
  const templates: Record<'very_low' | 'low' | 'medium' | 'high' | 'very_high', Record<FollowUpPurpose, string[]>> = {
    very_low: {
      [FollowUpPurpose.CLARIFY]: [
        "Let's take a step back. What {{topic}} are you thinking about?",
        "No pressure — just curious about {{topic}}. What's on your mind?"
      ],
      [FollowUpPurpose.EXECUTE]: [
        "Would it help if I walked you through {{action}}?",
        "I can guide you through {{action}} step by step."
      ],
      [FollowUpPurpose.DECIDE]: [
        "Let's explore both options: {{option1}} or {{option2}}?",
        "What feels more right — {{option1}} or {{option2}}?"
      ],
      [FollowUpPurpose.EXPAND]: [
        "Tell me more about {{topic}}. I'm here to help.",
        "Let's dive deeper into {{topic}}."
      ],
      [FollowUpPurpose.VALIDATE]: [
        "Does {{goal}} align with what you want?",
        "Does this direction feel right for you?"
      ],
      [FollowUpPurpose.REFLECT]: [
        "What would success look like for you in {{timeframe}}?",
        "Take a moment — what's one thing you'd like to improve?"
      ]
    },
    low: {
      [FollowUpPurpose.CLARIFY]: [
        "Which aspect of {{topic}} should we focus on?",
        "Are you more interested in {{option1}} or {{option2}}?"
      ],
      [FollowUpPurpose.EXECUTE]: [
        "Want a structured plan to {{action}}?",
        "Should we create a {{timeframe}} roadmap for {{goal}}?"
      ],
      [FollowUpPurpose.DECIDE]: [
        "Let's compare: {{option1}} vs {{option2}}. Which appeals to you?",
        "Do you lean toward {{option1}} or {{option2}}?"
      ],
      [FollowUpPurpose.EXPAND]: [
        "Let's explore {{topic}} further. What else would help?",
        "Want more details on {{topic}}?"
      ],
      [FollowUpPurpose.VALIDATE]: [
        "Does this align with your {{goal}}?",
        "Does this support your {{timeframe}} goals?"
      ],
      [FollowUpPurpose.REFLECT]: [
        "What would success in {{topic}} mean for you?",
        "How does this fit into your {{goal}}?"
      ]
    },
    medium: {
      [FollowUpPurpose.CLARIFY]: [
        "Should we clarify {{topic}} first?",
        "What's your target for {{goal}}?"
      ],
      [FollowUpPurpose.EXECUTE]: [
        "Ready to build a {{timeframe}} plan for {{goal}}?",
        "Want me to create a {{action}} strategy?"
      ],
      [FollowUpPurpose.DECIDE]: [
        "Should you pursue {{option1}} or {{option2}}?",
        "Which path — {{option1}} or {{option2}} — is better for your {{goal}}?"
      ],
      [FollowUpPurpose.EXPAND]: [
        "Want to explore {{topic}} in more depth?",
        "Let's dive into {{topic}}."
      ],
      [FollowUpPurpose.VALIDATE]: [
        "Does this align with your {{goal}}?",
        "Is {{goal}} still your primary focus?"
      ],
      [FollowUpPurpose.REFLECT]: [
        "What's your ideal outcome for {{topic}}?",
        "Where do you see yourself {{timeframe}} from now?"
      ]
    },
    high: {
      [FollowUpPurpose.CLARIFY]: [
        "What's your specific target for {{goal}}?",
        "Define your success metrics for {{topic}}."
      ],
      [FollowUpPurpose.EXECUTE]: [
        "Let's execute a {{timeframe}} plan to {{goal}}.",
        "Build a {{action}} strategy to achieve {{goal}}?"
      ],
      [FollowUpPurpose.DECIDE]: [
        "{{option1}} or {{option2}} — which is the right move for {{goal}}?",
        "Optimize for {{goal}}: {{option1}} or {{option2}}?"
      ],
      [FollowUpPurpose.EXPAND]: [
        "What specific aspects of {{topic}} matter most?",
        "Dive into {{topic}} with what detail level?"
      ],
      [FollowUpPurpose.VALIDATE]: [
        "Does this directly advance your {{goal}}?",
        "ROI for {{goal}} — is this the fastest path?"
      ],
      [FollowUpPurpose.REFLECT]: [
        "What's your {{timeframe}} milestone for {{goal}}?",
        "How does this fit your {{timeframe}} roadmap?"
      ]
    },
    very_high: {
      [FollowUpPurpose.CLARIFY]: [
        "What are your exact metrics for {{goal}}?",
        "Define the success threshold for {{topic}}."
      ],
      [FollowUpPurpose.EXECUTE]: [
        "Let's ship a {{timeframe}} plan to hit {{goal}}.",
        "Ready to execute {{action}} at scale?"
      ],
      [FollowUpPurpose.DECIDE]: [
        "{{option1}} or {{option2}} — optimize for impact on {{goal}}.",
        "Which maximizes {{goal}} in {{timeframe}}?"
      ],
      [FollowUpPurpose.EXPAND]: [
        "What's the full scope of {{topic}} we should tackle?",
        "How far should we push on {{topic}}?"
      ],
      [FollowUpPurpose.VALIDATE]: [
        "Is this the highest-leverage move for {{goal}}?",
        "Does this compound toward {{goal}}?"
      ],
      [FollowUpPurpose.REFLECT]: [
        "What's your {{timeframe}} vision for {{topic}}?",
        "What's the moonshot for {{goal}}?"
      ]
    }
  };

  return templates[confidence.confidenceLevel] || templates.medium;
}

/**
 * Apply confidence-adaptive tone to follow-ups with fallback (Phase 2: Template-based enrichment)
 * 
 * FALLBACK MECHANISM:
 * If template filling fails, returns original text unchanged
 * Failures can occur:
 * - Unfilled slots: template has {{slot}} that doesn't exist in slots dict
 * - Short result: template + slots produce unreasonably short output
 * - Exception: regex/string operations fail
 */
export function adaptFollowUpTone(
  followUps: Array<{ text: string; purpose: FollowUpPurpose }>,
  confidence: ConfidenceSignals
): Array<{ text: string; purpose: FollowUpPurpose; tone: string }> {
  const templates = getFollowUpTemplates(confidence);

  return followUps.map(followUp => {
    let adaptedText = followUp.text;
    let usedTemplate = false;

    // Try to enrich with template if available
    const purposeTemplates = templates[followUp.purpose];
    if (purposeTemplates && purposeTemplates.length > 0) {
      const selectedTemplate = purposeTemplates[0];

      // Extract slots from original text and fill template
      const slots: Record<string, string> = {
        topic: extractKeyword(followUp.text) || 'your goals',
        goal: 'your goals',
        action: 'this',
        option1: 'option A',
        option2: 'option B',
        timeframe: '30 days'
      };

      // Attempt template filling with error handling
      const filledTemplate = fillFollowUpTemplate(selectedTemplate, slots);

      if (filledTemplate !== null) {
        // Template succeeded - use it
        adaptedText = filledTemplate;
        usedTemplate = true;
      } else {
        // Template failed - fallback to original text
        console.log(`[FIL] Falling back to original text for ${followUp.purpose}: "${followUp.text}"`);
        adaptedText = followUp.text;
      }
    }

    return {
      ...followUp,
      text: adaptedText,
      tone: confidence.recommendedTone
    };
  });
}

/**
 * Helper: Extract keyword from text
 */
function extractKeyword(text: string): string {
  const keywords = ['profile', 'skills', 'projects', 'career', 'experience', 'goals'];
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword)) {
      return keyword;
    }
  }
  return 'this';
}

/**
 * Detect low-effort responses (Smart Silence Rule - Phase 3)
 */
export function detectSilenceSignal(userMessage: string): SilenceSignal {
  const msg = userMessage.toLowerCase().trim();

  // Low-effort acknowledgments
  const acknowledgments = ['okay', 'ok', 'yeah', 'sure', 'got it', 'thanks', 'good', 'cool', 'nice'];
  const uncertain = ['hmm', 'um', 'uh', 'i guess', 'maybe'];
  const engaged = ['interesting', 'wow', 'that\'s great', 'tell me more', 'how', 'why', 'what', 'when'];
  const actionReady = ['let\'s', 'let me', 'i will', 'i\'ll', 'ready', 'let\'s go', 'let\'s do it'];

  // Check message length and type
  const isShort = msg.length < 15;
  const isOneWord = msg.split(' ').length === 1;
  const hasQuestion = msg.includes('?');

  let responseType: 'acknowledgment' | 'uncertain' | 'engaged' | 'action_ready' = 'engaged';
  let isLowEffort = false;
  let suggestedAction = undefined;

  // Categorize response
  if (actionReady.some(a => msg.includes(a))) {
    responseType = 'action_ready';
  } else if (engaged.some(e => msg.includes(e)) && hasQuestion) {
    responseType = 'engaged';
  } else if (uncertain.some(u => msg.includes(u))) {
    responseType = 'uncertain';
  } else if (acknowledgments.some(a => msg === a || msg.includes(a)) && (isShort || isOneWord)) {
    responseType = 'acknowledgment';
    isLowEffort = true;
    suggestedAction = "Want me to take the next step for you?";
  }

  return {
    isLowEffortResponse: isLowEffort,
    responseType,
    suggestedAction
  };
}

/**
 * Group follow-ups into semantic bundles for better UI (Phase 3)
 */
export function groupFollowUpsIntoBundles(
  followUps: Array<{ text: string; purpose: FollowUpPurpose; tone: string }>
): FollowUpBundle[] {
  const bundles: Record<string, FollowUpBundle> = {
    'next_best_steps': {
      category: 'Next Best Steps',
      icon: '🎯',
      followUps: [],
      priority: 'high'
    },
    'execution': {
      category: 'Ready to Execute',
      icon: '⚡',
      followUps: [],
      priority: 'high'
    },
    'decision': {
      category: 'Let\'s Decide',
      icon: '🤔',
      followUps: [],
      priority: 'medium'
    },
    'exploration': {
      category: 'Explore Further',
      icon: '🔍',
      followUps: [],
      priority: 'medium'
    },
    'validation': {
      category: 'Validation & Alignment',
      icon: '✓',
      followUps: [],
      priority: 'low'
    }
  };

  // Distribute follow-ups into bundles based on purpose
  followUps.forEach(followUp => {
    switch (followUp.purpose) {
      case FollowUpPurpose.EXECUTE:
        bundles.execution.followUps.push(followUp);
        break;
      case FollowUpPurpose.DECIDE:
        bundles.decision.followUps.push(followUp);
        break;
      case FollowUpPurpose.EXPAND:
        bundles.exploration.followUps.push(followUp);
        break;
      case FollowUpPurpose.CLARIFY:
        bundles.decision.followUps.push(followUp);
        break;
      case FollowUpPurpose.VALIDATE:
        bundles.validation.followUps.push(followUp);
        break;
      case FollowUpPurpose.REFLECT:
        bundles.exploration.followUps.push(followUp);
        break;
      default:
        bundles.next_best_steps.followUps.push(followUp);
    }
  });

  // Return only non-empty bundles, sorted by priority
  return Object.values(bundles)
    .filter(bundle => bundle.followUps.length > 0)
    .sort((a, b) => {
      const priorityMap = { 'high': 1, 'medium': 2, 'low': 3 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
}

/**
 * Retrieve relevant follow-up templates from database (Hybrid Knowledge Engine)
 */
export async function retrieveIndustryTemplates(
  industry: string,
  intent: string,
  limit: number = 2
): Promise<Array<{ text: string; purpose: FollowUpPurpose; actionHint?: string }>> {
  try {
    const { pool } = await import('../db');

    // Attempt to match by industry and intent (type)
    const result = await pool.query(
      `SELECT text, type as purpose, action_hint as "actionHint" 
       FROM followup_templates 
       WHERE (LOWER(industry) = LOWER($1) OR industry = 'General')
       AND type = $2
       ORDER BY (industry != 'General') DESC
       LIMIT $3`,
      [industry, intent, limit]
    );

    return result.rows.map(row => ({
      text: row.text,
      purpose: row.purpose as FollowUpPurpose,
      actionHint: row.actionHint
    }));
  } catch (error) {
    console.warn('[FIL] Database template retrieval failed, using fallback logic', error);
    return [];
  }
}

/**
 * Main FIL orchestrator: Generate smart follow-ups using all intelligence layers (Phase 3: Bundle Support)
 */
export async function generateFollowUpIntelligence(
  context: MuskContext,
  intent: string,
  conversationHistory?: Array<{ content: string; sender: 'user' | 'musk' }>
): Promise<{
  followUps: Array<{ text: string; purpose: FollowUpPurpose; tone: string; actionHint?: string }>;
  bundles: FollowUpBundle[];
  silenceSignal?: SilenceSignal;
  memory: ConversationMemory;
  gaps: ProfileGap[];
  confidence: ConfidenceSignals;
}> {
  // 1. Detect user confidence
  const lastUserMessage = conversationHistory?.[conversationHistory.length - 1]?.content || '';
  const confidence = detectUserConfidence(lastUserMessage);

  // 1.5 (Phase 3) Detect silence signals
  const silenceSignal = detectSilenceSignal(lastUserMessage);

  // 2. Identify profile gaps
  const gaps = identifyProfileGaps(context, intent);

  // 3. Extract conversation memory
  const memory = conversationHistory ? extractConversationMemory(conversationHistory) : { recentIntents: [], topicContinuity: [] };

  // If smart silence detected, return early with suggested action
  if (silenceSignal.isLowEffortResponse) {
    return {
      followUps: [{
        text: silenceSignal.suggestedAction || "Want me to take the next step for you?",
        purpose: FollowUpPurpose.EXECUTE,
        tone: confidence.recommendedTone
      }],
      bundles: [{
        category: 'Next Action',
        icon: '→',
        followUps: [{
          text: silenceSignal.suggestedAction || "Want me to take the next step for you?",
          purpose: FollowUpPurpose.EXECUTE,
          tone: confidence.recommendedTone
        }],
        priority: 'high'
      }],
      silenceSignal,
      memory,
      gaps,
      confidence
    };
  }

  // 4. Generate outcome-anchored follow-ups (AI-calculated)
  let followUps: any[] = generateOutcomeAnchoredFollowUps(context, intent);

  // 4.5 (Hybrid Layer) Fetch curated templates from DB
  const industry = context.userData?.industry || 'General';
  const dbTemplates = await retrieveIndustryTemplates(industry, intent);

  if (dbTemplates.length > 0) {
    // Add DB templates at the beginning (they are high-quality curated)
    followUps = [...dbTemplates, ...followUps];
  }

  // 5. Add gap-driven follow-up if highest impact gap exists
  if (gaps.length > 0 && gaps[0].impactScore > 5) {
    const topGap = gaps[0];
    const gapFollowUp: { text: string; purpose: FollowUpPurpose } = {
      text: `Your profile lacks ${topGap.field} proof — want help adding compelling ${topGap.field}?`,
      purpose: FollowUpPurpose.EXECUTE
    };
    followUps = [gapFollowUp, ...followUps];
  }

  // 6. Add memory-continuity follow-up if unresolved question exists
  if (memory.lastUnresolvedQuestion) {
    const continuityFollowUp: { text: string; purpose: FollowUpPurpose } = {
      text: `Earlier you asked: "${memory.lastUnresolvedQuestion}" — shall we dive deeper into that?`,
      purpose: FollowUpPurpose.EXPAND
    };
    followUps = [continuityFollowUp, ...followUps.slice(0, 2)];
  }

  // 7. Adapt tone based on confidence
  const tonedFollowUps = adaptFollowUpTone(followUps.slice(0, 4), confidence);

  // 8. (Phase 3) Group into semantic bundles for UI
  const bundles = groupFollowUpsIntoBundles(tonedFollowUps);

  return {
    followUps: tonedFollowUps as any,
    bundles,
    silenceSignal,
    memory,
    gaps,
    confidence
  };
}
