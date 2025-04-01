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
    // Prepare the content block
    let expertContent = `My profile:
          ${skillsText}
          ${experiencesText}
          ${educationsText}
          ${careerGoal ? `\nMy career goal: ${careerGoal}` : ''}
          
          My question: ${message}`;
    
    // Create the OpenAI API call
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Musk, an enthusiastic and engaging professional career advisor specializing in technology careers.
          
          IMPORTANT: ALWAYS FORMAT YOUR RESPONSE FOLLOWING THIS EXACT TEMPLATE:

          First, provide your career advice formatted as a professional report with:
          - A brief executive summary (2-3 sentences)
          - Key recommendations (3-5 bullet points)
          - Relevant market context when applicable
          
          Then, EVERY RESPONSE MUST END with this exact format (the sections below are MANDATORY):

          ## Let me ask you a follow-up question:
          [Your specific question related to their career goals]
          
          **Quick Response Options:**
          - [Option 1]
          - [Option 2] 
          - [Option 3]
          - Tell me more about something else
          
          Here's an example of a properly formatted response:
          
          "Your career advancement strategy looks solid! With your technical skills and industry knowledge, focusing on leadership development will create new opportunities.
          
          ## Key Recommendations
          - Build a personal brand through LinkedIn content
          - Pursue certification in your specialty
          - Develop mentorship relationships
          
          ## Market Context
          The technology sector is experiencing growth in AI and cloud services, with companies prioritizing candidates who demonstrate both technical and soft skills.
          
          ## Let me ask you a follow-up question:
          Which of these skill areas would you like to prioritize in the next 3 months?
          
          **Quick Response Options:**
          - Technical certifications
          - Leadership training
          - Industry networking
          - Tell me more about something else"
          
          AGAIN: EVERY response MUST end with the follow-up question and 4 quick response options exactly as shown.`
        },
        {
          role: "user",
          content: expertContent
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate advice at the moment. Please try again.";
  } catch (error) {
    console.error("Error generating AI career advice:", error);
    throw new Error("Failed to generate career advice. Please try again later.");
  }
}
