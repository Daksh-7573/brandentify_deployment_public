/**
 * Musk Intelligence System - Local AI Version
 * Enhanced framework for Musk AI using local models instead of OpenAI
 */
import { User, WorkExperience, Education, Skill, Project } from "@shared/schema";
import { localAIService } from "./local-ai-service";

export interface MuskContext {
  userId?: string | number;
  userData?: Partial<User>;
  experiences?: Partial<WorkExperience>[];
  educations?: Partial<Education>[];
  skills?: Partial<Skill>[];
  projects?: Partial<Project>[];
  resumeData?: any;
  userMemory?: UserMemory;
  dataSource?: string;
  page?: string;
  section?: string;
}

export interface UserMemory {
  interactions: {
    timestamp: Date;
    message: string;
    response: string;
  }[];
  patterns: {
    communicationStyle?: string;
    topicPreferences?: Record<string, number>;
    engagementLevel?: string;
    responseStyle?: string;
  };
}

/**
 * Generate personalized career advice using local AI models
 */
export async function generatePersonalizedResponse(
  message: string,
  context: MuskContext
): Promise<string> {
  try {
    console.log("Musk intelligence system processing message with context:", {
      message: message.substring(0, 50) + "...",
      userId: context.userId,
      hasUserData: !!context.userData,
      experiencesCount: context.experiences?.length || 0,
      skillsCount: context.skills?.length || 0
    });

    // Determine user intent
    const intent = determineUserIntent(message, context);
    console.log(`Detected intent: ${intent}`);

    // Build user profile for local AI service
    const userProfile = {
      user: {
        name: context.userData?.name || "Professional",
        title: context.userData?.title,
        industry: context.userData?.industry,
        lookingFor: context.userData?.lookingFor
      },
      workExperiences: context.experiences || [],
      skills: (context.skills || []).map(skill => ({
        name: skill.name || "",
        proficiency: 80,
        level: skill.level
      })),
      educations: context.educations || [],
      adviceType: intent,
      customAdviceText: message
    };

    // Generate response using local AI service
    const aiResponse = await localAIService.generateCareerAdvice(userProfile);
    
    // Format response with personalization and smart quick responses
    const finalResponse = formatResponseWithPersonalization(aiResponse, context);
    
    return finalResponse;
  } catch (error) {
    console.error("Error in Musk intelligence system:", error);
    // Provide intelligent fallback response based on user intent and context
    return generateIntelligentFallbackResponse(message, context);
  }
}

/**
 * Determine user intent from message content
 */
function determineUserIntent(message: string, context: MuskContext): string {
  const lowercaseMessage = message.toLowerCase();
  
  // Intent mapping based on keywords
  const intentMap = {
    profile_optimization: ["standout profile", "standout", "profile", "improve profile", "better profile", "profile tips", "enhance profile"],
    industry_trends: ["industries", "industry", "growing", "trending", "hot sectors", "market trends", "emerging markets"],
    career_growth: ["next step", "advance", "promotion", "progress", "career development"],
    skill_development: ["skills", "learn", "improve", "certification", "courses"],
    career_change: ["change career", "switch", "transition", "new field"],
    interview_prep: ["interview", "prepare", "questions", "assessment"],
    salary_negotiation: ["salary", "compensation", "negotiate", "raise"],
    networking: ["network", "connect", "linkedin", "contacts"],
    resume_feedback: ["resume", "cv", "application"],
    work_experience: ["experience", "internship", "entry level", "first job"]
  };

  // Find best matching intent
  let bestIntent = "career_advice";
  let maxMatches = 0;

  for (const [intent, keywords] of Object.entries(intentMap)) {
    const matches = keywords.filter(keyword => lowercaseMessage.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestIntent = intent;
    }
  }

  return bestIntent;
}



/**
 * Analyze user's career profile from available data
 */
function analyzeCareerProfile(context: MuskContext) {
  return {
    careerStage: determineCareerStage(context),
    primarySkills: extractPrimarySkills(context),
    industryExperience: extractIndustryExperience(context),
    educationLevel: extractEducationLevel(context),
    profileCompleteness: calculateProfileCompleteness(context)
  };
}

function determineCareerStage(context: MuskContext): string {
  const experienceCount = context.experiences?.length || 0;
  if (experienceCount === 0) return "entry_level";
  if (experienceCount <= 2) return "early_career";
  if (experienceCount <= 5) return "mid_career";
  return "senior_level";
}

