/**
 * Enhanced Musk Intelligence Service - Clean Implementation
 * 
 * Integrates intent classification, persona selection, context enrichment,
 * and prompt generation for sophisticated AI career coaching responses.
 */

import OpenAI from 'openai';
import { classifyIntent, analyzeConversationContext, MessageIntent } from './intent-classification';
import { generatePersonaResponse, selectOptimalPersona } from './persona-engine';
import { enrichUserContext, EnrichedContext } from './context-enricher';
import { generateEnhancedPrompt } from './prompt-library';
import { LocalAIService } from './local-ai-service';
import { generateProactiveInsights, ProactiveContext } from './proactive-engine';
import { getIndustryMentoring, enhanceResponseWithIndustryContext } from './industry-mentoring';
import { 
  addMessageToMemory, 
  formatConversationForAI,
  isFollowUpMessage 
} from './conversation-memory';
import { 
  enhancedReferenceResolution,
  shouldRequestClarification,
  generateClarificationRequest 
} from './reference-resolution';
import { 
  analyzePersonaNeed,
  analyzeConversationFlow,
  enhancePromptWithPersona,
  PersonaAnalysis 
} from './dynamic-persona-engine';
import { 
  generateProactiveSuggestions,
  ProactiveInsight 
} from './proactive-suggestion-engine';
import { 
  analyzeUserPatterns,
  getPersonalizedGuidelines 
} from './learning-pattern-recognition';

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
  try {
    console.log('[Enhanced Musk] Processing Phase 2 enhanced request for user:', request.userId);
    const userIdString = request.userId.toString();
    
    // Phase 1: Add user message to conversation memory
    addMessageToMemory(userIdString, 'user', request.message);
    
    // Phase 2: Analyze user patterns and update learning profile
    const userPatterns = analyzeUserPatterns(userIdString);
    const personalizedGuidelines = getPersonalizedGuidelines(userIdString);
    console.log(`[Enhanced Musk] User patterns analyzed with confidence: ${userPatterns.confidence}`);
    
    // Phase 1: Check if clarification is needed for ambiguous input
    if (shouldRequestClarification(userIdString, request.message)) {
      console.log('[Enhanced Musk] Requesting clarification for ambiguous input');
      const clarificationRequest = generateClarificationRequest(userIdString, request.message);
      
      // Add clarification to memory
      addMessageToMemory(userIdString, 'musk', clarificationRequest);
      
      return {
        response: clarificationRequest,
        metadata: {
          intent: 'clarification_request' as any,
          persona: 'clarifier',
          confidence: 1.0,
          proactiveSuggestions: [],
          contextUsed: {
            profileCompleteness: 0,
            keyInsights: ['Required clarification for ambiguous input'],
            recommendedActions: ['Provide more specific details']
          }
        }
      };
    }

    // Phase 1: Apply reference resolution for follow-up messages
    let processedMessage = request.message;
    if (isFollowUpMessage(userIdString, request.message)) {
      console.log('[Enhanced Musk] Detected follow-up message, applying reference resolution');
      processedMessage = await enhancedReferenceResolution(userIdString, request.message);
      console.log(`[Enhanced Musk] Message after reference resolution: "${processedMessage}"`);
    }

    // Phase 2: Dynamic persona analysis and selection
    const personaAnalysis = analyzePersonaNeed(userIdString, processedMessage, request.userProfile);
    const conversationFlow = analyzeConversationFlow(userIdString);
    console.log(`[Enhanced Musk] Selected persona: ${personaAnalysis.selectedPersona.name} with confidence ${personaAnalysis.confidence}`);

    // Phase 2: Generate proactive suggestions
    const proactiveInsight = generateProactiveSuggestions(userIdString, request.userProfile, processedMessage);
    console.log(`[Enhanced Musk] Generated ${proactiveInsight.suggestions.length} proactive suggestions`);
    
    // Step 1: Enrich user context with comprehensive data analysis
    const enrichedContext = await enrichUserContext(
      request.userId,
      processedMessage, // Use the processed message with resolved references
      request.conversationHistory,
      request.userProfile,
      request.userExperiences,
      request.userSkills,
      request.userEducations,
      request.userProjects
    );

    console.log('[Enhanced Musk] Context enriched with profile completeness:', enrichedContext.user.profileCompleteness.score + '%');

    // Step 2: Generate persona-enhanced contextual response
    const conversationContext = formatConversationForAI(userIdString, processedMessage);
    const response = await generatePersonaAwareResponse(
      enrichedContext, 
      processedMessage, 
      conversationContext, 
      personaAnalysis, 
      conversationFlow,
      personalizedGuidelines,
      proactiveInsight
    );

    // Phase 1: Add Musk response to conversation memory
    addMessageToMemory(userIdString, 'musk', response, personaAnalysis.selectedPersona.name);

    // Step 3: Extract enhanced metadata for response tracking
    const metadata = {
      intent: 'career_guidance' as any,
      persona: personaAnalysis.selectedPersona.name,
      confidence: personaAnalysis.confidence,
      proactiveSuggestions: proactiveInsight.suggestions.slice(0, 3).map(s => s.title), // Top 3 suggestions
      contextUsed: {
        profileCompleteness: enrichedContext.user.profileCompleteness.score,
        keyInsights: extractKeyInsights(enrichedContext),
        recommendedActions: proactiveInsight.suggestions.slice(0, 3).map(s => s.actionText),
        conversationMemoryUsed: true,
        referenceResolutionApplied: processedMessage !== request.message,
        personaSelected: personaAnalysis.selectedPersona.name,
        userPatternConfidence: userPatterns.confidence,
        conversationStage: conversationFlow.conversationStage
      }
    };

    console.log('[Enhanced Musk] Phase 2 enhanced response generated with persona awareness and proactive insights');
    
    return {
      response,
      metadata
    };

  } catch (error) {
    console.error('[Enhanced Musk] Error in processEnhancedMuskRequest:', error);
    
    // Generate fallback response
    const fallbackResponse = await generateFallbackResponse(request.message, request.userProfile);
    
    return {
      response: fallbackResponse,
      metadata: {
        intent: 'general_guidance' as any,
        persona: 'generalist',
        confidence: 0.5,
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
 * Generate persona-aware response with Phase 2 enhancements
 */
async function generatePersonaAwareResponse(
  context: EnrichedContext, 
  message: string, 
  conversationContext: string,
  personaAnalysis: PersonaAnalysis,
  conversationFlow: any,
  personalizedGuidelines: any,
  proactiveInsight: ProactiveInsight
): Promise<string> {
  try {
    console.log(`[Enhanced Musk] Generating ${personaAnalysis.selectedPersona.name} response`);
    
    const userName = context.user.basicInfo.name;
    const title = context.user.basicInfo.title;
    const industry = context.user.basicInfo.industry || 'your field';
    
    // Build enhanced prompt with persona awareness
    const basePrompt = `Generate comprehensive career advice for ${userName}, a ${title} in ${industry}.

User Context:
- Name: ${userName}
- Title: ${title}
- Industry: ${industry}
- Location: ${context.user.basicInfo.location || 'your area'}
- Looking for: ${context.user.basicInfo.lookingFor || 'career_advice'}
- User Message: "${message}"

${conversationContext ? `Previous Conversation:
${conversationContext}

` : ''}Personalized Response Guidelines:
- Length: ${personalizedGuidelines.responseLength}
- Tone: ${personalizedGuidelines.tone}
- Focus Areas: ${personalizedGuidelines.focus.join(', ')}
- Approach: ${personalizedGuidelines.approachStyle}

${proactiveInsight.suggestions.length > 0 ? `Proactive Suggestions to Include:
${proactiveInsight.suggestions.slice(0, 2).map(s => `- ${s.title}: ${s.description}`).join('\n')}

` : ''}Provide specific, actionable advice that:
1. Addresses their specific question or concern
2. Uses their industry (${industry}) and role (${title}) context
3. Prioritizes Brandentifier platform recommendations first
4. Includes concrete next steps they can take
5. Maintains the ${personaAnalysis.selectedPersona.name} approach
6. References and builds upon previous conversation points when relevant

Make the response personal and relevant to their career level and industry.`;

    // Enhance prompt with persona-specific guidelines
    const enhancedPrompt = enhancePromptWithPersona(basePrompt, personaAnalysis, conversationFlow);
    
    return await generateIntelligentResponse(enhancedPrompt, context, message);
    
  } catch (error) {
    console.error('[Enhanced Musk] Error in generatePersonaAwareResponse:', error);
    return await generateContextualResponse(context, message, conversationContext);
  }
}

/**
 * Generate contextual response based on enriched context and message analysis
 */
async function generateContextualResponse(context: EnrichedContext, message: string, conversationContext?: string): Promise<string> {
  const userName = context.user.basicInfo.name;
  const title = context.user.basicInfo.title;
  const industry = context.user.basicInfo.industry || 'your field';
  const messageLower = message.toLowerCase();
  
  try {
    // For networking questions, use full OpenAI intelligence instead of static responses
    if (messageLower.includes('network') || messageLower.includes('nework') || messageLower.includes('netowrk') || messageLower.includes('connect') || 
        (messageLower.includes('platform') && (messageLower.includes('network') || messageLower.includes('nework') || messageLower.includes('netowrk'))) ||
        messageLower.includes('networking') || messageLower.includes('platforms ar') || messageLower.includes('brandentifier') || messageLower.includes('linkedin')) {
      console.log('[Enhanced Musk] Detected networking question - using OpenAI for dynamic response');
      
      // Generate dynamic networking advice using OpenAI
      const location = context.user.basicInfo.location || 'your area';
      const lookingFor = context.user.basicInfo.lookingFor || 'career_advice';
      
      const networkingPrompt = `Generate comprehensive networking advice for ${userName}, a ${title} in ${industry}. 

User Context:
- Name: ${userName}
- Title: ${title}
- Industry: ${industry}
- Location: ${location}
- Looking for: ${lookingFor}

${conversationContext ? `Previous Conversation:
${conversationContext}

` : ''}Provide specific, actionable networking strategies that:
1. Prioritize Brandentifier as the primary platform for comprehensive professional branding
2. Include LinkedIn and other platforms as secondary options
3. Give industry-specific networking advice for ${industry}
4. Address the user's role as ${title}
5. Provide concrete steps they can take immediately
${conversationContext ? '6. Build upon any previous discussion points mentioned in the conversation' : ''}

Make the response personal, encouraging, and professional. Include specific examples relevant to their industry and role.`;

      return await generateIntelligentResponse(networkingPrompt, context, message);
    }
    
    // All other career questions should use OpenAI for dynamic responses
    const careerPrompt = `Generate comprehensive career advice for ${userName}, a ${title} in ${industry}.

User Context:
- Name: ${userName}
- Title: ${title}
- Industry: ${industry}
- Location: ${context.user.basicInfo.location || 'your area'}
- Looking for: ${context.user.basicInfo.lookingFor || 'career_advice'}
- User Message: "${message}"

${conversationContext ? `Previous Conversation:
${conversationContext}

` : ''}Provide specific, actionable advice that:
1. Addresses their specific question or concern
2. Uses their industry (${industry}) and role (${title}) context
3. Prioritizes Brandentifier platform recommendations first
4. Includes concrete next steps they can take
5. Maintains an encouraging, professional tone
${conversationContext ? '6. References and builds upon previous conversation points when relevant' : ''}

Make the response personal and relevant to their career level and industry.`;

    return await generateIntelligentResponse(careerPrompt, context, message);
  } catch (error) {
    console.error('[Enhanced Musk] Error in generateContextualResponse:', error);
    return await generateContextualFallback(context, message);
  }
}

/**
 * Generate AI response using enhanced prompt
 */
async function generateIntelligentResponse(prompt: string, context: EnrichedContext, message: string = ''): Promise<string> {
  try {
    console.log('[Enhanced Musk] Generating intelligent response with OpenAI');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are Musk, an expert AI career coach on the Brandentifier platform. Provide comprehensive, personalized career advice that prioritizes Brandentifier features while including other platforms as secondary options."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    console.log('[Enhanced Musk] Generated intelligent response:', aiResponse.substring(0, 200) + '...');
    return aiResponse;
  } catch (error) {
    console.error('[Enhanced Musk] Error generating intelligent response:', error);
    return generateBasicFallback(message, context.user.basicInfo);
  }
}

/**
 * Generate contextual fallback response
 */
async function generateContextualFallback(context: EnrichedContext, currentMessage: string = ''): Promise<string> {
  const userName = context.user.basicInfo.name;
  const title = context.user.basicInfo.title;
  const industry = context.user.basicInfo.industry || 'your field';
  
  return `${userName}, I understand you're looking for career guidance as a ${title} in ${industry}. While I'm processing your request, I can help you with specific questions about career development, skill building, networking strategies, or professional growth. What particular area would you like to focus on?`;
}

/**
 * Generate basic fallback response when enhanced system fails
 */
function generateBasicFallback(message: string, userProfile: any): string {
  const userName = userProfile?.name || 'there';
  const userTitle = userProfile?.title || 'professional';
  
  if (message.toLowerCase().includes('transition') || message.toLowerCase().includes('change')) {
    return `${userName}, career transitions can be exciting opportunities for growth. As a ${userTitle}, you have valuable experience to leverage. I'd recommend starting with a clear assessment of your transferable skills and researching target roles. What type of transition are you considering?`;
  }
  
  if (message.toLowerCase().includes('skills') || message.toLowerCase().includes('develop')) {
    return `Great question, ${userName}! Skill development is crucial for career growth. Based on your role as a ${userTitle}, I'd suggest focusing on both technical and soft skills relevant to your field. What particular skills are you most interested in developing?`;
  }
  
  if (message.toLowerCase().includes('goals') || message.toLowerCase().includes('planning')) {
    return `${userName}, setting clear career goals is essential for success. As a ${userTitle}, you're in a good position to plan your next steps strategically. I recommend the SMART goals framework - making them Specific, Measurable, Achievable, Relevant, and Time-bound. What timeframe are you considering for your career goals?`;
  }
  
  return `Hello ${userName}! I'm here to help with your career development. As a ${userTitle}, you have unique strengths and opportunities. I can provide guidance on career transitions, skill development, goal setting, and professional growth strategies. What specific career challenge would you like to discuss?`;
}

/**
 * Check if enhanced intelligence should be used
 */
export function shouldUseEnhancedIntelligence(message: string, userProfile: any): boolean {
  const hasBasicProfile = userProfile?.name && userProfile?.title;
  const isComplexQuery = message.length > 15;
  
  const messageLower = message.toLowerCase();
  const isCareerQuestion = messageLower.includes('career') || 
                          messageLower.includes('job') || 
                          messageLower.includes('position') || 
                          messageLower.includes('application') ||
                          messageLower.includes('resume') ||
                          messageLower.includes('portfolio') ||
                          messageLower.includes('skills') ||
                          messageLower.includes('experience') ||
                          messageLower.includes('network') ||
                          messageLower.includes('connect') ||
                          messageLower.includes('advice') ||
                          messageLower.includes('help');
  
  return hasBasicProfile && (isComplexQuery || isCareerQuestion);
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
): Promise<EnhancedMuskResponse> {
  try {
    const enhancedRequest: EnhancedMuskRequest = {
      message,
      userId,
      userProfile,
      userExperiences,
      userSkills,
      userEducations,
      userProjects,
      conversationHistory,
      context: {
        page: 'chat',
        section: 'career_guidance',
        dataSource: 'user_input'
      }
    };

    return await processEnhancedMuskRequest(enhancedRequest);
  } catch (error) {
    console.error('[Enhanced Musk] Error in backward compatibility processing:', error);
    
    const fallbackResponse = await generateFallbackResponse(message, userProfile);
    
    return {
      response: fallbackResponse,
      metadata: {
        intent: 'general_guidance' as any,
        persona: 'generalist',
        confidence: 0.5,
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
  
  if (context.user.profileCompleteness.score < 70) {
    insights.push('Profile completion could improve visibility');
  }

  if (context.insights.skillRecommendations.length > 0) {
    const topSkill = context.insights.skillRecommendations[0];
    insights.push(`${topSkill.skill} is a high-demand skill in your field`);
  }

  if (context.insights.careerOpportunities.length > 0) {
    const bestMatch = context.insights.careerOpportunities
      .sort((a, b) => b.match_percentage - a.match_percentage)[0];
    
    if (bestMatch.match_percentage > 70) {
      insights.push(`Strong match for ${bestMatch.role} positions`);
    }
  }

  if (context.mood.current_confidence === 'low') {
    insights.push('Confidence building would accelerate progress');
  }

  return insights;
}

/**
 * Generate fallback response for errors
 */
async function generateFallbackResponse(message: string, userProfile: any): Promise<string> {
  const userName = userProfile?.name || 'there';
  return `Hi ${userName}, I'm experiencing some technical difficulties with my advanced analysis systems, but I'm still here to help with your career questions. Could you provide a bit more context about your specific situation so I can give you the most relevant advice?`;
}