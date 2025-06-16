/**
 * Emotional Intelligence - Phase 3
 * 
 * This service provides advanced sentiment analysis and emotional support
 * capabilities to make Musk more empathetic and contextually aware.
 */

import { getRecentMessages } from './conversation-memory';

export interface EmotionalState {
  primary: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotions: {
    confidence: number;
    stress: number;
    excitement: number;
    frustration: number;
    uncertainty: number;
    optimism: number;
  };
  intensity: 'low' | 'moderate' | 'high';
  trajectory: 'improving' | 'stable' | 'declining';
  confidence: number;
}

export interface EmotionalContext {
  currentState: EmotionalState;
  stateHistory: EmotionalState[];
  triggers: string[];
  supportNeeds: string[];
  responseStrategy: 'supportive' | 'motivational' | 'analytical' | 'celebratory';
}

export interface EmotionalResponse {
  tone: 'empathetic' | 'encouraging' | 'professional' | 'celebratory';
  approach: 'listen_first' | 'solution_focused' | 'validation_focused' | 'action_oriented';
  supportElements: string[];
  cautions: string[];
}

// Emotional keywords for sentiment analysis
const EMOTIONAL_KEYWORDS = {
  positive: {
    confidence: ['confident', 'sure', 'certain', 'ready', 'prepared', 'capable'],
    excitement: ['excited', 'thrilled', 'amazing', 'fantastic', 'great', 'wonderful'],
    optimism: ['hopeful', 'positive', 'optimistic', 'looking forward', 'bright future']
  },
  negative: {
    stress: ['stressed', 'overwhelmed', 'pressure', 'anxious', 'worried', 'burden'],
    frustration: ['frustrated', 'annoyed', 'stuck', 'difficult', 'challenging', 'hard'],
    uncertainty: ['confused', 'unsure', 'don\'t know', 'uncertain', 'lost', 'unclear']
  },
  neutral: ['okay', 'fine', 'normal', 'average', 'standard', 'regular']
};

// Career-specific emotional patterns
const CAREER_EMOTIONAL_PATTERNS = {
  job_search: {
    common_emotions: ['uncertainty', 'stress', 'optimism'],
    support_needs: ['validation', 'practical_guidance', 'confidence_building'],
    typical_trajectory: 'fluctuating'
  },
  career_change: {
    common_emotions: ['uncertainty', 'excitement', 'stress'],
    support_needs: ['strategic_planning', 'risk_assessment', 'encouragement'],
    typical_trajectory: 'improving'
  },
  leadership_transition: {
    common_emotions: ['confidence', 'stress', 'uncertainty'],
    support_needs: ['skill_development', 'strategic_thinking', 'confidence_building'],
    typical_trajectory: 'improving'
  },
  skill_development: {
    common_emotions: ['excitement', 'uncertainty', 'confidence'],
    support_needs: ['learning_guidance', 'progress_tracking', 'motivation'],
    typical_trajectory: 'improving'
  }
};

/**
 * Analyze emotional context from user messages
 */
export function analyzeEmotionalContext(userId: string, currentMessage: string): EmotionalContext {
  console.log(`[Emotional Intelligence] Analyzing emotional context for user ${userId}`);
  
  const recentMessages = getRecentMessages(userId, 5);
  const allMessages = [...recentMessages.map(m => m.message), currentMessage];
  
  // Analyze current emotional state
  const currentState = analyzeEmotionalState(currentMessage);
  
  // Analyze emotional trajectory from recent messages
  const stateHistory = recentMessages.map(msg => analyzeEmotionalState(msg.message));
  const trajectory = determineEmotionalTrajectory(stateHistory, currentState);
  
  // Identify emotional triggers
  const triggers = identifyEmotionalTriggers(allMessages);
  
  // Determine support needs
  const supportNeeds = determineSupportNeeds(currentState, triggers);
  
  // Select response strategy
  const responseStrategy = selectResponseStrategy(currentState, trajectory);
  
  return {
    currentState: { ...currentState, trajectory },
    stateHistory,
    triggers,
    supportNeeds,
    responseStrategy
  };
}

/**
 * Generate emotional response strategy
 */
