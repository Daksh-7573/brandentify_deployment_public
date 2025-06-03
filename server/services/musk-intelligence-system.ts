/**
 * Musk Intelligence System - Local AI Version
 * Enhanced framework for Musk AI using local models instead of OpenAI
 */
import { User, WorkExperience, Education, Skill, Project } from "@shared/schema";
import { localAIService } from "./local-ai-service";

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
 * Generate personalized career advice using local AI models
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
      skillsCount: context.skills?.length || 0
    });

    // Determine user intent
    const intent = determineUserIntent(message, context);
    console.log(`Detected intent: ${intent}`);

    // Build user profile for local AI service
    const userProfile = {
      user: {
        name: context.userData?.name || "Professional",
        title: context.userData?.title,
        industry: context.userData?.industry,
        lookingFor: context.userData?.lookingFor
      },
      workExperiences: context.experiences || [],
      skills: (context.skills || []).map(skill => ({
        name: skill.name || "",
        proficiency: 80,
        level: skill.level
      })),
      educations: context.educations || [],
      adviceType: intent,
      customAdviceText: message
    };

    // Generate response using local AI service
    const aiResponse = await localAIService.generateCareerAdvice(userProfile);
    
    // Format response with personalization
    const finalResponse = formatResponseWithPersonalization(aiResponse, context);
    
    return finalResponse;
  } catch (error) {
    console.error("Error in Musk intelligence system:", error);
    return "I encountered an issue while processing your request. As your AI career assistant, I'll work on improving. Could you please try asking your question in a different way?";
  }
}

/**
 * Determine user intent from message content
 */
function determineUserIntent(message: string, context: MuskContext): string {
  const lowercaseMessage = message.toLowerCase();
  
  // Intent mapping based on keywords
  const intentMap = {
    career_growth: ["next step", "advance", "promotion", "grow", "progress"],
    skill_development: ["skills", "learn", "improve", "certification", "courses"],
    career_change: ["change career", "switch", "transition", "new field"],
    interview_prep: ["interview", "prepare", "questions", "assessment"],
    salary_negotiation: ["salary", "compensation", "negotiate", "raise"],
    networking: ["network", "connect", "linkedin", "contacts"],
    resume_feedback: ["resume", "cv", "profile", "application"]
  };

  // Find best matching intent
  let bestIntent = "career_advice";
  let maxMatches = 0;

  for (const [intent, keywords] of Object.entries(intentMap)) {
    const matches = keywords.filter(keyword => lowercaseMessage.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

/**
 * Format AI response with personalization
 */
function formatResponseWithPersonalization(response: string, context: MuskContext): string {
  let formattedResponse = response;

  // Add personalization based on user data
  if (context.userData?.name) {
    // Ensure response feels personal
    if (!formattedResponse.includes(context.userData.name)) {
      formattedResponse = `Hi ${context.userData.name}! ${formattedResponse}`;
    }
  }

  // Add context-specific formatting
  if (context.page && !formattedResponse.includes("follow-up")) {
    formattedResponse += "\n\nFeel free to ask any follow-up questions about your career development!";
  }

  return formattedResponse;
}

/**
 * Analyze user's career profile from available data
 */
function analyzeCareerProfile(context: MuskContext) {
  return {
    careerStage: determineCareerStage(context),
    primarySkills: extractPrimarySkills(context),
    industryExperience: extractIndustryExperience(context),
    educationLevel: extractEducationLevel(context),
    profileCompleteness: calculateProfileCompleteness(context)
  };
}

function determineCareerStage(context: MuskContext): string {
  const experienceCount = context.experiences?.length || 0;
  if (experienceCount === 0) return "entry_level";
  if (experienceCount <= 2) return "early_career";
  if (experienceCount <= 5) return "mid_career";
  return "senior_level";
}

function extractPrimarySkills(context: MuskContext): string[] {
  return (context.skills || [])
    .map(skill => skill.name)
    .filter(name => name)
    .slice(0, 5) as string[];
}

function extractIndustryExperience(context: MuskContext): string[] {
  const industries = new Set<string>();
  (context.experiences || []).forEach(exp => {
    if (exp.industry) industries.add(exp.industry);
  });
  return Array.from(industries);
}

function extractEducationLevel(context: MuskContext): string {
  const educations = context.educations || [];
  if (educations.some(edu => edu.degree?.toLowerCase().includes("phd"))) return "doctorate";
  if (educations.some(edu => edu.degree?.toLowerCase().includes("master"))) return "masters";
  if (educations.some(edu => edu.degree?.toLowerCase().includes("bachelor"))) return "bachelors";
  return "other";
}

function calculateProfileCompleteness(context: MuskContext): number {
  let score = 0;
  if (context.userData?.name) score += 20;
  if (context.userData?.title) score += 20;
  if ((context.experiences?.length || 0) > 0) score += 20;
  if ((context.skills?.length || 0) > 0) score += 20;
  if ((context.educations?.length || 0) > 0) score += 20;
  return score;
}