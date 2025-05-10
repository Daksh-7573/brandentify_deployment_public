/**
 * Musk Intelligence System
 *
 * An enhanced framework for Musk AI to provide personalized, context-aware
 * career guidance through multiple intelligence dimensions.
 */
import { User, WorkExperience, Education, Skill, Project } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI with proper error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Core intelligence system for Musk AI that processes user data through
 * multiple specialized intelligence dimensions to generate personalized responses.
 */
export interface MuskContext {
  userId?: string | number;
  userData?: Partial<User>;
  experiences?: Partial<WorkExperience>[];
  educations?: Partial<Education>[];
  skills?: Partial<Skill>[];
  projects?: Partial<Project>[];
  resumeData?: any;
  userMemory?: UserMemory;
  dataSource?: string;
  page?: string;
  section?: string;
}

export interface UserMemory {
  interactions: {
    timestamp: Date;
    message: string;
    response: string;
  }[];
  patterns: {
    communicationStyle?: string;
    topicPreferences?: Record<string, number>;
    engagementLevel?: string;
    responseStyle?: string;
  };
}

/**
 * The main intelligence orchestrator that combines all dimensions
 * to generate comprehensive, personalized career guidance
 */
export async function generatePersonalizedResponse(
  message: string,
  context: MuskContext
): Promise<string> {
  try {
    console.log("Musk intelligence system processing message with context:", {
      message: message.substring(0, 50) + "...",
      userId: context.userId,
      hasUserData: !!context.userData,
      experiencesCount: context.experiences?.length || 0,
      skillsCount: context.skills?.length || 0,
      hasResumeData: !!context.resumeData,
      hasUserMemory: !!context.userMemory
    });
    
    // SECURITY: Final validation of message content
    // This is an additional safety check even though secureMuskInteraction should already have been called
    try {
      if (message.length > 10000) {
        console.warn("SECURITY: Truncating excessively long message");
        message = message.substring(0, 10000) + "... [truncated for security reasons]";
      }
      
      // Check for any remaining PII patterns that might have been missed
      const PII_PATTERNS = [
        // Email addresses
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
        // Phone numbers (various formats)
        /\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
        // SSN/Government IDs (generic pattern)
        /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
      ];
      
      for (const pattern of PII_PATTERNS) {
        message = message.replace(pattern, '[REDACTED]');
      }
      
      // Ensure context doesn't have any unexpected data or potentially malicious properties
      if (context.userData) {
        // Deep clone to avoid modifying original, then sanitize
        const sanitizedUserData = JSON.parse(JSON.stringify(context.userData));
        // Remove any sensitive fields that shouldn't be processed
        delete sanitizedUserData.password;
        delete sanitizedUserData.authToken;
        delete sanitizedUserData.apiKeys;
        context.userData = sanitizedUserData;
      }
    } catch (error) {
      console.error("SECURITY: Error during additional validation:", error);
      // Continue with original message if validation fails
    }

    // Analyze user's career profile from all available sources
    const careerProfile = analyzeCareerProfile(context);
    
    // Determine user intent from the message
    const intent = await determineUserIntent(message, context);
    console.log(`Detected intent: ${intent}`);
    
    // Generate personalized prompt based on career profile, intent and available data
    const prompt = generateEnhancedPrompt(message, intent, careerProfile, context);
    
    // Generate response using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system", 
          content: prompt
        },
        {
          role: "user",
          content: message
        }
      ]
    });
    
    // Extract the response
    const aiResponse = response.choices[0].message.content || 
      "I apologize, but I'm unable to process your request right now. Please try again later.";
    
    // SECURITY: Sanitize the AI response to prevent any potential sensitive data leakage
    let sanitizedResponse = aiResponse;
    
    try {
      // Import sanitization function from the security service
      const { sanitizeAIResponse } = await import('./musk-security-service');
      sanitizedResponse = sanitizeAIResponse(aiResponse);
      console.log("SECURITY: AI response sanitized successfully");
    } catch (error) {
      console.error("SECURITY: Error sanitizing AI response:", error);
      // Continue with the original response if sanitization fails
      sanitizedResponse = aiResponse;
    }
    
    // Generate potential follow-up questions based on intent and context
    const followUpQuestions = generateFollowUpQuestions(intent, context);
    
    // Choose one follow-up question to add to the response if appropriate
    let finalResponse = formatResponseWithPersonalization(sanitizedResponse, context);
    
    // Add a follow-up question if the response doesn't already contain a question
    // and it's not too long (to avoid making it overwhelming)
    if (followUpQuestions.length > 0 && 
        !aiResponse.includes("?") && 
        finalResponse.length < 2000) {
      const selectedQuestion = followUpQuestions[0];
      finalResponse += `\n\nIs there anything specific you'd like to know more about? For example: ${selectedQuestion}`;
    }
    
    return finalResponse;
  } catch (error) {
    console.error("Error in Musk intelligence system:", error);
    return "I encountered an issue while processing your request. As your AI career assistant, I'll work on improving. Could you please try asking your question in a different way?";
  }
}

