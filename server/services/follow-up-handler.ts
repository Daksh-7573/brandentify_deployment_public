/**
 * Follow-Up Handler Service
 * 
 * Detects and processes follow-up questions, vague references,
 * and provides clarification when needed.
 */

import { ConversationMemory, getConversationMemory, isFollowUpMessage } from './conversation-memory';

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

function isFollowUpQuestion(message: string, memory: ConversationMemory | null): boolean {
  if (!memory || memory.messages.length < 2) {
    return false;
  }

  const vaguePhrases = [
    'that', 'this', 'it', 'both', 'them', 'those', 'these',
    'again', 'also', 'too', 'as well', 'like you said',
    'what about', 'how about', 'and what', 'but what'
  ];

  const lowerMessage = message.toLowerCase().trim();
  
  const hasVagueTerms = vaguePhrases.some(phrase => 
    lowerMessage.includes(phrase.toLowerCase())
  );

  const wordCount = message.trim().split(/\s+/).length;
  const isShort = wordCount < 5;

  const startsWithConnector = /^(and|but|or|so|also|what about|how about|what if)/i.test(lowerMessage);

  return hasVagueTerms || (isShort && startsWithConnector);
}

function needsClarification(message: string): boolean {
  const ambiguousPhrases = [
    'what do you mean', 'how so', 'explain more',
    'can you clarify', 'not sure', "don't understand"
  ];
  
  const lowerMessage = message.toLowerCase().trim();
  return ambiguousPhrases.some(phrase => lowerMessage.includes(phrase));
}

function expandFollowUpQuestion(message: string, memory: ConversationMemory | null): string {
  if (!memory || memory.messages.length === 0) {
    return message;
  }

  const lastMessages = memory.messages.slice(-4);
  const lastTopic = extractTopicFromMessages(lastMessages);
  
  if (lastTopic) {
    return `${message} (context: ${lastTopic})`;
  }
  
  return message;
}

function extractTopicFromMessages(messages: any[]): string | null {
  const topicPatterns = [
    { pattern: /\b(resume|cv)\b/i, topic: 'resume' },
    { pattern: /\b(portfolio|showcase)\b/i, topic: 'portfolio' },
    { pattern: /\b(network|linkedin|connect)\b/i, topic: 'networking' },
    { pattern: /\b(career|job|role)\b/i, topic: 'career' },
    { pattern: /\b(skill|learn|course)\b/i, topic: 'skills' }
  ];
  
  for (const msg of messages.reverse()) {
    const content = msg.message || '';
    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(content)) {
        return topic;
      }
    }
  }
  
  return null;
}

function generateClarificationPrompt(message: string, memory: ConversationMemory | null): string {
  const lastTopic = memory ? extractTopicFromMessages(memory.messages.slice(-4)) : null;
  
  if (lastTopic) {
    return `I want to make sure I understand correctly. Are you asking about ${lastTopic}? Could you provide more details?`;
  }
  
  return "Could you please clarify what you'd like to know more about?";
}

/**
 * Analyze message for follow-up patterns and context needs
 */
export async function analyzeFollowUpContext(message: string, userId: number): Promise<FollowUpAnalysis> {
  const memory = await getConversationMemory(userId.toString());
  const isFollowUp = isFollowUpQuestion(message, memory);
  const needsClarity = needsClarification(message);
  
  const analysis: FollowUpAnalysis = {
    isFollowUp,
    needsClarification: needsClarity,
    confidence: 0,
    detectedReferences: []
  };

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
  let preferredLength: 'short' | 'medium' | 'long' = 'medium';
  let preferredStyle: 'conversational' | 'structured' | 'bullet-points' = 'conversational';
  let preferredDepth: 'overview' | 'detailed' | 'comprehensive' = 'detailed';

  if (/\b(brief|short|quick|summary)\b/i.test(message)) {
    preferredLength = 'short';
  } else if (/\b(detailed|comprehensive|thorough|complete)\b/i.test(message)) {
    preferredLength = 'long';
  }

  if (/\b(list|bullet|points|steps)\b/i.test(message)) {
    preferredStyle = 'bullet-points';
  } else if (/\b(structure|organize|format)\b/i.test(message)) {
    preferredStyle = 'structured';
  }

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
export async function generateContextAwarePrefix(message: string, userId: number): Promise<string> {
  const memory = await getConversationMemory(userId.toString());
  if (!memory || memory.messages.length < 2) return '';

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
export async function rewriteMessageWithContext(message: string, userId: number): Promise<string> {
  const memory = await getConversationMemory(userId.toString());
  
  if (!isFollowUpQuestion(message, memory)) {
    return message;
  }

  const expandedMessage = expandFollowUpQuestion(message, memory);
  const lastTopic = memory ? extractTopicFromMessages(memory.messages.slice(-4)) : null;
  
  let rewritten = expandedMessage;

  if (/\b(better|best|worse|prefer)\b/i.test(message) && lastTopic) {
    rewritten = `In the context of ${lastTopic}, ${rewritten.toLowerCase()}`;
  }

  if (/\b(should I|can I|would you)\b/i.test(message) && lastTopic) {
    rewritten = `For someone working on ${lastTopic}, ${rewritten.toLowerCase()}`;
  }

  return rewritten;
}

/**
 * Generate smart follow-up suggestions based on context
 */
export async function generateSmartFollowUps(userId: number): Promise<string[]> {
  const memory = await getConversationMemory(userId.toString());
  const suggestions: string[] = [];
  const lastTopic = memory ? extractTopicFromMessages(memory.messages.slice(-4)) : null;

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
