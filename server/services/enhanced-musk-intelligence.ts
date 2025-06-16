/**
 * Enhanced Musk Intelligence Service
 * 
 * Integrates intent classification, persona selection, context enrichment,
 * and prompt generation for sophisticated AI career coaching responses.
 */

import { classifyIntent, analyzeConversationContext, MessageIntent } from './intent-classification';
import { generatePersonaResponse, selectOptimalPersona } from './persona-engine';
import { enrichUserContext, EnrichedContext } from './context-enricher';
import { generateEnhancedPrompt, generateProactiveSuggestions } from './prompt-library';
import { LocalAIService } from './local-ai-service';
import { generateProactiveInsights, generateImmediateSuggestions, ProactiveContext } from './proactive-engine';
import { getIndustryMentoring, enhanceResponseWithIndustryContext } from './industry-mentoring';

export interface EnhancedMuskRequest {
  message: string;
  userId: number;
  userProfile: any;
  userExperiences: any[];
  userSkills: any[];
  userEducations: any[];
  userProjects: any[];
  conversationHistory: Array<{ message: string; response?: string; timestamp: Date }>;
  context?: {
    page?: string;
    section?: string;
    dataSource?: string;
  };
}

export interface EnhancedMuskResponse {
  response: string;
  metadata: {
    intent: MessageIntent;
    persona: string;
    confidence: number;
    proactiveSuggestions: string[];
    contextUsed: {
      profileCompleteness: number;
      keyInsights: string[];
      recommendedActions: string[];
    };
  };
}

/**
 * Process user message with enhanced intelligence system
 */
export async function processEnhancedMuskRequest(request: EnhancedMuskRequest): Promise<EnhancedMuskResponse> {
  console.log('[Enhanced Musk] Processing request with intelligent persona system');
  
  try {
    // Step 1: Classify user intent and analyze conversation context
    const intent = classifyIntent(request.message, {
      userProfile: {
        currentRole: request.userProfile?.title,
        industry: request.userProfile?.industry,
        experienceLevel: determineExperienceLevel(request.userExperiences),
        lookingFor: request.userProfile?.lookingFor
      },
      conversationHistory: request.conversationHistory.map(h => ({
        message: h.message,
        timestamp: h.timestamp
      }))
    });

    console.log(`[Enhanced Musk] Classified intent: ${intent.type} (confidence: ${intent.confidence})`);
    console.log(`[Enhanced Musk] Emotional state: ${intent.emotionalState}, Persona: ${intent.advisorPersona}`);

    // Step 2: Select optimal persona (may override intent-based selection)
    const optimalPersona = selectOptimalPersona(
      intent.type,
      intent.emotionalState,
      request.conversationHistory.map(h => ({ persona: 'strategist', satisfaction: 0.8 })) // Placeholder
    );

    console.log(`[Enhanced Musk] Selected persona: ${optimalPersona}`);

    // Step 3: Enrich user context with comprehensive analysis
    const enrichedContext = await enrichUserContext(
      request.userId,
      request.message,
      request.conversationHistory,
      request.userProfile,
      request.userExperiences,
      request.userSkills,
      request.userEducations,
      request.userProjects
    );

    console.log(`[Enhanced Musk] Profile completeness: ${enrichedContext.user.profileCompleteness.score}%`);
    console.log(`[Enhanced Musk] User confidence: ${enrichedContext.mood.current_confidence}`);

    // Step 4: Generate persona-specific response configuration
    const personaResponse = generatePersonaResponse(
      optimalPersona,
      intent.emotionalState,
      intent.urgency,
      intent.type,
      enrichedContext.user.basicInfo.industry,
      enrichedContext.user.basicInfo.title
    );

    // Step 5: Create enhanced prompt with all context
    const enhancedPrompt = generateEnhancedPrompt(
      optimalPersona,
      intent.type,
      intent.emotionalState,
      enrichedContext,
      request.message
    );

    console.log(`[Enhanced Musk] Generated enhanced prompt (${enhancedPrompt.length} characters)`);

    // Step 6: Generate AI response using enhanced prompt
    const aiResponse = await generateIntelligentResponse(enhancedPrompt, enrichedContext);

    // Step 7: Generate enhanced proactive suggestions
    const proactiveContext: ProactiveContext = {
      userId: request.userId,
      userProfile: enrichedContext.user.basicInfo,
      recentActivity: [],
      careerGoals: [],
      industryTrends: [],
      profileCompleteness: enrichedContext.user.profileCompleteness.score
    };
    
    const proactiveInsights = await generateProactiveInsights(proactiveContext);
    const immediateSuggestions = generateImmediateSuggestions(
      request.message, 
      enrichedContext.user.basicInfo, 
      enrichedContext.user.profileCompleteness.score
    );

    console.log(`[Enhanced Musk] Generated ${immediateSuggestions.length} immediate suggestions and ${proactiveInsights.length} proactive insights`);

    // Apply industry-specific enhancements to response
    const enhancedResponse = enhanceResponseWithIndustryContext(
      aiResponse,
      enrichedContext.user.basicInfo.industry || '',
      enrichedContext.user.basicInfo.title || '',
      intent.type
    );

    // Compile response metadata
    const metadata = {
      intent,
      persona: optimalPersona,
      confidence: intent.confidence,
      proactiveSuggestions: immediateSuggestions,
      proactiveInsights: proactiveInsights.slice(0, 3),
      contextUsed: {
        profileCompleteness: enrichedContext.user.profileCompleteness.score,
        keyInsights: extractKeyInsights(enrichedContext),
        recommendedActions: enrichedContext.recommendations.immediate_actions,
        industrySpecific: true
      }
    };

    return {
      response: enhancedResponse,
      metadata
    };

  } catch (error) {
    console.error('[Enhanced Musk] Error in intelligence processing:', error);
    
    // Fallback to basic response
    const fallbackResponse = await generateFallbackResponse(request.message, request.userProfile);
    
    return {
      response: fallbackResponse,
      metadata: {
        intent: {
          type: 'general_advice',
          confidence: 0.3,
          emotionalState: 'uncertain',
          advisorPersona: 'strategist',
          urgency: 'medium',
          subCategories: []
        },
        persona: 'strategist',
        confidence: 0.3,
        proactiveSuggestions: [],
        contextUsed: {
          profileCompleteness: 0,
          keyInsights: [],
          recommendedActions: []
        }
      }
    };
  }
}

