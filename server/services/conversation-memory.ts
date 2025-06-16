/**
 * Conversation Memory Service
 * 
 * Implements conversation context retention, follow-up detection,
 * and clarification handling for enhanced Musk intelligence.
 */

export interface ConversationExchange {
  speaker: 'User' | 'Musk';
  message: string;
  timestamp: Date;
  intent?: string;
  context?: any;
}

export interface ConversationMemory {
  userId: number;
  exchanges: ConversationExchange[];
  userPreferences: {
    responseStyle: 'brief' | 'detailed' | 'lists' | 'examples';
    responseLength: 'short' | 'medium' | 'long';
    followUpDepth: 'low' | 'medium' | 'high';
    preferredFormat: 'conversational' | 'structured' | 'bullet-points';
  };
  contextualReferences: Map<string, string>; // Maps pronouns/references to actual entities
  lastTopic: string;
  sessionGoal?: string;
}

// In-memory storage for conversation history (could be moved to Redis/DB later)
const conversationMemories = new Map<number, ConversationMemory>();

/**
 * Initialize or get conversation memory for a user
 */
export function getConversationMemory(userId: number): ConversationMemory {
  if (!conversationMemories.has(userId)) {
    conversationMemories.set(userId, {
      userId,
      exchanges: [],
      userPreferences: {
        responseStyle: 'detailed',
        responseLength: 'medium',
        followUpDepth: 'medium',
        preferredFormat: 'conversational'
      },
      contextualReferences: new Map(),
      lastTopic: ''
    });
  }
  return conversationMemories.get(userId)!;
}

/**
 * Add a new exchange to conversation memory
 */
export function addConversationExchange(
  userId: number, 
  speaker: 'User' | 'Musk', 
  message: string, 
  intent?: string,
  context?: any
): void {
  const memory = getConversationMemory(userId);
  
  const exchange: ConversationExchange = {
    speaker,
    message,
    timestamp: new Date(),
    intent,
    context
  };

  memory.exchanges.push(exchange);
  
  // Keep only last 5 exchanges to maintain context without overwhelming the prompt
  if (memory.exchanges.length > 10) {
    memory.exchanges = memory.exchanges.slice(-10);
  }

  // Update last topic for context
  if (speaker === 'User') {
    memory.lastTopic = extractTopicFromMessage(message);
    updateContextualReferences(memory, message);
  }
}

/**
 * Get formatted conversation history for prompt inclusion
 */
export function getFormattedConversationHistory(userId: number, includeLastN: number = 5): string {
  const memory = getConversationMemory(userId);
  const recentExchanges = memory.exchanges.slice(-includeLastN * 2); // Get last N exchanges (user + musk pairs)
  
  if (recentExchanges.length === 0) {
    return '';
  }

  const formatted = recentExchanges
    .map(exchange => `${exchange.speaker}: ${exchange.message}`)
    .join('\n');

  return `\n**Recent Conversation:**\n${formatted}\n`;
}

/**
 * Detect if a message is a follow-up question that needs context
 */
export function isFollowUpQuestion(message: string, memory: ConversationMemory): boolean {
  const followUpIndicators = [
    // Vague references
    /\b(that|it|this|one|them|those|these)\b/i,
    // Comparison words without context
    /\b(both|either|also|too|as well)\b/i,
    // Continuation words
    /\b(and then|what about|how about|what if)\b/i,
    // Pronouns without clear antecedents
    /\b(he|she|they|we|you mentioned)\b/i,
    // Short questions
    /^.{1,15}\?$/,
    // References to previous conversation
    /\b(like you said|as you mentioned|from before)\b/i
  ];

  return followUpIndicators.some(pattern => pattern.test(message)) && memory.exchanges.length > 0;
}

/**
 * Detect if a message needs clarification
 */
export function needsClarification(message: string): boolean {
  // Very short messages
  if (message.trim().length < 5) return true;
  
  // Messages with only vague words
  const vagueOnlyPattern = /^(yes|no|ok|sure|maybe|both|either|that|it|this)\.?$/i;
  if (vagueOnlyPattern.test(message.trim())) return true;
  
  // Questions with no clear subject
  const vagueQuestionPattern = /^(what about|how about|can I|should I|what if).{0,20}\?$/i;
  if (vagueQuestionPattern.test(message.trim())) return true;
  
  return false;
}

/**
 * Expand vague follow-up questions using conversation context
 */
