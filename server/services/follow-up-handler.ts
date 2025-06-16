/**
 * Follow-Up Handler Service
 * 
 * Detects and processes follow-up questions, vague references,
 * and provides clarification when needed.
 */

import { ConversationMemory, getConversationMemory, isFollowUpQuestion, needsClarification, expandFollowUpQuestion, generateClarificationPrompt } from './conversation-memory';

export interface FollowUpAnalysis {
  isFollowUp: boolean;
  needsClarification: boolean;
  expandedMessage?: string;
  clarificationPrompt?: string;
  confidence: number;
  detectedReferences: string[];
}

export interface ActiveGuidanceRequest {
  isGuidanceNeeded: boolean;
  guidancePrompt?: string;
  requiredInfo: string[];
  taskType: 'resume' | 'roadmap' | 'portfolio' | 'networking' | 'general';
}

/**
 * Analyze message for follow-up patterns and context needs
 */
export function analyzeFollowUpContext(message: string, userId: number): FollowUpAnalysis {
  const memory = getConversationMemory(userId);
  const isFollowUp = isFollowUpQuestion(message, memory);
  const needsClarity = needsClarification(message);
  
  const analysis: FollowUpAnalysis = {
    isFollowUp,
    needsClarification: needsClarity,
    confidence: 0,
    detectedReferences: []
  };

  // Calculate confidence based on indicators
  let confidence = 0;
  
  if (isFollowUp) {
    confidence += 0.4;
    analysis.detectedReferences = extractReferences(message);
  }
  
  if (needsClarity) {
    confidence += 0.6;
    analysis.clarificationPrompt = generateClarificationPrompt(message, memory);
  } else if (isFollowUp) {
    analysis.expandedMessage = expandFollowUpQuestion(message, memory);
    confidence += 0.3;
  }

  analysis.confidence = Math.min(confidence, 1.0);
  
  return analysis;
}

/**
 * Detect if message requires active guidance for complex tasks
 */
export function detectActiveGuidanceNeeds(message: string, userId: number): ActiveGuidanceRequest {
  const guidancePatterns = [
    {
      pattern: /\b(write|create|build|make).*(resume|cv)\b/i,
      type: 'resume' as const,
      info: ['current role', 'target role', 'key experiences', 'preferred format']
    },
    {
      pattern: /\b(create|build|make).*(roadmap|plan|path)\b/i,
      type: 'roadmap' as const,
      info: ['current role', 'target role', 'timeline', 'learning preferences']
    },
    {
      pattern: /\b(create|build|design).*(portfolio|showcase)\b/i,
      type: 'portfolio' as const,
      info: ['current role', 'target audience', 'key projects', 'preferred style']
    },
    {
      pattern: /\b(help.*network|networking strategy|connect with)\b/i,
      type: 'networking' as const,
      info: ['current role', 'target industry', 'networking goals', 'preferred platforms']
    }
  ];

  for (const { pattern, type, info } of guidancePatterns) {
    if (pattern.test(message)) {
      return {
        isGuidanceNeeded: true,
        taskType: type,
        requiredInfo: info,
        guidancePrompt: generateActiveGuidancePrompt(type, info)
      };
    }
  }

  return { isGuidanceNeeded: false, requiredInfo: [], taskType: 'general' };
}

/**
 * Generate structured guidance prompt for complex tasks
 */
function generateActiveGuidancePrompt(taskType: string, requiredInfo: string[]): string {
  const taskPrompts = {
    resume: "I can help you create a compelling resume! To provide the best guidance, could you share:",
    roadmap: "I'd love to create a personalized career roadmap for you. First, let me understand:",
    portfolio: "Great idea to build a portfolio! To give you the most relevant advice, I need to know:",
    networking: "I can definitely help with your networking strategy. To provide targeted guidance:"
  };

  const prompt = taskPrompts[taskType as keyof typeof taskPrompts] || "I can help with that! First, could you tell me:";
  
  const infoList = requiredInfo
    .map((info, index) => `${index + 1}. ${info.charAt(0).toUpperCase() + info.slice(1)}`)
    .join('\n');

  return `${prompt}\n\n${infoList}\n\nThis will help me provide specific, actionable advice tailored to your situation.`;
}

/**
 * Extract references and pronouns from message
 */
