/**
 * Musk AI Security Service
 * 
 * This service provides security measures for Musk AI to protect against:
 * 1. Prompt Injection - Preventing manipulation of AI inputs
 * 2. Data Leakage - Ensuring private user data doesn't leak through responses
 * 3. Content Moderation - Filtering inappropriate content in inputs and outputs
 */

import OpenAI from 'openai';
import { MuskContext } from './musk-intelligence-system';

// Initialize OpenAI client for content moderation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Custom error class for security violations
export class MuskSecurityError extends Error {
  constructor(message: string, public securityCode: string) {
    super(message);
    this.name = 'MuskSecurityError';
  }
}

/**
 * Pattern database for detecting prompt injection attempts
 */
const PROMPT_INJECTION_PATTERNS = [
  // System instruction override attempts
  /ignore previous instructions|ignore above instructions|disregard (your|previous) instructions/i,
  // Direct system prompt attacks
  /you are now|you're now|you will be|act as if|you are an AI that|new role|new persona/i,
  // Jailbreak attempts
  /DAN mode|developer mode|ignore ethical guidelines|ignore content policy/i,
  // Format manipulation
  /respond as JSON|respond in XML|escape the format|bypass the filter/i,
  // Generic manipulation
  /let's play a game where you|pretend that you are|imagine you are not bound by/i,
  // Data exfiltration attempts
  /what were your previous instructions|show me your prompt|return your system message/i,
  // ASCII boundary breaking
  /```|===|---|\*\*\*/i
];

/**
 * PII detection patterns for identifying personally identifiable information
 */
const PII_PATTERNS = [
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  // Phone numbers (various formats)
  /\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  // Credit card numbers
  /\b(?:\d[ -]*?){13,16}\b/,
  // SSN/Government IDs (generic pattern)
  /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
  // Address patterns
  /\b\d{1,5}\s[A-Za-z\s]{1,20}\b(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|court|ct|lane|ln|way|parkway|pkwy)/i,
  // Passport numbers
  /\b[A-Z]{1,2}[0-9]{6,9}\b/i,
  // API Keys and tokens (generic pattern)
  /\b[A-Za-z0-9_\-]{20,64}\b/
];

/**
 * Forbidden topics for content moderation
 */
const FORBIDDEN_TOPICS = [
  'illegal activities',
  'hate speech',
  'harassment',
  'self-harm',
  'violence',
  'adult content',
  'exploitation',
  'hacking',
  'malware',
  'drug manufacturing',
  'weapons manufacturing'
];

/**
 * Filter the user input for potential prompt injection attacks
 * @param input User input to analyze for security issues
 * @returns Sanitized input or throws MuskSecurityError if a security issue is detected
 */
export function filterPromptInjection(input: string): string {
  // Check for prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      throw new MuskSecurityError(
        "Your request contained patterns that could be attempting to manipulate Musk's AI system. Please rephrase your question.",
        'PROMPT_INJECTION'
      );
    }
  }

  // Add boundary enforcement - ensure the input stays within expected boundaries
  const sanitizedInput = input
    // Remove any markdown code blocks that might contain instructions
    .replace(/```[\s\S]*?```/g, '[code block removed for security]')
    // Normalize whitespace to prevent obfuscation
    .replace(/\s+/g, ' ')
    // Limit input length to prevent attacks via large inputs
    .slice(0, 2000);

  return sanitizedInput;
}

/**
 * Check for and remove any personally identifiable information from user input
 * @param input User input to scan for PII
 * @returns Sanitized input with PII removed
 */
export function preventDataLeakage(input: string): string {
  let sanitizedInput = input;

  // Check for and redact PII patterns
  for (const pattern of PII_PATTERNS) {
    sanitizedInput = sanitizedInput.replace(pattern, '[REDACTED]');
  }

  return sanitizedInput;
}

/**
 * Verify user context doesn't contain cross-user information
 * @param context The Musk context to check for isolation issues
 * @param userId The current user's ID
 * @returns Sanitized context with only the current user's data
 */
export function enforceUserIsolation(context: MuskContext, userId: string | number): MuskContext {
  // Clone the context to avoid modifying the original
  const sanitizedContext: MuskContext = { ...context };

  // Ensure context only contains information about the current user
  if (sanitizedContext.userId && sanitizedContext.userId.toString() !== userId.toString()) {
    // Log potential security issue
    console.warn(`Data isolation issue: Context contains userId ${sanitizedContext.userId} but request is for ${userId}`);
    // Reset to only include the current user's ID
    sanitizedContext.userId = userId;
  }

  // Clear any user memory that might contain other users' data
  if (sanitizedContext.userMemory) {
    // Only keep the most recent 5 interactions to limit context
    const limitedInteractions = sanitizedContext.userMemory.interactions || [];
    sanitizedContext.userMemory.interactions = limitedInteractions.slice(-5);
  }

  return sanitizedContext;
}

/**
 * Use OpenAI's moderation API to check for inappropriate content
 * @param content Text to moderate
 * @returns True if content is safe, throws MuskSecurityError if not
 */
export async function moderateContent(content: string): Promise<boolean> {
  try {
    // Check for empty or very short inputs to avoid unnecessary API calls
    if (!content || content.length < 3) {
      return true;
    }

    // First, check against our basic blocklist
    for (const topic of FORBIDDEN_TOPICS) {
      if (content.toLowerCase().includes(topic)) {
        throw new MuskSecurityError(
          "I'm not able to respond to this type of request. Let's focus on career advice instead.",
          'CONTENT_VIOLATION'
        );
      }
    }

    // Then use OpenAI's moderation API for comprehensive checking
    const moderation = await openai.moderations.create({ input: content });
    
    if (moderation.results[0].flagged) {
      // Get the specific categories that were flagged
      const categories = moderation.results[0].categories;
      const flaggedCategories = Object.entries(categories)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      
      // Log the moderation result for monitoring
      console.warn(`Content moderation triggered: ${flaggedCategories.join(', ')}`);
      
      throw new MuskSecurityError(
        "I'm not able to respond to this type of request. Let's focus on career advice instead.",
        'CONTENT_VIOLATION'
      );
    }
    
    return true;
  } catch (error) {
    // If the OpenAI API call fails, log it but allow the content through
    // to avoid disrupting service (with basic checks still in place)
    if (!(error instanceof MuskSecurityError)) {
      console.error('Moderation API error:', error);
      return true;
    }
    throw error;
  }
}

/**
 * Check AI response for potential data leakage or policy violations
 * @param response The AI-generated response to check
 * @returns Sanitized response or throws MuskSecurityError if issues detected
 */
export function sanitizeAIResponse(response: string): string {
  // Check for potential data leakage in responses
  let sanitizedResponse = response;
  
  // Redact any PII that might have been included in the response
  for (const pattern of PII_PATTERNS) {
    sanitizedResponse = sanitizedResponse.replace(pattern, '[REDACTED]');
  }
  
  // Detect and remove any system prompt leakage
  const systemPromptLeakagePatterns = [
    /as an AI assistant developed by|as an AI language model|as a language model/i,
    /my instructions are to|I was programmed to|I was trained to|I was designed to/i,
    /my programming doesn't allow|I cannot comply with|I'm unable to fulfill/i
  ];
  
  for (const pattern of systemPromptLeakagePatterns) {
    sanitizedResponse = sanitizedResponse.replace(pattern, "As Musk, I");
  }
  
  return sanitizedResponse;
}

/**
 * Main security handler for Musk AI that applies all security measures
 * @param input User input message
 * @param context User context data
 * @param userId Current user ID
 * @returns Sanitized input and context, or throws MuskSecurityError if security issues detected
 */
export async function secureMuskInteraction(
  input: string,
  context: MuskContext,
  userId: string | number
): Promise<{ sanitizedInput: string; sanitizedContext: MuskContext }> {
  try {
    // Step 1: Filter for prompt injection
    const injectionFilteredInput = filterPromptInjection(input);
    
    // Step 2: Prevent data leakage
    const leakageFilteredInput = preventDataLeakage(injectionFilteredInput);
    
    // Step 3: Moderate content
    await moderateContent(leakageFilteredInput);
    
    // Step 4: Enforce user isolation in context
    const sanitizedContext = enforceUserIsolation(context, userId);
    
    return {
      sanitizedInput: leakageFilteredInput,
      sanitizedContext
    };
  } catch (error) {
    if (error instanceof MuskSecurityError) {
      throw error;
    }
    // For other errors, throw a generic security error
    console.error('Unexpected security error:', error);
    throw new MuskSecurityError(
      "I'm experiencing a security check issue. Please try again with a different question.",
      'SECURITY_ERROR'
    );
  }
}

/**
 * Process and secure AI response before sending to user
 * @param response The raw AI-generated response
 * @returns Sanitized response safe for user consumption
 */
export function secureAIResponse(response: string): string {
  return sanitizeAIResponse(response);
}

// Rate limiting implementation
interface RateLimitRecord {
  count: number;
  lastRequestTime: number;
  blockedUntil?: number;
}

// In-memory store for rate limiting 
// In production, this would be in Redis or a database
const rateLimitStore: Record<string, RateLimitRecord> = {};

/**
 * Apply rate limiting to protect AI endpoints from abuse
 * @param userId User identifier for tracking request rates
 * @param endpoint Name of the endpoint being accessed
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowMs Time window in milliseconds (default 60000ms = 1min)
 * @param blockDurationMs Duration to block if limit exceeded (default 300000ms = 5min)
 * @returns Boolean indicating if the request is allowed
 * @throws MuskSecurityError if rate limit is exceeded
 */
export function checkRateLimit(
  userId: string | number,
  endpoint: string,
  maxRequests: number = 20,
  windowMs: number = 60000,
  blockDurationMs: number = 300000
): boolean {
  // Temporarily disabled for development
  // Skipping all rate limit checks
  return true;
  
  /*
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  
  // Initialize or get the rate limit record
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 0,
      lastRequestTime: now
    };
  }
  
  const record = rateLimitStore[key];
  
  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const remainingBlockTime = Math.ceil((record.blockedUntil - now) / 1000);
    throw new MuskSecurityError(
      `Rate limit exceeded. Please try again in ${remainingBlockTime} seconds.`,
      'RATE_LIMIT_EXCEEDED'
    );
  }
  
  // Reset counter if outside window
  if (now - record.lastRequestTime > windowMs) {
    record.count = 0;
    record.lastRequestTime = now;
    delete record.blockedUntil;
  }
  
  // Increment counter
  record.count++;
  
  // Check if rate limit exceeded
  if (record.count > maxRequests) {
    // Block user for block duration
    record.blockedUntil = now + blockDurationMs;
    throw new MuskSecurityError(
      `Rate limit of ${maxRequests} requests per ${windowMs/1000} seconds exceeded. Please try again later.`,
      'RATE_LIMIT_EXCEEDED'
    );
  }
  
  return true;
  */
}