function extractPrimarySkills(context: MuskContext): string[] {
  return (context.skills || [])
    .map(skill => skill.name)
    .filter(name => name)
    .slice(0, 5) as string[];
}

function extractIndustryExperience(context: MuskContext): string[] {
  const industries = new Set<string>();
  (context.experiences || []).forEach(exp => {
    if (exp.industry) industries.add(exp.industry);
  });
  return Array.from(industries);
}

function extractEducationLevel(context: MuskContext): string {
  const educations = context.educations || [];
  if (educations.some(edu => edu.degree?.toLowerCase().includes("phd"))) return "doctorate";
  if (educations.some(edu => edu.degree?.toLowerCase().includes("master"))) return "masters";
  if (educations.some(edu => edu.degree?.toLowerCase().includes("bachelor"))) return "bachelors";
  return "other";
}

function calculateProfileCompleteness(context: MuskContext): number {
  let score = 0;
  if (context.userData?.name) score += 20;
  if (context.userData?.title) score += 20;
  if ((context.experiences?.length || 0) > 0) score += 20;
  if ((context.skills?.length || 0) > 0) score += 20;
  if ((context.educations?.length || 0) > 0) score += 20;
  return score;
}

/**
 * Format response with personalization and smart quick responses
 */
function formatResponseWithPersonalization(response: string, context: MuskContext): string {
  let formattedResponse = response;

  // Add personalization based on user data
  if (context.userData?.name) {
    // Ensure response feels personal
    if (!formattedResponse.includes(context.userData.name)) {
      formattedResponse = `Hi ${context.userData.name}! ${formattedResponse}`;
    }
  }

  // Add context-specific formatting
  if (context.page && !formattedResponse.includes("follow-up")) {
    formattedResponse += "\n\nFeel free to ask any follow-up questions about your career development!";
  }

  // Add smart quick response options based on user profile and context
  const quickResponses = generateSmartQuickResponses(context);
  
  if (quickResponses.length > 0) {
    formattedResponse += `\n\nQuick Response Options: ${quickResponses.map(q => `"${q}"`).join(", ")}`;
  }
  
  return formattedResponse;
}

/**
 * Generate smart quick response options based on user context
 */
function generateSmartQuickResponses(context: MuskContext): string[] {
  const responses: string[] = [];
  const hasExperiences = (context.experiences?.length || 0) > 0;
  const hasSkills = (context.skills?.length || 0) > 0;
  const hasEducation = (context.educations?.length || 0) > 0;
  const hasProjects = (context.projects?.length || 0) > 0;
  const userTitle = context.userData?.title;
  const userIndustry = context.userData?.industry;
  
  // Career growth suggestions based on profile
  if (hasExperiences) {
    responses.push("What's my next career step?");
    responses.push("How can I advance in my current role?");
  } else {
    responses.push("How do I start my career?");
    responses.push("What entry-level positions should I consider?");
  }
  
  // Skill development based on profile
  if (hasSkills) {
    responses.push("Which skills should I develop further?");
  } else {
    responses.push("What skills are essential for my field?");
  }
  
  // Industry-specific suggestions
  if (userIndustry) {
    responses.push(`What are the trends in ${userIndustry}?`);
  } else {
    responses.push("Help me identify my ideal industry");
  }
  
  // Resume and profile optimization
  if (hasExperiences || hasEducation || hasProjects) {
    responses.push("How can I improve my professional profile?");
  } else {
    responses.push("How do I build a strong professional profile?");
  }
  
  // Return top 3 most relevant suggestions
  return responses.slice(0, 3);
}

/**
 * Generate intelligent fallback response when AI services are unavailable
 */
function generateIntelligentFallbackResponse(message: string, context: MuskContext): string {
  const intent = determineUserIntent(message, context);
  const userName = context.userData?.name || "Professional";
  const userTitle = context.userData?.title || "your current role";
  const hasExperiences = (context.experiences?.length || 0) > 0;
  const hasSkills = (context.skills?.length || 0) > 0;
  const userIndustry = context.userData?.industry;

  // Generate contextual response based on intent and user profile
  switch (intent) {
    case 'profile_optimization':
      return generateProfileOptimizationAdvice(userName, context);
    
    case 'industry_trends':
      return generateIndustryTrendsAdvice(userName, context);
    
    case 'networking':
      return generateNetworkingAdvice(userName, userTitle, userIndustry, hasExperiences, context);
    
    case 'career_growth':
      return generateCareerGrowthAdvice(userName, userTitle, hasExperiences, hasSkills, context);
    
    case 'skill_development':
      return generateSkillDevelopmentAdvice(userName, context);
    
    case 'career_change':
      return generateCareerChangeAdvice(userName, userTitle, hasExperiences, context);
    
    case 'interview_prep':
      return generateInterviewPrepAdvice(userName, userTitle, context);
    
    case 'salary_negotiation':
      return generateSalaryNegotiationAdvice(userName, userTitle, hasExperiences, context);
    
    case 'work_experience':
      return generateWorkExperienceAdvice(userName, hasExperiences, context);
    
    default:
      return generateGeneralCareerAdvice(userName, userTitle, context);
  }
}