/**
 * Determines the user's intent from their message to guide response generation
 * Based on the 8 intelligence dimensions from the training roadmap and Musk Prompt Library
 */
async function determineUserIntent(message: string, context: MuskContext): Promise<string> {
  try {
    // Enhanced intent map based on the 8 intelligence dimensions and Musk Prompt Library
    const intentMap = {
      // USER PERSONA UNDERSTANDING
      persona_assessment: ["who am i", "what type of professional", "my strengths", "my weaknesses", "personality", 
                          "professional identity", "work style", "career stage", "profile analysis", 
                          "personal brand", "career identity", "professional strengths"],
                          
      // SKILLS vs MARKET DEMAND MAPPING
      skill_gap_analysis: ["skills i need", "missing skills", "learn", "improve skills", "skill gap", 
                          "current skills", "market demand", "skills in demand", "certification", "courses",
                          "develop skills", "upskill", "technical skills", "soft skills", "skill assessment",
                          "competitive skills", "skill benchmark", "learn new tools", "professional development"],
      
      // CAREER PATH INTELLIGENCE
      career_progression: ["next step", "career path", "progress", "advance", "promotion", "grow", 
                          "career trajectory", "next role", "step up", "senior", "leadership", 
                          "career growth", "professional growth", "advancement", "roadmap", "tech lead",
                          "management track", "individual contributor", "expert path", "stuck in career"],
      
      career_change: ["change career", "switch", "transition", "new field", "different industry", 
                     "pivot", "transfer skills", "reinvent", "new direction", "career switch",
                     "industry change", "skill bridge", "career pivot", "second career", "move into", 
                     "shift to", "career alternatives", "from finance to tech", "moving from"],
      
      // GLOBAL OPPORTUNITY AWARENESS
      location_advice: ["relocation", "move to", "remote work", "location", "geographic", "city", 
                       "country", "region", "cost of living", "local market", "visa", "work permit",
                       "global job", "international", "overseas opportunity", "country comparison", 
                       "regional differences", "moving abroad", "immigration", "global career"],
      
      market_trends: ["trends", "growing markets", "hotspots", "emerging markets", "industry growth",
                     "regional differences", "global opportunities", "industry outlook", "sector growth",
                     "market forecast", "emerging sectors", "industry prediction", "growth areas", 
                     "future of industry", "market analysis", "industry health"],
      
      // PERSONALITY-TO-PROFESSION MAPPING
      role_fit: ["right job for me", "job fit", "culture fit", "match my personality", "suit me", 
                "work environment", "company size", "startup", "corporate", "right for me",
                "personality type", "work preference", "independent work", "team collaboration", 
                "work style", "value alignment", "company culture", "work-life balance", "burned out"],
      
      // TREND FORECASTING
      future_planning: ["future proof", "emerging trends", "upcoming", "next 5 years", "future skills",
                       "industry direction", "technology trends", "future of work", "sustainability careers",
                       "emerging roles", "future jobs", "jobs of tomorrow", "future career paths", 
                       "technology evolution", "skill future-proofing", "career longevity", "AI impact"],
      
      // Standard career needs
      resume_feedback: ["resume", "cv", "application", "my profile", "professional summary", 
                       "improve resume", "review resume", "application materials", "resume weaknesses",
                       "strengthen profile", "profile improvement", "CV feedback", "resume bullets",
                       "application documents", "resume optimization", "ATS friendly", "LinkedIn profile"],
      
      job_search: ["find job", "job hunt", "job search", "looking for work", "job application", 
                  "job posting", "apply", "interview process", "application status", "job boards",
                  "company research", "job search strategy", "application tracking", "recruiter outreach", 
                  "hiring process", "application follow-up", "job opportunities", "talent acquisition"],
      
      interview_preparation: ["interview", "prepare for interview", "interview question", "common questions", 
                             "technical interview", "behavioral interview", "assessment", "case study",
                             "interview prep", "STAR method", "interview story", "practice interview",
                             "interview nerves", "interview examples", "tough questions", "panel interview"],
      
      salary_negotiation: ["salary", "compensation", "benefits", "negotiate", "offer", "pay", 
                          "raise", "bonus", "equity", "total compensation", "counter offer",
                          "salary expectations", "compensation package", "market rate", "negotiate benefits",
                          "salary research", "pay increase", "salary benchmark", "worth in market"],
      
      networking: ["network", "connect", "professional network", "linkedin", "industry contacts", 
                  "referral", "introduction", "networking event", "conference", "build connections",
                  "industry networking", "professional relationships", "informational interview", 
                  "networking strategy", "social capital", "virtual networking", "community building"]
    };
    
    // Check for the most relevant intent
    const lowercaseMessage = message.toLowerCase();
    let matchedIntent = "career_advice"; // Default intent
    let highestScore = 0;
    
    // Score each intent based on keyword matches
    for (const [intent, keywords] of Object.entries(intentMap)) {
      let score = 0;
      
      for (const keyword of keywords) {
        if (lowercaseMessage.includes(keyword)) {
          score++;
        }
      }
      
      // Additional contextual scoring
      if (intent === "resume_feedback" && context.resumeData) {
        score += 2; // Prioritize resume feedback if the user has uploaded a resume
      }
      
      if (intent === "career_change" && 
          context.userMemory?.patterns?.topicPreferences && 
          context.userMemory.patterns.topicPreferences["career"] > 2) {
        score += 1; // Boost career change if user frequently discusses career topics
      }
      
      // Check if we have a new highest score
      if (score > highestScore) {
        highestScore = score;
        matchedIntent = intent;
      }
    }
    
    // Special case: If no keywords matched but user has resume data and is asking something general,
    // prioritize resume-related advice
    if (highestScore === 0 && context.resumeData && message.length < 50) {
      return "resume_feedback";
    }
    
    // Map our detailed intents to higher-level categories for prompt generation
    const intentCategories = {
      persona_assessment: "career_advice",
      skill_gap_analysis: "skill_development",
      career_progression: "career_advice",
      career_change: "career_change",
      location_advice: "global_opportunities",
      market_trends: "industry_trends",
      role_fit: "career_advice",
      future_planning: "industry_trends",
      resume_feedback: "resume_feedback",
      job_search: "job_search",
      interview_preparation: "interview_preparation",
      salary_negotiation: "salary_negotiation",
      networking: "networking"
    };
    
    // Log the intent detection results
    console.log(`Intent detection: message triggered intent "${matchedIntent}" with score ${highestScore}`);
    
    // Return the mapped category or the matched intent if no mapping exists
    return intentCategories[matchedIntent as keyof typeof intentCategories] || matchedIntent;
  } catch (error) {
    console.error("Error determining user intent:", error);
    return "career_advice";
  }
}