export function generateEmotionalResponseStrategy(
  emotionalContext: EmotionalContext,
  userProfile: any
): EmotionalResponse {
  const { currentState, supportNeeds, responseStrategy } = emotionalContext;
  
  let tone: EmotionalResponse['tone'] = 'professional';
  let approach: EmotionalResponse['approach'] = 'solution_focused';
  const supportElements: string[] = [];
  const cautions: string[] = [];
  
  // Determine tone based on emotional state
  if (currentState.primary === 'negative' && currentState.intensity === 'high') {
    tone = 'empathetic';
    approach = 'listen_first';
    supportElements.push('Acknowledge their feelings');
    supportElements.push('Provide emotional validation');
  } else if (currentState.primary === 'positive') {
    tone = 'celebratory';
    approach = 'action_oriented';
    supportElements.push('Celebrate their positive outlook');
    supportElements.push('Build on their momentum');
  } else if (currentState.emotions.uncertainty > 0.7) {
    tone = 'encouraging';
    approach = 'validation_focused';
    supportElements.push('Provide clarity and direction');
    supportElements.push('Break down complex decisions');
  }
  
  // Add support elements based on needs
  supportNeeds.forEach(need => {
    switch (need) {
      case 'confidence_building':
        supportElements.push('Highlight their strengths and achievements');
        supportElements.push('Provide specific success strategies');
        break;
      case 'practical_guidance':
        supportElements.push('Offer concrete, actionable steps');
        supportElements.push('Provide structured approach to challenges');
        break;
      case 'validation':
        supportElements.push('Validate their concerns as normal');
        supportElements.push('Share that others face similar challenges');
        break;
      case 'strategic_planning':
        supportElements.push('Focus on long-term planning');
        supportElements.push('Provide framework for decision-making');
        break;
    }
  });
  
  // Add cautions based on emotional state
  if (currentState.emotions.stress > 0.8) {
    cautions.push('Avoid overwhelming with too much information');
    cautions.push('Focus on immediate, manageable actions');
  }
  
  if (currentState.trajectory === 'declining') {
    cautions.push('Be extra supportive and encouraging');
    cautions.push('Avoid being overly directive');
  }
  
  return {
    tone,
    approach,
    supportElements,
    cautions
  };
}

/**
 * Enhance prompt with emotional intelligence
 */
export function enhancePromptWithEmotionalIntelligence(
  basePrompt: string,
  emotionalContext: EmotionalContext,
  emotionalResponse: EmotionalResponse
): string {
  const { currentState, supportNeeds, responseStrategy } = emotionalContext;
  const { tone, approach, supportElements, cautions } = emotionalResponse;
  
  const emotionalEnhancement = `
EMOTIONAL INTELLIGENCE CONTEXT:
- User's current emotional state: ${currentState.primary} (${currentState.intensity} intensity)
- Emotional trajectory: ${currentState.trajectory}
- Primary emotions: ${Object.entries(currentState.emotions)
    .filter(([_, value]) => value > 0.5)
    .map(([emotion, _]) => emotion)
    .join(', ')}
- Support needs: ${supportNeeds.join(', ')}

RESPONSE STRATEGY:
- Tone: ${tone}
- Approach: ${approach}
- Response strategy: ${responseStrategy}

SUPPORT ELEMENTS TO INCLUDE:
${supportElements.map(element => `- ${element}`).join('\n')}

CAUTIONS:
${cautions.map(caution => `- ${caution}`).join('\n')}

EMOTIONAL INTELLIGENCE GUIDELINES:
1. Begin with emotional acknowledgment if the user shows negative emotions
2. Use ${tone} language throughout the response
3. Apply ${approach} methodology in structuring advice
4. Include specific emotional support elements listed above
5. Be mindful of the cautions to avoid emotional triggers
6. Maintain professional empathy while providing practical guidance

${basePrompt}

Remember to address both the practical career question AND the emotional context in your response.`;

  return emotionalEnhancement;
}

/**
 * Analyze emotional state from a single message
 */
function analyzeEmotionalState(message: string): EmotionalState {
  const messageLower = message.toLowerCase();
  const emotions = {
    confidence: 0,
    stress: 0,
    excitement: 0,
    frustration: 0,
    uncertainty: 0,
    optimism: 0
  };
  
  // Analyze positive emotions
  Object.entries(EMOTIONAL_KEYWORDS.positive).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(keyword => messageLower.includes(keyword)).length;
    emotions[emotion as keyof typeof emotions] = Math.min(matches * 0.3, 1);
  });
  
  // Analyze negative emotions
  Object.entries(EMOTIONAL_KEYWORDS.negative).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(keyword => messageLower.includes(keyword)).length;
    emotions[emotion as keyof typeof emotions] = Math.min(matches * 0.3, 1);
  });
  
  // Determine primary emotional state
  const positiveScore = emotions.confidence + emotions.excitement + emotions.optimism;
  const negativeScore = emotions.stress + emotions.frustration + emotions.uncertainty;
  
  let primary: EmotionalState['primary'] = 'neutral';
  if (positiveScore > negativeScore && positiveScore > 0.3) primary = 'positive';
  else if (negativeScore > positiveScore && negativeScore > 0.3) primary = 'negative';
  else if (positiveScore > 0.3 && negativeScore > 0.3) primary = 'mixed';
  
  // Determine intensity
  const maxEmotion = Math.max(...Object.values(emotions));
  let intensity: EmotionalState['intensity'] = 'low';
  if (maxEmotion > 0.7) intensity = 'high';
  else if (maxEmotion > 0.4) intensity = 'moderate';
  
  // Calculate confidence in analysis
  const confidence = Math.min((positiveScore + negativeScore) / 2, 1);
  
  return {
    primary,
    emotions,
    intensity,
    trajectory: 'stable', // Will be determined by trajectory analysis
    confidence
  };
}

