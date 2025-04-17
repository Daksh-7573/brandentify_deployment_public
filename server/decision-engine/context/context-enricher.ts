/**
 * Context Enricher
 * 
 * Enriches the matching context with user insights, preferences,
 * and behavioral data to improve matching quality.
 */

import { UserProfileData, MatchCriteria, MatchingContext } from "../types/index";
import { storage } from "../../storage";

/**
 * Enrich matching context with user insights and preferences
 */
export async function enrichContextWithUserInsights(
  userProfile: UserProfileData,
  criteria: MatchCriteria
): Promise<MatchingContext> {
  // Initialize context with basic data
  const context: MatchingContext = {
    userPreferences: {
      preferredIndustries: [],
      preferredSkills: [],
      preferredLocations: [],
      preferredRoles: []
    },
    userInsights: {
      skillGaps: [],
      careerPath: [],
      activityPatterns: {},
      engagementMetrics: {},
      networkAnalysis: {}
    },
    applicationContext: {
      purpose: criteria.lookingFor || "connection",
      source: "smart-connect",
      personalizationLevel: 1 // Default personalization level
    }
  };
  
  // Extract preferred industries from criteria and work history
  if (criteria.industry) {
    context.userPreferences.preferredIndustries.push(criteria.industry);
  } else if (userProfile.user.industry) {
    context.userPreferences.preferredIndustries.push(userProfile.user.industry);
  }
  
  // Add industries from work experience if available
  userProfile.workExperiences.forEach(exp => {
    if (exp.industry && !context.userPreferences.preferredIndustries.includes(exp.industry)) {
      context.userPreferences.preferredIndustries.push(exp.industry);
    }
  });
  
  // Extract preferred skills from criteria and user skills
  if (criteria.skills && criteria.skills.length > 0) {
    context.userPreferences.preferredSkills = [...criteria.skills];
  } else {
    // Use user's top skills as preferences
    const userSkills = userProfile.skills
      .sort((a, b) => {
        // Sort by proficiency if available, otherwise by name
        if (a.proficiency && b.proficiency) {
          return b.proficiency - a.proficiency;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5) // Take top 5 skills
      .map(skill => skill.name);
    
    context.userPreferences.preferredSkills = userSkills;
  }
  
  // Extract preferred locations
  if (criteria.location) {
    context.userPreferences.preferredLocations.push(criteria.location);
  } else if (userProfile.user.location) {
    context.userPreferences.preferredLocations.push(userProfile.user.location);
  }
  
  // Extract preferred roles
  if (criteria.targetJobTitle) {
    context.userPreferences.preferredRoles.push(criteria.targetJobTitle);
  } else if (userProfile.user.title) {
    context.userPreferences.preferredRoles.push(userProfile.user.title);
  }
  
  // Add historical roles from work experience
  userProfile.workExperiences.forEach(exp => {
    if (exp.title && !context.userPreferences.preferredRoles.includes(exp.title)) {
      context.userPreferences.preferredRoles.push(exp.title);
    }
  });
  
  // Analyze skills to find potential skill gaps
  await analyzeSkillGaps(userProfile, context);
  
  // Analyze career path based on work history
  analyzeCareerPath(userProfile, context);
  
  // Analyze activity patterns (in a real implementation, this would use actual user activity data)
  await analyzeActivityPatterns(userProfile.user.id, context);
  
  // Analyze engagement metrics
  await analyzeEngagementMetrics(userProfile.user.id, context);
  
  // Analyze network
  await analyzeNetwork(userProfile.user.id, context);
  
  // Set personalization level based on available data
  context.applicationContext.personalizationLevel = calculatePersonalizationLevel(context);
  
  return context;
}

/**
 * Analyze user's skills and identify potential skill gaps
 */
async function analyzeSkillGaps(userProfile: UserProfileData, context: MatchingContext): Promise<void> {
  const userSkills = new Set(userProfile.skills.map(s => s.name.toLowerCase()));
  
  // For a real implementation, you would:
  // 1. Get industry skill benchmarks from a database or API
  // 2. Compare user's skills against relevant benchmarks
  // 3. Identify missing critical skills for their industry/role
  
  // For this prototype, we'll use some static industry skill mappings
  const industrySkills: Record<string, string[]> = {
    "technology": ["programming", "software development", "cloud computing", "agile", "devops"],
    "design": ["ui design", "ux design", "user research", "figma", "sketch", "adobe creative suite"],
    "marketing": ["digital marketing", "content creation", "seo", "social media", "analytics"],
    "finance": ["financial analysis", "accounting", "investment", "risk management", "excel"],
    "healthcare": ["patient care", "medical research", "healthcare management", "clinical expertise"]
  };
  
  // Check if user is in a known industry
  const userIndustry = userProfile.user.industry?.toLowerCase();
  if (userIndustry && industrySkills[userIndustry]) {
    // Find skills that are important for the industry but user doesn't have
    const missingSkills = industrySkills[userIndustry].filter(
      skill => !userSkills.has(skill.toLowerCase())
    );
    
    // Add top 3 missing skills as gaps
    context.userInsights.skillGaps = missingSkills.slice(0, 3);
  }
  
  // Based on role, suggest additional skills
  const userTitle = userProfile.user.title?.toLowerCase() || "";
  
  // Check for common tech roles and their expected skills
  if (userTitle.includes("developer") || userTitle.includes("engineer")) {
    const techSkills = ["algorithms", "data structures", "system design", "testing"];
    const missingTechSkills = techSkills.filter(
      skill => !userSkills.has(skill.toLowerCase())
    );
    
    // Add missing tech skills to gaps
    context.userInsights.skillGaps = [
      ...context.userInsights.skillGaps,
      ...missingTechSkills
    ].slice(0, 5); // Limit to 5 total skill gaps
  }
  
  // Check for management roles
  if (userTitle.includes("manager") || userTitle.includes("director") || userTitle.includes("lead")) {
    const managementSkills = ["leadership", "team management", "strategic planning", "negotiation"];
    const missingManagementSkills = managementSkills.filter(
      skill => !userSkills.has(skill.toLowerCase())
    );
    
    // Add missing management skills to gaps
    context.userInsights.skillGaps = [
      ...context.userInsights.skillGaps,
      ...missingManagementSkills
    ].slice(0, 5); // Limit to 5 total skill gaps
  }
}

/**
 * Analyze user's career path based on work history
 */
function analyzeCareerPath(userProfile: UserProfileData, context: MatchingContext): void {
  if (!userProfile.workExperiences.length) {
    return; // No work experiences to analyze
  }
  
  // Sort experiences by start date (oldest first)
  const sortedExperiences = [...userProfile.workExperiences].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Extract career progression as sequence of roles
  const careerPath = sortedExperiences.map(exp => {
    return {
      title: exp.title,
      company: exp.company,
      industry: exp.industry || userProfile.user.industry || ""
    };
  });
  
  // Store career path in context
  context.userInsights.careerPath = careerPath.map(step => 
    `${step.title} at ${step.company} (${step.industry})`
  );
  
  // For a real implementation, you would also:
  // 1. Analyze role transitions and progression patterns
  // 2. Identify unusual or accelerated career moves
  // 3. Determine typical next career steps based on similar profiles
}

/**
 * Analyze user activity patterns
 */
async function analyzeActivityPatterns(userId: number, context: MatchingContext): Promise<void> {
  // In a real implementation, this would analyze:
  // - Posting/engagement frequency
  // - Time of day active
  // - Content types created/engaged with
  // - Response patterns
  
  // For this prototype, we'll use placeholder data
  context.userInsights.activityPatterns = {
    activeFrequency: "weekly",
    primaryActivityType: "content consumption",
    responseRate: 0.7
  };
}

/**
 * Analyze user engagement metrics
 */
async function analyzeEngagementMetrics(userId: number, context: MatchingContext): Promise<void> {
  // In a real implementation, this would analyze:
  // - Profile completion
  // - Connection activity
  // - Content created/shared
  // - Comments and reactions
  
  try {
    // Get pulses created by the user
    const userPulses = await storage.getPulsesByUserId(userId);
    
    // Get comments by the user - since we don't have a direct method to get comments by user ID,
    // we'll create a placeholder for now - in a real implementation, this would fetch from the database
    const userComments = [];
    
    // Get reactions by the user - since we don't have a direct method to get reactions by user ID,
    // we'll create a placeholder for now - in a real implementation, this would fetch from the database
    const userReactions = [];
    
    // Calculate engagement metrics
    context.userInsights.engagementMetrics = {
      contentCreated: userPulses.length,
      commentsPosted: userComments.length,
      reactionsGiven: userReactions.length,
      lastActiveDate: new Date().toISOString().split('T')[0], // Today's date as ISO string
      profileCompleteness: calculateProfileCompleteness(context.userInsights)
    };
  } catch (error) {
    console.error("Error analyzing engagement metrics:", error);
    // Use default/placeholder values
    context.userInsights.engagementMetrics = {
      contentCreated: 0,
      commentsPosted: 0,
      reactionsGiven: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      profileCompleteness: 0.5
    };
  }
}

/**
 * Analyze user's network
 */
async function analyzeNetwork(userId: number, context: MatchingContext): Promise<void> {
  // In a real implementation, this would analyze:
  // - Network size and growth
  // - Connection demographics
  // - Interaction patterns
  // - Clusters and communities
  
  // For this prototype, we'll use placeholder data
  context.userInsights.networkAnalysis = {
    networkSize: "growing",
    connectionTypes: ["industry peers", "colleagues"],
    diversityScore: 0.6
  };
}

/**
 * Calculate profile completeness
 */
function calculateProfileCompleteness(userInsights: any): number {
  // In a real implementation, this would be based on:
  // - Required profile fields completed
  // - Optional profile fields completed
  // - Media and content uploaded
  // - Verification status
  
  return 0.7; // 70% complete (placeholder)
}

/**
 * Calculate personalization level based on available data
 */
function calculatePersonalizationLevel(context: MatchingContext): number {
  // Count how many preference categories have data
  let dataPoints = 0;
  
  if (context.userPreferences.preferredIndustries.length > 0) dataPoints++;
  if (context.userPreferences.preferredSkills.length > 0) dataPoints++;
  if (context.userPreferences.preferredLocations.length > 0) dataPoints++;
  if (context.userPreferences.preferredRoles.length > 0) dataPoints++;
  
  // Count insight categories with data
  if (context.userInsights.skillGaps.length > 0) dataPoints++;
  if (context.userInsights.careerPath.length > 0) dataPoints++;
  if (Object.keys(context.userInsights.activityPatterns).length > 0) dataPoints++;
  if (Object.keys(context.userInsights.engagementMetrics).length > 0) dataPoints++;
  if (Object.keys(context.userInsights.networkAnalysis).length > 0) dataPoints++;
  
  // Calculate personalization level (1-3)
  if (dataPoints >= 7) {
    return 3; // High personalization
  } else if (dataPoints >= 4) {
    return 2; // Medium personalization
  } else {
    return 1; // Basic personalization
  }
}