/**
 * Analyzes the user's career profile from context data
 */
function analyzeCareerProfile(context: MuskContext): any {
  // Extract career profile information from context
  const profile: any = {
    name: context.userData?.name || "there",
    careerStage: determineCareerStage(context),
    skills: extractSkills(context),
    experiences: extractExperiences(context),
    education: extractEducation(context),
    industry: context.userData?.industry || null,
    lookingFor: context.userData?.lookingFor || null,
    domain: context.userData?.domain || null,
    location: context.userData?.location || null
  };
  
  return profile;
}

/**
 * Determines career stage based on work experience and other factors
 */
function determineCareerStage(context: MuskContext): string {
  // Default to "professional" if we can't determine
  if (!context.experiences || context.experiences.length === 0) {
    return "professional";
  }
  
  // Calculate total years of experience
  let totalYears = 0;
  const experiences = context.experiences;
  
  for (const exp of experiences) {
    const startDate = exp.startDate ? new Date(exp.startDate) : null;
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    
    if (startDate) {
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += durationYears;
    }
  }
  
  // Determine career stage based on years of experience
  if (totalYears < 1) {
    return "entry-level";
  } else if (totalYears < 3) {
    return "early-career";
  } else if (totalYears < 7) {
    return "mid-level";
  } else if (totalYears < 15) {
    return "senior";
  } else {
    return "executive";
  }
}

