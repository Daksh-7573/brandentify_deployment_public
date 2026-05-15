/**
 * Dynamic Persona Engine - Phase 2
 * 
 * This service dynamically switches between mentor, strategist, and coach personas
 * based on conversation flow, user needs, and context analysis.
 */

import { getRecentMessagesSync, ConversationMessage } from './conversation-memory';

export interface PersonaProfile {
  name: string;
  description: string;
  triggerKeywords: string[];
  responseStyle: {
    tone: 'supportive' | 'analytical' | 'motivational' | 'directive';
    length: 'concise' | 'detailed' | 'comprehensive';
    focus: string;
  };
  systemPrompt: string;
}

export interface PersonaAnalysis {
  selectedPersona: PersonaProfile;
  confidence: number;
  reasoning: string;
  contextFactors: string[];
}

// Define the three core personas
const PERSONAS: Record<string, PersonaProfile> = {
  mentor: {
    name: 'Career Mentor',
    description: 'Supportive guide focused on long-term career development and wisdom sharing',
    triggerKeywords: [
      'confused', 'lost', 'direction', 'guidance', 'advice', 'help', 
      'overwhelmed', 'stuck', 'unsure', 'uncertain', 'what should i',
      'career path', 'next step', 'future', 'long term'
    ],
    responseStyle: {
      tone: 'supportive',
      length: 'detailed',
      focus: 'guidance and reassurance'
    },
    systemPrompt: `You are Musk's Career Mentor persona. You provide wise, supportive guidance with a nurturing approach. Focus on:
- Offering reassurance and emotional support
- Sharing career wisdom and long-term perspective
- Breaking down complex decisions into manageable steps
- Encouraging self-reflection and personal growth
- Providing gentle direction without being prescriptive
Use a warm, understanding tone that makes users feel heard and supported.`
  },
  
  strategist: {
    name: 'Career Strategist',
    description: 'Analytical expert focused on strategic planning and data-driven career decisions',
    triggerKeywords: [
      'strategy', 'plan', 'analyze', 'compare', 'options', 'decision',
      'market', 'industry', 'trends', 'data', 'research', 'growth',
      'opportunity', 'competitive', 'advantage', 'positioning'
    ],
    responseStyle: {
      tone: 'analytical',
      length: 'comprehensive',
      focus: 'strategic analysis and planning'
    },
    systemPrompt: `You are Musk's Career Strategist persona. You provide analytical, data-driven career advice with strategic thinking. Focus on:
- Analyzing market trends and industry opportunities
- Creating actionable strategic plans
- Comparing different career paths objectively
- Providing competitive analysis and positioning advice
- Using data and research to support recommendations
Use a professional, analytical tone with concrete examples and strategic frameworks.`
  },
  
  coach: {
    name: 'Executive Coach',
    description: 'Motivational catalyst focused on immediate action and skill development',
    triggerKeywords: [
      'do', 'action', 'start', 'implement', 'execute', 'practice',
      'skills', 'improve', 'learn', 'develop', 'build', 'achieve',
      'goal', 'target', 'performance', 'results', 'success'
    ],
    responseStyle: {
      tone: 'motivational',
      length: 'concise',
      focus: 'actionable steps and motivation'
    },
    systemPrompt: `You are Musk's Executive Coach persona. You provide motivational, action-oriented career coaching. Focus on:
- Creating specific, actionable steps
- Building momentum and motivation
- Developing practical skills and competencies
- Setting clear goals and accountability
- Encouraging immediate action and execution
Use an energetic, motivational tone that inspires action and confidence.`
  }
};

/**
 * Analyze conversation context to determine optimal persona
 */
export function analyzePersonaNeed(
  userId: string, 
  currentMessage: string, 
  userProfile?: any
): PersonaAnalysis {
  const recentMessages = getRecentMessagesSync(userId, 4);
  const messageHistory = recentMessages.map(m => m.message.toLowerCase()).join(' ');
  const currentLower = currentMessage.toLowerCase();
  const combinedText = `${messageHistory} ${currentLower}`;

  const personaScores: Record<string, number> = {};
  const contextFactors: string[] = [];

  // Analyze keyword matches for each persona
  Object.entries(PERSONAS).forEach(([key, persona]) => {
    let score = 0;
    
    persona.triggerKeywords.forEach(keyword => {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(keywordRegex) || [];
      score += matches.length * 2; // Weight recent messages
      
      if (currentLower.includes(keyword)) {
        score += 3; // Higher weight for current message
      }
    });
    
    personaScores[key] = score;
  });

  // Analyze conversation patterns
  const hasQuestionMarks = currentMessage.includes('?');
  const isShortMessage = currentMessage.trim().split(/\s+/).length < 8;
  const hasUrgentWords = /\b(urgent|asap|quickly|immediate|now|soon)\b/i.test(currentMessage);
  const hasAnalyticalWords = /\b(analyze|compare|research|data|trends|market)\b/i.test(currentMessage);
  const hasEmotionalWords = /\b(feel|worried|anxious|excited|frustrated|confused)\b/i.test(currentMessage);

  // Adjust scores based on patterns
  if (hasEmotionalWords || hasQuestionMarks) {
    personaScores.mentor += 2;
    contextFactors.push('Emotional language detected');
  }
  
  if (hasAnalyticalWords || !hasQuestionMarks) {
    personaScores.strategist += 2;
    contextFactors.push('Analytical language detected');
  }
  
  if (hasUrgentWords || isShortMessage) {
    personaScores.coach += 2;
    contextFactors.push('Action-oriented language detected');
  }

  // Consider user profile context
  if (userProfile) {
    const lookingFor = userProfile.lookingFor || '';
    if (lookingFor.includes('career_change')) {
      personaScores.mentor += 1;
      contextFactors.push('User seeking career change');
    }
    if (lookingFor.includes('skill_development')) {
      personaScores.coach += 1;
      contextFactors.push('User focusing on skill development');
    }
  }

  // Determine winning persona
  const maxScore = Math.max(...Object.values(personaScores));
  const selectedPersonaKey = Object.keys(personaScores).find(
    key => personaScores[key] === maxScore
  ) || 'mentor'; // Default to mentor

  const confidence = maxScore > 0 ? Math.min(maxScore / 10, 1) : 0.5;

  return {
    selectedPersona: PERSONAS[selectedPersonaKey],
    confidence,
    reasoning: `Selected ${PERSONAS[selectedPersonaKey].name} based on keyword analysis and conversation patterns`,
    contextFactors
  };
}

