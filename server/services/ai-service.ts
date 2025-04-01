import { Skill, WorkExperience, Education } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCareerAdvice(
  message: string,
  skills: Skill[],
  experiences: WorkExperience[],
  educations: Education[],
  careerGoal?: string
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
    // Enhance the profile information with more structured details
    const profileAnalysis = `
      DETAILED PROFILE ANALYSIS:
      
      Skills: ${skillsText ? skillsText : "No specific skills provided. Focus on identifying core strengths and development areas."}
      
      Work Experience: ${experiencesText ? experiencesText : "No work experience provided. Consider discussing ways to gain relevant experience or transferable skills."}
      
      Education: ${educationsText ? educationsText : "No education details provided. Consider discussing educational paths that align with career goals."}
      
      Career Goal: ${careerGoal || "No specific career goal provided"}
    `;
    
    // Create a more comprehensive prompt with detailed instructions
    let expertContent = `
      ${profileAnalysis}
      
      User Question: ${message}
      
      As a career expert, first analyze the profile details above thoroughly before providing advice.
      Make connections between their skills, experience, education, and career aspirations.
      Identify strengths, gaps, and growth opportunities specific to this individual.
      Provide industry-specific insights relevant to their field or desired field.
      
      For reference, the current date is April 1, 2025.
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
