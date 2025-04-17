/**
 * Recommendation Rules
 * 
 * Defines the rules and parameters used for matching algorithms
 * based on user criteria and context.
 */

import { MatchCriteria, MatchingContext, MatchingRules } from "../types/index";

/**
 * Get recommendation rules based on match criteria and context
 */
export function getRecommendationRules(
  criteria: MatchCriteria,
  context: MatchingContext
): MatchingRules {
  // Base rules with default weights
  const rules: MatchingRules = {
    weights: {
      skill: 2.0,
      industry: 1.5,
      experience: 1.0,
      location: 1.0,
      profile: 1.0
    },
    skillRules: {
      requiredSkills: [],
      preferredSkills: [],
      complementarySkillsWeight: 0.7,
      skillLevelImportance: 0.5,
      minimumSkillMatch: 0.3
    },
    industryRules: {
      targetIndustries: [],
      relatedIndustriesWeight: 0.8,
      domainSpecificityWeight: 0.6,
      crossIndustryExperienceValue: 0.5
    },
    experienceRules: {
      minExperienceYears: 0,
      maxExperienceYears: Infinity,
      seniorityWeight: 0.8,
      careerTrajectoryWeight: 0.6,
      companyReputationWeight: 0.4
    },
    profileRules: {
      educationWeight: 0.7,
      projectsWeight: 0.8,
      activityLevelWeight: 0.5,
      profileCompletenessWeight: 0.4,
      collaborationHistoryWeight: 0.6
    }
  };
  
  // Customize rules based on "lookingFor" criteria
  customizeRulesByGoal(rules, criteria, context);
  
  // Adjust based on specific criteria provided
  if (criteria.skills && criteria.skills.length > 0) {
    rules.skillRules.preferredSkills = [...criteria.skills];
    rules.weights.skill = 3.0; // Increase weight for skills
  }
  
  if (criteria.industry) {
    rules.industryRules.targetIndustries = [criteria.industry];
    rules.weights.industry = 2.0; // Increase weight for industry
  }
  
  if (criteria.location) {
    rules.weights.location = 2.0; // Increase weight for location
  }
  
  if (criteria.experienceLevel) {
    adjustExperienceRules(rules, criteria.experienceLevel);
  }
  
  // Apply personalization based on context level
  applyPersonalization(rules, context);
  
  return rules;
}

/**
 * Customize rules based on the user's goal ("lookingFor")
 */
function customizeRulesByGoal(
  rules: MatchingRules,
  criteria: MatchCriteria,
  context: MatchingContext
): void {
  const lookingFor = criteria.lookingFor?.toLowerCase() || "";
  
  // Mentorship-seeking
  if (lookingFor.includes("mentor")) {
    // Looking for a mentor: prioritize higher experience and industry match
    rules.weights.experience = 3.0;
    rules.weights.industry = 2.5;
    rules.weights.skill = 2.0;
    rules.weights.profile = 1.5;
    rules.weights.location = 0.5; // Lower priority for location in mentorship
    
    // Prefer people with more experience
    rules.experienceRules.minExperienceYears = 5;
    rules.experienceRules.seniorityWeight = 1.5;
    rules.experienceRules.careerTrajectoryWeight = 1.2;
    
    // Skill complementarity is more important
    rules.skillRules.complementarySkillsWeight = 1.2;
  }
  
  // Mentoring others
  else if (lookingFor.includes("mentee") || lookingFor.includes("to mentor")) {
    // Looking to mentor: find people with less experience but high potential
    rules.weights.experience = 2.5;
    rules.weights.skill = 2.0;
    rules.weights.industry = 2.0;
    rules.weights.profile = 1.5;
    rules.weights.location = 0.5;
    
    // Prefer people with less experience
    rules.experienceRules.maxExperienceYears = 5;
    rules.experienceRules.careerTrajectoryWeight = 1.5; // Career trajectory is important
    
    // Skill gaps are important
    rules.skillRules.minimumSkillMatch = 0.2; // Lower minimum to find people with skill gaps
  }
  
  // Job opportunities / hiring
  else if (lookingFor.includes("job") || lookingFor.includes("hire") || lookingFor.includes("employment")) {
    // Job-related matching: skills and experience are critical
    rules.weights.skill = 3.5;
    rules.weights.experience = 3.0;
    rules.weights.industry = 2.0;
    rules.weights.location = 2.0; // Location more important for jobs
    rules.weights.profile = 1.0;
    
    // Required skills are important
    if (criteria.skills) {
      rules.skillRules.requiredSkills = criteria.skills;
    }
    
    // Experience level is more strictly evaluated
    rules.experienceRules.seniorityWeight = 1.5;
    rules.experienceRules.companyReputationWeight = 1.2;
  }
  
  // Collaboration / project partners
  else if (lookingFor.includes("collaborat") || lookingFor.includes("partner") || lookingFor.includes("project")) {
    // Collaboration: balanced skill sets, complementary expertise
    rules.weights.skill = 3.0;
    rules.weights.profile = 2.5; // Project history is important
    rules.weights.industry = 1.5;
    rules.weights.experience = 1.5;
    rules.weights.location = 1.0;
    
    // Project experience is crucial
    rules.profileRules.projectsWeight = 1.5;
    rules.profileRules.collaborationHistoryWeight = 1.5;
    
    // Complementary skills are valuable
    rules.skillRules.complementarySkillsWeight = 1.5;
  }
  
  // Networking / connections
  else if (lookingFor.includes("network") || lookingFor.includes("connect")) {
    // General networking: balanced across dimensions
    rules.weights.industry = 2.0;
    rules.weights.profile = 2.0;
    rules.weights.skill = 1.5;
    rules.weights.experience = 1.5;
    rules.weights.location = 1.5;
    
    // Industry connections and cross-industry value
    rules.industryRules.relatedIndustriesWeight = 1.0;
    rules.industryRules.crossIndustryExperienceValue = 1.0;
    
    // Activity level matters for networking
    rules.profileRules.activityLevelWeight = 1.2;
  }
  
  // Advisory / consulting
  else if (lookingFor.includes("advisor") || lookingFor.includes("consult")) {
    // Advisory relationships: expertise and experience
    rules.weights.experience = 3.0;
    rules.weights.industry = 2.5;
    rules.weights.skill = 2.0;
    rules.weights.profile = 1.5;
    rules.weights.location = 0.5;
    
    // Domain expertise is crucial
    rules.industryRules.domainSpecificityWeight = 1.5;
    
    // Experienced professionals
    rules.experienceRules.minExperienceYears = 7;
    rules.experienceRules.seniorityWeight = 1.5;
  }
  
  // Default / general matching
  else {
    // Use the base rules with minor adjustments based on context
    adaptRulesToContext(rules, context);
  }
}

