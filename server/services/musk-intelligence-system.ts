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
 * Generate contextual quick response options based on available data
 */
export function generateContextualQuickResponses(context: MuskContext): string[] {
  const responses: string[] = [];
  
  // Check if resume data is available
  const userIdStr = context.userId?.toString();
  const hasResumeData = !!context.resumeData || !!(userIdStr && (global as any).resumeContexts?.[userIdStr]);
  
  if (hasResumeData) {
    // Resume-specific quick responses
    responses.push("What about my work experiences?");
    responses.push("How can I improve my resume?");
    responses.push("What skills should I highlight?");
  } else {
    // General career quick responses when no resume data
    responses.push("Tell me more about my career options");
    responses.push("How can I improve my skills?");
    responses.push("What industries are growing?");
  }
  
  // Add context-specific responses based on user profile
  if (context.userData?.industry) {
    responses.push(`What's trending in ${context.userData.industry}?`);
  }
  
  if (context.experiences && context.experiences.length > 0) {
    responses.push("How can I leverage my experience?");
  }
  
  if (context.skills && context.skills.length > 0) {
    responses.push("Which of my skills are most valuable?");
  }
  
  // Limit to 3-4 most relevant responses
  return responses.slice(0, 4);
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

    // Check for work experience questions when resume data exists
    if (message.toLowerCase().includes("work experience") || 
        message.toLowerCase().includes("what about my work") ||
        message.toLowerCase().includes("my experience")) {
      
      const userIdStr = context.userId?.toString();
      const hasResumeData = !!context.resumeData || !!(userIdStr && (global as any).resumeContexts?.[userIdStr]);
      
      if (hasResumeData && userIdStr) {
        const resumeContext = (global as any).resumeContexts?.[userIdStr];
        if (resumeContext) {
          return await handleWorkExperienceQuery(resumeContext, context);
        }
      }
      
      // If no resume data, provide helpful guidance
      if (context.experiences && context.experiences.length > 0) {
        return formatWorkExperienceFromProfile(context.experiences, context.userData?.name || "Professional");
      } else {
        return `I'd love to help you analyze your work experiences! To provide the most accurate insights, I'll need to review your resume or have you add your work experiences to your profile.

**Here's what I can help you with once I have your work experience data:**
- Identify your strongest achievements and quantifiable results
- Suggest ways to better highlight your impact and contributions
- Recommend skills to emphasize based on your experience
- Provide industry-specific advice for your background

**Quick ways to get started:**
- Upload your resume for detailed analysis
- Add your work experiences to your profile
- Tell me about a specific role you'd like to discuss

Quick Response Options: "How do I upload my resume?", "What should I include in work experience?", "Help me describe my achievements"`;
      }
    }

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
    
    // Format response with personalization and contextual quick responses
    const finalResponse = formatResponseWithPersonalization(aiResponse, context);
    
    return finalResponse;
  } catch (error) {
    console.error("Error in Musk intelligence system:", error);
    return "I encountered an issue while processing your request. As your AI career assistant, I'll work on improving. Could you please try asking your question in a different way?";
  }
}

/**
 * Handle work experience queries using resume data
 */
async function handleWorkExperienceQuery(resumeContext: any, context: MuskContext): Promise<string> {
  const userName = context.userData?.name || "Professional";
  
  try {
    // Use local AI to analyze the work experience from resume
    const analysisPrompt = `Analyze the work experiences from this resume and provide insights:

Resume Text: ${resumeContext.resumeText}

Please focus on:
1. Key achievements and quantifiable results
2. Career progression and growth patterns
3. Skills demonstrated through experience
4. Industry expertise developed
5. Leadership and impact indicators

Provide actionable advice for improving how these experiences are presented.`;

    const analysis = await localAIService.generateCareerAdvice({
      user: { name: userName },
      workExperiences: [],
      skills: [],
      educations: [],
      adviceType: 'work_experience_analysis',
      customAdviceText: analysisPrompt
    });

    return `# Your Work Experience Analysis

Hello ${userName}! I've reviewed your work experiences from your resume. Here's what I found:

${analysis}

**Next Steps:**
- Consider quantifying more of your achievements with specific metrics
- Highlight leadership and initiative-taking examples
- Align your experience descriptions with your target role requirements

Quick Response Options: "How can I quantify my achievements?", "What skills should I emphasize?", "Help me improve my job descriptions"`;

  } catch (error) {
    console.error("Error analyzing work experience:", error);
    return `I found your work experience data but encountered an issue analyzing it in detail. Based on your resume, I can see you have valuable professional experience.

**To provide better insights, I'd like to help you:**
- Identify your strongest achievements and results
- Suggest ways to highlight your impact and contributions
- Recommend skills to emphasize based on your background

Quick Response Options: "Help me describe my achievements", "What makes experience stand out?", "How do I show career growth?"`;
  }
}

/**
 * Format work experience from user profile data
 */
function formatWorkExperienceFromProfile(experiences: Partial<any>[], userName: string): string {
  const experienceCount = experiences.length;
  
  return `# Your Work Experience Overview

Hello ${userName}! I can see you have ${experienceCount} work experience${experienceCount > 1 ? 's' : ''} in your profile.

**Based on your profile data, here's what I can help you with:**

✅ **Experience Optimization**
- Review how your roles are described
- Identify achievement patterns across positions
- Suggest industry-specific terminology

✅ **Career Progression Analysis**
- Analyze your growth trajectory
- Identify transferable skills
- Highlight leadership development

✅ **Impact Enhancement**
- Add quantifiable metrics to your achievements
- Emphasize results and outcomes
- Showcase problem-solving abilities

**Would you like me to analyze specific aspects of your experience or help you improve how you present them?**

Quick Response Options: "Analyze my career progression", "Help me quantify achievements", "What skills do I showcase?"`;
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
 * Format AI response with personalization and contextual quick responses
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

  // Generate contextual quick responses
  const quickResponses = generateContextualQuickResponses(context);
  
  // Add contextual quick responses if not already present
  if (!formattedResponse.includes("Quick Response Options:")) {
    formattedResponse += `\n\nQuick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;
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