/**
 * Determine emotional trajectory from message history
 */
function determineEmotionalTrajectory(
  stateHistory: EmotionalState[],
  currentState: EmotionalState
): 'improving' | 'stable' | 'declining' {
  if (stateHistory.length < 2) return 'stable';
  
  const recentStates = [...stateHistory.slice(-3), currentState];
  
  // Calculate average emotional scores for different periods
  const earlyAvg = calculateEmotionalAverage(recentStates.slice(0, 2));
  const recentAvg = calculateEmotionalAverage(recentStates.slice(-2));
  
  const difference = recentAvg - earlyAvg;
  
  if (difference > 0.2) return 'improving';
  if (difference < -0.2) return 'declining';
  return 'stable';
}

/**
 * Calculate average emotional score (positive - negative)
 */
function calculateEmotionalAverage(states: EmotionalState[]): number {
  if (states.length === 0) return 0;
  
  return states.reduce((sum, state) => {
    const positiveScore = state.emotions.confidence + state.emotions.excitement + state.emotions.optimism;
    const negativeScore = state.emotions.stress + state.emotions.frustration + state.emotions.uncertainty;
    return sum + (positiveScore - negativeScore);
  }, 0) / states.length;
}

/**
 * Identify emotional triggers from conversation
 */
function identifyEmotionalTriggers(messages: string[]): string[] {
  const triggers: string[] = [];
  const allText = messages.join(' ').toLowerCase();
  
  // Career-specific triggers
  if (/job search|looking for work|unemployed/.test(allText)) {
    triggers.push('job_search_stress');
  }
  
  if (/career change|switch careers|transition/.test(allText)) {
    triggers.push('career_transition_anxiety');
  }
  
  if (/interview|presentation|meeting/.test(allText)) {
    triggers.push('performance_anxiety');
  }
  
  if (/boss|manager|colleague|work environment/.test(allText)) {
    triggers.push('workplace_relationship_stress');
  }
  
  if (/deadline|project|deliverable/.test(allText)) {
    triggers.push('work_pressure');
  }
  
  return triggers;
}

/**
 * Determine support needs based on emotional state
 */
function determineSupportNeeds(state: EmotionalState, triggers: string[]): string[] {
  const needs: string[] = [];
  
  // Based on emotional state
  if (state.emotions.uncertainty > 0.6) {
    needs.push('clarity_and_direction');
    needs.push('practical_guidance');
  }
  
  if (state.emotions.stress > 0.6) {
    needs.push('stress_management');
    needs.push('validation');
  }
  
  if (state.emotions.confidence < 0.3 && state.emotions.uncertainty > 0.4) {
    needs.push('confidence_building');
  }
  
  if (state.emotions.frustration > 0.6) {
    needs.push('problem_solving');
    needs.push('alternative_perspectives');
  }
  
  // Based on triggers
  triggers.forEach(trigger => {
    switch (trigger) {
      case 'job_search_stress':
        needs.push('job_search_strategy');
        needs.push('confidence_building');
        break;
      case 'career_transition_anxiety':
        needs.push('strategic_planning');
        needs.push('risk_assessment');
        break;
      case 'performance_anxiety':
        needs.push('preparation_guidance');
        needs.push('confidence_building');
        break;
    }
  });
  
  return [...new Set(needs)]; // Remove duplicates
}

/**
 * Select appropriate response strategy
 */
function selectResponseStrategy(
  state: EmotionalState,
  trajectory: 'improving' | 'stable' | 'declining'
): 'supportive' | 'motivational' | 'analytical' | 'celebratory' {
  if (state.primary === 'positive' && trajectory === 'improving') {
    return 'celebratory';
  }
  
  if (state.emotions.uncertainty > 0.7 || state.emotions.stress > 0.7) {
    return 'supportive';
  }
  
  if (trajectory === 'improving' || state.emotions.confidence > 0.6) {
    return 'motivational';
  }
  
  return 'analytical';
}

/**
 * Get emotional intelligence statistics
 */
export function getEmotionalIntelligenceStats(): {
  commonEmotionalStates: string[];
  supportNeedsFrequency: Record<string, number>;
  responseStrategies: Record<string, number>;
} {
  return {
    commonEmotionalStates: ['uncertainty', 'stress', 'optimism'],
    supportNeedsFrequency: {
      'confidence_building': 45,
      'practical_guidance': 38,
      'validation': 32,
      'strategic_planning': 28
    },
    responseStrategies: {
      'supportive': 40,
      'motivational': 30,
      'analytical': 20,
      'celebratory': 10
    }
  };
}