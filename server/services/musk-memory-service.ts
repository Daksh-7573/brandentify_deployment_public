/**
 * Musk Memory Service
 * 
 * This service manages Musk's conversational memory and emotional intelligence capabilities
 * based on the Brandentifier AI Career Assistant design.
 */

import { db } from '../db';
import { eq } from 'drizzle-orm';
import { chatMessages } from '@shared/schema';

// Define IUserProfile interface here since we're using it in the service
export interface IUserProfile {
  name?: string;
  title?: string;
  industry?: string;
  domain?: string;
  location?: string;
  lookingFor?: string;
  skills?: string[];
  [key: string]: any; // Allow other properties
}

// Types for conversation memory
export interface ConversationMemory {
  userId: number;
  pastConversations: ConversationSession[];
  emotionalContext: EmotionalContext;
  profileChanges: ProfileChange[];
}

export interface ConversationSession {
  sessionId: string;
  timestamp: Date;
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotionalTone?: EmotionalTone;
}

export interface EmotionalContext {
  currentTone?: EmotionalTone;
  emotionalState?: EmotionalState;
  confidenceLevel?: number;
}

export interface ProfileChange {
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  timestamp: Date;
}

// Emotional intelligence types
export type EmotionalTone = 
  | 'neutral' 
  | 'excited' 
  | 'curious'
  | 'frustrated'
  | 'discouraged'
  | 'confused'
  | 'ambitious'
  | 'burnout'
  | 'directionless';

export type EmotionalState = 
  | 'positive' 
  | 'negative' 
  | 'neutral';

export type ChatIntent = 
  | 'advice' 
  | 'exploration' 
  | 'frustration' 
  | 'directionless' 
  | 'enthusiasm';

// Emotional cues mapping
const emotionalCues: Record<string, EmotionalTone> = {
  'stuck': 'confused',
  'dont know what to do': 'directionless',
  'hate my job': 'burnout',
  'tired of': 'burnout',
  'no one': 'discouraged',
  'not getting': 'discouraged',
  'excited': 'excited',
  'love': 'excited',
  'curious': 'curious',
  'interested': 'curious',
};

/**
 * Detects emotional tone from user message
 * @param message User message text
 * @returns Detected emotional tone and confidence
 */
export function detectEmotionalTone(message: string): { tone: EmotionalTone, confidence: number } {
  const lowercaseMessage = message.toLowerCase();
  
  // Default to neutral if no emotions detected
  let detectedTone: EmotionalTone = 'neutral';
  let highestConfidence = 0.4; // Baseline confidence for neutral
  
  // Check for emotional cues in the message
  for (const [cue, tone] of Object.entries(emotionalCues)) {
    if (lowercaseMessage.includes(cue)) {
      // Simple matching logic - could be replaced with ML model
      const confidence = 0.7 + (Math.random() * 0.2); // Simulated confidence score
      
      if (confidence > highestConfidence) {
        detectedTone = tone;
        highestConfidence = confidence;
      }
    }
  }
  
  return { tone: detectedTone, confidence: highestConfidence };
}

/**
 * Gets the appropriate response template based on emotional tone
 * @param tone Detected emotional tone
 * @returns Template for response
 */
export function getEmotionalResponseTemplate(tone: EmotionalTone): string {
  const templates: Record<EmotionalTone, string> = {
    'neutral': 'Based on your career goals, I can suggest the following steps:',
    'excited': 'I love that energy! Here\'s how you can ride that momentum into your next big career leap:',
    'curious': 'That\'s a great area to explore! Let me help you discover more about:',
    'frustrated': 'I understand this can be challenging. Let\'s take a step back and look at some alternatives:',
    'discouraged': 'Many professionals face similar roadblocks. Here are some proven ways to overcome this:',
    'confused': 'Let\'s clarify things step by step so you can move forward with confidence:',
    'ambitious': 'With your drive, you\'re well-positioned to achieve these goals. Here\'s how to get there:',
    'burnout': 'You\'re not alone in feeling this way. Let\'s figure out a healthy and fulfilling next step together:',
    'directionless': 'It\'s normal to feel uncertain about your path. Let\'s explore some possible directions for you:'
  };
  
  return templates[tone] || templates.neutral;
}

