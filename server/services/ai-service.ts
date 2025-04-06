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
  // Fetch previous conversation history for context
  const prevMessages = await storage.getChatMessagesByUserId(userId);
  const recentMessages = prevMessages
    .filter(msg => msg.messageType === 'career_advice')
    .sort((a, b) => {
      // Simply use the timestamp field which should be there according to the schema
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : Date.now();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : Date.now();
      return timeA - timeB;
    })
    .slice(-10); // Get last 10 messages for context
    
  const isFollowUpQuestion = recentMessages.length > 0;
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
    
    // Format conversation history if this is a follow-up question
    let conversationHistory = '';
    if (isFollowUpQuestion && recentMessages.length >= 2) {
      conversationHistory = 'CONVERSATION HISTORY:\n\n';
      recentMessages.forEach(msg => {
        const role = msg.sender === 'user' ? 'User' : 'Musk';
        conversationHistory += `${role}: ${msg.content}\n\n`;
      });
    }
    
    // Create a strict step-by-step process for the AI to follow
    let expertContent = `
      ${profileAnalysis}
      
      ${conversationHistory}
      
      User Question: ${message}
      
      CRITICAL INSTRUCTIONS - FAILURE TO FOLLOW WILL RESULT IN INCORRECT OUTPUT:
      
      ${isFollowUpQuestion ? 
        `This is a FOLLOW-UP QUESTION. You MUST:
        1. Address the specific question being asked
        2. Reference your previous advice and recommendations
        3. Provide a direct, concise answer that builds on the previous conversation
        4. Maintain continuity with your previous responses` 
        :
        `1. You MUST begin by explicitly mentioning specific details from the user's profile that you are analyzing.
        For example: "Based on your experience as [specific job title] at [specific company] and your skills in [specific skills]..."
        
        2. Your response MUST demonstrate that you have thoroughly analyzed the specific profile above.
        - NEVER use generic phrases like "based on your profile" or "given your background"
        - ALWAYS mention SPECIFIC job titles, company names, skills, or education details from their profile
        
        3. Structure your response with these EXACT headings (include the ### markdown):
        ### Executive Summary
        [Personalized summary that references specific profile elements]
        
        ### Profile Analysis
        [Detailed analysis of strengths & gaps based on SPECIFIC profile information]
        
        ### Strategic Recommendations
        [3-5 actionable items tailored to THIS SPECIFIC person's situation]
        
        ### Industry Context
        [Insights about their specific industry: ${userTitle || "technology"}]`
      }
      
      4. Your response MUST end with this EXACT format (copy it precisely):
         
         ## Let me ask you a follow-up question:
         [Question tailored to their profile]
         
         **Quick Response Options:**
         - [Option 1 specific to their background]
         - [Option 2 specific to their background]
         - [Option 3 specific to their background]
         - Tell me more about something else
      
      5. DO NOT generate generic career advice. If you cannot find enough profile information, explicitly state what information is missing and how it limits your ability to provide fully personalized advice.
      
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
          
          4. CONTEXTUAL AWARENESS: When responding to follow-up questions, remember what you've previously discussed. Reference prior recommendations and build upon them rather than starting from scratch.
          
          5. FORMAT YOUR RESPONSE AS A PROFESSIONAL ASSESSMENT:
             - Begin with a personalized "Executive Summary" that acknowledges their background and goals
             - Include a "Profile Strengths & Gaps Analysis" section
             - Provide "Strategic Career Recommendations" (3-5 actionable items)
             - Add relevant "Industry Context" with current trends
          
          6. FOR FOLLOW-UP QUESTIONS:
             - Directly address the specific question being asked
             - Reference the conversation history to provide continuity
             - Maintain the same tone and level of expertise
             - Provide concise but thorough answers
          
          7. EVERY RESPONSE MUST END with a follow-up question and quick response options:
          
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
      max_tokens: 2000,
      temperature: 0.4,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate advice at the moment. Please try again.";
  } catch (error) {
    console.error("Error generating AI career advice:", error);
    throw new Error("Failed to generate career advice. Please try again later.");
  }
}
