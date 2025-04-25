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

    // Analyze user's career profile from all available sources
    const careerProfile = analyzeCareerProfile(context);
    
    // Determine user intent from the message
    const intent = await determineUserIntent(message, context);
    
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
    
    // Extract and format the response
    const aiResponse = response.choices[0].message.content || 
      "I apologize, but I'm unable to process your request right now. Please try again later.";
    
    return formatResponseWithPersonalization(aiResponse, context);
  } catch (error) {
    console.error("Error in Musk intelligence system:", error);
    return "I encountered an issue while processing your request. As your AI career assistant, I'll work on improving. Could you please try asking your question in a different way?";
  }
}

/**
 * Determines the user's intent from their message to guide response generation
 */
async function determineUserIntent(message: string, context: MuskContext): Promise<string> {
  try {
    // Common career-related intents
    const intents = [
      "career_advice",
      "skill_development",
      "resume_feedback",
      "job_search",
      "networking",
      "education_advice",
      "industry_trends",
      "salary_negotiation",
      "work_life_balance",
      "personal_branding",
      "interview_preparation",
      "career_change",
      "entrepreneurship",
      "freelancing_advice",
      "remote_work",
      "professional_development",
      "leadership_development",
      "technical_question"
    ];
    
    // Basic intent detection through keywords
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes("resume") || lowercaseMessage.includes("cv")) {
      return "resume_feedback";
    } else if (lowercaseMessage.includes("skill") || lowercaseMessage.includes("learn")) {
      return "skill_development";
    } else if (lowercaseMessage.includes("job") || lowercaseMessage.includes("position") || lowercaseMessage.includes("apply")) {
      return "job_search";
    } else if (lowercaseMessage.includes("salary") || lowercaseMessage.includes("compensation") || lowercaseMessage.includes("negotiate")) {
      return "salary_negotiation";
    } else if (lowercaseMessage.includes("network") || lowercaseMessage.includes("connect")) {
      return "networking";
    } else if (lowercaseMessage.includes("interview") || lowercaseMessage.includes("question")) {
      return "interview_preparation";
    } else if (lowercaseMessage.includes("change") || lowercaseMessage.includes("switch") || lowercaseMessage.includes("transition")) {
      return "career_change";
    } else if (lowercaseMessage.includes("trend") || lowercaseMessage.includes("future") || lowercaseMessage.includes("emerging")) {
      return "industry_trends";
    } else if (lowercaseMessage.includes("advice") || lowercaseMessage.includes("tip") || lowercaseMessage.includes("suggest")) {
      return "career_advice";
    }
    
    // Default to general career advice if no specific intent detected
    return "career_advice";
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
  // Base personality and capabilities
  let prompt = `
You are Musk, an advanced AI career coach and professional development assistant. 
Your purpose is to provide personalized, actionable career guidance based on the user's specific 
profile, experiences, and goals.

USER PROFILE INFORMATION:
- Name: ${careerProfile.name}
- Career Stage: ${careerProfile.careerStage}
- Industry: ${careerProfile.industry || "Unknown"}
- Domain: ${careerProfile.domain || "Unknown"}
- Location: ${careerProfile.location || "Unknown"}
- Looking For: ${careerProfile.lookingFor || "Career development opportunities"}

SKILLS:
${careerProfile.skills.length > 0 
  ? careerProfile.skills.map((s: any) => `- ${s.name} (${s.category || 'General'}, Level: ${s.level || 'Intermediate'})`).join('\n') 
  : "- No specific skills information available"}

WORK EXPERIENCE:
${careerProfile.experiences.length > 0 
  ? careerProfile.experiences.map((e: any) => 
    `- ${e.title} at ${e.company}, ${e.industry || 'Unknown industry'} (${formatDateRange(e.startDate, e.endDate)})`
  ).join('\n') 
  : "- No specific work experience information available"}

EDUCATION:
${careerProfile.education.length > 0 
  ? careerProfile.education.map((e: any) => 
    `- ${e.degree || 'Studied'} in ${e.field || 'Unknown field'} at ${e.institution} (${formatDateRange(e.startDate, e.endDate)})`
  ).join('\n') 
  : "- No specific education information available"}
`;

  // Add communication guidelines based on the 8 intelligence dimensions
  prompt += `
YOUR GUIDANCE APPROACH:
1. USER PERSONA UNDERSTANDING: Tailor your advice to the user's career stage, skills, and aspirations.
2. SKILLS vs MARKET DEMAND: Connect their current skills to market demand, suggesting improvements.
3. CAREER PATH INTELLIGENCE: Recommend realistic career paths based on their background.
4. GLOBAL OPPORTUNITY AWARENESS: Consider location-specific advice when relevant.
5. PERSONALITY-TO-PROFESSION MAPPING: Match their interests and work style to suitable roles.
6. TREND FORECASTING: Include emerging trends and roles they might consider.
7. USER FEEDBACK LEARNING: Adapt based on the conversation context.
8. EMOTIONAL INTELLIGENCE: Respond with empathy to career challenges and anxiety.

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

  // Add intent-specific instructions
  switch (intent) {
    case "skill_development":
      prompt += `
For SKILL DEVELOPMENT requests:
- Focus on the skills the user already has (${careerProfile.skills.map((s: any) => s.name).join(', ')})
- Suggest new skills based on their career stage and industry trends
- Prioritize recommendations based on market demand
- Mention specific resources or courses when appropriate
`;
      break;
      
    case "career_change":
      prompt += `
For CAREER CHANGE guidance:
- Analyze transferable skills from their current role/industry
- Suggest realistic transition paths based on their experience
- Highlight skill gaps they'll need to address
- Provide concrete steps to make the transition
`;
      break;
      
    case "resume_feedback":
      prompt += `
For RESUME FEEDBACK:
- Focus on highlighting achievements over responsibilities
- Suggest industry-specific keywords to include
- Recommend structure and formatting that matches their career level
- Provide specific examples of strong bullet points based on their background
`;
      break;
      
    // Add more intent-specific instructions as needed
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
 * Format AI response with personalization elements
 */
function formatResponseWithPersonalization(response: string, context: MuskContext): string {
  // Add personal greeting if we have the user's name
  if (context.userData?.name && !response.includes(context.userData.name)) {
    const greeting = `Hi ${context.userData.name}, `;
    return greeting + response.charAt(0).toLowerCase() + response.slice(1);
  }
  
  return response;
}