/**
 * Type definitions for the Brandentifier Decision Engine
 */

import { User, WorkExperience, Education, Skill, Project } from "../../shared/schema";

/**
 * Comprehensive user profile data used for matching
 */
export interface UserProfileData {
  user: User;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
}

/**
 * Criteria used for matching professionals
 */
export interface MatchCriteria {
  lookingFor: string;           // What the user is looking for (e.g., "mentor", "collaborator")
  targetJobTitle?: string;      // Target job title if applicable
  experienceLevel?: string;     // Target experience level
  industry?: string;            // Target industry
  domain?: string;              // Specific domain/expertise within the industry
  location?: string;            // Target location
  skills?: string[];            // Desired skills
  interests?: string[];         // Professional interests
  personalityTraits?: string[]; // Desired personality traits
  availabilityPreference?: string; // Preferred availability (e.g., "full-time", "part-time")
  communicationStyle?: string;  // Preferred communication style
  remotePreference?: boolean;   // Whether remote collaboration is preferred
}

/**
 * Rule configurations for different matching dimensions
 */
export interface MatchingRules {
  weights: {
    skill: number;
    industry: number;
    experience: number;
    location: number;
    profile: number;
  };
  skillRules: SkillMatchRules;
  industryRules: IndustryMatchRules;
  experienceRules: ExperienceMatchRules;
  profileRules: ProfileMatchRules;
}

/**
 * Rules for skill matching
 */
export interface SkillMatchRules {
  requiredSkills: string[];
  preferredSkills: string[];
  complementarySkillsWeight: number;
  skillLevelImportance: number;
  minimumSkillMatch: number;
}

/**
 * Rules for industry matching
 */
export interface IndustryMatchRules {
  targetIndustries: string[];
  relatedIndustriesWeight: number;
  domainSpecificityWeight: number;
  crossIndustryExperienceValue: number;
}

/**
 * Rules for experience matching
 */
export interface ExperienceMatchRules {
  minExperienceYears: number;
  maxExperienceYears: number;
  seniorityWeight: number;
  careerTrajectoryWeight: number;
  companyReputationWeight: number;
}

/**
 * Rules for general profile matching
 */
export interface ProfileMatchRules {
  educationWeight: number;
  projectsWeight: number;
  activityLevelWeight: number;
  profileCompletenessWeight: number;
  collaborationHistoryWeight: number;
}

/**
 * Match result with scoring and explanations
 */
export interface MatchResult {
  user: User;
  score: number;
  strengthAreas: string[];
  compatibilityInsights: string[];
  matchReasons: string[];
}

/**
 * Context data that enriches the matching process with
 * user-specific insights and learned preferences
 */
export interface MatchingContext {
  userPreferences: {
    preferredIndustries: string[];
    preferredSkills: string[];
    preferredLocations: string[];
    preferredRoles: string[];
  };
  userInsights: {
    skillGaps: string[];
    careerPath: string[];
    activityPatterns: any;
    engagementMetrics: any;
    networkAnalysis: any;
  };
  applicationContext: {
    purpose: string;
    source: string;
    personalizationLevel: number;
  };
}

/**
 * Result of individual matching dimensions
 */
export interface DimensionScore {
  score: number;
  contributingFactors: any;
}

/**
 * Skill matching result with detailed information
 */
export interface SkillMatchResult extends DimensionScore {
  sharedSkills: string[];
  complementarySkills: string[];
  missingCriticalSkills: string[];
}

/**
 * Industry matching result with detailed information
 */
export interface IndustryMatchResult extends DimensionScore {
  industryAlignmentScore: number;
  domainExpertiseScore: number;
  crossIndustryInsights: string[];
}

/**
 * Experience matching result with detailed information
 */
export interface ExperienceMatchResult extends DimensionScore {
  experienceLevelMatch: number;
  careerTrajectoryAlignment: number;
  roleResponsibilityOverlap: string[];
}

/**
 * Location proximity calculation result
 */
export interface LocationMatchResult extends DimensionScore {
  distance: number | null;
  sameCity: boolean;
  sameRegion: boolean;
  sameCountry: boolean;
}

/**
 * Profile matching result with detailed information
 */
export interface ProfileMatchResult extends DimensionScore {
  complementaryAreas: string[];
  potentialSynergies: string[];
  collaborationOpportunities: string[];
}

/**
 * Smart Radar result for location-based matching
 */
export interface NearbyProfessionalResult {
  user: User;
  distance: number;
  matchScore: number;
  commonInterests: string[];
  suggestedInteractionPoints: string[];
}

/**
 * Smart Connect advanced recommendations
 */
export interface SmartConnectRecommendation {
  user: User;
  matchScore: number;
  recommendationStrength: 'High' | 'Medium' | 'Low';
  primaryReason: string;
  secondaryReasons: string[];
  suggestedTalkingPoints: string[];
  potentialBenefits: string[];
}

/**
 * Career recommendation from Musk AI
 */
export interface CareerRecommendation {
  recommendationType: 'SkillGap' | 'OpportunityMatch' | 'CareerPath' | 'NetworkGrowth';
  title: string;
  description: string;
  actionItems: string[];
  timeframe: 'Immediate' | 'Short-term' | 'Long-term';
  expectedOutcomes: string[];
  relevanceScore: number;
  relatedInsights: string[];
}