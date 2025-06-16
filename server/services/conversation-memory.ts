/**
 * Conversation Memory Service
 * 
 * This service manages conversation history for contextual responses.
 * Stores the last few interactions per user to enable follow-up detection
 * and context-aware responses.
 */

export interface ConversationMessage {
  role: 'user' | 'musk';
  message: string;
  timestamp: Date;
  intent?: string;
}

export interface ConversationMemory {
  userId: string;
  messages: ConversationMessage[];
  lastUpdated: Date;
}

// In-memory storage for conversation histories
// TODO: Move to Redis or database for production scaling
const conversationStore = new Map<string, ConversationMemory>();

// Maximum number of messages to keep in memory per user
const MAX_MESSAGES_PER_USER = 10;

/**
 * Add a message to user's conversation memory
 */
export function addMessageToMemory(
  userId: string, 
  role: 'user' | 'musk', 
  message: string,
  intent?: string
): void {
  const userMemory = conversationStore.get(userId) || {
    userId,
    messages: [],
    lastUpdated: new Date()
  };

  // Add new message
  userMemory.messages.push({
    role,
    message,
    timestamp: new Date(),
    intent
  });

  // Keep only the last MAX_MESSAGES_PER_USER messages
  if (userMemory.messages.length > MAX_MESSAGES_PER_USER) {
    userMemory.messages = userMemory.messages.slice(-MAX_MESSAGES_PER_USER);
  }

  userMemory.lastUpdated = new Date();
  conversationStore.set(userId, userMemory);

  console.log(`[Conversation Memory] Added ${role} message for user ${userId}. Total messages: ${userMemory.messages.length}`);
}

/**
 * Get conversation history for a user
 */
export function getConversationMemory(userId: string): ConversationMemory | null {
  return conversationStore.get(userId) || null;
}

/**
 * Get the last few messages for context (default: last 6 messages)
 */
export function getRecentMessages(userId: string, count: number = 6): ConversationMessage[] {
  const memory = conversationStore.get(userId);
  if (!memory || memory.messages.length === 0) {
    return [];
  }

  return memory.messages.slice(-count);
}

/**
 * Get the last Musk response for reference resolution
 */
export function getLastMuskResponse(userId: string): string | null {
  const memory = conversationStore.get(userId);
  if (!memory || memory.messages.length === 0) {
    return null;
  }

  // Find the last message from Musk
  for (let i = memory.messages.length - 1; i >= 0; i--) {
    if (memory.messages[i].role === 'musk') {
      return memory.messages[i].message;
    }
  }

  return null;
}

/**
 * Check if user input appears to be a follow-up to previous conversation
 */
export function isFollowUpMessage(userId: string, message: string): boolean {
  const memory = conversationStore.get(userId);
  if (!memory || memory.messages.length < 2) {
    return false;
  }

  // Check for vague references or short responses that likely refer to previous context
  const vaguePhrases = [
    'that', 'this', 'it', 'both', 'them', 'those', 'these',
    'again', 'also', 'too', 'as well', 'like you said',
    'what about', 'how about', 'and what', 'but what'
  ];

  const lowerMessage = message.toLowerCase().trim();
  
  // Check for vague terms
  const hasVagueTerms = vaguePhrases.some(phrase => 
    lowerMessage.includes(phrase.toLowerCase())
  );

  // Check for short responses (under 5 words)
  const wordCount = message.trim().split(/\s+/).length;
  const isShort = wordCount < 5;

  // Check if it starts with connectors that suggest continuation
  const startsWithConnector = /^(and|but|or|so|also|what about|how about|what if)/i.test(lowerMessage);

  return hasVagueTerms || (isShort && startsWithConnector);
}

/**
 * Format conversation history for AI context
 */
export function formatConversationForAI(userId: string, currentMessage: string): string {
  const recentMessages = getRecentMessages(userId, 6);
  
  if (recentMessages.length === 0) {
    return `User's current message: "${currentMessage}"`;
  }

  let contextString = "Recent conversation context:\n";
  
  recentMessages.forEach((msg, index) => {
    const roleLabel = msg.role === 'user' ? 'User' : 'Musk';
    contextString += `${roleLabel}: "${msg.message}"\n`;
  });

  contextString += `\nUser's current message: "${currentMessage}"`;
  
  return contextString;
}

/**
 * Clear conversation memory for a user (useful for testing or privacy)
 */
export function clearConversationMemory(userId: string): void {
  conversationStore.delete(userId);
  console.log(`[Conversation Memory] Cleared memory for user ${userId}`);
}

/**
 * Get conversation statistics for monitoring
 */
export function getConversationStats(): {
  totalUsers: number;
  totalMessages: number;
  averageMessagesPerUser: number;
} {
  const totalUsers = conversationStore.size;
  let totalMessages = 0;

  conversationStore.forEach(memory => {
    totalMessages += memory.messages.length;
  });

  return {
    totalUsers,
    totalMessages,
    averageMessagesPerUser: totalUsers > 0 ? Math.round(totalMessages / totalUsers) : 0
  };
}