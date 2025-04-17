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
  // Advanced decision tree structure for determining response category
  const intentDetection = detectUserIntent(message, context);
  const userContext = analyzeUserContext(context);
  const responseCategory = determineResponseCategory(intentDetection, userContext, context);
  
  // Generate personalized response based on the determined category and user context
  return generatePersonalizedResponse(responseCategory, userContext, message, context);
}

// LEVEL 1: Intent Detection - Determine user's primary intent from message
function detectUserIntent(message: string, context: any) {
  const lowerMessage = message.toLowerCase();
  const keywords = {
    career_advancement: ['career', 'advance', 'promotion', 'growth', 'progress', 'next step', 'level up'],
    resume_improvement: ['resume', 'cv', 'profile', 'improve', 'update', 'enhance', 'summary'],
    networking: ['network', 'connect', 'introduction', 'reach out', 'contact', 'meet', 'people'],
    skill_development: ['skill', 'learn', 'course', 'certificate', 'training', 'develop', 'improve'],
    job_search: ['job', 'interview', 'position', 'apply', 'application', 'company', 'opportunity'],
    industry_insight: ['trend', 'industry', 'future', 'insight', 'emerging', 'technology', 'prediction'],
    personal_brand: ['brand', 'presence', 'visibility', 'known', 'reputation', 'profile', 'perception'],
    platform_help: ['help', 'how to', 'feature', 'use', 'tool', 'create', 'build']
  };
  
  // Check explicit section context first (highest priority)
  if (context?.section) {
    const sectionMappings: Record<string, string> = {
      'career-advice': 'career_advancement',
      'resume-analysis': 'resume_improvement',
      'networking': 'networking',
      'industry-insights': 'industry_insight',
      'job-hunting': 'job_search',
      'profile-building': 'personal_brand',
      'feature-discovery': 'platform_help'
    };
    
    if (sectionMappings[context.section]) {
      return sectionMappings[context.section];
    }
  }
  
  // Check for keyword matches
  for (const [intent, intentKeywords] of Object.entries(keywords)) {
    for (const keyword of intentKeywords) {
      if (lowerMessage.includes(keyword)) {
        return intent;
      }
    }
  }
  
  // Check for trigger phrases (more specific than keywords)
  if (/what (should|can) i (post|share)/i.test(lowerMessage)) {
    return 'content_creation';
  }
  
  if (/how (can|do) i (get more|increase|grow) (views|visibility|attention)/i.test(lowerMessage)) {
    return 'personal_brand';
  }
  
  if (/how (can|do|to) (use|work with) (smart connect|musk|radar)/i.test(lowerMessage)) {
    return 'platform_help';
  }
  
  // Default to general guidance if no clear intent is detected
  return 'general_guidance';
}

// LEVEL 2: User Context Analysis - Understand the user's profile deeply
function analyzeUserContext(context: any) {
  const userData = context.userData || {};
  const profile = userData.profile || {};
  const experiences = userData.experiences || [];
  const educations = userData.educations || [];
  const skills = userData.skills || [];
  const projects = userData.projects || [];
  
  // Profile completeness analysis
  const profileCompleteness = {
    hasName: !!profile.name,
    hasTitle: !!profile.title,
    hasIndustry: !!profile.industry,
    hasLocation: !!profile.location,
    hasExperiences: experiences.length > 0,
    hasEducation: educations.length > 0,
    hasSkills: skills.length > 0,
    hasProjects: projects.length > 0
  };
  
  // Career stage inference
  let careerStage = 'unknown';
  const totalYearsExperience = experiences.reduce((total, exp) => {
    // Simple calculation assuming end date exists or current job
    const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : new Date().getFullYear();
    const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : new Date().getFullYear();
    return total + (endYear - startYear);
  }, 0);
  
  if (totalYearsExperience < 2) careerStage = 'entry_level';
  else if (totalYearsExperience < 5) careerStage = 'mid_level';
  else if (totalYearsExperience < 10) careerStage = 'senior_level';
  else careerStage = 'executive_level';
  
  // Extract primary skill areas based on skill list and experience descriptions
  const skillAreas = skills.map(skill => skill.name || '').filter(Boolean);
  
  // Industry and domain expertise
  const industryExpertise = profile.industry || '';
  const domainExpertise = profile.domain || '';
  
  return {
    profileCompleteness,
    careerStage,
    skillAreas,
    industryExpertise,
    domainExpertise,
    yearsExperience: totalYearsExperience,
    latestJobTitle: experiences[0]?.title || profile.title || '',
    latestCompany: experiences[0]?.company || '',
    highestEducation: educations[0]?.degree || '',
    educationInstitution: educations[0]?.institution || '',
    hasProjects: projects.length > 0
  };
}