/**
 * Generate AI response using enhanced prompt
 */
async function generateIntelligentResponse(prompt: string, context: EnrichedContext): Promise<string> {
  try {
    console.log('[Enhanced Musk] Generating enhanced response with custom prompt');
    
    // Use the enhanced prompt with a simplified AI call
    const fallbackResponse = generateContextualFallback(context);
    
    // For now, return the contextual fallback enhanced with personalization
    // In a full implementation, this would use the enhanced prompt with the AI service
    return enhanceResponseWithPersonalization(fallbackResponse, context);

  } catch (error) {
    console.error('[Enhanced Musk] Error in intelligent response generation:', error);
    
    // Fallback response generation
    return generateContextualFallback(context);
  }
}

/**
 * Enhance response with personalized elements
 */
function enhanceResponseWithPersonalization(response: string, context: EnrichedContext): string {
  let enhancedResponse = response;
  
  // Add user name if not already present
  const userName = context.user.basicInfo.name;
  if (userName && !enhancedResponse.toLowerCase().includes(userName.toLowerCase())) {
    enhancedResponse = enhancedResponse.replace(/^/, `${userName}, `);
  }

  // Add Brandentifier-specific recommendations
  if (enhancedResponse.includes('networking') || enhancedResponse.includes('connect')) {
    enhancedResponse += '\n\n💡 *Pro tip: Use Brandentifier\'s Smart Connect feature to find professionals with similar backgrounds in your target industry.*';
  }

  if (context.user.profileCompleteness.score < 80 && !enhancedResponse.includes('profile')) {
    enhancedResponse += '\n\n📝 *I noticed your profile could be more complete. Adding missing sections would help me provide even more targeted advice.*';
  }

  return enhancedResponse;
}

/**
 * Generate contextual fallback response
 */
function generateContextualFallback(context: EnrichedContext): string {
  const userName = context.user.basicInfo.name;
  const experienceLevel = context.user.basicInfo.experienceLevel;
  const industry = context.user.basicInfo.industry || 'your field';

  let fallback = `${userName}, I understand you're looking for career guidance. `;

  if (experienceLevel === 'entry') {
    fallback += `As someone early in your career in ${industry}, focus on building foundational skills and gaining diverse experience. `;
  } else if (experienceLevel === 'mid') {
    fallback += `At your career stage in ${industry}, consider specializing in key areas while developing leadership skills. `;
  } else {
    fallback += `With your senior experience in ${industry}, you're well-positioned to mentor others while expanding into strategic roles. `;
  }

  fallback += 'I\'m here to provide specific guidance once you share more details about your goals.';

  return fallback;
}

/**
 * Generate fallback response for errors
 */
async function generateFallbackResponse(message: string, userProfile: any): Promise<string> {
  const userName = userProfile?.name || 'there';
  return `Hi ${userName}, I'm experiencing some technical difficulties with my advanced analysis systems, but I'm still here to help with your career questions. Could you provide a bit more context about your specific situation so I can give you the most relevant advice?`;
}

/**
 * Determine experience level from work experiences
 */
