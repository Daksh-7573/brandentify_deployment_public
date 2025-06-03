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
  // Determine user intent first to ensure it's available in catch block
  const intent = determineUserIntent(message, context);
  console.log(`Detected intent: ${intent}`);

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
    
    // Provide contextual fallback responses based on available data and user intent
    return generateIntelligentFallback(message, context, intent);
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
  
  // Intent mapping based on keywords - more specific detection
  const intentMap = {
    networking: ["network", "connect", "networking", "linkedin", "contacts", "meet people", "professional connections"],
    skill_development: ["skills", "learn", "improve", "develop", "certification", "courses", "training", "abilities"],
    career_growth: ["career", "next step", "advance", "promotion", "grow", "progress", "growth", "development"],
    resume_feedback: ["resume", "cv", "profile", "application", "feedback", "review"],
    interview_prep: ["interview", "prepare", "questions", "assessment", "preparation"],
    salary_negotiation: ["salary", "compensation", "negotiate", "raise", "pay"],
    work_experience: ["experience", "work history", "job", "employment", "background"],
    industry_insights: ["industry", "market", "trends", "insights", "growing"]
  };

  // Find best matching intent with better scoring
  let bestIntent = "general";
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

/**
 * Generate intelligent fallback responses when AI services are unavailable
 */