// LEVEL 3: Response Determination - Select appropriate response category
function determineResponseCategory(intent: string, userContext: any, context: any) {
  // Base category from intent
  let category = intent;
  
  // Enhance with user context for more personalized paths
  if (intent === 'career_advancement') {
    if (userContext.careerStage === 'entry_level') {
      category = 'career_advancement_junior';
    } else if (userContext.careerStage === 'mid_level') {
      category = 'career_advancement_mid';
    } else if (userContext.careerStage === 'senior_level' || userContext.careerStage === 'executive_level') {
      category = 'career_advancement_senior';
    }
  }
  
  if (intent === 'resume_improvement') {
    // Check profile completeness to guide focus areas
    const { profileCompleteness } = userContext;
    if (!profileCompleteness.hasExperiences) {
      category = 'resume_improvement_experience';
    } else if (!profileCompleteness.hasSkills) {
      category = 'resume_improvement_skills';
    } else if (!profileCompleteness.hasEducation) {
      category = 'resume_improvement_education';
    } else {
      category = 'resume_improvement_optimization';
    }
  }
  
  if (intent === 'platform_help') {
    // Suggest features based on context.page if available
    if (context.page === 'profile') {
      category = 'platform_help_profile';
    } else if (context.page === 'portfolio') {
      category = 'platform_help_portfolio';
    } else if (context.page === 'networking') {
      category = 'platform_help_networking';
    } else if (context.page === 'pulse') {
      category = 'platform_help_pulse';
    }
  }
  
  // If there's no specific user data to personalize responses, default to general categories
  if (Object.keys(userContext.profileCompleteness).every(key => !userContext.profileCompleteness[key])) {
    if (intent === 'career_advancement') category = 'career_advancement';
    if (intent === 'resume_improvement') category = 'resume_improvement';
    if (intent === 'networking') category = 'networking';
    if (intent === 'skill_development') category = 'skill_development';
  }
  
  return category;
}

