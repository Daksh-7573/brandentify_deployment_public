import { WorkExperience, Education, Skill } from "@shared/schema";

/**
 * Perplexity API integration service
 * This service provides methods to interact with the Perplexity API for AI-powered features
 * using the Llama-3.1 models.
 */

// Helper function to check if API key is available
function isApiKeyAvailable(): boolean {
  return !!process.env.PERPLEXITY_API_KEY;
}

/**
 * Makes a request to the Perplexity API
 * @param systemPrompt - Optional system prompt to guide the model
 * @param userPrompt - The user's prompt/query
 * @param options - Additional options for the API call
 * @returns The response from the Perplexity API
 */
async function callPerplexityApi(
  userPrompt: string,
  systemPrompt: string = "Be precise and concise.",
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    search_domain_filter?: string[];
    return_related_questions?: boolean;
    search_recency_filter?: string;
  } = {}
) {
  if (!isApiKeyAvailable()) {
    throw new Error("Perplexity API key is missing");
  }

  const {
    model = "llama-3.1-sonar-small-128k-online",
    temperature = 0.2,
    max_tokens,
    stream = false,
    search_domain_filter,
    return_related_questions = false,
    search_recency_filter = "month"
  } = options;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens,
        temperature,
        top_p: 0.9,
        search_domain_filter,
        return_images: false,
        return_related_questions,
        search_recency_filter,
        top_k: 0,
        stream,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
}

/**
 * Analyzes a resume text and extracts structured information
 * @param resumeText - The full text of the resume to analyze
 * @returns A structured analysis of the resume with extracted information
 */
export async function analyzeResume(resumeText: string) {
  const systemPrompt = `
    You are an expert resume analyzer. Extract the following information from the provided resume text:
    1. Work experience (companies, roles, dates, achievements)
    2. Education (degrees, institutions, dates)
    3. Skills (both technical and soft skills)
    4. Contact information
    
    Be precise and factual. Do not invent or hallucinate information. If information is not found, state it explicitly.
    Provide a structured analysis that can be used to automatically update a professional profile.
  `;

  const response = await callPerplexityApi(resumeText, systemPrompt, {
    temperature: 0.1,
    search_domain_filter: ["perplexity.ai"]
  });

  return response.choices[0].message.content;
}

/**
 * Generates networking recommendations based on user profile information
 * @param userProfile - User's profile data including work experiences and skills
 * @param targetIndustry - The industry the user is interested in networking within
 * @param purpose - The purpose of networking (finding mentors, collaborators, etc.)
 * @returns Personalized networking recommendations
 */
export async function generateNetworkingRecommendations(
  userProfile: { workExperiences: WorkExperience[]; skills: Skill[] },
  targetIndustry: string,
  purpose: string
) {
  const { workExperiences, skills } = userProfile;

  // Format the user profile data
  const workExperienceText = workExperiences
    .map(exp => 
      `${exp.title} at ${exp.company} (${exp.startDate || 'unknown'} to ${exp.endDate || 'present'}): ${exp.description || 'No description'}`
    )
    .join("\n");

  const skillsText = skills.map(skill => skill.name).join(", ");

  const systemPrompt = `
    You are a professional networking and career development expert. Provide personalized networking recommendations
    based on the user's work experience, skills, and networking goals. Include specific strategies, 
    potential networking platforms, and types of connections that would be most valuable.
    
    Focus on providing actionable advice that is tailored to the user's profile and stated networking purpose.
    Include citations to relevant professional networking research or best practices when available.
  `;

  const userPrompt = `
    Based on the following profile information:
    
    Work Experience:
    ${workExperienceText}
    
    Skills:
    ${skillsText}
    
    Target Industry: ${targetIndustry}
    Networking Purpose: ${purpose}
    
    Provide me with personalized networking recommendations, including:
    1. Key types of professionals I should connect with
    2. Specific strategies for approaching these connections
    3. Recommended platforms or venues for making these connections
    4. How to leverage my existing experience and skills effectively
  `;

  const response = await callPerplexityApi(userPrompt, systemPrompt, {
    temperature: 0.3,
    search_domain_filter: ["linkedin.com", "perplexity.ai", "harvard.edu", "forbes.com"]
  });

  return response.choices[0].message.content;
}