function generateProfileOptimizationAdvice(userName: string, context: MuskContext): string {
  // Analyze user's current profile state
  const profileAnalysis = analyzeCareerProfile(context);
  const hasExperiences = (context.experiences?.length || 0) > 0;
  const hasSkills = (context.skills?.length || 0) > 0;
  const hasProjects = (context.projects?.length || 0) > 0;
  const hasEducation = (context.educations?.length || 0) > 0;
  const currentSkills = context.skills?.map(s => s.name).filter(Boolean) || [];
  const projectCount = context.projects?.length || 0;
  
  // Calculate current profile strength
  const profileCompleteness = calculateProfileCompleteness(context);
  
  // Generate personalized recommendations based on current state
  let priorityRecommendations = [];
  let strengthsToLeverage = [];
  let immediateActions = [];
  
  // Analyze strengths
  if (projectCount >= 6) {
    strengthsToLeverage.push("Strong project portfolio with " + projectCount + " projects");
  }
  if (hasSkills) {
    strengthsToLeverage.push("Technical skills in " + currentSkills.join(", "));
  }
  if (hasEducation) {
    strengthsToLeverage.push("Educational background");
  }
  
  // Identify gaps and priorities
  if (!context.userData?.title || context.userData.title.trim() === '') {
    priorityRecommendations.push("Add a professional title that clearly defines your role or aspirations");
    immediateActions.push("Update your title to something specific like 'Software Developer', 'Product Manager', or your target role");
  }
  
  if (!context.userData?.industry || context.userData.industry.trim() === '') {
    priorityRecommendations.push("Specify your target industry to help recruiters find you");
    immediateActions.push("Choose an industry that aligns with your " + projectCount + " projects");
  }
  
  if (!context.userData?.location || context.userData.location.trim() === '') {
    priorityRecommendations.push("Add your location for local opportunities and remote work preferences");
  }
  
  if (!hasExperiences) {
    priorityRecommendations.push("Add work experience entries, including internships, freelance work, or significant projects");
    immediateActions.push("Convert your strongest projects into 'experience' entries with specific achievements");
  }
  
  if (!context.userData?.aboutMe || context.userData.aboutMe.trim() === '') {
    priorityRecommendations.push("Write a compelling professional summary that highlights your unique value");
  }
  
  return `Hi ${userName}! I've analyzed your profile and here's how to make it standout:

# Profile Analysis for ${userName}

## Current Strengths
${strengthsToLeverage.length > 0 ? strengthsToLeverage.map(s => `✓ ${s}`).join('\n') : '• Building a solid foundation with your current efforts'}

## Profile Completeness: ${profileCompleteness}%

## Priority Improvements (Do These First)
${priorityRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Immediate Action Items
${immediateActions.length > 0 ? immediateActions.map((action, i) => `• ${action}`).join('\n') : '• Focus on adding missing profile sections mentioned above'}

## Maximize Brandentifier's Profile Features
- **Industry Pulse**: Share insights about your ${projectCount} projects to establish expertise
- **Nowboard**: Create opportunities showcasing your project capabilities
- **Career Capsule**: Document your professional journey and achievements
- **Smart Connect**: Let our AI match you with relevant professionals based on your skills
- **Mentorship Features**: Offer your project expertise or seek guidance from industry leaders

## Leverage Your ${projectCount} Projects on Brandentifier
- Showcase each project with detailed case studies and outcomes
- Use Industry Pulse to share project insights and lessons learned
- Create Nowboard opportunities related to your project expertise
- Highlight specific technologies and problems solved in your profile
- Connect your projects to trending industry topics

## Skills Strategy Using Brandentifier
${hasSkills ? 
  `- Use your ${currentSkills.join(', ')} skills to engage in relevant Industry Pulse discussions
- Create Nowboard opportunities that leverage your existing expertise
- Complete Career Quests to validate and expand your skill set` :
  `- Add technical skills from your projects to attract the right connections
- Participate in Industry Pulse discussions to learn and demonstrate knowledge
- Use Career Quests to systematically build and validate new skills`
}

## Professional Branding on Brandentifier
- Create compelling content on Industry Pulse to establish thought leadership
- Use consistent professional messaging across all Brandentifier features
- Engage authentically with the professional community
- Showcase your unique perspective through project stories and insights

## Next Steps to Stand Out on Brandentifier
1. Complete all missing profile sections identified above
2. Create your first Industry Pulse post about one of your projects
3. Set up at least one Nowboard opportunity showcasing your expertise
4. Engage with 3-5 trending discussions in Industry Pulse
5. Complete your first Career Quest to demonstrate active growth

Your ${projectCount} projects show you're actively building things - that's excellent! Now let's make sure your profile tells that story effectively.

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateIndustryTrendsAdvice(userName: string, context: MuskContext): string {
  return `Hi ${userName}! Here are the fastest-growing industries and career opportunities:

# Top Growing Industries for 2025

## Technology & AI
- **Artificial Intelligence & Machine Learning**: AI engineers, data scientists, prompt engineers
- **Cybersecurity**: Security analysts, ethical hackers, compliance specialists
- **Cloud Computing**: Cloud architects, DevOps engineers, solutions architects
- **Software Development**: Full-stack developers, mobile app developers, API specialists

## Healthcare & Biotechnology
- **Digital Health**: Telemedicine specialists, health informatics, medical device engineers
- **Mental Health Services**: Therapists, counselors, wellness coaches
- **Biotechnology**: Research scientists, clinical trial coordinators, regulatory affairs
- **Elder Care**: Geriatric care specialists, home health aides, care coordinators

## Green Energy & Sustainability
- **Renewable Energy**: Solar/wind technicians, energy analysts, project managers
- **Environmental Consulting**: Sustainability consultants, environmental engineers
- **Electric Vehicles**: Battery engineers, charging infrastructure specialists
- **Green Construction**: LEED specialists, sustainable design architects

## E-commerce & Digital Marketing
- **Digital Marketing**: SEO specialists, content creators, social media managers
- **E-commerce Operations**: Supply chain analysts, logistics coordinators
- **User Experience**: UX/UI designers, product managers, conversion specialists
- **Data Analytics**: Business analysts, marketing analysts, growth hackers

## Financial Technology
- **Fintech**: Blockchain developers, payment processing specialists
- **Digital Banking**: Mobile banking specialists, financial advisors
- **Investment Technology**: Robo-advisor developers, algorithmic trading specialists
- **Regulatory Technology**: Compliance automation, risk management

## Remote Work Infrastructure
- **Virtual Collaboration**: Platform developers, community managers
- **Digital Training**: Instructional designers, e-learning specialists
- **Remote Work Consulting**: Productivity coaches, virtual team leaders

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateNetworkingAdvice(userName: string, userTitle: string, userIndustry: string | null | undefined, hasExperiences: boolean, context: MuskContext): string {
  const industry = userIndustry ? ` in ${userIndustry}` : "";
  
  return `Hi ${userName}! Here's personalized networking guidance for you as ${userTitle}${industry}:

# Professional Networking Strategy

## Leverage Brandentifier's Networking Features
- **Industry Pulse**: Share insights and engage with trending topics in your field
- **Smart Connect**: Use our intelligent matching system to find relevant professionals
- **Nowboard**: Showcase your opportunities and connect with potential collaborators
- **Mentorship Connect**: Find mentors or offer mentorship in your expertise areas
- **Career Quests**: Complete networking challenges to expand your professional circle

## Building Your Network on Brandentifier
${hasExperiences ? 
  "- Import and showcase your professional experience to attract like-minded professionals\n- Use your work history to connect with colleagues from previous companies" :
  "- Start building your professional presence on Brandentifier's platform\n- Join industry-specific discussions in Industry Pulse"
}

## Advanced Networking Strategies
- Create compelling content on Industry Pulse to establish thought leadership
- Participate in trending discussions to increase your visibility
- Use Brandentifier's Smart Connect to find professionals with complementary skills
- Offer value through Nowboard opportunities before seeking connections
- Engage authentically in the platform's professional community

## External Networking (if needed)
- Attend industry events, conferences, and meetups${industry ? ` focused on ${userIndustry}` : ""}
- Consider other professional platforms only for specific industry requirements
- Maintain consistent professional branding across all platforms

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateCareerGrowthAdvice(userName: string, userTitle: string, hasExperiences: boolean, hasSkills: boolean, context: MuskContext): string {
  return `Hi ${userName}! Here's your personalized career growth roadmap:

# Career Advancement Strategy

## Current Position Analysis
${hasExperiences ? 
  "Based on your work experience, focus on expanding your responsibilities and demonstrating leadership capabilities." :
  "As you build your professional foundation, concentrate on gaining diverse experience and proving your value."
}

## Growth Opportunities
- Seek stretch assignments that challenge your current skill set
- Volunteer for cross-functional projects to broaden your expertise
- Consider lateral moves that provide new perspectives
- Build relationships with senior leaders and mentors

## Skill Enhancement
${hasSkills ?
  "Continue developing your existing skills while identifying emerging competencies in your field." :
  "Focus on building both technical skills and soft skills that are valued in your industry."
}

## Professional Development on Brandentifier
- **Career Quests**: Complete structured learning paths to advance your skills
- **Industry Pulse**: Follow thought leaders and trending topics in your field
- **Mentorship Connect**: Find mentors who can guide your career progression
- **Nowboard**: Explore opportunities that challenge and develop your capabilities

## Additional Development Resources
- Pursue relevant certifications that align with Career Quest recommendations
- Attend industry conferences and share insights on Industry Pulse
- Connect with professional associations through Brandentifier's networking features
- Consider leadership development programs and document progress in Career Capsule

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateSkillDevelopmentAdvice(userName: string, context: MuskContext): string {
  const currentSkills = context.skills?.map(s => s.name).filter(Boolean) || [];
  const hasSkills = currentSkills.length > 0;
  
  return `Hi ${userName}! Here's your personalized skill development plan:

# Skill Development Strategy

## Current Skills Assessment
${hasSkills ? 
  `You've identified skills in: ${currentSkills.join(", ")}. Let's build on this foundation.` :
  "Let's identify and develop the key skills that will accelerate your career growth."
}

## Skill Categories to Focus On
- **Technical Skills**: Industry-specific tools and technologies
- **Soft Skills**: Communication, leadership, and problem-solving
- **Digital Literacy**: Data analysis, digital marketing, or relevant tech skills
- **Business Acumen**: Understanding of business operations and strategy

## Learning Through Brandentifier
- **Career Quests**: Follow structured skill-building paths with measurable progress
- **Industry Pulse**: Learn from expert insights and trending discussions in your field
- **Mentorship Connect**: Get personalized guidance from industry professionals
- **Nowboard**: Find skill-building opportunities and collaborative projects
- **Smart Connect**: Connect with professionals who can teach complementary skills

## Skill Development Strategy
- Complete Career Quests aligned with your target skills
- Share your learning journey on Industry Pulse to demonstrate growth
- Use hands-on projects and document them in your profile
- Engage with mentors through Brandentifier's mentorship features

## Skill Validation on Brandentifier
- Showcase new capabilities through Nowboard opportunities
- Share project outcomes and learnings on Industry Pulse
- Get feedback from mentors and peers in the platform
- Document your skill development progress in Career Capsule
- Use external certifications only when Career Quests don't cover specific areas

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateCareerChangeAdvice(userName: string, userTitle: string, hasExperiences: boolean, context: MuskContext): string {
  return `Hi ${userName}! Here's guidance for your career transition:

# Career Change Strategy

## Transition Planning
${hasExperiences ?
  "Leverage your existing experience while identifying transferable skills for your target field." :
  "Use this early career stage as an opportunity to explore different paths and industries."
}

## Research & Exploration
- Conduct informational interviews with professionals in your target field
- Research industry trends, growth prospects, and required qualifications
- Understand the typical career progression in your desired area
- Identify companies and roles that align with your interests

## Skill Gap Analysis
- Compare your current skills with requirements in your target field
- Identify specific skills, certifications, or experience you need to develop
- Create a learning plan to bridge identified gaps
- Consider transitional roles that combine your current and target expertise

## Making the Transition
- Update your resume to highlight transferable skills and relevant experience
- Network with professionals in your target industry
- Consider contract work, volunteering, or side projects to gain experience
- Be prepared to explain your career change motivation clearly

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateInterviewPrepAdvice(userName: string, userTitle: string, context: MuskContext): string {
  return `Hi ${userName}! Here's your comprehensive interview preparation guide:

# Interview Success Strategy

## Pre-Interview Preparation
- Research the company, its culture, values, and recent developments
- Review the job description and align your experience with key requirements
- Prepare specific examples using the STAR method (Situation, Task, Action, Result)
- Practice common interview questions relevant to ${userTitle} roles

## Key Areas to Prepare
- Your professional story and career progression
- Specific achievements and quantifiable results
- Challenges you've overcome and lessons learned
- Questions about the role, team, and company culture

## Interview Performance
- Arrive early and dress appropriately for the company culture
- Demonstrate enthusiasm and genuine interest in the opportunity
- Listen actively and provide thoughtful, specific responses
- Ask insightful questions that show your research and interest

## Follow-Up Strategy
- Send a thank-you email within 24 hours
- Reference specific conversation points from the interview
- Reiterate your interest and key qualifications
- Be patient but follow up appropriately on timing

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateSalaryNegotiationAdvice(userName: string, userTitle: string, hasExperiences: boolean, context: MuskContext): string {
  return `Hi ${userName}! Here's your salary negotiation strategy:

# Compensation Negotiation Guide

## Market Research
- Research salary ranges for ${userTitle} positions in your location
- Use platforms like Glassdoor, PayScale, and LinkedIn Salary Insights
- Consider industry standards and company size factors
- Factor in your experience level and unique qualifications

## Preparation Strategy
${hasExperiences ?
  "Document your achievements, contributions, and value delivered in previous roles." :
  "Focus on your potential, relevant skills, and any unique qualifications you bring."
}

## Negotiation Approach
- Express gratitude for the offer before discussing adjustments
- Present your research and rationale professionally
- Consider the total compensation package, not just base salary
- Be prepared to discuss benefits, vacation time, and professional development

## Beyond Salary
- Professional development opportunities and training budgets
- Flexible work arrangements or remote work options
- Additional vacation time or sabbatical opportunities
- Stock options, bonuses, or performance incentives

## Negotiation Tips
- Remain professional and collaborative throughout the process
- Give the employer time to consider your request
- Be prepared to compromise and find mutually beneficial solutions
- Get any agreed-upon changes in writing

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateWorkExperienceAdvice(userName: string, hasExperiences: boolean, context: MuskContext): string {
  return `Hi ${userName}! Here's guidance about building your work experience:

# Work Experience Development

## Experience Building Strategy
${hasExperiences ?
  "Continue expanding your experience with strategic role selections and skill development." :
  "Focus on gaining foundational experience while building a strong professional reputation."
}

## Gaining Relevant Experience
- Seek internships, co-op programs, or entry-level positions in your target field
- Volunteer for projects that provide relevant skills and networking opportunities
- Consider freelance or contract work to build a diverse portfolio
- Participate in professional organizations and industry associations

## Maximizing Current Roles
- Take on additional responsibilities beyond your job description
- Volunteer for challenging projects and cross-functional teams
- Seek mentorship from experienced colleagues
- Document your achievements and impact for future reference

## Building Professional Credibility
- Deliver consistent, high-quality work that exceeds expectations
- Develop strong relationships with colleagues and supervisors
- Seek feedback regularly and implement suggestions for improvement
- Maintain a professional online presence and personal brand

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}

function generateGeneralCareerAdvice(userName: string, userTitle: string, context: MuskContext): string {
  return `Hi ${userName}! Here's personalized career guidance for you:

# Professional Development Strategy

## Career Foundation
- Define your professional goals and create a clear career vision
- Identify your strengths, interests, and values to guide your decisions
- Build a strong professional network within and outside your current industry
- Maintain an updated resume and professional online presence

## Continuous Learning
- Stay current with industry trends and emerging technologies
- Pursue relevant certifications and professional development opportunities
- Seek feedback regularly and implement suggestions for improvement
- Consider formal education or specialized training as needed

## Professional Growth
- Take on challenging projects that stretch your capabilities
- Seek mentorship from experienced professionals in your field
- Build both technical expertise and leadership skills
- Document your achievements and impact for future opportunities

## Career Management
- Regularly assess your career progress against your goals
- Be open to new opportunities that align with your long-term vision
- Maintain strong professional relationships and reputation
- Plan for both short-term advancement and long-term career sustainability

${formatResponseWithPersonalization("", context).includes("Quick Response Options") ? "" : 
`\n\nQuick Response Options: ${generateSmartQuickResponses(context).map(q => `"${q}"`).join(", ")}`}`;
}