// LEVEL 4: Response Generation - Create personalized response text
function generatePersonalizedResponse(category: string, userContext: any, message: string, context: any) {
  // Core response templates with personalization placeholders
  const responseTemplates: Record<string, string> = {
    // Default/general responses
    general_guidance: `I've analyzed your profile data and can help with your professional development journey. Let's focus on actionable steps to help you advance.\n\nWhat specific area would you like guidance on today?\n\nQuick Response Options: "Career advancement", "Skills to learn", "Networking tips", "Resume improvement"`,
    
    // Career advancement responses by career stage
    career_advancement_junior: `As someone early in your ${userContext.industryExpertise || "professional"} career, I see great potential for growth. Focus on building technical expertise in ${userContext.skillAreas[0] || "your primary skill area"} and seeking mentorship.\n\nI recommend documenting achievements and volunteering for high-visibility projects to accelerate your growth.\n\nQuick Response Options: "Finding mentors", "Building technical skills", "Visibility strategies", "Promotion timeline"`,
    
    career_advancement_mid: `With ${userContext.yearsExperience} years of experience in ${userContext.industryExpertise || "your industry"}, you're at an ideal point to specialize or move toward leadership. Your experience with ${userContext.latestJobTitle || "your current role"} positions you well for senior roles.\n\nConsider developing leadership skills alongside your technical expertise in ${userContext.skillAreas[0] || "your field"}.\n\nQuick Response Options: "Leadership transition", "Specialization path", "Industry certification", "Salary negotiation"`,
    
    career_advancement_senior: `As a senior professional with ${userContext.yearsExperience} years of experience, your next steps could involve strategic leadership, mentoring, or entering adjacent domains. Your expertise in ${userContext.skillAreas[0] || "your primary domain"} is valuable.\n\nI recommend focusing on thought leadership and strategic business impact to continue advancing.\n\nQuick Response Options: "Executive transition", "Thought leadership", "Board positions", "Strategic influence"`,
    
    // Resume improvement focused responses
    resume_improvement_experience: `I notice your profile could benefit from adding more work experience details. For each role, include metrics and achievements rather than just responsibilities. This will significantly strengthen your professional story.\n\nWould you like help crafting impactful experience descriptions?\n\nQuick Response Options: "Help with metrics", "Achievement examples", "What to include", "What to exclude"`,
    
    resume_improvement_skills: `Your profile would be stronger with a more comprehensive skills section. Consider adding both technical skills like ${userContext.industryExpertise ? getRelevantSkills(userContext.industryExpertise) : "relevant technical tools"} and soft skills like leadership and communication.\n\nA well-structured skills section helps with both networking and recruitment.\n\nQuick Response Options: "Technical skills to add", "Soft skills to highlight", "Skills organization", "Skills assessment"`,
    
    resume_improvement_education: `Adding education details can strengthen your profile, even if your degree isn't directly related to your current field. Your ${userContext.highestEducation || "education"} demonstrates foundational knowledge that employers value.\n\nConsider including relevant courses, certifications, and continuing education as well.\n\nQuick Response Options: "Education formatting", "Certifications to add", "Online courses", "Education emphasis"`,
    
    resume_improvement_optimization: `Your profile has good content, but could be optimized for greater impact. Consider:\n\n1. Highlighting leadership experiences more prominently\n2. Adding quantifiable achievements in each role\n3. Tailoring your summary to emphasize ${userContext.skillAreas[0] || "your primary expertise"}\n\nThese changes will make your profile more compelling.\n\nQuick Response Options: "Summary improvement", "Achievement metrics", "Keywords to add", "Before/after examples"`,
    
    // Networking focused responses
    networking: `Building your network in ${userContext.industryExpertise || "your industry"} requires a strategic approach. Based on your profile as a ${userContext.latestJobTitle || "professional"}, I recommend:\n\n1. Connecting with peers at ${userContext.latestCompany || "companies like yours"}\n2. Joining industry groups focused on ${userContext.skillAreas[0] || "your specialization"}\n3. Creating thought leadership content\n\nBrandentifier's Smart Connect feature can also help you find ideal networking matches based on your profile data.\n\nQuick Response Options: "Smart Connect tips", "Online networking", "In-person events", "Follow-up strategies"`,
    
    // Skill development focused responses  
    skill_development: `To advance as a ${userContext.latestJobTitle || "professional"} in ${userContext.industryExpertise || "your industry"}, consider developing these skills:\n\n1. ${userContext.industryExpertise ? getRelevantSkills(userContext.industryExpertise)[0] : "Advanced technical skills"}\n2. Strategic leadership\n3. ${userContext.industryExpertise ? getRelevantSkills(userContext.industryExpertise)[1] : "Project management"}\n\nThese align well with your background and will position you for growth opportunities.\n\nQuick Response Options: "Learning resources", "Certification paths", "Implementation timeline", "ROI on skills"`,
    
    // Personal branding responses
    personal_brand: `Building your personal brand as a ${userContext.latestJobTitle || "professional"} in ${userContext.industryExpertise || "your field"} requires consistency across platforms. I recommend:\n\n1. Creating a strong, consistent visual identity using Brandentifier's portfolio templates\n2. Regularly sharing insights on industry trends\n3. Highlighting your expertise in ${userContext.skillAreas[0] || "your specialty"}\n\nWould you like me to help you get started with a compelling brand story?\n\nQuick Response Options: "Portfolio templates", "Content strategy", "Visual branding", "Measurement metrics"`,
    
    // Platform help responses
    platform_help_profile: `To maximize your Brandentifier profile, be sure to:\n\n1. Upload a professional photo (400x400px works best)\n2. Complete all sections - especially your skills and experience\n3. Link your portfolio and digital visiting card\n\nA complete profile increases your visibility in Smart Connect matches by up to 250%.\n\nQuick Response Options: "Photo tips", "Smart Connect setup", "Profile checklist", "Example profiles"`,
    
    platform_help_portfolio: `Brandentifier offers multiple portfolio templates designed for different professional needs:\n\n1. Visual Expert - for showcasing visual work\n2. Corporate Executive - for a polished, corporate aesthetic\n3. Dynamic Innovator - for technologists and creative thinkers\n\nBased on your ${userContext.industryExpertise || "background"}, I'd recommend the ${getRecommendedTemplate(userContext)} template.\n\nQuick Response Options: "View templates", "Customization options", "Content suggestions", "Examples"`,
    
    platform_help_networking: `Brandentifier's networking features include:\n\n1. Smart Connect - AI-powered professional matching\n2. Smart Radar - discover nearby professionals\n3. Pulse Sharing - share insights directly with your network\n\nTo get started with Smart Connect, complete your profile and set your networking preferences in Settings.\n\nQuick Response Options: "Smart Connect setup", "Smart Radar tips", "Engagement strategies", "Success metrics"`,
    
    platform_help_pulse: `Pulses are Brandentifier's way of sharing professional insights. You can create:\n\n1. Media Pulses - images or video showcasing your work\n2. Poll Pulses - gather community opinions\n3. Project Pulses - highlight completed work\n\nI recommend starting with a Media Pulse about your expertise in ${userContext.skillAreas[0] || "your field"}.\n\nQuick Response Options: "Create a Pulse", "Media tips", "Poll ideas", "Engagement strategies"`,
    
    // Job search/interview focused responses
    job_search: `For your job search as a ${userContext.latestJobTitle || "professional"} with ${userContext.yearsExperience} years of experience, focus on highlighting:\n\n1. Your experience at ${userContext.latestCompany || "your current company"}\n2. Your expertise in ${userContext.skillAreas[0] || "your primary skill area"}\n3. Measurable achievements that demonstrate your impact\n\nPrepare stories that showcase leadership, problem-solving, and adaptability.\n\nQuick Response Options: "Interview preparation", "Salary negotiation", "Application tactics", "Remote interview tips"`,
    
    // Content creation suggestions
    content_creation: `Based on your background in ${userContext.industryExpertise || "your industry"}, here are content ideas to share:\n\n1. Insights on trends in ${userContext.industryExpertise || "your field"}\n2. Case studies from your work with ${userContext.latestCompany || "clients/companies"}\n3. Tips related to ${userContext.skillAreas[0] || "your expertise"}\n\nConsistent content sharing improves your visibility and positions you as a thought leader.\n\nQuick Response Options: "Content calendar", "Media types", "Engagement tactics", "Analytics tracking"`
  };
  
  // Default fallbacks for categories without specific templates
  const generalCategories: Record<string, string> = {
    career_advancement: responseTemplates.career_advancement_mid,
    resume_improvement: responseTemplates.resume_improvement_optimization,
    platform_help: responseTemplates.platform_help_profile,
  };
  
  // Return the appropriate personalized response
  return responseTemplates[category] || generalCategories[category] || responseTemplates.general_guidance;
}

