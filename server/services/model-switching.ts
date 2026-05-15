/**
 * Model Switching Service
 * 
 * Implements intelligent model selection based on query complexity,
 * confidence scoring, and response quality assessment.
 * 
 * NOW USES FREE VPS OLLAMA FOR RETRY LOGIC!
 */

import { LocalAIService } from './local-ai-service';

// Import will be handled dynamically to avoid circular dependencies

export interface ModelSwitchingAnalysis {
  shouldSwitchModel: boolean;
  reason: string;
  complexity: 'low' | 'medium' | 'high';
  confidence: number;
  recommendedModel: 'local' | 'openai' | 'anthropic';
}

export interface ResponseQualityScore {
  coherence: number;
  relevance: number;
  completeness: number;
  overall: number;
  needsImprovement: boolean;
}

/**
 * Analyze if query requires switching from local model to stronger model
 */
export function analyzeModelSwitchingNeeds(
  message: string,
  conversationHistory: Array<{ message: string; response?: string }> = [],
  userProfile?: any
): ModelSwitchingAnalysis {
  const messageLength = message.trim().length;
  const wordCount = message.trim().split(/\s+/).length;
  
  // High complexity indicators
  const complexityIndicators = {
    vague: /^(yes|no|ok|sure|maybe|both|that|this|it)$/i.test(message.trim()),
    ambiguous: /\b(what about|how about|can i|should i)\b/i.test(message) && wordCount < 8,
    implicitReference: /\b(that|this|it|both|one|them|they)\b/i.test(message) && wordCount < 10,
    nuancedAdvice: /\b(strategy|approach|best way|complex|detailed|comprehensive)\b/i.test(message),
    multiStep: /\band\b.*\band\b/i.test(message) || message.includes(',') && wordCount > 15,
    emotionalContext: /\b(confused|overwhelmed|stressed|anxious|uncertain|frustrated)\b/i.test(message)
  };

  // Previous conversation context indicators
  const conversationComplexity = conversationHistory.length > 0 && 
    conversationHistory[conversationHistory.length - 1]?.message?.length < 20;

  let complexity: 'low' | 'medium' | 'high' = 'low';
  let shouldSwitch = false;
  let reason = 'Standard query suitable for local model';
  let confidence = 0.8;
  let recommendedModel: 'local' | 'openai' | 'anthropic' = 'local';

  // Calculate complexity score
  const complexityScore = Object.values(complexityIndicators).filter(Boolean).length;

  if (complexityScore >= 3 || complexityIndicators.nuancedAdvice) {
    complexity = 'high';
    shouldSwitch = true;
    reason = 'High complexity query requiring advanced reasoning';
    confidence = 0.3;
    recommendedModel = 'openai'; // Use OpenAI as primary enhanced model
  } else if (complexityScore >= 2 || conversationComplexity) {
    complexity = 'medium';
    shouldSwitch = messageLength < 30 && complexityIndicators.vague;
    reason = shouldSwitch ? 'Vague follow-up requiring context understanding' : 'Medium complexity manageable by local model';
    confidence = shouldSwitch ? 0.4 : 0.6;
    recommendedModel = shouldSwitch ? 'openai' : 'local';
  }

  // Special cases for career-specific complex queries
  if (/\b(career change|industry switch|salary negotiation|leadership transition)\b/i.test(message)) {
    complexity = 'high';
    shouldSwitch = true;
    reason = 'Complex career transition requiring expert guidance';
    recommendedModel = 'anthropic';
    confidence = 0.3;
  }

  return {
    shouldSwitchModel: shouldSwitch,
    reason,
    complexity,
    confidence,
    recommendedModel
  };
}

/**
 * Assess response quality to determine if model switching is needed
 */
export function assessResponseQuality(
  response: string,
  originalQuery: string,
  expectedLength: number = 200
): ResponseQualityScore {
  const responseLength = response.length;
  const queryWords = originalQuery.toLowerCase().split(/\s+/);
  
  // Coherence assessment
  const coherence = calculateCoherence(response);
  
  // Relevance assessment - check if response addresses query keywords
  const relevance = calculateRelevance(response, queryWords);
  
  // Completeness assessment
  const completeness = Math.min(responseLength / expectedLength, 1.0);
  
  const overall = (coherence + relevance + completeness) / 3;
  const needsImprovement = overall < 0.6;

  return {
    coherence,
    relevance,
    completeness,
    overall,
    needsImprovement
  };
}

/**
 * Calculate response coherence based on structure and clarity
 */
