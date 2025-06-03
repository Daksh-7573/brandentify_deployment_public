import { LocalAIService } from "./local-ai-service";

// Initialize local AI service
const localAI = new LocalAIService();

/**
 * Generate career advice based on user profile information
 * @param userProfile User profile data
 * @returns Career advice and next step recommendations
 */
export async function generateCareerAdvice(userProfile: {
  workExperiences: any[];
  skills: any[];
  educations: any[];
}) {
  try {
    // Prepare the prompt with user's profile information
    let prompt = `Based on the following professional profile, provide career advice and identify potential growth opportunities:\n\n`;

    // Add work experience
    prompt += `## Work Experience\n`;
    if (userProfile.workExperiences && userProfile.workExperiences.length > 0) {
      userProfile.workExperiences.forEach((exp: any, index: number) => {
        prompt += `${index + 1}. ${exp.title} at ${exp.company} (${exp.industry}, ${exp.domain})\n`;
        if (exp.description) {
          prompt += `   - ${exp.description}\n`;
        }
      });
    } else {
      prompt += `No work experience provided.\n`;
    }

    // Add skills
    prompt += `\n## Skills\n`;
    if (userProfile.skills && userProfile.skills.length > 0) {
      userProfile.skills.forEach((skill: any, index: number) => {
        prompt += `${index + 1}. ${skill.name} (${skill.category}) - Proficiency: ${skill.proficiency}\n`;
      });
    } else {
      prompt += `No skills provided.\n`;
    }

    // Add education
    prompt += `\n## Education\n`;
    if (userProfile.educations && userProfile.educations.length > 0) {
      userProfile.educations.forEach((edu: any, index: number) => {
        prompt += `${index + 1}. ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}\n`;
      });
    } else {
      prompt += `No education information provided.\n`;
    }

    // Add specific questions for the AI
    prompt += `\n## Request\nProvide professional career advice addressing the following areas:
1. Skill gaps and improvement opportunities
2. Career advancement paths
3. Industry trends relevant to this profile
4. Next steps for professional development
5. Potential roles that would be a good fit

Format your response in clear sections with actionable advice.`;

    // Call local AI service
    const response = await localAI.generateCareerAdvice({
      user: { name: "User" },
      workExperiences: userProfile.workExperiences,
      skills: userProfile.skills,
      educations: userProfile.educations,
      adviceType: "general",
      customAdviceText: prompt
    });

    return response;
  } catch (error) {
    console.error("Error generating career advice with local AI:", error);
    throw new Error("Failed to generate career advice. Please try again later.");
  }
}

/**
 * Analyze resume text to extract professional insights
 * @param resumeText The text content of the resume
 * @returns Analysis and suggestions based on the resume
 */
export async function analyzeResume(resumeText: string) {
  try {
    const prompt = `Analyze the following resume and provide professional insights:
    
${resumeText}

Please provide the following:
1. A summary of key qualifications and experience
2. Strengths based on the resume content
3. Areas for improvement or missing information
4. Formatting and presentation suggestions
5. Keywords that should be included for better ATS (Applicant Tracking System) performance

Format your response in clearly labeled sections.`;

    const response = await localAI.analyzeResume(resumeText);

    return response;
  } catch (error) {
    console.error("Error analyzing resume with local AI:", error);
    throw new Error("Failed to analyze resume. Please try again later.");
  }
}

/**
 * Generate personalized networking recommendations
 * @param userProfile User profile information
 * @param targetIndustry Target industry for networking
 * @param purpose Purpose of networking (e.g., job search, mentorship)
 * @returns Personalized networking recommendations
 */
export async function generateNetworkingRecommendations(
  userProfile: {
    workExperiences: any[];
    skills: any[];
  },
  targetIndustry: string,
  purpose: string
) {
  try {
    let prompt = `Generate personalized networking recommendations for a professional with the following profile:\n\n`;
    
    // Add work experience
    prompt += `## Work Experience\n`;
    if (userProfile.workExperiences && userProfile.workExperiences.length > 0) {
      userProfile.workExperiences.forEach((exp: any, index: number) => {
        prompt += `${index + 1}. ${exp.title} at ${exp.company} (${exp.industry}, ${exp.domain})\n`;
      });
    } else {
      prompt += `No work experience provided.\n`;
    }

    // Add skills
    prompt += `\n## Skills\n`;
    if (userProfile.skills && userProfile.skills.length > 0) {
      userProfile.skills.forEach((skill: any, index: number) => {
        prompt += `${index + 1}. ${skill.name} (${skill.category}) - Proficiency: ${skill.proficiency}\n`;
      });
    } else {
      prompt += `No skills provided.\n`;
    }

    prompt += `\n## Networking Goals\n`;
    prompt += `- Target Industry: ${targetIndustry}\n`;
    prompt += `- Purpose: ${purpose}\n`;

    prompt += `\n## Request\nProvide strategic networking recommendations including:
1. Most relevant professional communities or groups to join
2. Types of events or conferences that would be valuable
3. Approaches for making meaningful connections
4. How to leverage existing experience for networking
5. Digital networking strategies (LinkedIn, etc.)

Make all advice specific to the profile and networking goals provided.`;

    // Use local AI for networking recommendations  
    const response = await localAI.generateCareerAdvice({
      user: { name: "User" },
      workExperiences: userProfile.workExperiences,
      skills: userProfile.skills,
      educations: [],
      adviceType: "networking",
      customAdviceText: prompt
    });

    return response;
  } catch (error) {
    console.error("Error generating networking recommendations with local AI:", error);
    throw new Error("Failed to generate networking recommendations. Please try again later.");
  }
}