/**
 * Extract the user's skills from context
 */
function extractSkills(context: MuskContext): any[] {
  if (!context.skills || context.skills.length === 0) {
    return [];
  }
  
  return context.skills.map(skill => ({
    name: skill.name || "Unknown",
    category: (skill as any).category || "General",
    level: skill.level || "Intermediate"
  }));
}

/**
 * Extract work experiences from context
 */
function extractExperiences(context: MuskContext): any[] {
  if (!context.experiences || context.experiences.length === 0) {
    return [];
  }
  
  return context.experiences.map(exp => ({
    title: exp.title,
    company: exp.company,
    industry: exp.industry,
    startDate: exp.startDate,
    endDate: exp.endDate,
    description: exp.description
  }));
}

/**
 * Extract education from context
 */
function extractEducation(context: MuskContext): any[] {
  if (!context.educations || context.educations.length === 0) {
    return [];
  }
  
  return context.educations.map(edu => ({
    institution: edu.institution,
    degree: edu.degree,
    field: (edu as any).fieldOfStudy || "General Studies",
    startDate: edu.startDate,
    endDate: edu.endDate
  }));
}

/**
 * Generates an enhanced system prompt for OpenAI based on user context and intent
 */
function generateEnhancedPrompt(
  message: string, 
  intent: string, 
  careerProfile: any,
  context: MuskContext
): string {
  // Base personality and capabilities with improved prompt engineering based on Musk guidelines
  let prompt = `
# MUSK AI CAREER ASSISTANT SYSTEM PROMPT

## YOUR ROLE
You are Musk, a smart, empathetic AI career coach inside Brandentifier. 
Respond like a futuristic career coach who is empathetic, strategic, and forward-thinking.
Act as a wise AI mentor who gives confident, data-backed and user-centric advice.

## PERSONALITY & TONE
- Be supportive yet practical
- Communicate with confidence and clarity
- Show enthusiasm for the user's potential
- Be forward-thinking and trend-aware
- Balance empathy with strategic thinking

## USER PROFILE INFORMATION
- Name: ${careerProfile.name}
- Career Stage: ${careerProfile.careerStage}
- Industry: ${careerProfile.industry || "Unknown"}
- Domain: ${careerProfile.domain || "Unknown"}
- Location: ${careerProfile.location || "Unknown"}
- Looking For: ${careerProfile.lookingFor || "Career development opportunities"}

## SKILLS
${careerProfile.skills.length > 0 
  ? careerProfile.skills.map((s: any) => `- ${s.name} (${s.category || 'General'}, Level: ${s.level || 'Intermediate'})`).join('\n') 
  : "- No specific skills information available"}

## WORK EXPERIENCE
${careerProfile.experiences.length > 0 
  ? careerProfile.experiences.map((e: any) => 
    `- ${e.title} at ${e.company}, ${e.industry || 'Unknown industry'} (${formatDateRange(e.startDate, e.endDate)})`
  ).join('\n') 
  : "- No specific work experience information available"}

## EDUCATION
${careerProfile.education.length > 0 
  ? careerProfile.education.map((e: any) => 
    `- ${e.degree || 'Studied'} in ${e.field || 'Unknown field'} at ${e.institution} (${formatDateRange(e.startDate, e.endDate)})`
  ).join('\n') 
  : "- No specific education information available"}

## RESPONSE STRUCTURE
- Start with an insight or "⚡ Here's your personalized career guidance..."
- Provide actionable, specific advice (avoid generic phrases like "work hard")
- Break advice into phases when appropriate: short-term, medium-term, long-term
- Use bullet points for clear actions
- End with a supportive closing like "Ready to explore this path? You've got this. —Musk"

## QUALITY GUIDELINES
- Be specific, not generic
- Suggest resources only if they match the user's experience level and domain
- Avoid repetitive suggestions
- Consider it's 2025 when giving advice on trends and opportunities
- If the user's profile is incomplete, gently guide them to complete it first
`;

  // Add communication guidelines based on the 8 intelligence dimensions from the training roadmap
  prompt += `
YOUR GUIDANCE APPROACH (THE 8 INTELLIGENCE DIMENSIONS):

1. USER PERSONA UNDERSTANDING:
   - Tailor your advice to ${careerProfile.name}'s specific career stage: ${careerProfile.careerStage}
   - Consider their industry (${careerProfile.industry || "Unknown"}) and domain specialization
   - Factor in their location (${careerProfile.location || "Unspecified"}) and geographic preferences
   - Address their explicitly stated career goals: ${careerProfile.lookingFor || "Career development"}

2. SKILLS vs MARKET DEMAND MAPPING:
   - Identify gaps between their current skills and market requirements
   - Prioritize skill suggestions based on ROI and relevance to their goals
   - Suggest specific tools, technologies, or certifications that would enhance their profile
   - Consider both technical skills and soft skills in your recommendations

3. CAREER PATH INTELLIGENCE:
   - Suggest realistic next steps based on their experience and qualifications
   - Recommend alternative paths that leverage their transferable skills
   - Provide insights on common career transitions from their current position
   - Share approximate timeframes for career transitions when relevant

4. GLOBAL OPPORTUNITY AWARENESS:
   - Consider location-specific career dynamics in ${careerProfile.location || "their region"}
   - Highlight remote work opportunities when appropriate
   - Mention geographic hotspots for their industry or desired role
   - Address regional salary differences and cost of living considerations

5. PERSONALITY-TO-PROFESSION MAPPING:
   - Infer work preferences from their communication style and stated goals
   - Match their apparent interests and strengths to suitable roles
   - Suggest environments (startup, enterprise, freelance) that might fit their style
   - Recommend roles that align with their apparent values and priorities

6. TREND FORECASTING:
   - Highlight emerging roles and technologies in their industry
   - Identify skills with growing demand in their field
   - Reference industry shifts that could impact their career trajectory
   - Suggest how they can position themselves for future opportunities

7. USER FEEDBACK LOOP LEARNING:
   - Reference previous conversations when available
   - Adapt your guidance based on their engagement patterns
   - Build upon topics they've shown interest in previously
   - Progressively refine your understanding of their needs

8. EMOTIONAL INTELLIGENCE:
   - Acknowledge career challenges and anxiety when expressed
   - Be supportive and constructive while remaining honest
   - Recognize achievements and strengths to build confidence
   - Provide both encouragement and realistic expectations

FORMATTING:
- Use markdown formatting with headers (##, ###), bullet points, and emphasis when appropriate
- Use emojis strategically to enhance readability, not excessively
- For important points, use bold text
- Structure your response with clear sections
- Write in a professional but conversational tone
- Always provide specific, actionable advice

CURRENT USER INTENT: ${intent.toUpperCase()}

Remember, your goal is to provide personalized guidance that is directly relevant to ${careerProfile.name}'s background and goals. Be specific, practical, and empathetic.
`;

  // Add conversation memory if available to provide context continuity
  if (context.userMemory?.interactions && context.userMemory.interactions.length > 0) {
    const recentInteractions = context.userMemory.interactions
      .slice(-3) // Get last 3 interactions
      .map(interaction => `
USER: ${interaction.message || ""}
YOU: ${(interaction.response || "").substring(0, 150)}...
      `).join('\n');
    
    prompt += `
RECENT CONVERSATION HISTORY:
${recentInteractions}
`;
  }

  // Add intent-specific instructions based on the 8 intelligence dimensions
  switch (intent) {
    case "skill_development":
      prompt += `
# SKILL DEVELOPMENT INSTRUCTIONS

## Focus Areas:
- Analyze the gap between their current skills (${careerProfile.skills.map((s: any) => s.name).join(', ')}) and market requirements
- Suggest both technical and soft skills that would enhance their profile in ${careerProfile.industry || "their industry"}
- Prioritize recommendations based on ROI and market demand
- Consider their career stage (${careerProfile.careerStage}) when suggesting skill development paths

## Approach Style:
- Provide specific, actionable learning paths with estimated timeframes
- Suggest 2-3 high-priority skills they should develop next
- Recommend relevant learning platforms, certifications, or resources
- Connect skill recommendations to potential career outcomes
`;
      break;
      
    case "career_change":
      prompt += `
# CAREER TRANSITION GUIDANCE

## Focus Areas:
- Analyze their transferable skills from ${careerProfile.experiences.length > 0 ? careerProfile.experiences[0].title + ' at ' + careerProfile.experiences[0].company : "their current role"}
- Suggest realistic transition paths based on their background
- Identify skill gaps they'll need to address for the transition
- Estimate realistic timeframes for different transition scenarios

## Approach Style:
- Start with acknowledging the challenges of career transitions
- Frame career change as a strategic process with concrete steps
- Provide examples of successful transitions from similar backgrounds
- Include both immediate next steps and longer-term planning
`;
      break;
      
    case "resume_feedback":
      prompt += `
# RESUME ENHANCEMENT GUIDANCE

## Focus Areas:
- Focus on highlighting quantifiable achievements over responsibilities
- Suggest industry-specific keywords and power verbs for ${careerProfile.industry || "their industry"}
- Recommend structure and formatting that aligns with their career goals
- Address potential gaps or red flags in their experience

## Approach Style:
- Be constructive but honest about areas for improvement
- Provide specific examples of strong bullet points tailored to their experience
- Suggest ATS optimization strategies 
- Reference how their resume should position them for their next career step
`;
      break;
      
    case "global_opportunities":
      prompt += `
# LOCATION-BASED CAREER GUIDANCE

## Focus Areas:
- Analyze career opportunities specific to ${careerProfile.location || "their location"}
- Discuss remote work possibilities in their field
- Identify geographic hotspots for their industry or desired roles
- Compare career growth potential across different regions if relevant

## Approach Style:
- Be specific about location-based salary expectations and cost of living
- Discuss cultural workplace differences if relevant
- Highlight companies or sectors with strong presence in their region
- Include remote-friendly employers in their industry when appropriate
`;
      break;
      
    case "industry_trends":
      prompt += `
# INDUSTRY TREND ANALYSIS

## Focus Areas:
- Highlight emerging roles and technologies in ${careerProfile.industry || "their industry"}
- Identify skills with growing demand in their field
- Discuss industry shifts that could impact their career trajectory
- Suggest how they can position themselves for future opportunities

## Approach Style:
- Focus on practical, actionable insights rather than abstract predictions
- Connect trends directly to their career stage and background
- Prioritize near-term (1-3 year) trends over long-term speculation
- Include specific examples of how professionals are adapting to these trends
`;
      break;
      
    case "job_search":
      prompt += `
# JOB SEARCH STRATEGY GUIDANCE

## Focus Areas:
- Tailor job search tactics to their career stage and industry
- Suggest targeted companies and roles based on their background
- Discuss effective networking approaches for their field
- Provide strategies for standing out in application processes

## Approach Style:
- Be realistic about the current job market in their industry
- Emphasize quality of applications over quantity
- Include both traditional and creative job search methods
- Provide concrete next steps they can take immediately
`;
      break;
      
    case "interview_preparation":
      prompt += `
# INTERVIEW PREPARATION GUIDANCE

## Focus Areas:
- Suggest preparation strategies for common questions in their field
- Provide frameworks for discussing their experience effectively
- Help them address potential red flags or gaps
- Tailor advice to both technical and behavioral aspects

## Approach Style:
- Include specific example responses based on their background
- Suggest methods to demonstrate both technical and soft skills
- Address interview anxiety with practical preparation strategies
- Include guidance on follow-up and negotiation phases
`;
      break;
      
    case "salary_negotiation":
      prompt += `
# COMPENSATION NEGOTIATION GUIDANCE

## Focus Areas:
- Provide market-based salary insights for their role, experience and location
- Suggest negotiation tactics appropriate for their career stage
- Address total compensation beyond base salary
- Help them present their value proposition effectively

## Approach Style:
- Be data-driven about compensation ranges
- Emphasize professional, confident approaches to negotiation
- Include scripts or frameworks for different negotiation scenarios
- Address concerns about negotiation risks constructively
`;
      break;
      
    case "networking":
      prompt += `
# PROFESSIONAL NETWORKING GUIDANCE

## Focus Areas:
- Suggest networking approaches tailored to their industry and goals
- Provide strategies for meaningful connection building
- Address both online and in-person networking opportunities
- Help craft effective outreach and follow-up communications

## Approach Style:
- Focus on quality connections over quantity
- Include templates or scripts for different networking scenarios
- Emphasize authentic relationship building over transactional approaches
- Suggest specific professional groups or communities relevant to their field
`;
      break;
      
    default:
      prompt += `
# CAREER GUIDANCE APPROACH

## Focus Areas:
- Provide personalized advice based on their career stage, skills, and experiences
- Address both short-term steps and longer-term career vision
- Consider their specific industry, location, and stated goals
- Balance tactical advice with strategic career planning

## Approach Style:
- Be specific and actionable in your guidance
- Balance encouragement with realistic expectations
- Structure your response with clear, distinct recommendations
- End with concrete next steps they can take
`;
      break;
  }

  return prompt;
}