export function expandFollowUpQuestion(message: string, memory: ConversationMemory): string {
  if (!isFollowUpQuestion(message, memory)) {
    return message;
  }

  const lastUserMessage = memory.exchanges
    .filter(e => e.speaker === 'User')
    .slice(-1)[0];
    
  const lastMuskMessage = memory.exchanges
    .filter(e => e.speaker === 'Musk')
    .slice(-1)[0];

  let expandedMessage = message;

  // Replace pronouns and vague references with context
  const referenceMap = memory.contextualReferences;
  
  // Handle common patterns
  if (/\b(both|either)\b/i.test(message) && memory.lastTopic) {
    expandedMessage = message.replace(
      /\b(both|either)\b/gi, 
      `$1 ${memory.lastTopic} options`
    );
  }

  if (/\b(that|it|this)\b/i.test(message) && memory.lastTopic) {
    expandedMessage = expandedMessage.replace(
      /\b(that|it|this)\b/gi, 
      memory.lastTopic
    );
  }

  if (/^what about/i.test(message) && lastMuskMessage) {
    // Extract key topics from last Musk response
    const topics = extractTopicsFromResponse(lastMuskMessage.message);
    if (topics.length > 0) {
      expandedMessage = `What about ${topics[0]} in the context of ${memory.lastTopic}?`;
    }
  }

  return expandedMessage;
}

/**
 * Generate clarification prompt for unclear messages
 */
export function generateClarificationPrompt(message: string, memory: ConversationMemory): string {
  const userName = memory.contextualReferences.get('userName') || '';
  
  if (message.trim().length < 5) {
    return `${userName}, could you provide more details about what you'd like to know? I want to give you the most helpful guidance.`;
  }

  if (/\b(both|either)\b/i.test(message)) {
    return `${userName}, when you say "both," are you referring to the options we just discussed? Could you clarify which specific choices you're considering?`;
  }

  if (/\b(that|it|this)\b/i.test(message)) {
    return `${userName}, could you be more specific about what you're referring to? I want to make sure I understand your question correctly.`;
  }

  if (/^(what about|how about)/i.test(message)) {
    return `${userName}, I'd like to help you explore that option. Could you provide more context about what specific aspect you'd like to discuss?`;
  }

  return `${userName}, could you provide a bit more detail about your question? The more specific you are, the better guidance I can provide.`;
}

/**
 * Update user interaction preferences based on their behavior
 */
export function updateUserPreferences(userId: number, responseLength: number, followUpPattern: string): void {
  const memory = getConversationMemory(userId);
  
  // Adapt response length preference
  if (responseLength < 200) {
    memory.userPreferences.responseLength = 'short';
  } else if (responseLength > 800) {
    memory.userPreferences.responseLength = 'long';
  }

  // Detect preferred response style
  if (followUpPattern.includes('list') || followUpPattern.includes('bullet')) {
    memory.userPreferences.responseStyle = 'lists';
  } else if (followUpPattern.includes('example')) {
    memory.userPreferences.responseStyle = 'examples';
  }
}

/**
 * Extract main topic from a user message
 */
function extractTopicFromMessage(message: string): string {
  // Simple topic extraction - could be enhanced with NLP
  const topicPatterns = [
    /\b(resume|cv)\b/i,
    /\b(portfolio|project)\b/i,
    /\b(networking|linkedin)\b/i,
    /\b(job search|career)\b/i,
    /\b(skills|experience)\b/i,
    /\b(interview|application)\b/i
  ];

  for (const pattern of topicPatterns) {
    const match = message.match(pattern);
    if (match) return match[0].toLowerCase();
  }

  // Fallback: extract first meaningful noun
  const words = message.toLowerCase().split(' ')
    .filter(word => word.length > 3 && !['what', 'how', 'when', 'where', 'why'].includes(word));
  
  return words[0] || 'career advice';
}

/**
 * Update contextual references map
 */
function updateContextualReferences(memory: ConversationMemory, message: string): void {
  // Extract and store references for future use
  const roleMatch = message.match(/\b(director|manager|engineer|developer|designer)\b/i);
  if (roleMatch) {
    memory.contextualReferences.set('currentRole', roleMatch[0]);
  }

  const industryMatch = message.match(/\b(tech|healthcare|finance|education|hospitality)\b/i);
  if (industryMatch) {
    memory.contextualReferences.set('industry', industryMatch[0]);
  }
}

/**
 * Extract topics from Musk's response for context
 */
function extractTopicsFromResponse(response: string): string[] {
  const topics: string[] = [];
  
  // Extract from headers (marked with **)
  const headerMatches = response.match(/\*\*(.*?)\*\*/g);
  if (headerMatches) {
    topics.push(...headerMatches.map(h => h.replace(/\*\*/g, '').trim()));
  }

  // Extract key career terms
  const careerTerms = response.match(/\b(resume|portfolio|networking|linkedin|skills|experience|interview)\b/gi);
  if (careerTerms) {
    topics.push(...careerTerms.map(t => t.toLowerCase()));
  }

  const uniqueTopics = topics.filter((topic, index) => topics.indexOf(topic) === index);
  return uniqueTopics.slice(0, 3); // Return unique topics, max 3
}