/**
 * Adjust experience rules based on specified experience level
 */
function adjustExperienceRules(rules: MatchingRules, experienceLevel: string): void {
  const level = experienceLevel.toLowerCase();
  
  if (level.includes("entry") || level.includes("junior")) {
    rules.experienceRules.minExperienceYears = 0;
    rules.experienceRules.maxExperienceYears = 3;
  } 
  else if (level.includes("mid")) {
    rules.experienceRules.minExperienceYears = 3;
    rules.experienceRules.maxExperienceYears = 7;
  } 
  else if (level.includes("senior")) {
    rules.experienceRules.minExperienceYears = 7;
    rules.experienceRules.maxExperienceYears = 15;
  } 
  else if (level.includes("lead") || level.includes("principal")) {
    rules.experienceRules.minExperienceYears = 8;
    rules.experienceRules.maxExperienceYears = 20;
  } 
  else if (level.includes("manager") || level.includes("management")) {
    rules.experienceRules.minExperienceYears = 5;
    rules.experienceRules.maxExperienceYears = 25;
  } 
  else if (level.includes("director") || level.includes("executive") || level.includes("vp") || level.includes("chief")) {
    rules.experienceRules.minExperienceYears = 10;
    rules.experienceRules.maxExperienceYears = Infinity;
  }
}

/**
 * Apply personalization adjustments based on context
 */
function applyPersonalization(rules: MatchingRules, context: MatchingContext): void {
  // Only apply advanced personalization if context has enough data
  if (context.applicationContext.personalizationLevel >= 2) {
    // Add preferred skills from context if not explicitly provided
    if (rules.skillRules.preferredSkills.length === 0 && context.userPreferences.preferredSkills.length > 0) {
      rules.skillRules.preferredSkills = [...context.userPreferences.preferredSkills];
    }
    
    // Add target industries from context if not explicitly provided
    if (rules.industryRules.targetIndustries.length === 0 && context.userPreferences.preferredIndustries.length > 0) {
      rules.industryRules.targetIndustries = [...context.userPreferences.preferredIndustries];
    }
    
    // Apply skill gap insights for complementary skills
    if (context.userInsights.skillGaps.length > 0) {
      // Add skill gaps to preferred skills with lower weight
      rules.skillRules.complementarySkillsWeight += 0.3;
    }
    
    // Apply career path insights
    if (context.userInsights.careerPath.length > 0) {
      // Identify career stage and adjust accordingly
      rules.experienceRules.careerTrajectoryWeight += 0.2;
    }
  }
  
  // For highest personalization level, apply advanced rules
  if (context.applicationContext.personalizationLevel >= 3) {
    // Use engagement patterns to adjust weights
    if (context.userInsights.engagementMetrics && 
        context.userInsights.engagementMetrics.profileCompleteness > 0.8) {
      // Users with complete profiles value others with complete profiles
      rules.profileRules.profileCompletenessWeight += 0.3;
    }
    
    // Use network analysis to adjust rules
    if (context.userInsights.networkAnalysis && 
        context.userInsights.networkAnalysis.diversityScore < 0.5) {
      // Users with less diverse networks would benefit from industry diversity
      rules.industryRules.crossIndustryExperienceValue += 0.3;
    }
  }
}

/**
 * Adapt rules based on general context insights
 */
function adaptRulesToContext(rules: MatchingRules, context: MatchingContext): void {
  // Adjust based on overall purpose
  if (context.applicationContext.purpose === "connection") {
    // For general connections, keep a balanced approach
    rules.weights.industry = 1.8;
    rules.weights.profile = 1.8;
    rules.weights.skill = 1.5;
    rules.weights.experience = 1.5;
    rules.weights.location = 1.2;
  } else if (context.applicationContext.purpose === "career") {
    // For career development, emphasize experience and industry
    rules.weights.experience = 2.0;
    rules.weights.industry = 2.0;
    rules.weights.skill = 1.8;
    rules.weights.profile = 1.5;
    rules.weights.location = 1.0;
  }
}