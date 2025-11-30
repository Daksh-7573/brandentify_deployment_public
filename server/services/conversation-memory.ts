/**
 * Conversation Memory Service
 * 
 * This service manages conversation history for contextual responses.
 * Stores the last few interactions per user to enable follow-up detection
 * and context-aware responses.
 * 
 * Phase 2.1: Migrated from in-memory Map to PostgreSQL (chat_messages table)
 * for persistence across app restarts in production.
 * 
 * Architecture:
 * - Primary storage: PostgreSQL (chat_messages table)
 * - Cache layer: In-memory Map with TTL for performance
 * - Retention: MAX_MESSAGES_PER_USER (older messages auto-deleted)
 * - Cache warm-up: Sync helpers trigger background DB load on cache miss
 */

import { db } from '../db';
import { chatMessages } from '@shared/schema';
import { eq, desc, lt, and } from 'drizzle-orm';

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

const MAX_MESSAGES_PER_USER = 10;
const CACHE_TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map<string, { data: ConversationMemory; expiry: number }>();
const warmUpInProgress = new Set<string>();

function getCachedMemory(userId: string): ConversationMemory | null {
  const cached = memoryCache.get(userId);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  memoryCache.delete(userId);
  return null;
}

function setCachedMemory(userId: string, memory: ConversationMemory): void {
  memoryCache.set(userId, { data: memory, expiry: Date.now() + CACHE_TTL_MS });
}

function invalidateCache(userId: string): void {
  memoryCache.delete(userId);
}

/**
 * Trigger background cache warm-up for a user
 * This ensures sync helpers have data available after cold start
 */
function triggerCacheWarmUp(userId: string): void {
  if (warmUpInProgress.has(userId)) {
    return;
  }
  
  warmUpInProgress.add(userId);
  
  getConversationMemory(userId)
    .then(() => {
      console.log(`[Conversation Memory] Cache warmed up for user ${userId}`);
    })
    .catch(err => {
      console.error(`[Conversation Memory] Cache warm-up failed for user ${userId}:`, err);
    })
    .finally(() => {
      warmUpInProgress.delete(userId);
    });
}

/**
 * Enforce retention policy by deleting old messages beyond MAX_MESSAGES_PER_USER
 */
async function enforceRetentionPolicy(userId: string): Promise<void> {
  try {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return;
    }

    const allMessages = await db.select({ id: chatMessages.id, timestamp: chatMessages.timestamp })
      .from(chatMessages)
      .where(eq(chatMessages.userId, userIdNum))
      .orderBy(desc(chatMessages.timestamp));

    if (allMessages.length > MAX_MESSAGES_PER_USER) {
      const messagesToDelete = allMessages.slice(MAX_MESSAGES_PER_USER);
      const idsToDelete = messagesToDelete.map(m => m.id);
      
      for (const id of idsToDelete) {
        await db.delete(chatMessages).where(eq(chatMessages.id, id));
      }
      
      console.log(`[Conversation Memory] Retention: deleted ${idsToDelete.length} old messages for user ${userId}`);
    }
  } catch (error) {
    console.error(`[Conversation Memory] Retention policy enforcement failed:`, error);
  }
}

/**
 * Add a message to user's conversation memory (stored in database)
 * Throws on failure to prevent silent data loss
 */
export async function addMessageToMemory(
  userId: string, 
  role: 'user' | 'musk', 
  message: string,
  intent?: string
): Promise<void> {
  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    throw new Error(`[Conversation Memory] Invalid userId: ${userId}`);
  }

  const sender = role === 'musk' ? 'ai' : 'user';

  try {
    await db.insert(chatMessages).values({
      userId: userIdNum,
      message: message,
      sender
    });

    invalidateCache(userId);
    console.log(`[Conversation Memory] Added ${role} message for user ${userId} to database`);
    
    enforceRetentionPolicy(userId).catch(err => {
      console.error(`[Conversation Memory] Background retention failed:`, err);
    });
  } catch (error) {
    console.error(`[Conversation Memory] Failed to add message to database:`, error);
    throw new Error(`Failed to persist message to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get conversation history for a user from database
 */
export async function getConversationMemory(userId: string): Promise<ConversationMemory | null> {
  const cached = getCachedMemory(userId);
  if (cached) {
    return cached;
  }

  try {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return null;
    }

    const dbMessages = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userIdNum))
      .orderBy(desc(chatMessages.timestamp))
      .limit(MAX_MESSAGES_PER_USER);

    if (!dbMessages || dbMessages.length === 0) {
      const emptyMemory: ConversationMemory = {
        userId,
        messages: [],
        lastUpdated: new Date()
      };
      setCachedMemory(userId, emptyMemory);
      return emptyMemory;
    }

    const messages: ConversationMessage[] = dbMessages
      .reverse()
      .map(msg => ({
        role: msg.sender === 'ai' ? 'musk' as const : 'user' as const,
        message: msg.message,
        timestamp: msg.timestamp ?? new Date()
      }));

    const memory: ConversationMemory = {
      userId,
      messages,
      lastUpdated: messages[messages.length - 1]?.timestamp ?? new Date()
    };

    setCachedMemory(userId, memory);
    return memory;
  } catch (error) {
    console.error(`[Conversation Memory] Failed to get memory from database:`, error);
    return null;
  }
}

/**
 * Get the last few messages for context (default: last 6 messages)
 */
export async function getRecentMessages(userId: string, count: number = 6): Promise<ConversationMessage[]> {
  const memory = await getConversationMemory(userId);
  if (!memory || memory.messages.length === 0) {
    return [];
  }

  return memory.messages.slice(-count);
}

/**
 * Get the last Musk response for reference resolution
 */
export async function getLastMuskResponse(userId: string): Promise<string | null> {
  const memory = await getConversationMemory(userId);
  if (!memory || memory.messages.length === 0) {
    return null;
  }

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
export async function isFollowUpMessage(userId: string, message: string): Promise<boolean> {
  const memory = await getConversationMemory(userId);
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

/**
 * Format conversation history for AI context
 */
export async function formatConversationForAI(userId: string, currentMessage: string): Promise<string> {
  const recentMessages = await getRecentMessages(userId, 6);
  
  if (recentMessages.length === 0) {
    return `User's current message: "${currentMessage}"`;
  }

  let contextString = "Recent conversation context:\n";
  
  recentMessages.forEach((msg) => {
    const roleLabel = msg.role === 'user' ? 'User' : 'Musk';
    contextString += `${roleLabel}: "${msg.message}"\n`;
  });

  contextString += `\nUser's current message: "${currentMessage}"`;
  
  return contextString;
}