/**
 * Helper function to format date ranges for readability
 */
function formatDateRange(startDate: string | Date | null, endDate: string | Date | null): string {
  if (!startDate) return "Unknown timeframe";
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : null;
  
  const startStr = start.getFullYear().toString();
  const endStr = end ? end.getFullYear().toString() : "Present";
  
  return `${startStr} - ${endStr}`;
}

/**
 * Format AI response with personalization elements and follow-up questions
 */
function formatResponseWithPersonalization(response: string, context: MuskContext): string {
  let formattedResponse = response;
  
  // Add personal greeting if we have the user's name and it's not already included
  if (context.userData?.name && !response.includes(context.userData.name)) {
    const greeting = `Hi ${context.userData.name}, `;
    formattedResponse = greeting + response.charAt(0).toLowerCase() + response.slice(1);
  }
  
  // Make sure the response has the Musk signature ending if it doesn't already
  if (!formattedResponse.includes("Ready to explore") && !formattedResponse.includes("—Musk")) {
    formattedResponse += "\n\nReady to explore this path? You've got this. —Musk";
  }
  
  return formattedResponse;
}

/**
 * Generate appropriate follow-up questions based on user context and conversation
 * This helps Musk provide more targeted guidance and encourages continued interaction
 * Enhanced with Musk Prompt Library patterns
 */