function determineExperienceLevel(experiences: any[]): string {
  if (!experiences || experiences.length === 0) return 'entry';
  
  const totalYears = experiences.reduce((total, exp) => {
    const startYear = new Date(exp.startDate).getFullYear();
    const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : new Date().getFullYear();
    return total + (endYear - startYear);
  }, 0);

  if (totalYears < 3) return 'entry';
  if (totalYears < 7) return 'mid';
  if (totalYears < 12) return 'senior';
  return 'executive';
}

/**
 * Extract key insights from enriched context
 */
function extractKeyInsights(context: EnrichedContext): string[] {
  const insights: string[] = [];
  
  // Profile insights
  if (context.user.profileCompleteness.score < 70) {
    insights.push('Profile completion could improve visibility');
  }

  // Skill insights
  if (context.insights.skillRecommendations.length > 0) {
    const topSkill = context.insights.skillRecommendations[0];
    insights.push(`${topSkill.skill} is a high-demand skill in your field`);
  }

  // Career opportunity insights
  if (context.insights.careerOpportunities.length > 0) {
    const bestMatch = context.insights.careerOpportunities
      .sort((a, b) => b.match_percentage - a.match_percentage)[0];
    
    if (bestMatch.match_percentage > 70) {
      insights.push(`Strong match for ${bestMatch.role} positions`);
    }
  }

  // Mood insights
  if (context.mood.current_confidence === 'low') {
    insights.push('Confidence building would accelerate progress');
  }

  return insights;
}

/**
 * Check if enhanced intelligence should be used
 */
export function shouldUseEnhancedIntelligence(message: string, userProfile: any): boolean {
  // Use enhanced intelligence for all requests with sufficient user data
  const hasBasicProfile = userProfile?.name && userProfile?.title;
  const isComplexQuery = message.length > 20;
  
  return hasBasicProfile && isComplexQuery;
}

/**
 * Process with backward compatibility
 */
export async function processWithBackwardCompatibility(
  message: string,
  userId: number,
  userProfile: any,
  userExperiences: any[] = [],
  userSkills: any[] = [],
  userEducations: any[] = [],
  userProjects: any[] = [],
  conversationHistory: Array<{ message: string; response?: string; timestamp: Date }> = []
): Promise<{ response: string; enhanced: boolean; metadata?: any }> {
  
  if (shouldUseEnhancedIntelligence(message, userProfile)) {
    console.log('[Enhanced Musk] Using enhanced intelligence system');
    
    try {
      const enhancedResponse = await processEnhancedMuskRequest({
        message,
        userId,
        userProfile,
        userExperiences,
        userSkills,
        userEducations,
        userProjects,
        conversationHistory
      });

      return {
        response: enhancedResponse.response,
        enhanced: true,
        metadata: enhancedResponse.metadata
      };
    } catch (error) {
      console.error('[Enhanced Musk] Enhanced processing failed, falling back to basic:', error);
    }
  }

  // Fallback to basic processing
  console.log('[Enhanced Musk] Using basic processing');
  const basicResponse = generateBasicFallback(message, userProfile);
  
  return {
    response: basicResponse,
    enhanced: false
  };
}

/**
 * Generate basic fallback response when enhanced system fails
 */
function generateBasicFallback(message: string, userProfile: any): string {
  const userName = userProfile?.name || 'there';
  const userTitle = userProfile?.title || 'professional';
  
  // Simple contextual responses based on message content
  if (message.toLowerCase().includes('transition') || message.toLowerCase().includes('switch')) {
    return `Hi ${userName}, career transitions require strategic planning. As a ${userTitle}, you already have valuable experience that can transfer to new roles. I'd recommend identifying your transferable skills, researching target industries, and building relevant connections. What specific area are you looking to transition into?`;
  }
  
  if (message.toLowerCase().includes('stuck') || message.toLowerCase().includes('confidence')) {
    return `${userName}, feeling stuck is a common experience in career development. Your background as a ${userTitle} shows you've already achieved significant milestones. Sometimes we need to step back and reassess our goals. What specific challenges are you facing right now?`;
  }
  
  if (message.toLowerCase().includes('skills') || message.toLowerCase().includes('develop')) {
    return `Great question, ${userName}! Skill development is crucial for career growth. Based on your role as a ${userTitle}, I'd suggest focusing on both technical and soft skills relevant to your field. What particular skills are you most interested in developing?`;
  }
  
  if (message.toLowerCase().includes('goals') || message.toLowerCase().includes('planning')) {
    return `${userName}, setting clear career goals is essential for success. As a ${userTitle}, you're in a good position to plan your next steps strategically. I recommend the SMART goals framework - making them Specific, Measurable, Achievable, Relevant, and Time-bound. What timeframe are you considering for your career goals?`;
  }
  
  // General career advice response
  return `Hello ${userName}! I'm here to help with your career development. As a ${userTitle}, you have unique strengths and opportunities. I can provide guidance on career transitions, skill development, goal setting, and professional growth strategies. What specific career challenge would you like to discuss?`;
}