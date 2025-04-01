import { Skill, WorkExperience, Education } from "@shared/schema";
import OpenAI from "openai";
import { storage } from "../storage";

// Initialize OpenAI with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCareerAdvice(
  message: string,
  skills: Skill[],
  experiences: WorkExperience[],
  educations: Education[],
  careerGoal?: string,
  userId: number = 1 // Default to demo user ID
): Promise<string> {
  try {
    // Format user profile information
    const skillsText = skills.length > 0 
      ? `Skills: ${skills.map(s => `${s.name} (${s.level})`).join(', ')}` 
      : "No skills provided";
    
    const experiencesText = experiences.length > 0 
      ? `Work Experience: ${experiences.map(e => 
          `${e.title} at ${e.company} (${e.startDate} to ${e.endDate || 'Present'})`).join('; ')}` 
      : "No work experience provided";
    
    const educationsText = educations.length > 0 
      ? `Education: ${educations.map(e => 
          `${e.degree} from ${e.institution} (${e.startDate} to ${e.endDate})`).join('; ')}` 
      : "No education details provided";

    // Create a prompt with user profile and query
    // Format skills as a detailed list with proficiency levels
    const formattedSkills = skills.length > 0 
      ? skills.map((skill: any) => {
          return `- ${skill.name}: ${skill.level || 'Proficiency level not specified'} ${skill.proficiency ? `(${skill.proficiency}% proficient)` : ''}`;
        }).join('\n')
      : "No specific skills provided in profile.";
    
    // Format experiences with detailed information
    const formattedExperiences = experiences.length > 0
      ? experiences.map((exp: any) => {
          return `- ${exp.title} at ${exp.company} (${exp.startDate} to ${exp.endDate || 'Present'})\n  Description: ${exp.description || 'No detailed description provided'}`;
        }).join('\n\n')
      : "No work experience provided in profile.";
    
    // Format education with detailed information
    const formattedEducation = educations.length > 0
      ? educations.map((edu: any) => {
          return `- ${edu.degree} from ${edu.institution} (${edu.startDate} to ${edu.endDate || 'Present'})`;
        }).join('\n')
      : "No education details provided in profile.";
    
    // Extract user information from the query metadata if available
    let userName = "";
    let userTitle = "";
    let userLocation = "";
    
    if (userId) {
      try {
        // Use the storage to get user info directly instead of fetch
        const userData = await storage.getUser(userId);
        if (userData) {
          userName = userData.name || "";
          userTitle = userData.title || "";
          userLocation = userData.location || "";
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
    
    // Create a very detailed profile analysis
    const profileAnalysis = `
      DETAILED PROFILE ANALYSIS:
      
      Basic Information:
      - Name: ${userName || "Not provided"}
      - Current Role: ${userTitle || "Not specified"}
      - Location: ${userLocation || "Not specified"}
      
      Skills Analysis:
      ${formattedSkills}
      
      Work Experience Analysis:
      ${formattedExperiences}
      
      Education Analysis:
      ${formattedEducation}
      
      Career Goal: ${careerGoal || "No specific career goal provided"}
    `;
    
    // Create a strict step-by-step process for the AI to follow
    let expertContent = `
      ${profileAnalysis}
      
      User Question: ${message}
      
      ATTENTION! You MUST analyze the specific profile information above in a thorough manner before providing advice.
      FIRST, explicitly identify the key elements of their profile that inform your analysis.
      NEXT, reference specific skills, experiences, or background information from their profile in your response.
      THEN, tailor your advice specifically to this individual's situation.
      FINALLY, provide industry-specific insights relevant to their field (${userTitle || "technology"}).
      
      DO NOT give generic career advice that could apply to anyone. Your response must demonstrate that you analyzed their specific profile.
      
      Current date: April 1, 2025
    `;
    
    // Create the OpenAI API call
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Musk, a world-class career advisor with deep expertise across all industries, domains, and professional fields.

          IMPORTANT INSTRUCTIONS:
          
          1. PROFILE ANALYSIS IS MANDATORY: Begin by thoroughly analyzing the provided profile information (skills, experience, education). Mention specific elements from their profile in your response to demonstrate you've understood their background.
          
          2. INDUSTRY EXPERTISE: Demonstrate your knowledge of current trends, challenges, and opportunities in the relevant industry/domain. Include a "Current Industry Landscape" section with market insights specific to their field.
          
          3. PERSONALIZATION: Make your advice highly customized to their specific situation. Avoid generic career advice that could apply to anyone.
          
          4. FORMAT YOUR RESPONSE AS A PROFESSIONAL ASSESSMENT:
             - Begin with a personalized "Executive Summary" that acknowledges their background and goals
             - Include a "Profile Strengths & Gaps Analysis" section
             - Provide "Strategic Career Recommendations" (3-5 actionable items)
             - Add relevant "Industry Context" with current trends
          
          5. EVERY RESPONSE MUST END with a follow-up question and quick response options:
          
          ## Let me ask you a follow-up question:
          [Ask a specific question related to their profile and career goals]
          
          **Quick Response Options:**
          - [Specific option 1 related to their situation]
          - [Specific option 2 related to their situation]
          - [Specific option 3 related to their situation]
          - Tell me more about something else
          
          Use sophisticated career development frameworks and concepts in your analysis. Demonstrate your expertise as a true career strategist who understands both mainstream and specialized career paths.`
        },
        {
          role: "user",
          content: expertContent
        }
      ],
      max_tokens: 1000,
      temperature: 0.6,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate advice at the moment. Please try again.";
  } catch (error) {
    console.error("Error generating AI career advice:", error);
    throw new Error("Failed to generate career advice. Please try again later.");
  }
}
