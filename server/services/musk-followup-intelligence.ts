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

// Profile gap with impact scoring
export interface ProfileGap {
  field: string;
  isEmpty: boolean;
  importanceWeight: number;  // 1-10 scale
  relevanceToIntent: number; // 0-1 scale
  impactScore: number;
}

// User confidence detection
export interface ConfidenceSignals {
  confidenceLevel: 'low' | 'medium' | 'high';
  indicators: string[];
  recommendedTone: 'supportive' | 'neutral' | 'strategic';
}

/**
 * Detect user confidence from message content and patterns
 */
export function detectUserConfidence(message: string): ConfidenceSignals {
  const lowercaseMsg = message.toLowerCase();
  
  const lowConfidenceIndicators = ['confused', 'not sure', 'i think', 'maybe', 'uncertain', 'unsure', 'help me', '?', 'stuck'];
  const highConfidenceIndicators = ['i want to', "i'm planning", "i've done", 'i know', 'definitely', 'absolutely', 'let\'s'];
  
  let lowCount = 0, highCount = 0;
  const detected: string[] = [];
  
  // Count confidence indicators
  lowConfidenceIndicators.forEach(indicator => {
    if (lowercaseMsg.includes(indicator)) {
      lowCount++;
      detected.push(indicator);
    }
  });
  
  highConfidenceIndicators.forEach(indicator => {
    if (lowercaseMsg.includes(indicator)) {
      highCount++;
      detected.push(indicator);
    }
  });
  
  // Determine confidence level
  let confidenceLevel: 'low' | 'medium' | 'high' = 'medium';
  if (lowCount > highCount) {
    confidenceLevel = 'low';
  } else if (highCount > lowCount) {
    confidenceLevel = 'high';
  }
  
  // Short messages suggest lower confidence
  if (message.length < 20) {
    confidenceLevel = 'low';
  }
  
  return {
    confidenceLevel,
    indicators: detected,
    recommendedTone: confidenceLevel === 'low' ? 'supportive' : 'strategic'
  };
}

/**
 * Identify and score profile gaps by impact
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
  
  // Check each potential gap
  const hasTitle = context.userData?.title && context.userData.title.trim().length > 0;
  const hasAboutMe = context.userData?.aboutMe && context.userData.aboutMe.trim().length > 0;
  const hasProjects = (context.projects?.length || 0) > 0;
  const hasExperiences = (context.experiences?.length || 0) > 0;
  const hasSkills = (context.skills?.length || 0) > 0;
  
  if (!hasTitle) {
    gaps.push({
      field: 'title',
      isEmpty: true,
      importanceWeight: weights.title || 8,
      relevanceToIntent: 0.9,
      impactScore: (weights.title || 8) * 0.9
    });
  }
  
  if (!hasProjects) {
    gaps.push({
      field: 'projects',
      isEmpty: true,
      importanceWeight: weights.projects || 8,
      relevanceToIntent: 0.85,
      impactScore: (weights.projects || 8) * 0.85
    });
  }
  
  if (!hasExperiences) {
    gaps.push({
      field: 'experiences',
      isEmpty: true,
      importanceWeight: weights.experiences || 7,
      relevanceToIntent: 0.8,
      impactScore: (weights.experiences || 7) * 0.8
    });
  }
  
  if (!hasSkills) {
    gaps.push({
      field: 'skills',
      isEmpty: true,
      importanceWeight: weights.skills || 7,
      relevanceToIntent: 0.75,
      impactScore: (weights.skills || 7) * 0.75
    });
  }
  
  if (!hasAboutMe) {
    gaps.push({
      field: 'aboutMe',
      isEmpty: true,
      importanceWeight: weights.aboutMe || 6,
      relevanceToIntent: 0.7,
      impactScore: (weights.aboutMe || 6) * 0.7
    });
  }
  
  // Sort by impact score (highest first)
  return gaps.sort((a, b) => b.impactScore - a.impactScore);
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
 * Apply confidence-adaptive tone to follow-ups
 */
export function adaptFollowUpTone(
  followUps: Array<{ text: string; purpose: FollowUpPurpose }>,
  confidence: ConfidenceSignals
): Array<{ text: string; purpose: FollowUpPurpose; tone: string }> {
  return followUps.map(followUp => {
    let adaptedText = followUp.text;
    
    if (confidence.confidenceLevel === 'low') {
      // Make it more supportive and exploratory
      if (followUp.purpose === FollowUpPurpose.EXECUTE) {
        adaptedText = `Would you like me to ${adaptedText.replace(/Want a|Want me to /, 'help you with').replace(/\?/, '?')}`;
      } else if (followUp.purpose === FollowUpPurpose.DECIDE) {
        adaptedText = `Let's think about: ${adaptedText.replace(/Should we|Do you |Want |'/g, '').toLowerCase()}`;
      }
    } else if (confidence.confidenceLevel === 'high') {
      // Make it more strategic and action-oriented
      if (followUp.purpose === FollowUpPurpose.EXECUTE) {
        adaptedText = `Let's execute: ${adaptedText}`;
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
 * Main FIL orchestrator: Generate smart follow-ups using all intelligence layers
 */
export function generateFollowUpIntelligence(
  context: MuskContext,
  intent: string,
  conversationHistory?: Array<{ content: string; sender: 'user' | 'musk' }>
): {
  followUps: Array<{ text: string; purpose: FollowUpPurpose; tone: string }>;
  memory: ConversationMemory;
  gaps: ProfileGap[];
  confidence: ConfidenceSignals;
} {
  // 1. Detect user confidence
  const lastUserMessage = conversationHistory?.[conversationHistory.length - 1]?.content || '';
  const confidence = detectUserConfidence(lastUserMessage);
  
  // 2. Identify profile gaps
  const gaps = identifyProfileGaps(context, intent);
  
  // 3. Extract conversation memory
  const memory = conversationHistory ? extractConversationMemory(conversationHistory) : { recentIntents: [], topicContinuity: [] };
  
  // 4. Generate outcome-anchored follow-ups
  let followUps = generateOutcomeAnchoredFollowUps(context, intent);
  
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
  const tonedFollowUps = adaptFollowUpTone(followUps.slice(0, 3), confidence);
  
  return {
    followUps: tonedFollowUps,
    memory,
    gaps,
    confidence
  };
}
