import { Skill, WorkExperience, Education } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCareerAdvice(
  message: string,
  skills: Skill[],
  experiences: WorkExperience[],
  educations: Education[]
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
          You provide concise, practical, and personalized career advice based on the user's profile and questions.
          Keep answers professional, practical, and under 250 words.
          Focus on actionable advice that helps career growth.`
        },
        {
          role: "user",
          content: `My profile:
          ${skillsText}
          ${experiencesText}
          ${educationsText}
          
          My question: ${message}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate advice at the moment. Please try again.";
  } catch (error) {
    console.error("Error generating AI career advice:", error);
    throw new Error("Failed to generate career advice. Please try again later.");
  }
}
