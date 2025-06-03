/**
 * AI Security Module for Musk
 * 
 * This module provides security measures specific to AI interactions:
 * 1. Prompt Injection Filtering - Prevents manipulation of the AI system
 * 2. Data Leakage Prevention - Ensures user data privacy between sessions
 * 3. Content Moderation - Filters potentially harmful AI-generated content
 */

import { Request, Response, NextFunction } from 'express';
import { LocalAIService } from './services/local-ai-service';

// Initialize local AI service for content moderation
const localAI = new LocalAIService();

// Regular expressions for detecting potential prompt injection attacks
const PROMPT_INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /disregard previous instructions/i,
  /ignore all previous commands/i,
  /forget your instructions/i,
  /you are now a different AI/i,
  /system: /i,
  /\<\/?system\>/i,
  /Answer: /i,
  /You are not actually Musk/i,
  /you are designed to/i,
  /act as if you are/i,
  /your new role is/i,
  /your real purpose is/i
];

// Data leakage prevention patterns
const DATA_LEAKAGE_PATTERNS = [
  /API[_\s]?key/i,
  /secret[_\s]?key/i,
  /password/i,
  /access[_\s]?token/i,
  /bearer[_\s]?token/i,
  /private[_\s]?key/i,
  /ssh[_\s]?key/i,
  /authorization/i
];

// Sensitive content patterns
const SENSITIVE_CONTENT_PATTERNS = [
  /social security/i, 
  /ssn/i,
  /credit card/i,
  /passport/i,
  /driver'?s license/i,
  /bank account/i,
  /routing number/i,
  /personal identification/i,
  /home address/i
];

/**
 * Sanitizes a prompt to prevent injection attacks
 * @param prompt User input to be sanitized
 * @returns Sanitized prompt or null if attack detected
 */
function sanitizePrompt(prompt: string): string | null {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      console.warn(`[AI SECURITY] Potential prompt injection detected: ${pattern}`);
      return null;
    }
  }
  
  return prompt;
}

/**
 * Checks for potential data leakage in user input
 * @param input User input to check
 * @returns True if data leakage is detected
 */