/**
 * Clear conversation memory for a user (useful for testing or privacy)
 */
export async function clearConversationMemory(userId: string): Promise<void> {
  try {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return;
    }

    await db.delete(chatMessages).where(eq(chatMessages.userId, userIdNum));
    invalidateCache(userId);
    console.log(`[Conversation Memory] Cleared memory for user ${userId}`);
  } catch (error) {
    console.error(`[Conversation Memory] Failed to clear memory:`, error);
    throw error;
  }
}

/**
 * Get conversation statistics for monitoring
 */
export async function getConversationStats(): Promise<{
  totalUsers: number;
  totalMessages: number;
  averageMessagesPerUser: number;
}> {
  try {
    const allMessages = await db.select().from(chatMessages);
    const userSet = new Set(allMessages.map(m => m.userId));
    
    const totalUsers = userSet.size;
    const totalMessages = allMessages.length;

    return {
      totalUsers,
      totalMessages,
      averageMessagesPerUser: totalUsers > 0 ? Math.round(totalMessages / totalUsers) : 0
    };
  } catch (error) {
    console.error(`[Conversation Memory] Failed to get stats:`, error);
    return { totalUsers: 0, totalMessages: 0, averageMessagesPerUser: 0 };
  }
}

/**
 * Sync wrapper for addMessageToMemory
 * Fires and forgets, but logs errors for monitoring
 */
export function addMessageToMemorySync(
  userId: string, 
  role: 'user' | 'musk', 
  message: string,
  intent?: string
): void {
  addMessageToMemory(userId, role, message, intent).catch(err => {
    console.error('[Conversation Memory] Sync add failed (data may be lost):', err);
  });
}

/**
 * Sync version that returns cached memory or triggers background warm-up
 * On cache miss, returns null but starts loading from DB
 */
export function getConversationMemorySync(userId: string): ConversationMemory | null {
  const cached = getCachedMemory(userId);
  if (cached) {
    return cached;
  }
  
  triggerCacheWarmUp(userId);
  return null;
}

/**
 * Sync version that returns cached messages or triggers background warm-up
 * On cache miss, returns empty array but starts loading from DB
 */
export function getRecentMessagesSync(userId: string, count: number = 6): ConversationMessage[] {
  const cached = getCachedMemory(userId);
  if (cached && cached.messages.length > 0) {
    return cached.messages.slice(-count);
  }
  
  triggerCacheWarmUp(userId);
  return [];
}

/**
 * Sync version that returns cached last Musk response or triggers background warm-up
 */
export function getLastMuskResponseSync(userId: string): string | null {
  const cached = getCachedMemory(userId);
  if (cached && cached.messages.length > 0) {
    for (let i = cached.messages.length - 1; i >= 0; i--) {
      if (cached.messages[i].role === 'musk') {
        return cached.messages[i].message;
      }
    }
    return null;
  }
  
  triggerCacheWarmUp(userId);
  return null;
}

/**
 * Sync check for follow-up messages
 */
export function isFollowUpMessageSync(userId: string, message: string): boolean {
  const cached = getCachedMemory(userId);
  if (!cached || cached.messages.length < 2) {
    triggerCacheWarmUp(userId);
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

/**
 * Sync version of formatConversationForAI
 */
export function formatConversationForAISync(userId: string, currentMessage: string): string {
  const recentMessages = getRecentMessagesSync(userId, 6);
  
  if (recentMessages.length === 0) {
    return `User's current message: "${currentMessage}"`;
  }

  let contextString = "Recent conversation context:\n";
  
  recentMessages.forEach((msg) => {
    const roleLabel = msg.role === 'user' ? 'User' : 'Musk';
    contextString += `${roleLabel}: "${msg.message}"\n`;
  });

  contextString += `\nUser's current message: "${currentMessage}"`;
  
  return contextString;
}

/**
 * Pre-warm cache for a specific user (call on user login/session start)
 * This ensures conversation history is available immediately for sync helpers
 */
export async function warmUpUserCache(userId: string): Promise<void> {
  try {
    await getConversationMemory(userId);
    console.log(`[Conversation Memory] Cache pre-warmed for user ${userId}`);
  } catch (error) {
    console.error(`[Conversation Memory] Failed to pre-warm cache for user ${userId}:`, error);
  }
}