/**
 * Get conversation flow analysis to detect persona switching needs
 */
export function analyzeConversationFlow(userId: string): {
  needsPersonaSwitch: boolean;
  currentTopic: string;
  conversationStage: 'opening' | 'exploration' | 'decision' | 'action';
} {
  const recentMessages = getRecentMessagesSync(userId, 6);
  
  if (recentMessages.length === 0) {
    return {
      needsPersonaSwitch: false,
      currentTopic: 'general',
      conversationStage: 'opening'
    };
  }

  // Analyze conversation progression
  const userMessages = recentMessages.filter(m => m.role === 'user');
  const lastMessage = userMessages[userMessages.length - 1]?.message || '';
  
  const isAskingQuestions = lastMessage.includes('?');
  const isExpressingConcerns = /\b(worried|concerned|anxious|unsure)\b/i.test(lastMessage);
  const isRequestingAction = /\b(how do i|what should i|help me|show me)\b/i.test(lastMessage);
  const isComparing = /\b(versus|vs|compare|better|which|or)\b/i.test(lastMessage);

  let conversationStage: 'opening' | 'exploration' | 'decision' | 'action' = 'opening';
  let currentTopic = 'general';

  if (recentMessages.length === 1) {
    conversationStage = 'opening';
  } else if (isAskingQuestions || isExpressingConcerns) {
    conversationStage = 'exploration';
  } else if (isComparing) {
    conversationStage = 'decision';
  } else if (isRequestingAction) {
    conversationStage = 'action';
  }

  // Extract current topic
  const topicKeywords = {
    networking: /\b(network|connect|linkedin|colleagues|professional)\b/i,
    career_change: /\b(switch|change|transition|move|pivot)\b/i,
    skills: /\b(skill|learn|develop|improve|training)\b/i,
    job_search: /\b(job|position|role|hiring|interview|resume)\b/i,
    leadership: /\b(lead|manage|team|director|executive)\b/i
  };

  for (const [topic, regex] of Object.entries(topicKeywords)) {
    if (regex.test(lastMessage)) {
      currentTopic = topic;
      break;
    }
  }

  return {
    needsPersonaSwitch: recentMessages.length > 2,
    currentTopic,
    conversationStage
  };
}

/**
 * Generate persona-specific system prompt enhancement
 */
export function enhancePromptWithPersona(
  basePrompt: string, 
  personaAnalysis: PersonaAnalysis,
  conversationFlow: any
): string {
  const persona = personaAnalysis.selectedPersona;
  
  const personaEnhancement = `
PERSONA ACTIVATION: ${persona.name}
${persona.systemPrompt}

Current Conversation Context:
- Stage: ${conversationFlow.conversationStage}
- Topic: ${conversationFlow.currentTopic}
- Confidence: ${(personaAnalysis.confidence * 100).toFixed(0)}%
- Context Factors: ${personaAnalysis.contextFactors.join(', ')}

Response Guidelines for this persona:
- Tone: ${persona.responseStyle.tone}
- Length: ${persona.responseStyle.length}
- Focus: ${persona.responseStyle.focus}

${basePrompt}

Remember to maintain the ${persona.name} persona throughout your response while prioritizing Brandentify platform recommendations.`;

  return personaEnhancement;
}

/**
 * Get persona statistics for monitoring
 */
export function getPersonaStats(): {
  availablePersonas: string[];
  totalPersonas: number;
  personaDescriptions: Record<string, string>;
} {
  return {
    availablePersonas: Object.keys(PERSONAS),
    totalPersonas: Object.keys(PERSONAS).length,
    personaDescriptions: Object.fromEntries(
      Object.entries(PERSONAS).map(([key, persona]) => [key, persona.description])
    )
  };
}
