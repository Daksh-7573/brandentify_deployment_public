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
          content: `You are Mark, a professional career advisor specializing in technology careers. 
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
    
    // Fallback responses for when OpenAI API fails
    const fallbackResponses = [
      "Based on your profile, I'd recommend focusing on developing your technical and analytical skills further. Consider taking courses in data visualization or advanced SQL to enhance your marketability.",
      "Looking at your background, expanding your knowledge in cloud technologies would be beneficial. AWS or Azure certifications could complement your existing skills nicely.",
      "To advance in your field, consider developing both technical and soft skills. Project management certifications could help you move into leadership roles while leveraging your technical expertise.",
      "Based on current industry trends, enhancing your skills in data analysis and business intelligence tools would make you more competitive in the job market."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}
