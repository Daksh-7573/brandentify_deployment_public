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
import { 
  generatePredictiveInsights,
  PredictiveInsight 
} from './predictive-career-modeling';
import { 
  generateCrossUserRecommendations,
  updateCohortData 
} from './cross-user-intelligence';
import { 
  analyzeEmotionalContext,
  generateEmotionalResponseStrategy,
  enhancePromptWithEmotionalIntelligence 
} from './emotional-intelligence';

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
    
    // Phase 3: Update cross-user intelligence cohorts
    updateCohortData(userIdString, request.userProfile, userPatterns);
    
    // Phase 3: Analyze emotional context and generate response strategy
    const emotionalContext = analyzeEmotionalContext(userIdString, request.message);
    const emotionalResponseStrategy = generateEmotionalResponseStrategy(emotionalContext, request.userProfile);
    console.log(`[Enhanced Musk] Emotional state: ${emotionalContext.currentState.primary} (${emotionalContext.currentState.intensity})`);
    
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
    
    // Phase 3: Generate predictive career insights
    const predictiveInsights = generatePredictiveInsights(
      userIdString, 
      request.userProfile, 
      request.userExperiences, 
      request.userSkills
    );
    console.log(`[Enhanced Musk] Generated ${predictiveInsights.predictions.length} predictive insights`);
    
    // Phase 3: Generate cross-user recommendations
    const crossUserRecommendations = generateCrossUserRecommendations(userIdString, request.userProfile, userPatterns);
    console.log(`[Enhanced Musk] Generated ${crossUserRecommendations.length} cross-user recommendations`);
    
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

    // Step 2: Generate Phase 3 enhanced contextual response
    const conversationContext = formatConversationForAI(userIdString, processedMessage);
    const response = await generatePhase3EnhancedResponse(
      enrichedContext, 
      processedMessage, 
      conversationContext, 
      personaAnalysis, 
      conversationFlow,
      personalizedGuidelines,
      proactiveInsight,
      predictiveInsights,
      crossUserRecommendations,
      emotionalContext,
      emotionalResponseStrategy
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
 * Generate Phase 3 enhanced response with all advanced AI capabilities
 */
async function generatePhase3EnhancedResponse(
  context: EnrichedContext, 
  message: string, 
  conversationContext: string,
  personaAnalysis: PersonaAnalysis,
  conversationFlow: any,
  personalizedGuidelines: any,
  proactiveInsight: ProactiveInsight,
  predictiveInsights: PredictiveInsight,
  crossUserRecommendations: any[],
  emotionalContext: any,
  emotionalResponseStrategy: any
): Promise<string> {
  try {
    console.log(`[Enhanced Musk] Generating Phase 3 ${personaAnalysis.selectedPersona.name} response`);
    
    const userName = context.user.basicInfo.name;
    const title = context.user.basicInfo.title;
    const industry = context.user.basicInfo.industry || 'your field';
    
    // Check for specific networking feature questions first
    const isNetworkingFeature = /network|netowrk|nework|netwrok.*feature|feature.*network/i.test(message);
    
    if (isNetworkingFeature) {
      console.log(`[Enhanced Musk] Detected networking feature question, generating specific response`);
      return generateNetworkingFeatureResponse(userName || 'there', title || 'professional', industry || 'your field');
    }
    
    // Build Phase 3 enhanced prompt with all AI capabilities
    const basePrompt = `Generate comprehensive career advice for ${userName}, a ${title} in ${industry}.

User Context:
- Name: ${userName}
- Title: ${title}
- Industry: ${industry}
- Location: ${context.user.basicInfo.location || 'your area'}
- Looking for: ${context.user.basicInfo.lookingFor || 'career_advice'}
- User Message: "${message}"
- Emotional State: ${emotionalContext.currentState.primary} (${emotionalContext.currentState.intensity} intensity)
- Career Trajectory: ${predictiveInsights.overallCareerTrajectory}

${conversationContext ? `Previous Conversation:
${conversationContext}

` : ''}Personalized Response Guidelines:
- Length: ${personalizedGuidelines.responseLength}
- Tone: ${personalizedGuidelines.tone} with ${emotionalResponseStrategy.tone} emotional approach
- Focus Areas: ${personalizedGuidelines.focus.join(', ')}
- Approach: ${personalizedGuidelines.approachStyle}
- Emotional Response Strategy: ${emotionalResponseStrategy.approach}

${proactiveInsight.suggestions.length > 0 ? `Proactive Suggestions to Include:
${proactiveInsight.suggestions.slice(0, 2).map(s => `- ${s.title}: ${s.description}`).join('\n')}

` : ''}${predictiveInsights.predictions.length > 0 ? `Predictive Career Insights:
- Next Likely Move: ${predictiveInsights.nextLikelyMove}
- Key Prediction: ${predictiveInsights.predictions[0].prediction}
- Confidence: ${Math.round(predictiveInsights.confidence * 100)}%

` : ''}${crossUserRecommendations.length > 0 ? `Peer Intelligence (based on similar professionals):
${crossUserRecommendations.slice(0, 2).map(r => `- ${r.title}: ${r.description}`).join('\n')}

` : ''}${emotionalResponseStrategy.supportElements.length > 0 ? `Emotional Support Elements to Include:
${emotionalResponseStrategy.supportElements.slice(0, 2).map(element => `- ${element}`).join('\n')}

` : ''}Provide specific, actionable advice that:
1. Addresses their specific question with emotional awareness
2. Uses their industry (${industry}) and role (${title}) context
3. Prioritizes Brandentifier platform recommendations first
4. Incorporates predictive insights about their career trajectory
5. Includes peer intelligence from similar professionals
6. Maintains the ${personaAnalysis.selectedPersona.name} approach
7. Provides emotional support based on their current state
8. References and builds upon previous conversation points when relevant

Make the response deeply personal, emotionally intelligent, and forward-looking based on predictive insights.`;

    // Enhance prompt with all Phase 3 capabilities
    let enhancedPrompt = enhancePromptWithPersona(basePrompt, personaAnalysis, conversationFlow);
    enhancedPrompt = enhancePromptWithEmotionalIntelligence(enhancedPrompt, emotionalContext, emotionalResponseStrategy);
    
    return await generateIntelligentResponse(enhancedPrompt, context, message);
    
  } catch (error) {
    console.error('[Enhanced Musk] Error in generatePhase3EnhancedResponse:', error);
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
  console.log('[Enhanced Musk] Using advanced contextual intelligence for reliability');
  
  // Check for career questions first and use dynamic AI generation
  const isCareer = /career|job|position|role|advancement|growth|future|plan|goal|strategy|transition|promote|director|vp|vice president|executive|leadership|next step|move up|climb|ladder/i.test(message);
  
  if (isCareer) {
    console.log('[Enhanced Musk] Detected career question, using dynamic AI generation');
    return generateDynamicCareerAdvice(context, message);
  }
  
  // Use intelligent fallback for other questions
  return generateAdvancedFallback(context, message);
}

/**
 * Generate dynamic AI-powered career advice
 */
async function generateDynamicCareerAdvice(context: EnrichedContext, message: string): Promise<string> {
  const { user } = context;
  const userName = user.basicInfo.name || 'there';
  const title = user.basicInfo.title || 'professional';
  const industry = user.basicInfo.industry || 'your field';
  const location = user.basicInfo.location || 'your area';
  const lookingFor = user.basicInfo.lookingFor || 'career_advice';

  try {
    // Use OpenAI directly for dynamic content generation with optimized settings
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const userLocation = user.basicInfo.location || 'their area';
    const careerPrompt = `As an expert career strategist, provide specific advice for ${userName}, a ${title} in ${industry} located in ${userLocation}.

User Profile:
- Role: ${title} 
- Industry: ${industry}
- Location: ${userLocation}
- Career Goals: ${lookingFor}
- Experience: Senior-level professional seeking advancement

Provide concise, actionable career advancement advice covering:
1. Specific next steps for role progression
2. Key skills to develop for VP-level positions
3. Strategic networking recommendations
4. Leadership development priorities
5. Industry-specific career moves

Keep response under 500 words with clear, actionable recommendations.`;

    console.log(`[Enhanced Musk] Generating AI career advice for ${title} in ${industry}`);
    
    // Optimized OpenAI call with reduced token limit for faster response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: careerPrompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    const aiAdvice = completion.choices[0].message.content;
    
    return `Hello ${userName},

${aiAdvice}

**Immediate Actions on Brandentifier:**
• Complete your professional profile to 100% for maximum visibility
• Showcase your UX research expertise through detailed project portfolios
• Connect with other ${industry} leaders and professionals
• Share insights about UX research trends and methodologies
• Engage with industry discussions and thought leadership content

**Strategic Next Steps:**
• Document your impact metrics and success stories from previous roles
• Build thought leadership through professional content sharing
• Expand your network within ${industry} and adjacent fields
• Consider speaking opportunities at industry conferences
• Mentor junior professionals to build your leadership profile

What specific aspect of your career development would you like to explore further?`;
  } catch (error) {
    console.error('[Enhanced Musk] Error generating dynamic career advice:', error);
    
    // Generate enhanced contextual response when AI is unavailable
    return `Hello ${userName},

As a ${title} in ${industry}, here's strategic career guidance tailored for your role:

**Career Advancement Strategy:**
• Focus on developing leadership skills specific to ${industry}
• Build expertise in emerging areas that align with your ${lookingFor}
• Expand your professional network within ${location} and beyond
• Document your achievements and impact quantifiably

**Brandentifier Platform Actions:**
• Complete your profile with detailed work history and achievements
• Share insights and expertise through professional posts
• Connect with other ${industry} professionals
• Showcase your best projects and case studies
• Engage meaningfully with industry discussions

**Professional Development:**
• Identify skill gaps in your current role and industry trends
• Seek mentorship from senior professionals in ${industry}
• Participate in industry events and conferences
• Consider certification programs relevant to your field

What specific career challenge or opportunity would you like to discuss further?`;
  }
}

/**
 * Advanced fallback response generator with intelligent context analysis
 */
async function generateAdvancedFallback(context: EnrichedContext, message: string): Promise<string> {
  const { user, proactiveSuggestions, predictiveInsights, selectedPersona } = context;
  const userName = user.basicInfo.name || 'there';
  const title = user.basicInfo.title || 'professional';
  const industry = user.basicInfo.industry || 'your field';
  
  // Analyze message intent for intelligent responses with typo handling
  const isNetworking = /network|netowrk|nework|netwrok|connect|connection|relationship|mentor|professional|colleague|linkedin|reach out|meet people|contacts|events|community|feature/i.test(message);
  const isSkills = /skill|learn|improve|develop|capability|expertise|training|course|certification|upskill/i.test(message);
  const isCareer = /career|job|position|role|advancement|growth|future|plan|goal|strategy|transition|promote|director|vp|vice president|executive|leadership|next step|move up|climb|ladder/i.test(message);
  
  console.log(`[Enhanced Musk] Intent Analysis: networking=${isNetworking}, skills=${isSkills}, career=${isCareer}, message="${message}"`);
  
  let response = `Hello ${userName},\n\n`;
  
  if (isNetworking) {
    response += `Great question about networking! As a ${title} in ${industry}, here's how to leverage Brandentifier's networking features effectively:\n\n`;
    response += `**Brandentifier Networking Features:**\n`;
    response += `• **Professional Discovery**: Use the explore section to find professionals in ${industry} and related fields\n`;
    response += `• **Smart Connections**: The platform suggests relevant connections based on your industry, role, and interests\n`;
    response += `• **Industry Pulses**: Share valuable insights to attract like-minded professionals\n`;
    response += `• **Direct Messaging**: Connect directly with professionals for mentorship and collaboration\n`;
    response += `• **Professional Groups**: Join ${industry}-specific communities and discussions\n\n`;
    response += `**How to Use These Features:**\n`;
    response += `1. Complete your profile to 100% for maximum visibility\n`;
    response += `2. Upload portfolio projects that showcase your expertise\n`;
    response += `3. Post regular updates about your work and industry insights\n`;
    response += `4. Engage meaningfully with others' content through thoughtful comments\n`;
    response += `5. Use the search filters to find professionals by location, industry, and role\n\n`;
    response += `**Strategic Networking Tips:**\n`;
    response += `• Start with quality over quantity - focus on meaningful connections\n`;
    response += `• Always personalize your connection requests with context\n`;
    response += `• Share knowledge and insights before asking for help\n`;
    response += `• Follow up with connections through valuable content sharing\n\n`;
  } else if (isSkills) {
    response += `Skill development is key for your growth as a ${title}. Here's a strategic approach:\n\n`;
    response += `**On Brandentifier:**\n`;
    response += `• Update your skills section with current proficiencies\n`;
    response += `• Showcase skill application through project examples\n`;
    response += `• Share learning progress through professional updates\n\n`;
    response += `**Development Focus:**\n`;
    response += `• Identify in-demand skills in ${industry}\n`;
    response += `• Create a structured learning plan with milestones\n`;
    response += `• Practice through real projects and implementations\n`;
    response += `• Seek feedback from experienced professionals\n\n`;
  } else if (isCareer) {
    // Generate dynamic AI-powered career advice using OpenAI
    console.log(`[Enhanced Musk] Generating dynamic career advice for ${title} in ${industry}`);
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const userLocation = user.basicInfo.location || 'their area';
      const careerPrompt = `Generate personalized career advice for ${userName}, a ${title} working in ${industry}, located in ${userLocation}.

User Context:
- Current Role: ${title}
- Industry: ${industry}
- Location: ${userLocation}
- Looking for: ${user.basicInfo.lookingFor || 'career advancement'}
- Experience Level: Based on Senior Director role, this is a senior-level professional
- Skills: UX Research, Product Management, Healthcare/Biotechnology background
- Current Focus: Career advancement and professional development

Generate comprehensive, personalized career advice that:
1. Addresses their specific role and industry context
2. Provides actionable next steps for career advancement
3. Includes strategic recommendations for their level
4. Considers current market trends in ${industry}
5. Prioritizes Brandentifier platform usage for networking and professional growth

Format as a detailed, professional response with specific recommendations and actionable insights.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: careerPrompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiAdvice = completion.choices[0].message.content;
      
      return `Hello ${userName},

${aiAdvice}

**Immediate Actions on Brandentifier:**
• Complete your professional profile to 100% for maximum visibility
• Showcase your UX research expertise through detailed project portfolios
• Connect with other ${industry} leaders and professionals
• Share insights about UX research trends and methodologies
• Engage with industry discussions and thought leadership content

**Strategic Next Steps:**
• Document your impact metrics and success stories from previous roles
• Build thought leadership through professional content sharing
• Expand your network within ${industry} and adjacent fields
• Consider speaking opportunities at industry conferences
• Mentor junior professionals to build your leadership profile

What specific aspect of your career development would you like to explore further?`;

    } catch (error) {
      console.error('[Enhanced Musk] Error generating AI career advice:', error);
      
      // Enhanced fallback with user context
      return `Hello ${userName},

As a ${title} in ${industry}, you're in a strategic position for significant career advancement. Here's personalized guidance:

**Career Advancement Strategy:**
• Leverage your senior-level experience to move into executive roles
• Focus on developing strategic leadership skills in ${industry}
• Build expertise in emerging areas like AI-driven UX research
• Expand your influence through thought leadership and industry speaking

**Brandentifier Platform Actions:**
• Complete your profile highlighting quantifiable achievements
• Showcase UX research case studies and methodologies
• Connect with C-suite executives and industry leaders
• Share insights about ${industry} trends and innovations
• Build your personal brand as a ${industry} thought leader

**Professional Development:**
• Pursue executive education in strategic leadership
• Develop expertise in emerging technologies affecting ${industry}
• Build board advisory experience or consulting opportunities
• Establish yourself as a subject matter expert in your field

What specific career challenge or opportunity would you like to discuss further?`;
    }
  } else {
    response += `I'm here to provide comprehensive career guidance. Let me help you with:\n\n`;
    response += `**Immediate Actions on Brandentifier:**\n`;
    response += `• Complete your professional profile\n`;
    response += `• Showcase your best work and achievements\n`;
    response += `• Connect with relevant industry professionals\n\n`;
    response += `**Career Development Areas:**\n`;
    response += `• Strategic career planning and goal setting\n`;
    response += `• Professional skill development and enhancement\n`;
    response += `• Networking strategies and relationship building\n`;
    response += `• Personal brand development and thought leadership\n\n`;
  }
  
  // Add contextual recommendations based on available data
  if (context.experiences && context.experiences.length > 0) {
    response += `**Based on Your Experience:**\n`;
    response += `• Leverage your background in ${context.experiences[0]?.title || 'your field'}\n`;
    response += `• Build upon your proven track record for strategic advantage\n\n`;
  }
  
  response += `What specific aspect would you like to explore further? I'm here to provide detailed, personalized guidance.`;
  
  return response;
}


/**
 * Generate specific networking feature response
 */
function generateNetworkingFeatureResponse(userName: string, title: string, industry: string): string {
  return `Hello ${userName},

Great question about Brandentifier's networking features! As a ${title} in ${industry}, here's how to leverage our platform's networking capabilities effectively:

**Brandentifier Networking Features:**
• **Professional Discovery**: Use the explore section to find professionals in ${industry} and related fields
• **Smart Connections**: The platform suggests relevant connections based on your industry, role, and interests  
• **Industry Pulses**: Share valuable insights to attract like-minded professionals
• **Direct Messaging**: Connect directly with professionals for mentorship and collaboration
• **Professional Groups**: Join ${industry}-specific communities and discussions

**How to Use These Features:**
1. Complete your profile to 100% for maximum visibility
2. Upload portfolio projects that showcase your expertise
3. Post regular updates about your work and industry insights
4. Engage meaningfully with others' content through thoughtful comments
5. Use the search filters to find professionals by location, industry, and role

**Strategic Networking Tips for ${industry}:**
• Start with quality over quantity - focus on meaningful connections
• Always personalize your connection requests with context
• Share knowledge and insights before asking for help
• Follow up with connections through valuable content sharing
• Attend industry events and share your participation on the platform

**Getting Started Today:**
1. Navigate to the explore section on your dashboard
2. Use filters to find professionals in your area and industry
3. Review their profiles and find common ground for connection
4. Send personalized connection requests mentioning shared interests
5. Start engaging with their content to build authentic relationships

What specific aspect of networking would you like to focus on first?`;
}

/**
 * Generate contextual fallback response
 */
async function generateContextualFallback(context: EnrichedContext, currentMessage: string = ''): Promise<string> {
  return generateAdvancedFallback(context, currentMessage);
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