function extractReferences(message: string): string[] {
  const references: string[] = [];
  
  // Common vague references
  const vaguePatterns = [
    /\b(that|it|this|one|them|those|these)\b/gi,
    /\b(both|either|also|too)\b/gi,
    /\b(he|she|they|we)\b/gi
  ];

  vaguePatterns.forEach(pattern => {
    const matches = message.match(pattern);
    if (matches) {
      references.push(...matches.map(m => m.toLowerCase()));
    }
  });

  return references.filter((ref, index) => references.indexOf(ref) === index);
}

/**
 * Process user preferences from interaction patterns
 */
export function detectUserPreferences(message: string, previousInteractions: any[]): {
  preferredLength: 'short' | 'medium' | 'long';
  preferredStyle: 'conversational' | 'structured' | 'bullet-points';
  preferredDepth: 'overview' | 'detailed' | 'comprehensive';
} {
  // Analyze message for preference indicators
  let preferredLength: 'short' | 'medium' | 'long' = 'medium';
  let preferredStyle: 'conversational' | 'structured' | 'bullet-points' = 'conversational';
  let preferredDepth: 'overview' | 'detailed' | 'comprehensive' = 'detailed';

  // Length preferences
  if (/\b(brief|short|quick|summary)\b/i.test(message)) {
    preferredLength = 'short';
  } else if (/\b(detailed|comprehensive|thorough|complete)\b/i.test(message)) {
    preferredLength = 'long';
  }

  // Style preferences
  if (/\b(list|bullet|points|steps)\b/i.test(message)) {
    preferredStyle = 'bullet-points';
  } else if (/\b(structure|organize|format)\b/i.test(message)) {
    preferredStyle = 'structured';
  }

  // Depth preferences
  if (/\b(overview|high.?level|general)\b/i.test(message)) {
    preferredDepth = 'overview';
  } else if (/\b(deep|comprehensive|thorough|everything)\b/i.test(message)) {
    preferredDepth = 'comprehensive';
  }

  return { preferredLength, preferredStyle, preferredDepth };
}

/**
 * Generate context-aware response prefix based on conversation history
 */
export function generateContextAwarePrefix(message: string, memory: ConversationMemory): string {
  const lastExchange = memory.exchanges.slice(-2); // Last user message and Musk response
  
  if (lastExchange.length < 2) return '';

  const lastUserMessage = lastExchange.find(e => e.speaker === 'User')?.message || '';
  const lastMuskMessage = lastExchange.find(e => e.speaker === 'Musk')?.message || '';

  // Generate connecting phrases based on context
  if (isFollowUpQuestion(message, memory)) {
    if (/\b(both|either)\b/i.test(message)) {
      return "Building on our previous discussion, ";
    }
    if (/\b(what about|how about)\b/i.test(message)) {
      return "Regarding your follow-up question, ";
    }
    if (/\b(that|it|this)\b/i.test(message)) {
      return "To expand on that point, ";
    }
  }

  return '';
}

/**
 * Smart message rewriting for better context
 */
export function rewriteMessageWithContext(message: string, memory: ConversationMemory): string {
  if (!isFollowUpQuestion(message, memory)) {
    return message;
  }

  const expandedMessage = expandFollowUpQuestion(message, memory);
  const lastTopic = memory.lastTopic;
  
  // Enhance common patterns
  let rewritten = expandedMessage;

  // Add context for comparative questions
  if (/\b(better|best|worse|prefer)\b/i.test(message) && lastTopic) {
    rewritten = `In the context of ${lastTopic}, ${rewritten.toLowerCase()}`;
  }

  // Add context for decision questions
  if (/\b(should I|can I|would you)\b/i.test(message) && lastTopic) {
    rewritten = `For someone working on ${lastTopic}, ${rewritten.toLowerCase()}`;
  }

  return rewritten;
}

/**
 * Generate smart follow-up suggestions based on context
 */
export function generateSmartFollowUps(message: string, memory: ConversationMemory): string[] {
  const suggestions: string[] = [];
  const lastTopic = memory.lastTopic;

  if (lastTopic === 'resume') {
    suggestions.push(
      "How can I make my resume ATS-friendly?",
      "What's the best resume format for my industry?",
      "How do I highlight achievements vs responsibilities?"
    );
  } else if (lastTopic === 'networking') {
    suggestions.push(
      "What's the best time to reach out on LinkedIn?",
      "How do I write effective connection requests?",
      "Should I attend virtual or in-person events?"
    );
  } else if (lastTopic === 'portfolio') {
    suggestions.push(
      "How many projects should I include?",
      "What's the best way to present case studies?",
      "Should I include personal or only professional projects?"
    );
  }

  return suggestions.slice(0, 3);
}