// Helper functions for response generation
function getRelevantSkills(industry: string): string[] {
  const industrySkills: Record<string, string[]> = {
    'Technology': ['Cloud architecture', 'DevOps', 'Full-stack development', 'Machine learning', 'Data engineering'],
    'Finance': ['Financial modeling', 'Risk assessment', 'Portfolio management', 'Blockchain', 'Regulatory compliance'],
    'Healthcare': ['Electronic health records', 'Clinical data analysis', 'Healthcare informatics', 'Regulatory compliance', 'Patient care coordination'],
    'Marketing': ['Digital marketing analytics', 'Content strategy', 'SEO/SEM', 'Marketing automation', 'Brand development'],
    'Manufacturing': ['Lean manufacturing', 'Supply chain optimization', 'Quality management systems', 'Industrial automation', 'Inventory management'],
    'Consulting': ['Business analysis', 'Change management', 'Process improvement', 'Stakeholder management', 'Strategic planning'],
    'Education': ['Curriculum development', 'Educational technology', 'Student assessment', 'Instructional design', 'Learning management systems'],
    'Design': ['UX/UI design', 'Design systems', 'User research', 'Prototyping', 'Visual design'],
    'Legal': ['Legal research', 'Contract analysis', 'Case management', 'Regulatory compliance', 'Legal writing']
  };
  
  return industrySkills[industry] || ['Strategic planning', 'Project management', 'Data analysis', 'Leadership', 'Communication'];
}

function getRecommendedTemplate(userContext: any): string {
  const { industryExpertise, careerStage } = userContext;
  
  const industryTemplates: Record<string, string> = {
    'Technology': 'Dynamic Innovator',
    'Finance': 'Corporate Executive',
    'Healthcare': 'Scholar',
    'Marketing': 'Visual Expert',
    'Design': 'Visual Expert',
    'Consulting': 'Corporate Executive',
    'Education': 'Scholar',
    'Manufacturing': 'Minimalist Pro',
    'Legal': 'Corporate Executive'
  };
  
  // Default mapping by career stage if no industry match
  if (!industryTemplates[industryExpertise]) {
    if (careerStage === 'executive_level') return 'Corporate Executive';
    if (careerStage === 'senior_level') return 'Minimalist Pro';
    if (careerStage === 'mid_level') return 'Dynamic Innovator';
    return 'Freelancer Hub';
  }
  
  return industryTemplates[industryExpertise];
}