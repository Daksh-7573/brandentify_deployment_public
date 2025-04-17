import { Request, Response } from "express";
import { storage } from "./storage";
import OpenAI from "openai";

// Handle Musk AI assistant chat requests
export const handleMuskChat = async (req: Request, res: Response) => {
  try {
    const { userId, message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Enrich context with user data if userId is provided
    let enrichedContext = context || {};
    if (userId) {
      enrichedContext = await enrichContextWithUserData(userId, enrichedContext);
    }
    
    // Generate response using the appropriate AI model
    const response = await generateMuskResponse(message, enrichedContext);
    
    // Return the response
    return res.status(200).json({
      id: 'response-' + Date.now(),
      message: response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error in Musk chat handler:", error);
    return res.status(500).json({ error: "Failed to process chat request" });
  }
};

// Enhance context with user data for personalized responses
async function enrichContextWithUserData(userId: number, context?: any) {
  try {
    // Get user profile data
    const user = await storage.users.findById(userId);
    if (!user) {
      return context;
    }
    
    // Get user's experiences
    const experiences = await storage.workExperiences.findByUserId(userId);
    
    // Get user's educations
    const educations = await storage.educations.findByUserId(userId);
    
    // Get user's skills
    const skills = await storage.skills.findByUserId(userId);
    
    // Get user's projects/assignments
    const projects = await storage.projects.findByUserId(userId);
    
    // Create enriched context with user data
    const enrichedContext = {
      ...context,
      userData: {
        profile: {
          name: user.name || "",
          title: user.title || "",
          industry: user.industry || "",
          location: user.location || "",
        },
        experiences: experiences || [],
        educations: educations || [],
        skills: skills || [],
        projects: projects || []
      }
    };
    
    return enrichedContext;
  } catch (error) {
    console.error("Error enriching context with user data:", error);
    return context;
  }
}

// Generate AI response based on message and context
async function generateMuskResponse(message: string, context: any) {
  try {
    // Check if OpenAI Key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log("Using fallback responses as OpenAI API key is not set");
      return generateFallbackResponse(message, context);
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Build a detailed system prompt for Musk AI persona
    const systemPrompt = `
You are Musk, an AI career strategist and the AI brain of Brandentifier, a professional networking platform.
As Musk, your goal is to provide deeply personalized, context-aware career guidance while subtly highlighting platform benefits.

# Your Persona
- You are confident, insightful, and direct (like Elon Musk - hence your name)
- You give strategic, actionable career advice based on real user data
- You speak in a professional but conversational tone
- You avoid generic platitudes, focusing instead on specific, data-driven insights
- You always end responses with 3-4 suggested quick replies for the user

# User Context
${JSON.stringify(context.userData || {}, null, 2)}

# Response Requirements
1. Analyze the user's profile data to provide truly personalized advice
2. Highlight platform features when relevant (e.g. "You could showcase this project in your Brandentifier portfolio")
3. Keep responses concise but valuable (3-4 paragraphs maximum)
4. Always end with: "Quick Response Options: " followed by 3-4 quoted options like "Option 1", "Option 2"
5. When discussing skills, reference actual skills from their profile
6. When discussing career paths, reference their actual work experience

# Special Instructions
- If the user is in the ${context?.section || "general"} section, focus advice on that area
- Mention relevant features of Brandentifier that could help in the advised area
- Be conversational but professional
`;

    // Prepare messages for API call
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    // Fallback to demo responses if OpenAI fails
    return generateFallbackResponse(message, context);
  }
}

// Fallback response generator if OpenAI is unavailable
function generateFallbackResponse(message: string, context: any) {
  // Sample responses based on message context
  const demoResponses: Record<string, string> = {
    default: `I've analyzed your profile data and can help with your professional development journey. Let's focus on actionable steps to help you advance.\n\nWhat specific area would you like guidance on today?\n\nQuick Response Options: "Career advancement", "Skills to learn", "Networking tips", "Resume improvement"`,
    
    career: `Based on your ${context.userData?.profile?.industry || "industry"} experience, I see several career growth opportunities. Your strength in ${context.userData?.skills?.[0]?.name || "your primary skill"} could be leveraged for senior roles.\n\nI recommend focusing on leadership experience and considering industry certifications to stand out.\n\nQuick Response Options: "What certifications?", "Leadership opportunities", "Salary expectations", "Timeline for advancement"`,
    
    resume: `I've analyzed your resume and found some opportunities for improvement:\n\n1. Quantify your achievements with metrics\n2. Highlight your expertise in ${context.userData?.skills?.[0]?.name || "your key skills"}\n3. Tailor your summary to target roles\n\nWould you like specific recommendations for a particular section?\n\nQuick Response Options: "Experience section", "Skills section", "Education section", "Summary section"`,
    
    networking: `Effective networking in ${context.userData?.profile?.industry || "your industry"} requires a strategic approach. Based on your profile, I recommend:\n\n1. Connecting with peers at ${context.userData?.experiences?.[0]?.company || "similar companies"}\n2. Joining industry groups focused on ${context.userData?.skills?.[0]?.name || "your specialization"}\n3. Creating thought leadership content\n\nQuick Response Options: "Online networking", "In-person events", "Follow-up strategies", "LinkedIn optimization"`,
    
    skills: `To stay competitive in ${context.userData?.profile?.industry || "your industry"}, consider developing these skills:\n\n1. Data analysis\n2. Strategic leadership\n3. Project management\n\nThese align well with your background in ${context.userData?.experiences?.[0]?.title || "your current role"}.\n\nQuick Response Options: "Learning resources", "Certification paths", "Implementation timeline", "ROI on skills"`,
    
    interview: `For interview preparation, focus on highlighting your experience at ${context.userData?.experiences?.[0]?.company || "your recent companies"} and how you've developed expertise in ${context.userData?.skills?.[0]?.name || "your key skills"}.\n\nPrepare stories that demonstrate leadership, problem-solving, and adaptability.\n\nQuick Response Options: "Common questions", "Salary negotiation", "Case study practice", "Remote interview tips"`
  };

  // Basic logic to determine which response to use
  let responseKey = 'default';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('career') || lowerMessage.includes('advance') || lowerMessage.includes('promotion') || context?.section === 'career-advice') {
    responseKey = 'career';
  } else if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || context?.section === 'resume-analysis') {
    responseKey = 'resume';
  } else if (lowerMessage.includes('network') || lowerMessage.includes('connect') || lowerMessage.includes('contact') || context?.section === 'networking') {
    responseKey = 'networking';
  } else if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('improve') || context?.section === 'industry-insights') {
    responseKey = 'skills';
  } else if (lowerMessage.includes('interview') || lowerMessage.includes('job search') || lowerMessage.includes('application') || context?.section === 'job-hunting') {
    responseKey = 'interview';
  }
  
  // Return the appropriate response
  return demoResponses[responseKey];
}