function calculateCoherence(response: string): number {
  let score = 0.5; // Base score
  
  // Check for structured elements
  if (response.includes('**') || response.includes('•') || response.includes('-')) {
    score += 0.15; // Well-formatted response
  }
  
  // Check for complete sentences
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length >= 2) {
    score += 0.15;
  }
  
  // Check for logical flow indicators
  const flowIndicators = /\b(first|second|then|next|finally|however|therefore|because)\b/gi;
  const flowMatches = response.match(flowIndicators);
  if (flowMatches && flowMatches.length >= 2) {
    score += 0.1;
  }
  
  // Penalize very short or repetitive responses
  if (response.length < 50) {
    score -= 0.3;
  }
  
  const uniqueWords = new Set(response.toLowerCase().split(/\s+/)).size;
  const totalWords = response.split(/\s+/).length;
  if (totalWords > 0 && uniqueWords / totalWords < 0.5) {
    score -= 0.2; // Too repetitive
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate relevance of response to original query
 */
function calculateRelevance(response: string, queryWords: string[]): number {
  const responseLower = response.toLowerCase();
  let relevantMatches = 0;
  
  // Check for direct keyword matches
  queryWords.forEach(word => {
    if (word.length > 3 && responseLower.includes(word)) {
      relevantMatches++;
    }
  });
  
  // Check for semantic relevance indicators
  const careerKeywords = ['career', 'job', 'role', 'skill', 'experience', 'resume', 'interview', 'networking'];
  const careerMatches = careerKeywords.filter(keyword => responseLower.includes(keyword)).length;
  
  const baseRelevance = queryWords.length > 0 ? relevantMatches / queryWords.length : 0;
  const semanticBonus = Math.min(careerMatches * 0.1, 0.3);
  
  return Math.min(1, baseRelevance + semanticBonus);
}

/**
 * Generate enhanced response using stronger model when needed
 */
export async function generateEnhancedResponse(
  message: string,
  context: any,
  modelChoice: 'openai' | 'anthropic' = 'anthropic'
): Promise<string> {
  try {
    if (modelChoice === 'anthropic') {
      return await generateWithAnthropic(message, context);
    } else {
      return await generateWithOpenAI(message, context);
    }
  } catch (error) {
    console.error(`[Model Switching] Error with ${modelChoice}:`, error);
    // Fallback to basic response
    return `I apologize, but I'm having difficulty processing your request right now. Could you please rephrase your question or provide more specific details about what you'd like help with regarding your career?`;
  }
}

/**
 * Generate response using Anthropic Claude
 */
async function generateWithAnthropic(message: string, context: any): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = buildEnhancedSystemPrompt(context);
  const userPrompt = buildEnhancedUserPrompt(message, context);

  console.log('[Model Switching] Using Anthropic Claude for enhanced response');

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022', // Latest Claude model
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I encountered an issue generating a response.';
}

/**
 * Generate response using FREE VPS Ollama (was OpenAI GPT-4)
 */
async function generateWithOpenAI(message: string, context: any): Promise<string> {
  // Initialize FREE Local AI Service (uses VPS Ollama)
  const localAI = LocalAIService.getInstance();

  const systemPrompt = buildEnhancedSystemPrompt(context);
  const userPrompt = buildEnhancedUserPrompt(message, context);

  console.log('[Model Switching] Using FREE VPS Ollama for enhanced response');

  // Combine system and user prompts for Ollama
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  const response = await localAI.generateCompletion(fullPrompt);

  return response || 'I apologize, but I encountered an issue generating a response.';
}

/**
 * Build enhanced system prompt for stronger models
 */
function buildEnhancedSystemPrompt(context: any): string {
  const userProfile = context.userProfile || {};
  const experienceLevel = determineExperienceLevel(context.userExperiences || []);
  
  return `You are Musk, the world's most sophisticated AI career coach and strategist. You possess deep expertise across all industries and career levels.

**Your Core Identity:**
- Expert career strategist with 20+ years of executive coaching experience
- Specializes in nuanced career transitions, leadership development, and strategic decision-making
- Known for providing actionable, personalized advice that drives real career growth

**User Context:**
- Name: ${userProfile.name || 'User'}
- Current Role: ${userProfile.title || 'Professional'}
- Industry: ${userProfile.industry || 'Various'}
- Experience Level: ${experienceLevel}
- Career Goal: ${userProfile.lookingFor || 'career advancement'}

**Response Guidelines:**
1. **Always prioritize Brandentify features first** when making platform recommendations
2. Provide specific, actionable advice tailored to their exact situation
3. Use industry-specific insights and current market trends
4. Address both immediate tactics and long-term strategy
5. Ask clarifying questions when context is needed
6. Be direct but supportive - avoid generic advice
7. Reference their specific background when relevant

**Tone:** Professional, insightful, confidence-building, strategic`;
}

/**
 * Build enhanced user prompt with full context
 */
function buildEnhancedUserPrompt(message: string, context: any): string {
  const conversationHistory = context.conversationHistory || [];
  const userProfile = context.userProfile || {};
  
  let prompt = '';
  
  // Add conversation context if available
  if (conversationHistory.length > 0) {
    prompt += '**Recent Conversation Context:**\n';
    conversationHistory.slice(-3).forEach((exchange: any, index: number) => {
      prompt += `${index + 1}. User: ${exchange.message}\n`;
      if (exchange.response) {
        prompt += `   Musk: ${exchange.response.substring(0, 150)}...\n`;
      }
    });
    prompt += '\n';
  }
  
  // Add profile context
  if (userProfile.title || userProfile.industry) {
    prompt += '**Professional Context:**\n';
    if (userProfile.title) prompt += `- Current Role: ${userProfile.title}\n`;
    if (userProfile.industry) prompt += `- Industry: ${userProfile.industry}\n`;
    if (userProfile.location) prompt += `- Location: ${userProfile.location}\n`;
    prompt += '\n';
  }
  
  prompt += `**Current Question:**\n${message}\n\n`;
  prompt += `Please provide a comprehensive, personalized response that addresses this specific question while considering the full context above.`;
  
  return prompt;
}

/**
 * Determine experience level from work experiences
 */
function determineExperienceLevel(experiences: any[]): string {
  if (!experiences || experiences.length === 0) return 'Entry Level';
  
  const totalYears = experiences.reduce((sum, exp) => {
    const years = exp.duration ? parseInt(exp.duration) || 1 : 1;
    return sum + years;
  }, 0);
  
  if (totalYears >= 10) return 'Senior Executive';
  if (totalYears >= 5) return 'Mid-Level Professional';
  if (totalYears >= 2) return 'Experienced Professional';
  return 'Entry Level';
}