function generateIntelligentFallback(message: string, context: MuskContext, intent: string): string {
  console.log(`[Fallback] Processing intent: "${intent}" for message: "${message.substring(0, 50)}..."`);
  
  const userName = context.userData?.name || "Professional";
  const userIdStr = context.userId?.toString();
  const hasResumeData = !!context.resumeData || !!(userIdStr && (global as any).resumeContexts?.[userIdStr]);
  const profileData = analyzeCareerProfile(context);
  
  console.log(`[Fallback] User: ${userName}, Intent: ${intent}, ProfileData:`, {
    careerStage: profileData.careerStage,
    skillsCount: profileData.primarySkills.length,
    completion: profileData.profileCompleteness
  });
  
  // Generate contextual quick responses
  const quickResponses = generateContextualQuickResponses(context);
  
  // Intent-based fallback responses
  switch (intent) {
    case 'networking':
      return `# Networking Guidance

Hello ${userName}! I can help you improve your networking strategy based on your profile.

**Key Networking Approaches:**
- Join professional associations in your industry
- Attend virtual and in-person industry events
- Engage meaningfully on LinkedIn with industry leaders
- Reach out to alumni from your educational background
- Participate in relevant online communities and forums

**Your Profile Strengths for Networking:**
${profileData.careerStage === 'entry_level' ? '- Fresh perspective and eagerness to learn' : '- Professional experience to share insights'}
${profileData.primarySkills.length > 0 ? `- Technical expertise in: ${profileData.primarySkills.slice(0,3).join(', ')}` : '- Developing skill set'}
${profileData.industryExperience.length > 0 ? `- Industry knowledge in ${profileData.industryExperience.join(', ')}` : '- Open to diverse industry connections'}

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;

    case 'career_growth':
      return `# Career Growth Strategy

Hi ${userName}! Based on your profile (${profileData.profileCompleteness}% complete), here's targeted growth advice:

**Immediate Growth Actions:**
- Identify 2-3 key skills to develop in your field
- Seek mentorship from senior professionals
- Document and quantify your current achievements
- Set specific, measurable career milestones

**Based on Your Career Stage (${profileData.careerStage}):**
${profileData.careerStage === 'entry_level' ? '- Focus on building core competencies and gaining diverse experience' : ''}
${profileData.careerStage === 'mid_career' ? '- Consider leadership opportunities and specialization' : ''}
${profileData.careerStage === 'senior_level' ? '- Explore strategic roles and mentoring opportunities' : ''}

${hasResumeData ? '**I notice you have resume data available. I can provide specific insights about your work experience once my analysis services are restored.**' : ''}

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;

    case 'skill_development':
      console.log(`[Fallback] Generating skill_development response for ${userName}`);
      const skillResponse = `# Skill Development Plan

Hello ${userName}! Let me help you enhance your skillset strategically.

**Current Skills Assessment:**
${profileData.primarySkills.length > 0 ? `- Existing strengths: ${profileData.primarySkills.join(', ')}` : '- Ready to build foundational skills'}
- Profile completion: ${profileData.profileCompleteness}%

**Skill Development Strategy:**
- Identify in-demand skills in your target industry
- Choose learning methods that fit your schedule (online courses, bootcamps, certifications)
- Practice skills through projects and real-world applications
- Build a portfolio showcasing your new capabilities

**Next Steps:**
- Research job descriptions in your field to identify skill gaps
- Set aside dedicated time weekly for skill development
- Connect with professionals who have the skills you want to develop

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;
      console.log(`[Fallback] Returning skill_development response: ${skillResponse.substring(0, 100)}...`);
      return skillResponse;

    case 'resume_feedback':
      if (hasResumeData) {
        return `# Resume Analysis

Hello ${userName}! I can see you have resume data uploaded. Once my detailed analysis services are restored, I'll provide specific feedback on:

**Resume Analysis Areas:**
- Achievement quantification and impact statements
- Skills alignment with target roles
- Professional experience presentation
- Industry-specific terminology optimization

**General Resume Best Practices:**
- Use action verbs and quantifiable results
- Tailor content for each application
- Keep formatting clean and professional
- Include relevant keywords for ATS systems

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;
      } else {
        return `# Resume Improvement Guide

Hi ${userName}! I can help you create a compelling resume.

**Key Resume Elements:**
- Strong professional summary highlighting your value
- Quantified achievements rather than job duties
- Relevant skills section with proficiency levels
- Clean, readable formatting with consistent styling

**Getting Started:**
- Upload your current resume for detailed analysis
- Or start building your profile with work experiences
- Focus on accomplishments over responsibilities

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;
      }

    case 'interview_prep':
      return `# Interview Preparation Guide

Hi ${userName}! Let me help you prepare for successful interviews.

**Interview Preparation Strategy:**
- Research the company's mission, values, and recent news
- Practice STAR method (Situation, Task, Action, Result) for behavioral questions
- Prepare specific examples that demonstrate your skills
- Review common questions for your industry and role level

**Based on Your Profile:**
${profileData.careerStage === 'entry_level' ? '- Focus on academic projects, internships, and enthusiasm to learn' : '- Emphasize your professional achievements and leadership experience'}
${profileData.primarySkills.length > 0 ? `- Prepare technical questions about: ${profileData.primarySkills.slice(0,3).join(', ')}` : '- Be ready to discuss your learning goals and adaptability'}

**Mock Interview Topics:**
- "Tell me about yourself" - craft a compelling 2-minute summary
- "Why do you want this role?" - connect your goals to the opportunity
- "Describe a challenge you overcame" - use specific examples

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;

    case 'industry_insights':
      return `# Industry Insights & Market Trends

Hello ${userName}! Here are current market insights to guide your career decisions.

**Growing Industries & Trends:**
- Technology: AI/ML, Cybersecurity, Cloud Computing, Data Science
- Healthcare: Digital Health, Biotechnology, Elderly Care
- Sustainability: Renewable Energy, Environmental Consulting
- Finance: FinTech, Digital Banking, Cryptocurrency

**Skills in High Demand:**
- Digital literacy and data analysis
- Project management and agile methodologies
- Communication and remote collaboration
- Problem-solving and critical thinking

**Career Strategy Tips:**
- Stay updated with industry publications and thought leaders
- Attend virtual conferences and webinars
- Build skills that complement automation rather than compete with it
- Network with professionals in target industries

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;

    case 'work_experience':
      if (hasResumeData) {
        return `# Work Experience Analysis

Hello ${userName}! I can see you have resume data available for analysis.

**Experience Enhancement Areas:**
- Quantify achievements with specific metrics and numbers
- Highlight leadership and collaboration experiences
- Showcase problem-solving and innovation
- Demonstrate career progression and skill development

**Current Profile Data:**
- Experience entries: ${profileData.primarySkills.length > 0 ? 'Available for analysis' : 'Ready to be added'}
- Skills demonstrated: ${profileData.primarySkills.length > 0 ? profileData.primarySkills.slice(0,3).join(', ') : 'To be identified from experiences'}

**Next Steps:**
- Review and optimize existing experience descriptions
- Add missing roles or responsibilities
- Focus on impact and results rather than just duties

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;
      } else {
        return `# Building Your Work Experience Profile

Hi ${userName}! Let's develop a strong work experience section.

**Experience Documentation Strategy:**
- Start with your most recent or relevant positions
- For each role, include company, title, dates, and key achievements
- Use action verbs and quantify results where possible
- Show progression and increasing responsibility

**What to Include:**
- Full-time and part-time employment
- Internships and co-op programs
- Freelance or contract work
- Volunteer leadership roles

**Getting Started:**
- Add your work experiences to your profile
- Or upload your resume for comprehensive analysis
- Focus on accomplishments that demonstrate your value

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;
      }

    default:
      return `# Career Guidance

Hello ${userName}! I'm here to help with your professional development.

**Your Profile Overview:**
- Career Stage: ${profileData.careerStage.replace('_', ' ')}
- Profile Completion: ${profileData.profileCompleteness}%
${profileData.primarySkills.length > 0 ? `- Key Skills: ${profileData.primarySkills.slice(0,3).join(', ')}` : ''}
${hasResumeData ? '- Resume data available for analysis' : ''}

**I can assist you with:**
- Career strategy and growth planning
- Resume optimization and feedback
- Skill development recommendations
- Networking strategies
- Interview preparation

Quick Response Options: ${quickResponses.map(r => `"${r}"`).join(", ")}`;
  }
}