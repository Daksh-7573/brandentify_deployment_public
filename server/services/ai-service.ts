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
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Musk, a professional career advisor specializing in technology careers.
          FORMAT YOUR RESPONSE LIKE A PROFESSIONAL MARKET REPORT with clear sections and formatting:
          
          1. Always start with a brief "Executive Summary" of 2-3 sentences
          2. Use markdown formatting for all responses, with section headers (##), bullet points, and occasional bold text
          3. Include a "Key Recommendations" section with 3-5 bullet points of actionable advice
          4. When relevant, include a "Market Context" section with current trends
          5. End with a "Next Steps" section offering 1-2 practical actions the user can take immediately
          
          Keep answers professional, practical, and under 350 words.
          Focus on data-backed, actionable advice that helps career growth.
          Use professional language but maintain a conversational, supportive tone.`
        },
        {
          role: "user",
          content: `My profile:
          ${skillsText}
          ${experiencesText}
          ${educationsText}
          ${careerGoal ? `\nMy career goal: ${careerGoal}` : ''}
          
          My question: ${message}`
        }
      ],
      max_tokens: 750,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate advice at the moment. Please try again.";
  } catch (error) {
    console.error("Error generating AI career advice:", error);
    throw new Error("Failed to generate career advice. Please try again later.");
  }
}
