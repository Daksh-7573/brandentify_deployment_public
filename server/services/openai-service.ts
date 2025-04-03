import OpenAI from "openai";
import { WorkExperience, Education, Skill } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate career advice based on user profile information
 * @param userProfile User profile data
 * @returns Career advice and next step recommendations
 */
export async function generateCareerAdvice(userProfile: {
  workExperiences: WorkExperience[];
  skills: Skill[];
  educations: Education[];
}) {
  try {
    // Format work experiences for the prompt
    const workExperienceText = userProfile.workExperiences
      .map((exp) => {
        return `- ${exp.title} at ${exp.company}${
          exp.domain ? ` (${exp.domain})` : ""
        }${exp.industry ? ` in ${exp.industry}` : ""}${
          exp.location ? `, ${exp.location}` : ""
        }
        Duration: ${exp.startDate}${exp.endDate ? ` to ${exp.endDate}` : " to Present"}
        ${exp.description ? `Description: ${exp.description}` : ""}`;
      })
      .join("\n\n");

    // Format skills for the prompt
    const skillsText = userProfile.skills
      .map((skill) => {
        return `- ${skill.name}${
          skill.level ? ` (${skill.level})` : ""
        }${skill.proficiency ? ` - Proficiency: ${skill.proficiency}/10` : ""}`;
      })
      .join("\n");

    // Format education for the prompt
    const educationText = userProfile.educations
      .map((edu) => {
        return `- ${edu.degree} at ${edu.institution}${
          edu.location ? `, ${edu.location}` : ""
        }
        Duration: ${edu.startDate}${
          edu.endDate ? ` to ${edu.endDate}` : " to Present"
        }`;
      })
      .join("\n\n");

    const prompt = `
    I need personalized career advice based on the following professional profile:
    
    WORK EXPERIENCE:
    ${workExperienceText || "No work experience provided"}
    
    SKILLS:
    ${skillsText || "No skills provided"}
    
    EDUCATION:
    ${educationText || "No education provided"}
    
    Please provide:
    1. A career assessment analyzing strengths, potential gaps, and positioning in the job market
    2. Three specific, actionable next steps to advance the career
    3. Suggestions for skill development that would complement the existing profile
    4. One or two potential career paths that might be worth exploring
    
    Format the advice in a clear, professional tone with section headings.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional career coach with expertise in career development and job market trends. Provide personalized, actionable career advice.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate career advice";
  } catch (error: any) {
    console.error("Error generating career advice:", error);
    throw new Error(`Failed to generate career advice: ${error.message}`);
  }
}

/**
 * Analyze resume text to extract professional insights
 * @param resumeText The text content of the resume or link to resume
 * @returns Analysis and suggestions based on the resume
 */
export async function analyzeResume(resumeText: string) {
  try {
    // Check if the input is likely a file or link
    const isLink = resumeText.startsWith('http://') || resumeText.startsWith('https://');
    const isBase64 = resumeText.startsWith('This is base64 encoded resume data:');
    
    let systemPrompt = "You are an expert resume analyzer with deep knowledge of professional development and hiring practices. Provide constructive feedback and actionable insights.";
    let userPrompt = "";
    
    if (isLink) {
      systemPrompt += " You cannot access the content of external links directly, but you can provide general guidance for resume improvement.";
      userPrompt = `
      The user has provided a link to their resume: ${resumeText.replace('This is a link to a resume: ', '')}
      
      Since I cannot directly access external links, please provide:
      1. An explanation that you cannot access the content directly
      2. General best practices for creating a strong resume
      3. Common mistakes to avoid in resumes
      4. Tips for tailoring resumes to specific industries
      5. Advice on how to highlight achievements effectively
      
      Format your response in a clear, professional tone with section headings.
      `;
    } else if (isBase64) {
      systemPrompt += " You cannot directly decode base64 data, but you can provide general guidance for resume improvement.";
      userPrompt = `
      The user has uploaded a resume file, but I cannot decode the file content directly. Please provide:
      1. An explanation that you cannot access the content directly
      2. General best practices for creating a strong resume
      3. Common mistakes to avoid in resumes
      4. Tips for tailoring resumes to specific industries
      5. Advice on how to highlight achievements effectively
      
      Format your response in a clear, professional tone with section headings.
      `;
    } else {
      userPrompt = `
      I need a professional analysis of this resume text:
      
      ${resumeText}
      
      Please provide:
      1. Overall assessment of the resume's strengths and weaknesses
      2. Specific suggestions for improvement in content, structure, and formatting
      3. Industry-specific advice for the target role(s)
      4. Key skills that are evident and skills that may be missing
      5. Recommendations for how to better position this professional profile
      
      Format the analysis in a clear, professional tone with section headings.
      `;
    }
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to analyze resume";
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
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
    workExperiences: WorkExperience[];
    skills: Skill[];
  },
  targetIndustry: string,
  purpose: string
) {
  try {
    // Format work experiences for the prompt
    const workExperienceText = userProfile.workExperiences
      .map((exp) => {
        return `- ${exp.title} at ${exp.company}${
          exp.domain ? ` (${exp.domain})` : ""
        }${exp.industry ? ` in ${exp.industry}` : ""}${
          exp.location ? `, ${exp.location}` : ""
        }
        Duration: ${exp.startDate}${
          exp.endDate ? ` to ${exp.endDate}` : " to Present"
        }
        ${exp.description ? `Description: ${exp.description}` : ""}`;
      })
      .join("\n\n");

    // Format skills for the prompt
    const skillsText = userProfile.skills
      .map((skill) => {
        return `- ${skill.name}${
          skill.level ? ` (${skill.level})` : ""
        }${skill.proficiency ? ` - Proficiency: ${skill.proficiency}/10` : ""}`;
      })
      .join("\n");

    const prompt = `
    I need personalized networking recommendations based on the following profile:
    
    WORK EXPERIENCE:
    ${workExperienceText || "No work experience provided"}
    
    SKILLS:
    ${skillsText || "No skills provided"}
    
    TARGET INDUSTRY: ${targetIndustry}
    
    NETWORKING PURPOSE: ${purpose}
    
    Please provide:
    1. Specific types of professionals to connect with based on the target industry and networking purpose
    2. Recommended networking platforms and communities that align with the profile and goals
    3. Networking conversation starters and topics to discuss based on the professional background
    4. Suggestions for how to leverage existing experience when networking in this industry
    5. Potential networking events or groups that would be valuable
    
    Format the recommendations in a clear, professional tone with section headings.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert networking strategist who helps professionals connect strategically to advance their careers. Provide personalized, actionable networking advice.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate networking recommendations";
  } catch (error: any) {
    console.error("Error generating networking recommendations:", error);
    throw new Error(`Failed to generate networking recommendations: ${error.message}`);
  }
}