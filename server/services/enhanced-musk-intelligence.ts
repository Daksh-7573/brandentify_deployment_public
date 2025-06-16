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
import { generateProactiveInsights, ProactiveContext } from './proactive-engine';
import { getIndustryMentoring, enhanceResponseWithIndustryContext } from './industry-mentoring';
import { 
  getConversationMemory, 
  addConversationExchange, 
  getFormattedConversationHistory 
} from './conversation-memory';
import { 
  analyzeFollowUpContext, 
  detectActiveGuidanceNeeds, 
  rewriteMessageWithContext,
  generateContextAwarePrefix 
} from './follow-up-handler';
import { analyzeModelSwitchingNeeds, generateEnhancedResponse, assessResponseQuality } from './model-switching';
import { resolveReferences } from './reference-resolution';

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
    // Step 1: Resolve references in the message using conversation context
    const referenceResolution = resolveReferences(request.message, request.userId, request.userProfile);
    let processedMessage = referenceResolution.resolvedMessage;
    
    console.log(`[Enhanced Musk] Reference resolution: "${request.message}" -> "${processedMessage}" (confidence: ${referenceResolution.confidence})`);

    // Step 2: Analyze model switching needs based on complexity
    const modelAnalysis = analyzeModelSwitchingNeeds(
      processedMessage,
      request.conversationHistory,
      request.userProfile
    );

    console.log(`[Enhanced Musk] Model analysis: complexity=${modelAnalysis.complexity}, shouldSwitch=${modelAnalysis.shouldSwitchModel}, recommended=${modelAnalysis.recommendedModel}, reason=${modelAnalysis.reason}`);

    // Step 3: Analyze follow-up context and conversation memory
    const followUpAnalysis = analyzeFollowUpContext(processedMessage, request.userId);
    const activeGuidanceNeeds = detectActiveGuidanceNeeds(processedMessage, request.userId);
    const conversationMemory = getConversationMemory(request.userId);
    
    console.log(`[Enhanced Musk] Follow-up analysis: isFollowUp=${followUpAnalysis.isFollowUp}, needsClarification=${followUpAnalysis.needsClarification}, confidence=${followUpAnalysis.confidence}`);

    // Step 4: Handle complex queries with stronger models first
    if (modelAnalysis.shouldSwitchModel && modelAnalysis.recommendedModel !== 'local') {
      console.log(`[Enhanced Musk] Switching to ${modelAnalysis.recommendedModel} for complex query`);
      
      try {
        const enhancedContext = {
          userProfile: request.userProfile,
          userExperiences: request.userExperiences,
          userSkills: request.userSkills,
          userEducations: request.userEducations,
          userProjects: request.userProjects,
          conversationHistory: request.conversationHistory,
          referenceResolution
        };

        const enhancedResponse = await generateEnhancedResponse(
          processedMessage,
          enhancedContext,
          'openai' // Use OpenAI as primary enhanced model
        );

        // Assess response quality
        const qualityScore = assessResponseQuality(enhancedResponse, processedMessage);
        
        console.log(`[Enhanced Musk] Enhanced response quality: ${qualityScore.overall} (coherence: ${qualityScore.coherence}, relevance: ${qualityScore.relevance})`);

        // Store conversation exchange
        addConversationExchange(request.userId, 'User', request.message);
        addConversationExchange(request.userId, 'Musk', enhancedResponse, modelAnalysis.recommendedModel);

        return {
          response: enhancedResponse,
          metadata: {
            intent: {
              type: 'general_advice',
              confidence: qualityScore.overall,
              emotionalState: 'confident',
              advisorPersona: 'expert',
              urgency: 'medium',
              subCategories: ['enhanced-model', modelAnalysis.complexity]
            },
            persona: 'expert',
            confidence: qualityScore.overall,
            proactiveSuggestions: [],
            contextUsed: {
              profileCompleteness: 95,
              keyInsights: [`Enhanced ${modelAnalysis.recommendedModel} response`, `Complexity: ${modelAnalysis.complexity}`],
              recommendedActions: ['Follow enhanced guidance', 'Ask follow-up questions if needed'],

            }
          }
        };
      } catch (enhancedError) {
        console.error('[Enhanced Musk] Enhanced model failed, falling back to standard processing:', enhancedError);
        // Continue with standard processing below
      }
    }

    // Step 2: Handle clarification or active guidance needs
    if (followUpAnalysis.needsClarification && followUpAnalysis.clarificationPrompt) {
      console.log('[Enhanced Musk] Providing clarification prompt');
      addConversationExchange(request.userId, 'User', request.message);
      addConversationExchange(request.userId, 'Musk', followUpAnalysis.clarificationPrompt);
      
      return {
        response: followUpAnalysis.clarificationPrompt,
        metadata: {
          intent: {
            type: 'clarification_needed' as const,
            confidence: followUpAnalysis.confidence,
            emotionalState: 'uncertain',
            advisorPersona: 'coach',
            urgency: 'medium',
            subCategories: ['follow-up', 'vague-reference']
          },
          persona: 'coach',
          confidence: followUpAnalysis.confidence,
          proactiveSuggestions: [],
          contextUsed: {
            profileCompleteness: 0,
            keyInsights: ['Clarification needed for better guidance'],
            recommendedActions: ['Provide more specific details']
          }
        }
      };
    }

    if (activeGuidanceNeeds.isGuidanceNeeded && activeGuidanceNeeds.guidancePrompt) {
      console.log(`[Enhanced Musk] Providing active guidance for ${activeGuidanceNeeds.taskType}`);
      addConversationExchange(request.userId, 'User', request.message);
      addConversationExchange(request.userId, 'Musk', activeGuidanceNeeds.guidancePrompt);
      
      return {
        response: activeGuidanceNeeds.guidancePrompt,
        metadata: {
          intent: {
            type: 'active_guidance' as const,
            confidence: 0.9,
            emotionalState: 'determined',
            advisorPersona: 'strategist',
            urgency: 'medium',
            subCategories: [activeGuidanceNeeds.taskType, 'structured-guidance']
          },
          persona: 'strategist',
          confidence: 0.9,
          proactiveSuggestions: [],
          contextUsed: {
            profileCompleteness: 0,
            keyInsights: [`Structured guidance needed for ${activeGuidanceNeeds.taskType}`],
            recommendedActions: activeGuidanceNeeds.requiredInfo
          }
        }
      };
    }

    // Step 5: Process message with context enhancement for standard flow
    let contextPrefix = '';
    
    if (followUpAnalysis.isFollowUp) {
      processedMessage = followUpAnalysis.expandedMessage || rewriteMessageWithContext(request.message, conversationMemory);
      contextPrefix = generateContextAwarePrefix(request.message, conversationMemory);
      console.log(`[Enhanced Musk] Enhanced follow-up message: "${processedMessage}"`);
    }

    // Step 4: Include conversation history context
    const conversationHistory = getFormattedConversationHistory(request.userId, 3);
    console.log(`[Enhanced Musk] Including conversation context: ${conversationHistory.length} characters`);

    // Step 5: Classify user intent and analyze conversation context
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
      processedMessage
    ) + conversationHistory;

    console.log(`[Enhanced Musk] Generated enhanced prompt (${enhancedPrompt.length} characters)`);

    // Step 6: Generate AI response using enhanced prompt
    const aiResponse = await generateIntelligentResponse(enhancedPrompt, enrichedContext, processedMessage);
    const finalResponse = contextPrefix + aiResponse;

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
    const immediateSuggestions = generateProactiveSuggestions(enrichedContext);

    console.log(`[Enhanced Musk] Generated ${immediateSuggestions.length} immediate suggestions and ${proactiveInsights.length} proactive insights`);

    // Apply industry-specific enhancements to response
    const enhancedResponse = enhanceResponseWithIndustryContext(
      aiResponse,
      enrichedContext.user.basicInfo.industry || '',
      enrichedContext.user.basicInfo.title || '',
      intent.type
    );

    // Store conversation exchange for future context
    addConversationExchange(request.userId, 'User', request.message, intent.type);
    addConversationExchange(request.userId, 'Musk', finalResponse, optimalPersona);

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

    console.log(`[Enhanced Musk] Final response length: ${finalResponse.length} characters`);

    return {
      response: finalResponse,
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
async function generateIntelligentResponse(prompt: string, context: EnrichedContext, message: string = ''): Promise<string> {
  try {
    console.log(`[Enhanced Musk] Generating AI response with direct OpenAI call for message: "${message}"`);
    
    // Import OpenAI directly for dynamic responses instead of using static fallbacks
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create enhanced prompt with user context
    const systemPrompt = `You are Musk, an expert AI career coach for ${context.user.basicInfo.name}, a ${context.user.basicInfo.title} in ${context.user.basicInfo.industry}. 

Always prioritize Brandentifier features first in your recommendations, then mention other platforms as secondary options.

User Context:
- Name: ${context.user.basicInfo.name}
- Title: ${context.user.basicInfo.title}  
- Industry: ${context.user.basicInfo.industry}
- Location: ${context.user.basicInfo.location}
- Looking for: ${context.user.basicInfo.lookingFor}
- Profile Completeness: ${context.user.profileCompleteness.score}%

Provide personalized, actionable career advice that's specific to their role and industry. Be encouraging but professional.`;

    const userPrompt = `${prompt}\n\nUser question: ${message}`;

    console.log('[Enhanced Musk] Making OpenAI API call for dynamic response');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }, {
      timeout: 15000 // 15 second timeout for complex career questions
    });

    const aiResponse = completion.choices[0]?.message?.content || "I'm here to help with your career development. Could you please provide more details about what you'd like guidance on?";
    
    console.log(`[Enhanced Musk] OpenAI response generated (${aiResponse.length} characters)`);
    console.log(`[Enhanced Musk] Response preview: ${aiResponse.substring(0, 100)}...`);
    
    return aiResponse;

  } catch (error) {
    console.error('[Enhanced Musk] Error in OpenAI response generation:', error);
    
    // Fallback to local AI if OpenAI fails
    console.log('[Enhanced Musk] Falling back to local AI due to OpenAI error');
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: `You are a career advisor helping ${context.user.basicInfo.name}, a ${context.user.basicInfo.title} in ${context.user.basicInfo.industry}. 

User question: ${message}

Provide helpful, personalized career advice:`,
          stream: false
        })
      });
      
      if (response.ok) {
        const data = await response.json() as any;
        const localResponse = data.response || "I'm here to help with your career development.";
        console.log(`[Enhanced Musk] Local AI response generated (${localResponse.length} characters)`);
        return localResponse;
      }
    } catch (localError) {
      console.error('[Enhanced Musk] Local AI also failed:', localError);
    }
    
    return `Hello ${context.user.basicInfo.name}! I'm here to help with your career as a ${context.user.basicInfo.title}. Could you please provide more specific details about what career guidance you're looking for?`;
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

  // Only suggest profile completion for genuinely incomplete profiles (under 60%)
  if (context.user.profileCompleteness.score < 60 && context.user.profileCompleteness.missingAreas.length > 3) {
    enhancedResponse += '\n\n📝 *I noticed your profile could be more complete. Adding missing sections would help me provide even more targeted advice.*';
  }

  return enhancedResponse;
}



