import { localAIService } from "./local-ai-service";

// Cache for hashtag suggestions to minimize API calls
const hashtagSuggestionCache = new Map<string, { suggestions: string[], timestamp: number }>();
const HASHTAG_CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Generate career advice based on user profile information and specific advice type
 * @param userProfile User profile data with career-related information
 * @returns Career advice tailored to the user's profile
 */
export async function generateCareerAdvice(userProfile: {
  name: string;
  title?: string;
  lookingFor?: string;
  industry?: string;
  domain?: string;
  location?: string;
  skills?: Array<{ name: string; proficiency: number; level?: string }>;
  experiences?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    domain?: string;
    keyResponsibilities?: string[];
  }>;
  educations?: Array<{
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
  }>;
  projects?: Array<{
    title: string;
    description?: string;
    category?: string;
    startDate: string;
    endDate?: string;
  }>;
  adviceType?: 'career_growth' | 'industry_switch' | 'skill_development' | 'interview_prep' | 'networking' | string;
}) {
  // Define system prompts based on the advice type
  const systemPrompts: Record<string, string> = {
    career_growth: `You are Musk, an expert AI Career Coach focused on helping professionals advance in their current field. Analyze the user's profile to recommend strategic next steps, potential promotions, and ways to position themselves for growth. Focus on tangible actions they can take in the next 3-12 months.`,
    
    industry_switch: `You are Musk, an expert AI Career Transition Coach. Help the user navigate switching to a new industry by identifying transferable skills, potential entry points, and skills gaps they need to fill. Be specific about realistic transition paths based on their experience.`,
    
    skill_development: `You are Musk, an expert AI Skills Development Coach. Analyze the user's profile to identify critical skills they should develop to remain competitive and advance in their field. Recommend specific courses, certifications, or learning paths that are highly valued in their industry.`,
    
    interview_prep: `You are Musk, an expert AI Interview Coach. Based on the user's profile, provide tailored interview preparation advice including likely questions, how to position their experience, and ways to demonstrate their unique value. Focus on helping them tell compelling stories about their achievements.`,
    
    networking: `You are Musk, an expert AI Networking Coach. Help the user expand their professional network strategically. Provide specific approaches to connect with relevant professionals, suggest industry groups or events aligned with their goals, and offer templates for outreach messages.`
  };

  // Default to career growth if no specific type is provided
  const adviceType = userProfile.adviceType || 'career_growth';
  const systemPrompt = systemPrompts[adviceType] || systemPrompts.career_growth;

  // Create a prompt summarizing the user's profile
  let userProfileSummary = `Name: ${userProfile.name}\n`;
  if (userProfile.title) userProfileSummary += `Current Title: ${userProfile.title}\n`;
  if (userProfile.industry) userProfileSummary += `Industry: ${userProfile.industry}\n`;
  if (userProfile.domain) userProfileSummary += `Domain: ${userProfile.domain}\n`;
  if (userProfile.location) userProfileSummary += `Location: ${userProfile.location}\n`;
  if (userProfile.lookingFor) userProfileSummary += `Looking For: ${userProfile.lookingFor}\n`;

  // Add skills information
  if (userProfile.skills && userProfile.skills.length > 0) {
    userProfileSummary += '\nSkills:\n';
    userProfile.skills.forEach(skill => {
      userProfileSummary += `- ${skill.name}${skill.level ? ` (${skill.level})` : ''}\n`;
    });
  }

  // Add work experience
  if (userProfile.experiences && userProfile.experiences.length > 0) {
    userProfileSummary += '\nWork Experience:\n';
    userProfile.experiences.forEach(exp => {
      userProfileSummary += `- ${exp.title} at ${exp.company} (${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'})\n`;
      if (exp.domain) userProfileSummary += `  Domain: ${exp.domain}\n`;
      if (exp.keyResponsibilities && exp.keyResponsibilities.length > 0) {
        userProfileSummary += '  Key Responsibilities:\n';
        exp.keyResponsibilities.forEach(resp => {
          userProfileSummary += `  - ${resp}\n`;
        });
      }
    });
  }

  // Add education
  if (userProfile.educations && userProfile.educations.length > 0) {
    userProfileSummary += '\nEducation:\n';
    userProfile.educations.forEach(edu => {
      userProfileSummary += `- ${edu.degree} in ${edu.fieldOfStudy || 'N/A'} from ${edu.institution} (${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : 'Present'})\n`;
    });
  }

  // Add projects if available
  if (userProfile.projects && userProfile.projects.length > 0) {
    userProfileSummary += '\nProjects:\n';
    userProfile.projects.forEach(project => {
      userProfileSummary += `- ${project.title}${project.category ? ` (${project.category})` : ''}\n`;
      if (project.description) userProfileSummary += `  Description: ${project.description}\n`;
    });
  }

  const userPrompt = `Based on my profile information below, I'm seeking ${adviceType.replace('_', ' ')} advice:\n\n${userProfileSummary}`;

  try {
    // Use local AI service instead of OpenAI
    const response = await localAIService.generateCareerAdvice({
      user: {
        name: userProfile.name,
        title: userProfile.title,
        industry: userProfile.industry,
        lookingFor: userProfile.lookingFor
      },
      workExperiences: userProfile.experiences || [],
      skills: userProfile.skills || [],
      educations: userProfile.educations || [],
      adviceType: adviceType,
      customAdviceText: userPrompt
    });
    
    return {
      advice: response,
      nextSteps: extractNextSteps(response),
    };
  } catch (error: unknown) {
    console.error('Error generating career advice with Local AI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate career advice: ${errorMessage}`);
  }
}

/**
 * Analyze a resume to extract professional insights
 * @param options Resume text or options including the text
 * @returns Analysis and recommendations based on the resume
 */
export async function analyzeResume(options: { resumeText: string } | string) {
  const resumeText = typeof options === 'string' ? options : options.resumeText;

  const systemPrompt = `You are Musk, an expert AI Career Assistant specialized in deep resume analysis. 
Your task is to analyze the provided resume and provide comprehensive insights, organized in the following sections:

1. FIRST IMPRESSION OVERVIEW: Briefly summarize the key highlights of the resume and the immediate impression it makes.

2. STRENGTHS ASSESSMENT: Identify 3-5 clear strengths evident in the resume, with specific examples from the content.

3. IMPROVEMENT RECOMMENDATIONS: Suggest 3-5 concrete improvements the person could make to their resume, with specific examples or rewrites of sections.

4. SKILL ANALYSIS: List the technical and soft skills identified in the resume, noting any potential skill gaps based on the person's career path.

5. CAREER TRAJECTORY INSIGHTS: Based on the resume, provide insights on the person's career path so far and potential future directions that would leverage their experience.

6. FOLLOW-UP QUESTIONS: List 2-3 questions you would ask to better understand areas that aren't clear from the resume.

Always be constructive and actionable in your feedback. Focus on helping the person improve their professional presentation and career potential.`;

  try {
    // Use local AI service instead of OpenAI
    const response = await localAIService.analyzeResume(resumeText);
    
    return {
      analysis: response,
      sections: extractAnalysisSections(response),
    };
  } catch (error: unknown) {
    console.error('Error analyzing resume with Local AI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to analyze resume: ${errorMessage}`);
  }
}

/**
 * Generate personalized networking recommendations
 * @param userProfile User profile data with career information
 * @param targetIndustry Optional target industry for networking
 * @param purpose Optional purpose of networking (e.g., job search, mentorship)
 * @returns Tailored networking recommendations
 */
/**
 * Generate hashtag suggestions based on user's industry, followed hashtags, and usage history
 * @param options User profile data and hashtag preferences
 * @returns Array of relevant hashtag suggestions
 */
export async function suggestHashtags(options: {
  industry?: string;
  domain?: string;
  followedHashtags?: string[];
  previouslyUsedHashtags?: string[];
  contentContext?: string;
  count?: number;
}) {
  // Create a cache key based on the inputs
  const cacheKey = JSON.stringify({
    industry: options.industry || '',
    domain: options.domain || '',
    followedHashtags: options.followedHashtags || [],
    contentContext: options.contentContext?.slice(0, 100) || '', // Use first 100 chars of context for cache key
  });
  
  // Check cache to avoid unnecessary API calls
  const cachedResult = hashtagSuggestionCache.get(cacheKey);
  if (cachedResult && (Date.now() - cachedResult.timestamp < HASHTAG_CACHE_TTL)) {
    return { hashtags: cachedResult.suggestions };
  }
  
  const count = options.count || 10;
  
  // Prepare the information for the prompt
  let contextInfo = '';
  if (options.industry) contextInfo += `Industry: ${options.industry}\n`;
  if (options.domain) contextInfo += `Domain: ${options.domain}\n`;
  
  if (options.followedHashtags && options.followedHashtags.length > 0) {
    contextInfo += `Followed hashtags: ${options.followedHashtags.join(', ')}\n`;
  }
  
  if (options.previouslyUsedHashtags && options.previouslyUsedHashtags.length > 0) {
    contextInfo += `Previously used hashtags: ${options.previouslyUsedHashtags.join(', ')}\n`;
  }
  
  if (options.contentContext) {
    contextInfo += `Content context: ${options.contentContext}\n`;
  }
  
  const systemPrompt = `You are Musk, an AI assistant that suggests relevant hashtags for professionals to use in their posts. 
Suggest ${count} hashtags that are:
1. Relevant to the user's industry and domain
2. Consistent with hashtags they've used before or followed
3. Professional and appropriate for career content
4. A mix of popular and niche tags to maximize reach
5. Format as a JSON array with ONLY hashtag strings (include the # symbol)`;

  const userPrompt = `Based on the following information, suggest ${count} relevant professional hashtags:\n\n${contextInfo}`;

  try {
    // Use local AI service instead of OpenAI
    const hashtags = await localAIService.suggestHashtags({
      industry: options.industry,
      domain: options.domain,
      content: options.contentContext,
      platform: "LinkedIn" // Default platform
    });
    
    // Cache the results
    hashtagSuggestionCache.set(cacheKey, {
      suggestions: hashtags,
      timestamp: Date.now()
    });
    
    return { hashtags };
  } catch (error: unknown) {
    console.error('Error generating hashtag suggestions with Local AI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate hashtag suggestions: ${errorMessage}`);
  }
}

export async function generateNetworkingRecommendations(
  userProfile: {
    name: string;
    title?: string;
    industry?: string;
    domain?: string;
    location?: string;
    skills?: Array<{ name: string; level?: string }>;
    lookingFor?: string;
  },
  targetIndustry?: string,
  purpose?: string
) {
  // Create profile summary
  let profileSummary = `Name: ${userProfile.name}\n`;
  if (userProfile.title) profileSummary += `Title: ${userProfile.title}\n`;
  if (userProfile.industry) profileSummary += `Current Industry: ${userProfile.industry}\n`;
  if (userProfile.domain) profileSummary += `Domain: ${userProfile.domain}\n`;
  if (userProfile.location) profileSummary += `Location: ${userProfile.location}\n`;
  if (userProfile.lookingFor) profileSummary += `Looking For: ${userProfile.lookingFor}\n`;

  // Add skills if available
  if (userProfile.skills && userProfile.skills.length > 0) {
    profileSummary += '\nKey Skills:\n';
    userProfile.skills.forEach(skill => {
      profileSummary += `- ${skill.name}${skill.level ? ` (${skill.level})` : ''}\n`;
    });
  }

  const systemPrompt = `You are Musk, an expert AI Networking Advisor who helps professionals connect strategically to advance their careers. 
Provide detailed, actionable networking recommendations based on the user's profile and goals. Include:

1. STRATEGIC APPROACH: Overall networking strategy tailored to their specific situation
2. PLATFORM RECOMMENDATIONS: Where specifically they should focus networking efforts (LinkedIn, events, associations, etc.)
3. OUTREACH TEMPLATES: 1-2 customized message templates they can use to initiate connections
4. TARGET CONNECTIONS: Types of professionals they should prioritize connecting with
5. CONVERSATION STARTERS: Specific icebreakers and talking points relevant to their industry

Your advice should be personalized, specific, and immediately actionable.`;

  let userPrompt = `I'm looking for strategic networking advice based on my professional profile below:

${profileSummary}`;

  if (targetIndustry) {
    userPrompt += `\nI'm particularly interested in networking with professionals in the ${targetIndustry} industry.`;
  }

  if (purpose) {
    userPrompt += `\nMy main purpose for networking is: ${purpose}`;
  }

  try {
    // Use local AI service to generate networking recommendations
    const response = await localAIService.generateCareerAdvice({
      user: {
        name: userProfile.name,
        title: userProfile.title,
        industry: userProfile.industry || targetIndustry,
        lookingFor: purpose
      },
      workExperiences: userProfile.experiences || [],
      skills: userProfile.skills || [],
      educations: userProfile.educations || [],
      adviceType: "networking",
      customAdviceText: userPrompt
    });
    
    return {
      recommendations: response,
      sections: extractNetworkingSections(response),
    };
  } catch (error: unknown) {
    console.error('Error generating networking recommendations with Local AI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate networking recommendations: ${errorMessage}`);
  }
}

// Helper to format dates in a readable format
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (e) {
    return dateString; // Return as-is if parsing fails
  }
}

// Helper to extract next steps from generated career advice
function extractNextSteps(text: string): string[] {
  // Look for sections that might contain next steps
  const nextStepsRegex = /(?:next steps|action items|recommended actions|what to do next)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\*\*|$)/i;
  const match = text.match(nextStepsRegex);
  
  if (match && match[1]) {
    // Extract bullet points or numbered items
    const stepsText = match[1].trim();
    const steps = stepsText
      .split(/\n(?:[-•*]|\d+\.)\s+/)
      .filter(step => step.trim().length > 0)
      .map(step => step.trim());
    
    return steps.length > 0 ? steps : [stepsText];
  }

  // If no explicit section found, try to identify action-oriented statements
  const actionRegex = /(?:should|could|consider|try|start|begin|focus on|prioritize|learn|develop|create|build|reach out to|connect with)[^.!?]*[.!?]/gi;
  const actionMatches = text.match(actionRegex) || [];
  
  return actionMatches.slice(0, 5).map(s => s.trim());
}

// Helper to extract analysis sections from resume analysis
function extractAnalysisSections(text: string): Record<string, string> {
  const sections = {
    firstImpression: '',
    strengths: '',
    improvements: '',
    skills: '',
    careerTrajectory: '',
    followUpQuestions: '',
  };

  // Extract each section using regex patterns
  const firstImpressionMatch = text.match(/(?:FIRST IMPRESSION|OVERVIEW|SUMMARY)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (firstImpressionMatch && firstImpressionMatch[1]) {
    sections.firstImpression = firstImpressionMatch[1].trim();
  }

  const strengthsMatch = text.match(/(?:STRENGTHS|STRENGTHS ASSESSMENT|STRONG POINTS)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (strengthsMatch && strengthsMatch[1]) {
    sections.strengths = strengthsMatch[1].trim();
  }

  const improvementsMatch = text.match(/(?:IMPROVEMENT|IMPROVEMENTS|RECOMMENDATIONS|AREAS TO IMPROVE)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (improvementsMatch && improvementsMatch[1]) {
    sections.improvements = improvementsMatch[1].trim();
  }

  const skillsMatch = text.match(/(?:SKILL|SKILLS|SKILL ANALYSIS|SKILLS ASSESSMENT)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (skillsMatch && skillsMatch[1]) {
    sections.skills = skillsMatch[1].trim();
  }

  const careerMatch = text.match(/(?:CAREER|TRAJECTORY|CAREER PATH|CAREER TRAJECTORY)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (careerMatch && careerMatch[1]) {
    sections.careerTrajectory = careerMatch[1].trim();
  }

  const questionsMatch = text.match(/(?:QUESTIONS|FOLLOW-UP|FOLLOW UP)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (questionsMatch && questionsMatch[1]) {
    sections.followUpQuestions = questionsMatch[1].trim();
  }

  return sections;
}

// Helper to extract sections from networking recommendations
function extractNetworkingSections(text: string): Record<string, string> {
  const sections = {
    strategy: '',
    platforms: '',
    outreachTemplates: '',
    targetConnections: '',
    conversationStarters: '',
  };

  // Extract each section using regex patterns
  const strategyMatch = text.match(/(?:STRATEGIC APPROACH|STRATEGY|NETWORKING STRATEGY)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (strategyMatch && strategyMatch[1]) {
    sections.strategy = strategyMatch[1].trim();
  }

  const platformsMatch = text.match(/(?:PLATFORM RECOMMENDATIONS|PLATFORMS|WHERE TO NETWORK)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (platformsMatch && platformsMatch[1]) {
    sections.platforms = platformsMatch[1].trim();
  }

  const templatesMatch = text.match(/(?:OUTREACH TEMPLATES|TEMPLATES|MESSAGE TEMPLATES)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (templatesMatch && templatesMatch[1]) {
    sections.outreachTemplates = templatesMatch[1].trim();
  }

  const connectionsMatch = text.match(/(?:TARGET CONNECTIONS|CONNECTIONS|WHO TO CONNECT WITH)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (connectionsMatch && connectionsMatch[1]) {
    sections.targetConnections = connectionsMatch[1].trim();
  }

  const startersMatch = text.match(/(?:CONVERSATION STARTERS|ICEBREAKERS|TALKING POINTS)(?::|\.)([\s\S]*?)(?:\n\n|\n#|\n\d\.|\n\*\*|$)/i);
  if (startersMatch && startersMatch[1]) {
    sections.conversationStarters = startersMatch[1].trim();
  }

  return sections;
}