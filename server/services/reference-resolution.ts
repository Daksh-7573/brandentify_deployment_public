/**
 * Reference Resolution Service
 * 
 * This service handles follow-up questions that contain vague references
 * like "that", "this", "it", "both" by providing context from previous
 * conversation exchanges.
 * 
 * NOW USES FREE VPS OLLAMA!
 */

import { getLastMuskResponseSync, getRecentMessagesSync } from './conversation-memory';
import { LocalAIService } from './local-ai-service';

/**
 * Detect if a message contains vague references that need resolution
 */
export function hasVagueReferences(message: string): boolean {
  const vagueTerms = [
    'that', 'this', 'it', 'both', 'them', 'those', 'these',
    'again', 'also', 'too', 'as well', 'like you said',
    'what about', 'how about', 'and what', 'but what',
    'the approach', 'the method', 'the strategy', 'the plan'
  ];

  const lowerMessage = message.toLowerCase().trim();
  
  return vagueTerms.some(term => {
    // Check for whole word matches to avoid false positives
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerMessage);
  });
}

/**
 * Check if message is too short and likely requires clarification
 */
export function isAmbiguouslyShort(message: string): boolean {
  const wordCount = message.trim().split(/\s+/).length;
  
  // Messages under 5 words that aren't complete questions or statements
  if (wordCount >= 5) return false;
  
  // Allow common short but complete responses
  const completeShortPhrases = [
    'yes', 'no', 'thanks', 'thank you', 'ok', 'okay', 'sure',
    'got it', 'makes sense', 'i see', 'understood', 'exactly'
  ];
  
  const lowerMessage = message.toLowerCase().trim();
  if (completeShortPhrases.includes(lowerMessage)) {
    return false;
  }
  
  // Check if it's a complete question
  if (message.trim().endsWith('?') && wordCount >= 3) {
    return false;
  }
  
  return true;
}

/**
 * Rewrite a follow-up message by adding context from previous conversation
 */
export function rewriteFollowUp(userId: string, userInput: string): string {
  const lastMuskResponse = getLastMuskResponseSync(userId);
  
  if (!lastMuskResponse) {
    return userInput; // No previous context available
  }

  if (hasVagueReferences(userInput)) {
    // Add context to clarify vague references
    return `The user's follow-up "${userInput}" refers to your previous response: "${lastMuskResponse}". Please answer accordingly, understanding what they're referring to.`;
  }

  if (isAmbiguouslyShort(userInput)) {
    // Provide context for short, potentially ambiguous messages
    return `The user sent a short message: "${userInput}". Given your previous response was: "${lastMuskResponse}", please interpret their message in context and respond appropriately.`;
  }

  return userInput;
}

/**
 * Enhanced reference resolution using OpenAI for complex cases
 */
export async function enhancedReferenceResolution(
  userId: string, 
  userInput: string
): Promise<string> {
  try {
    const recentMessages = getRecentMessagesSync(userId, 4);
    
    if (recentMessages.length === 0) {
      return userInput; // No context available
    }

    // Only use enhanced resolution for vague or ambiguous messages
    if (!hasVagueReferences(userInput) && !isAmbiguouslyShort(userInput)) {
      return userInput;
    }

    // Initialize FREE Local AI Service (uses VPS Ollama)
    const localAI = new LocalAIService();

    // Build context from recent messages
    let conversationContext = "Recent conversation:\n";
    recentMessages.forEach(msg => {
      conversationContext += `${msg.role}: "${msg.message}"\n`;
    });

    const resolutionPrompt = `You are a reference resolution assistant. Rewrite ambiguous messages to be clear and specific based on conversation context.

You are helping resolve ambiguous references in a follow-up message. Given the recent conversation context, rewrite the user's latest message to be clear and specific.

${conversationContext}

User's new message: "${userInput}"

Task: If the user's message contains vague references like "that", "this", "it", "both", etc., rewrite it to be specific based on the conversation context. If the message is already clear, return it unchanged.

Return only the rewritten message, nothing else.
`;

    // Call FREE VPS Ollama instead of expensive OpenAI
    const response = await localAI.generateCompletion(resolutionPrompt);

    const rewrittenMessage = response.trim();
    
    if (rewrittenMessage && rewrittenMessage !== userInput) {
      console.log(`[Reference Resolution] Enhanced resolution: "${userInput}" → "${rewrittenMessage}"`);
      return rewrittenMessage;
    }

    return userInput;

  } catch (error) {
    console.error('[Reference Resolution] Error in enhanced resolution:', error);
    return rewriteFollowUp(userId, userInput);
  }
}

/**
 * Generate clarification request for ambiguous input
 */
export function generateClarificationRequest(userId: string, userInput: string): string {
  const lastMuskResponse = getLastMuskResponseSync(userId);
  
  // Detect what specifically needs clarification
  const lowerInput = userInput.toLowerCase().trim();
  
  if (lowerInput.includes('both')) {
    return "Just to clarify — when you said 'both', which two options are you referring to? I want to make sure I give you the most relevant advice.";
  }
  
  if (lowerInput.includes('that') || lowerInput.includes('this')) {
    return "I want to make sure I understand correctly — what specifically are you referring to when you say 'that'? Could you be a bit more specific so I can give you the best guidance?";
  }
  
  if (lowerInput.includes('it')) {
    return "To give you the most helpful response — what specifically are you referring to when you say 'it'?";
  }
  
  if (isAmbiguouslyShort(userInput)) {
    return `I'd love to help, but could you provide a bit more detail about "${userInput}"? The more specific you are, the better career guidance I can provide.`;
  }
  
  // Generic clarification for other vague references
  return "Could you provide a bit more context or detail? I want to make sure I give you the most relevant and helpful career advice.";
}

/**
 * Determine if a clarification request should be sent instead of processing normally
 */
export function shouldRequestClarification(userId: string, userInput: string): boolean {
  // Don't request clarification if there's no conversation history
  const lastResponse = getLastMuskResponseSync(userId);
  if (!lastResponse) {
    return false;
  }
  
  // Check for highly ambiguous messages that need clarification
  const wordCount = userInput.trim().split(/\s+/).length;
  
  // Very short messages with vague references
  if (wordCount <= 3 && hasVagueReferences(userInput)) {
    return true;
  }
  
  // Single word responses that aren't clear
  if (wordCount === 1) {
    const singleWord = userInput.toLowerCase().trim();
    const clearSingleWords = ['yes', 'no', 'thanks', 'ok', 'sure'];
    return !clearSingleWords.includes(singleWord);
  }
  
  return false;
}