/**
 * Generate contextual fallback response
 */
function generateContextualFallback(context: EnrichedContext, currentMessage: string = ''): string {
  const userName = context.user.basicInfo.name;
  const title = context.user.basicInfo.title;
  const industry = context.user.basicInfo.industry || 'your field';
  const experienceLevel = context.user.basicInfo.experienceLevel;
  
  console.log(`[Enhanced Musk] generateContextualFallback called with message: "${currentMessage}"`);
  
  // Check if this is about profile enhancement based on message content and topic focus
  const topicFocus = context.conversation.currentSession.topicFocus || [];
  const messageLower = currentMessage.toLowerCase();
  
  // Only consider profile questions if they specifically mention profile-related terms
  const isProfileQuestion = topicFocus.some(topic => 
    topic.includes('profile_enhancement') || topic.includes('profile') || topic.includes('compelling') || topic.includes('showcase')
  ) || messageLower.includes('profile') || 
       messageLower.includes('compelling') ||
       messageLower.includes('showcase') ||
       (messageLower.includes('enhance') && !messageLower.includes('platform')) ||
       (messageLower.includes('improve') && !messageLower.includes('platform') && !messageLower.includes('network')) ||
       (messageLower.includes('better') && !messageLower.includes('platform') && !messageLower.includes('network') && !messageLower.includes('nework'));

  // Check if this is a career-specific question that should get specialized advice
  const isCareerSpecificQuestion = currentMessage.toLowerCase().includes('portfolio') ||
       currentMessage.toLowerCase().includes('skill') ||
       currentMessage.toLowerCase().includes('experience') ||
       currentMessage.toLowerCase().includes('network') ||
       currentMessage.toLowerCase().includes('nework') ||
       currentMessage.toLowerCase().includes('netowrk') ||
       currentMessage.toLowerCase().includes('networking') ||
       currentMessage.toLowerCase().includes('platforms ar') ||
       currentMessage.toLowerCase().includes('brandentifier') ||
       currentMessage.toLowerCase().includes('linkedin') ||
       currentMessage.toLowerCase().includes('platform') ||
       currentMessage.toLowerCase().includes('best') ||
       currentMessage.toLowerCase().includes('recommend') ||
       currentMessage.toLowerCase().includes('resume') ||
       currentMessage.toLowerCase().includes('cv') ||
       currentMessage.toLowerCase().includes('job') ||
       currentMessage.toLowerCase().includes('apply') ||
       currentMessage.toLowerCase().includes('application') ||
       currentMessage.toLowerCase().includes('career');

  console.log(`[Enhanced Musk] isProfileQuestion: ${isProfileQuestion}, isCareerSpecificQuestion: ${isCareerSpecificQuestion}, profile completeness: ${context.user.profileCompleteness.score}%`);
  console.log(`[Enhanced Musk] Message analysis: "${currentMessage}" contains - best: ${currentMessage.toLowerCase().includes('best')}, platform: ${currentMessage.toLowerCase().includes('platform')}, from all: ${currentMessage.toLowerCase().includes('from all')}, these: ${currentMessage.toLowerCase().includes('these')}`);

  if ((isProfileQuestion || isCareerSpecificQuestion) && context.user.profileCompleteness.score >= 75) {
    // Generate question-specific responses based on the actual question asked
    const messageLower = currentMessage.toLowerCase();
    
    console.log(`[Enhanced Musk] Analyzing question: "${currentMessage}"`);
    console.log(`[Enhanced Musk] Message keywords: ${messageLower}`);
    
    // Platform comparison questions (check first for highest priority)
    if (messageLower.includes('best platform') || messageLower.includes('which platform') || 
        (messageLower.includes('best') && messageLower.includes('platform')) ||
        (messageLower.includes('best') && (messageLower.includes('from all') || messageLower.includes('these'))) ||
        (messageLower.includes('recommend') && messageLower.includes('platform'))) {
      console.log('[Enhanced Musk] Detected platform comparison question');
      return `${userName}, for a ${title} in ${industry}, **Brandentifier is your best networking platform** because:

**Why Brandentifier First:**
• **Industry-Specific Features** - Built specifically for career professionals like you
• **Comprehensive Profile System** - Showcase work experience, skills, projects, and services in one place  
• **Career-Focused Community** - Connect with professionals seeking genuine career growth
• **AI-Powered Insights** - Get personalized career guidance and networking recommendations
• **Professional Brand Building** - Create a complete professional identity beyond just a resume

**Platform Ranking for Your Role:**
1. **Brandentifier** - Primary platform for comprehensive professional branding
2. **LinkedIn** - Secondary for broader industry reach and executive connections
3. **Industry-Specific Groups** - HFTP, HTNG for hospitality networking
4. **Executive Networks** - YPO, WEF for C-suite connections

**Strategic Approach:**
Start with Brandentifier to build your complete professional brand, then use LinkedIn to amplify your reach. Your director-level position in hospitality UX gives you unique authority - leverage Brandentifier's features to showcase this expertise comprehensively.`;
    }
    
    // Job search and career goal questions
    if ((messageLower.includes('job') && (messageLower.includes('get') || messageLower.includes('find') || messageLower.includes('search') || messageLower.includes('goal'))) || 
        (messageLower.includes('new') && messageLower.includes('position')) ||
        (messageLower.includes('career') && (messageLower.includes('goal') || messageLower.includes('change') || messageLower.includes('move') || messageLower.includes('advice'))) ||
        messageLower.includes('job search')) {
      console.log('[Enhanced Musk] Detected job search/career goal question');
      return `${userName}, here's your strategic roadmap to securing a high-level position as a ${title} in ${industry}:

**Executive Job Search Strategy:**
• **Target Identification** - Focus on VP/SVP roles or lateral Director positions with expanded scope
• **Market Research** - Analyze ${industry} leaders, identify growing companies needing UX transformation
• **Timeline Planning** - Executive searches typically take 6-12 months, plan accordingly
• **Personal Branding** - Establish thought leadership through industry publications and speaking engagements

**Positioning for High-Level Roles:**
• **Value Proposition** - Articulate how you transform guest experiences into business growth
• **Executive Presence** - Develop C-suite communication skills and strategic thinking
• **Network Activation** - Leverage relationships with hospitality executives and board members
• **Portfolio Enhancement** - Showcase transformational projects with measurable ROI

**Search Execution for ${industry} Leadership:**
• Work with executive search firms specializing in hospitality and customer experience
• Target companies undergoing digital transformation or customer experience initiatives
• Demonstrate expertise in both traditional hospitality and emerging travel technologies
• Prepare for board-level presentations and strategic planning discussions

**Immediate Action Plan:**
• Update your Brandentifier profile to highlight strategic achievements
• Connect with hospitality C-suite executives through industry events
• Develop case studies showing business impact of your UX initiatives
• Consider hospitality-focused executive coaching to refine your leadership narrative

Your experience in hospitality UX research positions you perfectly for senior leadership roles where customer experience drives business strategy.`;
    }
    
    // Job application questions (check second as high priority)
    if ((messageLower.includes('apply') && messageLower.includes('job')) || messageLower.includes('application')) {
      console.log('[Enhanced Musk] Detected job application question');
      return `${userName}, here's your strategic approach to job applications as a ${title} in ${industry}:

**Application Strategy for Director-Level Roles:**
• **Target Selection** - Focus on positions 1-2 levels above your current role or lateral moves with strategic value
• **Research Phase** - Study company culture, recent initiatives, and leadership team before applying
• **Timing** - Apply within 48-72 hours of job posting for maximum visibility
• **Follow-up** - Connect with hiring managers on LinkedIn before or after application

**Application Materials for ${industry}:**
• **Executive Resume** - Highlight P&L responsibility, team leadership, and strategic initiatives
• **Cover Letter** - Address specific business challenges the company faces
• **Portfolio** - Include case studies showing guest experience improvements and operational efficiency
• **References** - Prepare 3-5 executive-level references who can speak to your leadership impact

**Director-Level Application Process:**
• Apply through multiple channels (company website, LinkedIn, executive recruiters)
• Leverage your professional network for warm introductions
• Demonstrate thought leadership through industry content
• Prepare for behavioral and strategic scenario interviews

Focus on demonstrating how you'll drive business outcomes from day one.`;
    }
    
    // Resume creation/improvement questions (check second as high priority)
    if (messageLower.includes('resume') || (messageLower.includes('make') && messageLower.includes('cv'))) {
      console.log('[Enhanced Musk] Detected resume creation question');
      return `${userName}, here's how to create a compelling resume for your ${title} role in ${industry}:

**Resume Structure for Directors:**
• **Executive Summary** - 3-4 lines highlighting your leadership impact and strategic value
• **Core Competencies** - 8-12 key skills relevant to ${industry} and UX research
• **Professional Experience** - Focus on achievements, not just responsibilities
• **Education & Certifications** - Include relevant credentials and continuous learning

**Content Strategy for ${industry}:**
• Quantify guest experience improvements (satisfaction scores, retention rates)
• Highlight team leadership (size, budget, cross-functional collaboration)
• Showcase strategic initiatives with business outcomes
• Include technology and digital transformation experience

**Director-Level Formatting:**
• Clean, professional layout with consistent formatting
• Use action verbs and quantified achievements
• Keep to 2 pages maximum for executive-level positions
• Include industry-specific keywords for ATS optimization

Focus on strategic impact rather than tactical tasks to match your seniority level.`;
    }
    
    // Skills improvement questions (check first to avoid conflicts)
    if (messageLower.includes('skill') && (messageLower.includes('improve') || messageLower.includes('enhance') || messageLower.includes('presentation'))) {
      console.log('[Enhanced Musk] Detected skills improvement question');
      return `${userName}, to enhance your skills presentation as a ${title}:

**Technical Skills Enhancement:**
• Create skill progression narratives (beginner → expert journey)
• Link each skill to specific project outcomes
• Include certifications and continuous learning evidence

**Leadership Skills (Perfect for your director role):**
• Stakeholder management examples with measurable results
• Team building and cross-functional collaboration stories
• Strategic decision-making with business impact

**Industry-Specific Skills for ${industry}:**
• Guest experience optimization methodologies
• Operational efficiency improvement techniques
• Digital transformation leadership

Consider adding skill endorsements from colleagues and quantified skill applications.`;
    }
    
    // Portfolio layout questions (move to top priority)
    if (messageLower.includes('portfolio') && (messageLower.includes('layout') || messageLower.includes('best') || messageLower.includes('level'))) {
      console.log('[Enhanced Musk] Detected portfolio layout question');
      return `${userName}, for a ${title} at your ${experienceLevel} level in ${industry}, I recommend the **Corporate Executive** portfolio layout. This theme emphasizes:

• **Strategic Leadership Focus** - Perfect for director-level positions
• **Clean, Professional Design** - Builds trust with stakeholders  
• **Achievement-Driven Layout** - Highlights your business impact
• **Industry Authority Positioning** - Establishes thought leadership

Key sections to emphasize:
- Executive summary with quantified achievements
- Strategic initiatives you've led
- Cross-functional team leadership examples
- Industry-specific metrics and outcomes

This layout positions you as a strategic leader rather than just an individual contributor.`;
    }
    
    // Experience showcase questions
    if (messageLower.includes('experience') && (messageLower.includes('showcase') || messageLower.includes('highlight'))) {
      return `${userName}, to better showcase your ${experienceLevel}-level experience in ${industry}:

**Structure Each Role Around Impact:**
• Start with the business challenge you inherited
• Describe your strategic approach and initiatives
• Quantify the results with specific metrics

**Director-Level Focus Areas:**
• Team size and budget responsibility
• Cross-departmental collaboration and influence
• Strategic planning and execution
• Stakeholder management at executive level

**Hospitality Industry Specifics:**
• Guest satisfaction improvements (NPS scores, ratings)
• Operational efficiency gains (cost reduction, process optimization)
• Revenue impact from your initiatives
• Technology adoption and digital transformation

Use action verbs like "Led," "Transformed," "Optimized," and "Delivered" to emphasize leadership.`;
    }
    
    // Networking questions (check for variations and platform-specific terms)
    if (messageLower.includes('network') || messageLower.includes('nework') || messageLower.includes('netowrk') || messageLower.includes('connect') || 
        (messageLower.includes('platform') && (messageLower.includes('network') || messageLower.includes('nework') || messageLower.includes('netowrk'))) ||
        messageLower.includes('networking') || messageLower.includes('platforms ar') || messageLower.includes('brandentifier') || messageLower.includes('linkedin')) {
      console.log('[Enhanced Musk] Detected networking/platform question');
      
      // LinkedIn-specific networking questions (check first for specificity)
      console.log(`[Enhanced Musk] Checking LinkedIn detection: "${messageLower}" includes "linkedin"? ${messageLower.includes('linkedin')}`);
      if (messageLower.includes('linkedin')) {
        console.log('[Enhanced Musk] Detected LinkedIn-specific networking question');
        return `${userName}, here's how to network effectively on LinkedIn as a ${title} in ${industry}:

**LinkedIn Networking Strategy for Directors:**
• **Optimize Your Headline** - "Senior Director, UX Research | Hospitality Innovation | Guest Experience Optimization"
• **Professional Summary** - Highlight your strategic impact, team leadership, and industry expertise
• **Experience Descriptions** - Focus on business outcomes, team achievements, and strategic initiatives

**Content Strategy:**
• **Industry Insights** - Share hospitality UX trends and guest experience innovations
• **Leadership Content** - Post about team building, strategic decision-making, and industry leadership
• **Research Findings** - Share anonymized case studies and UX research methodologies
• **Thought Leadership** - Comment thoughtfully on industry discussions and executive posts

**Strategic Connections:**
• **Hospitality Executives** - CEOs, CTOs, and VPs at major hotel chains and hospitality companies
• **UX Leaders** - Directors and VPs of UX at technology and service companies
• **Industry Influencers** - Hospitality technology thought leaders and conference speakers
• **Peers and Mentees** - Other senior UX professionals for collaboration and mentoring

**LinkedIn Groups to Join:**
• Hospitality Financial and Technology Professionals
• UX Professionals Network
• Hotel Technology Next Generation
• Customer Experience Professionals Association

**Engagement Best Practices:**
• Comment meaningfully on executive posts (add strategic insights)
• Share wins and learnings from your team's projects
• Offer mentorship to emerging UX professionals
• Participate in industry discussions with director-level perspective

Remember: LinkedIn is powerful for broad reach, but consider building your complete professional brand on Brandentifier first, then use LinkedIn to amplify your message.`;
      }
      
      // Platform comparison questions
      if (messageLower.includes('best platform') || messageLower.includes('which platform') || 
          (messageLower.includes('best') && messageLower.includes('platform')) ||
          (messageLower.includes('best') && (messageLower.includes('from all') || messageLower.includes('these'))) ||
          (messageLower.includes('recommend') && messageLower.includes('platform'))) {
        return `${userName}, for a ${title} in ${industry}, **Brandentifier is your best networking platform** because:

**Why Brandentifier First:**
• **Industry-Specific Features** - Built specifically for career professionals like you
• **Comprehensive Profile System** - Showcase work experience, skills, projects, and services in one place  
• **Career-Focused Community** - Connect with professionals seeking genuine career growth
• **AI-Powered Insights** - Get personalized career guidance and networking recommendations
• **Professional Brand Building** - Create a complete professional identity beyond just a resume

**Platform Ranking for Your Role:**
1. **Brandentifier** - Primary platform for comprehensive professional branding
2. **LinkedIn** - Secondary for broader industry reach and executive connections
3. **Industry-Specific Groups** - HFTP, HTNG for hospitality networking
4. **Executive Networks** - YPO, WEF for C-suite connections

**Strategic Approach:**
Start with Brandentifier to build your complete professional brand, then use LinkedIn to amplify your reach. Your director-level position in hospitality UX gives you unique authority - leverage Brandentifier's features to showcase this expertise comprehensively.`;
      }
      
      // If specifically asking about Brandentifier networking
      if (messageLower.includes('brandentifier')) {
        return `${userName}, here's how to network effectively on Brandentifier as a ${title} in ${industry}:

**Brandentifier Networking Strategy:**
• **Complete Your Profile** - Add your work experiences, skills, projects, and services to increase visibility
• **Showcase Your Expertise** - Post pulses about UX research insights and hospitality industry trends
• **Connect with Industry Peers** - Search for other hospitality professionals and UX researchers
• **Join Conversations** - Engage with others' content through meaningful comments and reactions

**Content Creation for Networking:**
• Share case studies from your UX research projects in hospitality
• Post insights about guest experience optimization and operational efficiency
• Discuss digital transformation trends in the hospitality industry
• Offer career advice to emerging UX professionals

**Building Professional Relationships:**
• Send connection requests with personalized messages
• Offer to mentor junior professionals in your field
• Collaborate on industry discussions and thought leadership
• Share opportunities and insights with your network

**Leveraging Your Director-Level Position:**
• Position yourself as a thought leader in hospitality UX
• Share strategic insights about user research and business impact
• Connect with C-suite executives and other directors
• Use your expertise to add value to conversations

Your senior role gives you natural authority to lead discussions and mentor others on the platform.`;
      }
      
      return `${userName}, as a ${title} in ${industry}, here are the best platforms to network more effectively:

**Professional Networking Platforms:**
• **Brandentifier** - Your primary platform for showcasing career achievements and connecting with industry peers
• **LinkedIn** - Essential for executive networking, join hospitality industry groups and UX research communities
• **Indeed Career Guide** - Access to job market insights and industry connections

**Industry-Specific Platforms:**
• **Hospitality Financial and Technology Professionals (HFTP)** - Finance and tech leaders in hospitality
• **Hotel Technology Next Generation (HTNG)** - Technology innovation in hospitality
• **UX Mastery Community** - UX research professionals across industries

**Executive Networking:**
• **Young Presidents' Organization (YPO)** - Executive leadership network
• **World Economic Forum Young Global Leaders** - Global business leadership
• **Industry conference networking events** - Direct contact with hospitality C-suite executives

**Digital Strategy:**
• Start with your Brandentifier profile to establish credibility
• Share hospitality UX insights and research findings
• Engage authentically with industry discussions and thought leaders

Focus on quality connections over quantity - your director-level expertise provides natural conversation starters.`;
    }
    
    // General compelling profile questions - fallback to concise advice
    return `${userName}, as a ${title} in ${industry}, here are specific ways to make your profile more compelling:

**Experience Enhancement:**
• Quantify your impact with specific metrics (team size, budget managed, efficiency improvements)
• Highlight cross-functional collaboration and stakeholder management achievements
• Emphasize strategic initiatives you've led and their business outcomes

**Skills Positioning:**
• Create skill narratives showing progression from foundational to advanced expertise  
• Connect each skill to specific project outcomes or business value delivered

**Industry Authority:**
• Highlight guest experience improvements and satisfaction metrics
• Showcase operational efficiency initiatives and cost optimization
• Demonstrate digital transformation or technology integration experience`;
  }

  // Standard career guidance for non-profile questions
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
  const isComplexQuery = message.length > 15;
  
  // Always use enhanced intelligence for career-related questions
  const messageLower = message.toLowerCase();
  const isCareerQuestion = messageLower.includes('career') || 
                          messageLower.includes('job') || 
                          messageLower.includes('position') || 
                          messageLower.includes('application') ||
                          messageLower.includes('resume') ||
                          messageLower.includes('portfolio') ||
                          messageLower.includes('skills') ||
                          messageLower.includes('experience') ||
                          messageLower.includes('network');
  
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