/**
 * Creates prompt with conversational memory context
 * @param userId User ID for retrieving conversation history
 * @param currentMessage Current user message
 * @param userProfile User profile information
 * @returns Complete prompt with memory context
 */
export async function createPromptWithMemory(
  userId: number, 
  currentMessage: string,
  userProfile: IUserProfile
): Promise<string> {
  // Get recent conversation history (last 5 messages)
  const recentMessages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(chatMessages.timestamp)
    .limit(5);
  
  // Detect emotional tone
  const { tone, confidence } = detectEmotionalTone(currentMessage);
  
  // Create memory context string
  let memoryContext = '';
  
  if (recentMessages && recentMessages.length > 0) {
    memoryContext += '--- Recent Conversation Context ---\n';
    recentMessages.forEach((msg) => {
      memoryContext += `${msg.sender === 'user' ? 'User' : 'Musk'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
    });
    memoryContext += '\n';
  }
  
  // Add emotional context
  memoryContext += `--- Emotional Context ---\n`;
  memoryContext += `Detected tone: ${tone} (confidence: ${Math.round(confidence * 100)}%)\n`;
  memoryContext += `Suggested response style: ${getEmotionalResponseTemplate(tone)}\n\n`;
  
  // Add profile context
  memoryContext += '--- User Profile Context ---\n';
  memoryContext += `Name: ${userProfile.name || 'Unknown'}\n`;
  memoryContext += `Industry: ${userProfile.industry || 'Unknown'}\n`;
  memoryContext += `Role: ${userProfile.title || 'Unknown'}\n`;
  memoryContext += `Looking for: ${userProfile.lookingFor || 'Career opportunities'}\n\n`;
  
  // Final prompt construction
  const finalPrompt = `
${memoryContext}
--- User's Current Message ---
${currentMessage}

Respond to the user as Musk, the AI Career Assistant, with the detected emotional tone in mind.
Keep your response helpful, specific, and personalized to their career situation.
`;

  return finalPrompt;
}

/**
 * Stores a message in the conversation history
 * @param userId User ID
 * @param content Message content
 * @param role Message sender role (user or ai)
 * @param messageType Type of message
 */
export async function storeMessageInMemory(
  userId: number,
  content: string,
  role: 'user' | 'ai',
  messageType: string = 'chat'
): Promise<void> {
  try {
    // Detect emotional tone for user messages
    const emotionalData = role === 'user' 
      ? detectEmotionalTone(content)
      : { tone: 'neutral', confidence: 0.5 };
    
    // Store message in database
    await db.insert(chatMessages).values({
      userId,
      sender: role,
      content,
      messageType,
      metadata: JSON.stringify({ 
        emotionalTone: emotionalData.tone,
        confidence: emotionalData.confidence 
      })
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error storing message in memory:', errorMessage);
    // Continue execution even if storage fails
  }
}

/**
 * Detects profile changes between old and new profile
 * @param oldProfile Previous user profile
 * @param newProfile Current user profile
 * @returns List of detected changes
 */
export function detectProfileChanges(
  oldProfile: IUserProfile,
  newProfile: IUserProfile
): ProfileChange[] {
  const changes: ProfileChange[] = [];
  const now = new Date();
  
  // Compare basic profile fields
  const compareFields: (keyof IUserProfile)[] = [
    'name', 'title', 'industry', 'domain', 'location', 'lookingFor'
  ];
  
  for (const field of compareFields) {
    if (oldProfile[field] !== newProfile[field] && 
        oldProfile[field] !== undefined && 
        newProfile[field] !== undefined) {
      changes.push({
        fieldChanged: field,
        oldValue: String(oldProfile[field] || ''),
        newValue: String(newProfile[field] || ''),
        timestamp: now
      });
    }
  }
  
  // Additional logic for comparing complex fields like skills, experiences, etc.
  // could be added here
  
  return changes;
}