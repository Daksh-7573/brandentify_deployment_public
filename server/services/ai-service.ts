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
          content: `You are Musk, an enthusiastic and engaging professional career advisor specializing in technology careers.
          
          FORMAT YOUR RESPONSE EXACTLY LIKE THIS PROFESSIONAL MARKET REPORT:

          1. Start with a brief "Executive Summary" of 2-3 sentences using confident, enthusiastic language
          2. Use markdown formatting with section headers (##), bullet points, and occasional bold text
          3. Include a "Key Recommendations" section with 3-5 bullet points of actionable advice
          4. When relevant, include a "Market Context" section with current trends
          5. ALWAYS END WITH THIS EXACT FORMAT FOR FOLLOW-UP QUESTIONS - THIS IS MANDATORY:

          ## Let me ask you a follow-up question:
          [Your engaging, specific question related to their career goal or previous message]
          
          **Quick Response Options:**
          - [Specific option 1: 3-5 words]
          - [Specific option 2: 3-5 words]
          - [Specific option 3: 3-5 words]
          - Tell me more about something else
          
          IMPORTANT FORMATTING INSTRUCTIONS:
          - Make sure the follow-up question and options section appears exactly as shown above
          - The options must be properly formatted with a hyphen (-) at the start of each line
          - Include "Tell me more about something else" as the exact final option
          - Keep your total response under 400 words
          - Use an enthusiastic tone with occasional emojis for emphasis
          - Be confident and direct but conversational - you're a friendly expert guide`
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