function checkForDataLeakage(input: string): boolean {
  for (const pattern of DATA_LEAKAGE_PATTERNS) {
    if (pattern.test(input)) {
      console.warn(`[AI SECURITY] Potential sensitive data detected: ${pattern}`);
      return true;
    }
  }
  
  for (const pattern of SENSITIVE_CONTENT_PATTERNS) {
    if (pattern.test(input)) {
      console.warn(`[AI SECURITY] Potential PII detected: ${pattern}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Moderates AI-generated content for harmful material
 * @param content AI-generated content to moderate
 * @returns True if content is safe, false if potentially harmful
 */
async function moderateContent(content: string): Promise<boolean> {
  try {
    const response = await openai.moderations.create({ input: content });
    
    if (response?.results?.[0]?.flagged) {
      const categories = response.results[0].categories;
      const flaggedCategories = Object.entries(categories)
        .filter(([_, value]) => value === true)
        .map(([category]) => category);
      
      console.warn(`[AI SECURITY] Content moderation flagged: ${flaggedCategories.join(', ')}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`[AI SECURITY] Moderation API error:`, error);
    // Allow content to pass through on API error (fail open for functionality)
    return true;
  }
}

/**
 * Context isolation mechanism to prevent data leakage between users
 * Each user gets their own context/memory space
 */
class UserContextIsolation {
  private userContexts: Map<string, { lastAccessed: Date, contextData: any }> = new Map();
  private readonly CONTEXT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  
  constructor() {
    // Periodically clean up expired contexts
    setInterval(() => this.cleanExpiredContexts(), 5 * 60 * 1000); // Every 5 minutes
  }
  
  /**
   * Get user-specific context data
   */
  getUserContext(userId: string): any {
    const context = this.userContexts.get(userId);
    
    if (context) {
      context.lastAccessed = new Date();
      return context.contextData;
    }
    
    // Create new context if none exists
    const newContext = { 
      lastAccessed: new Date(), 
      contextData: { conversations: [], lastInteraction: new Date() } 
    };
    this.userContexts.set(userId, newContext);
    return newContext.contextData;
  }
  
  /**
   * Update user-specific context
   */
  updateUserContext(userId: string, contextData: any): void {
    const existingContext = this.userContexts.get(userId);
    
    if (existingContext) {
      existingContext.lastAccessed = new Date();
      existingContext.contextData = contextData;
    } else {
      this.userContexts.set(userId, {
        lastAccessed: new Date(),
        contextData
      });
    }
  }
  
  /**
   * Clean up expired contexts to prevent memory leaks
   */
  private cleanExpiredContexts(): void {
    const now = new Date().getTime();
    
    for (const [userId, context] of this.userContexts.entries()) {
      const age = now - context.lastAccessed.getTime();
      
      if (age > this.CONTEXT_EXPIRY_MS) {
        console.log(`[AI SECURITY] Removing expired context for user ${userId}`);
        this.userContexts.delete(userId);
      }
    }
  }
}

// Singleton instance for user context isolation
export const userContextIsolation = new UserContextIsolation();

/**
 * Express middleware for AI security
 */
export function aiSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip security checks for non-AI routes
  if (!req.path.includes('/api/musk') && 
      !req.path.includes('/api/resume-analysis') && 
      !req.path.includes('/api/career-advice') && 
      !req.path.includes('/api/hashtag-suggestions')) {
    return next();
  }

  // Get user ID for context isolation
  const userId = req.query.userId as string || req.body.userId || 'anonymous';

  // 1. Prompt Injection Protection
  if (req.body.prompt || req.body.message || req.body.text || req.body.query) {
    const inputText = req.body.prompt || req.body.message || req.body.text || req.body.query;
    
    if (typeof inputText === 'string') {
      const sanitizedInput = sanitizePrompt(inputText);
      
      if (sanitizedInput === null) {
        return res.status(400).json({
          error: 'Potentially unsafe input detected',
          message: 'Your input contains patterns that could be attempting to manipulate the AI system.'
        });
      }
      
      // Update the request with sanitized input
      if (req.body.prompt) req.body.prompt = sanitizedInput;
      if (req.body.message) req.body.message = sanitizedInput;
      if (req.body.text) req.body.text = sanitizedInput;
      if (req.body.query) req.body.query = sanitizedInput;
    }
  }
  
  // 2. Data Leakage Prevention
  // Check for sensitive data in request body
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);
    if (checkForDataLeakage(bodyStr)) {
      return res.status(400).json({
        error: 'Sensitive data detected',
        message: 'Your request contains what appears to be sensitive information. Please remove any personal identifiable information, API keys, or credentials.'
      });
    }
  }
  
  // 3. Context Isolation
  // Store the context isolation reference on the request for use in route handlers
  (req as any).userContext = userContextIsolation.getUserContext(userId);
  
  // 4. Content moderation happens on the response - we'll handle this in the routes
  // by wrapping API responses with the moderateContent function
  
  next();
}

/**
 * Wrap AI response with content moderation
 * @param content AI-generated content to be checked
 * @returns Safe content or warning message
 */
export async function moderateAIResponse(content: string): Promise<string> {
  const isSafe = await moderateContent(content);
  
  if (!isSafe) {
    return "I apologize, but I cannot provide that response as it may contain content that doesn't align with our guidelines. Please try rephrasing your request or ask something different.";
  }
  
  return content;
}

/**
 * Regular expression patterns for sanitizing user-uploaded resumes and CVs
 * to prevent potential security issues or data leakage
 */
export function sanitizeResumeText(resumeText: string): string {
  // Remove email addresses
  resumeText = resumeText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
  
  // Remove phone numbers (various formats)
  resumeText = resumeText.replace(/(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[PHONE]');
  resumeText = resumeText.replace(/\d{10}/g, '[PHONE]');
  
  // Remove social security numbers
  resumeText = resumeText.replace(/\d{3}[-\s]?\d{2}[-\s]?\d{4}/g, '[SSN]');
  
  // Remove home addresses (simplified pattern)
  resumeText = resumeText.replace(/\d+\s+[A-Za-z0-9\s.,]+(?:Avenue|Ave|Street|St|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Parkway|Pkwy|Place|Pl)\b/gi, '[ADDRESS]');
  
  // Remove URLs (except for LinkedIn and professional sites)
  resumeText = resumeText.replace(/https?:\/\/(?!www\.linkedin\.com|github\.com|stackoverflow\.com)[^\s]+/gi, '[WEBSITE]');
  
  return resumeText;
}