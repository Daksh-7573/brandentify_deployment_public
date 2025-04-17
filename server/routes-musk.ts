import { Request, Response } from "express";
import { storage } from "./storage";

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
  // Sample responses based on message context
  // In a production environment, this would be integrated with a real AI model
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