function generateFollowUpQuestions(intent: string, context: MuskContext): string[] {
  const questions: string[] = [];
  
  // Common questions for any intent
  questions.push("Would you like more specific advice on any part of what I've shared?");
  
  // Intent-specific follow-up questions enhanced with Musk Prompt Library
  switch (intent) {
    case "skill_development":
      questions.push("Which of these skills interests you most to develop first?");
      questions.push("Would you like a skill-bridge roadmap, including online certifications and transition timeline?");
      questions.push("Would you prefer focusing on technical skills or leadership capabilities?");
      questions.push("How does your learning style work best - hands-on projects, courses, or mentorship?");
      questions.push("Are you interested in future-proof skills that will remain relevant over the next 5 years?");
      break;
      
    case "career_change":
      questions.push("What aspects of this career transition feel most challenging to you?");
      questions.push("Would you like a detailed skill-bridge roadmap for this career change?");
      questions.push("Would you like to hear about others who successfully made a similar transition?");
      questions.push("Are you looking for a complete industry switch or role evolution within your current field?");
      questions.push("What transferable skills from your current role do you value most?");
      break;
      
    case "resume_feedback":
      questions.push("Which section of your resume would you like me to focus on improving next?");
      questions.push("Would you like me to suggest 5 bullet points to enhance your 'About Me' section?");
      questions.push("Would you like examples of how to quantify your achievements for greater impact?");
      questions.push("Are you tailoring your resume for a specific role or industry?");
      questions.push("Would you like help making your resume more ATS-friendly for automated screening?");
      break;
      
    case "global_opportunities":
      questions.push("Are there specific regions or countries you're most interested in working?");
      questions.push("Would you like recommendations for remote job boards in your specific field?");
      questions.push("Would you prefer remote opportunities or are you open to relocation?");
      questions.push("Are visa and work permit considerations important in your decision?");
      questions.push("Would you like insights on cost of living and tech industry growth in different regions?");
      break;
      
    case "industry_trends":
      questions.push("Which of these emerging trends interests you most to explore further?");
      questions.push("Would you like to know the top 5 emerging job roles in your industry?");
      questions.push("Are you interested in how sustainability might impact career opportunities in your field?");
      questions.push("Would you like recommendations for future-proof roles in your domain?");
      questions.push("Which upcoming technology shifts do you think will most impact your career path?");
      break;
      
    case "job_search":
      questions.push("What part of the job search process is most challenging for you currently?");
      questions.push("Would you like strategies for standing out in competitive application processes?");
      questions.push("Have you been facing any specific obstacles in your job search?");
      questions.push("Would you like a strategic job search plan tailored to your industry?");
      questions.push("Are you interested in unconventional job search approaches beyond job boards?");
      break;
      
    case "interview_preparation":
      questions.push("What types of interviews are you preparing for (technical, behavioral, case)?");
      questions.push("Would you like sample answers for industry-specific questions in your field?");
      questions.push("Would you like preparation strategies for salary expectation questions?");
      questions.push("Are you comfortable with the STAR method for behavioral questions?");
      questions.push("Would you like help preparing for specific types of technical assessments?");
      break;
      
    case "salary_negotiation":
      questions.push("What stage of the negotiation process are you currently in?");
      questions.push("Have you researched current market rates for your role and experience level?");
      questions.push("Would you like scripts for how to respond to specific compensation scenarios?");
      questions.push("Would you like strategies for negotiating beyond just the base salary?");
      questions.push("Are you comfortable discussing your value and achievements during negotiations?");
      break;
      
    case "networking":
      questions.push("What networking approaches have been most effective for you so far?");
      questions.push("Would you like templates for outreach messages to industry professionals?");
      questions.push("Are you looking to network for a specific purpose (job hunting, mentorship, learning)?");
      questions.push("Would you like strategies for virtual networking in today's digital environment?");
      questions.push("Are you comfortable with informational interviews and how to request them?");
      break;
      
    default:
      questions.push("What specific aspect of your career would you like guidance on next?");
      questions.push("Is there a particular career challenge you're facing right now?");
      questions.push("Would you like advice on how to grow in your current role or explore new opportunities?");
      questions.push("Are you feeling burned out or confused about your next career steps?");
      questions.push("Would you like me to analyze your current profile and suggest growth areas?");
      break;
  }
  
  // Add contextual questions based on user profile if available
  if (context.userData?.industry) {
    questions.push(`How do you feel about the current state of the ${context.userData.industry} industry?`);
  }
  
  if (context.userData?.location) {
    const locationParts = context.userData.location.split(',');
    const city = locationParts[0]?.trim();
    if (city) {
      questions.push(`Are you interested in career opportunities specifically in ${city} or open to relocation?`);
    }
  }
  
  // Choose 2-3 questions from the list
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(3, shuffled.length));
}