/**
 * Identifies skill gaps based on target job requirements and current skills
 * @param currentSkills - User's current skills
 * @param targetJobTitle - The job title the user is targeting
 * @param targetIndustry - The industry the user is targeting
 * @returns Analysis of skill gaps and recommendations for skill development
 */
export async function identifySkillGaps(
  currentSkills: Skill[],
  targetJobTitle: string,
  targetIndustry: string
) {
  const skillsText = currentSkills.map(skill => skill.name).join(", ");

  const systemPrompt = `
    You are a career development and skills analysis expert. Analyze the user's current skills
    compared to what is typically required for their target job in the specified industry.
    Identify gaps and provide specific recommendations for skill development.
    
    Be data-driven in your analysis, referencing current job market requirements when possible.
    Provide actionable recommendations for how to acquire the missing skills.
  `;

  const userPrompt = `
    Based on the following information:
    
    My current skills: ${skillsText}
    
    Target job title: ${targetJobTitle}
    Target industry: ${targetIndustry}
    
    Please analyze:
    1. What skills are typically required for this position that I don't currently have?
    2. Which of my existing skills are most valuable for this position?
    3. What specific courses, certifications, or learning paths would help me close these skill gaps?
    4. How should I prioritize skill development based on market demand and learning curve?
  `;

  const response = await callPerplexityApi(userPrompt, systemPrompt, {
    temperature: 0.2,
    search_domain_filter: ["linkedin.com", "indeed.com", "glassdoor.com", "perplexity.ai"]
  });

  return response.choices[0].message.content;
}

/**
 * Generates professional career advice based on user profile and career goals
 * @param userMessage - The user's specific question or concern
 * @param userProfile - Optional user profile information to provide context
 * @returns Personalized career advice
 */
export async function getCareerAdvice(
  userMessage: string,
  userProfile?: {
    workExperiences?: WorkExperience[];
    skills?: Skill[];
    education?: Education[];
  }
) {
  let contextText = "";

  // Add user profile information to the context if available
  if (userProfile) {
    const { workExperiences, skills, education } = userProfile;

    if (workExperiences && workExperiences.length > 0) {
      contextText += "Work Experience:\n";
      contextText += workExperiences
        .map(exp => 
          `${exp.title} at ${exp.company} (${exp.startDate || 'unknown'} to ${exp.endDate || 'present'})`
        )
        .join("\n");
      contextText += "\n\n";
    }

    if (skills && skills.length > 0) {
      contextText += "Skills:\n";
      contextText += skills.map(skill => skill.name).join(", ");
      contextText += "\n\n";
    }

    if (education && education.length > 0) {
      contextText += "Education:\n";
      contextText += education
        .map(edu => 
          `${edu.degree} from ${edu.institution} (${edu.startDate || 'unknown'} to ${edu.endDate || 'present'})`
        )
        .join("\n");
      contextText += "\n\n";
    }
  }

  const systemPrompt = `
    You are a professional career coach with expertise in career development, job searching, 
    and professional growth. Provide thoughtful, personalized career advice based on the user's
    profile information and specific question. 
    
    Your advice should be practical, actionable, and tailored to the user's specific situation.
    When appropriate, cite relevant sources of information or industry best practices.
  `;

  const userPrompt = contextText 
    ? `Given my background:\n\n${contextText}\n\nMy question is: ${userMessage}`
    : userMessage;

  const response = await callPerplexityApi(userPrompt, systemPrompt, {
    temperature: 0.3,
    search_domain_filter: ["linkedin.com", "harvard.edu", "forbes.com", "perplexity.ai"]
  });

  return response.choices[0].message.content;
}