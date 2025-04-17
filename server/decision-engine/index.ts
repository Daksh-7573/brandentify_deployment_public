/**
 * Brandentifier Decision Engine
 * 
 * Core architecture for intelligent recommendations and matching algorithms
 * that power features like Smart Connect, Smart Radar, and Musk AI suggestions.
 */

import { storage } from "../storage";
import { calculateProfileMatchScore } from "./matchers/profile-matcher";
import { calculateSkillMatch } from "./matchers/skill-matcher";
import { calculateIndustryMatch } from "./matchers/industry-matcher";
import { calculateExperienceMatch } from "./matchers/experience-matcher";
import { calculateLocationProximity } from "./matchers/location-matcher";
import { getRecommendationRules } from "./rules/recommendation-rules";
import { MatchCriteria, MatchResult, UserProfileData, MatchingContext } from "./types/index";
import { validateCriteria } from "./validators/criteria-validator";
import { enrichContextWithUserInsights } from "./context/context-enricher";

export class DecisionEngine {
  /**
   * Main entry point for the Smart Connect feature
   * Finds the best matches for a user based on specific criteria
   */
  async findMatches(userId: number, criteria: MatchCriteria): Promise<MatchResult[]> {
    try {
      // Validate and normalize the matching criteria
      const validatedCriteria = validateCriteria(criteria);
      
      // Get the full profile data of the searching user
      const userProfile = await this.getUserProfileData(userId);
      
      // Create matching context with user insights and preferences
      const context = await enrichContextWithUserInsights(userProfile, validatedCriteria);
      
      // Get all potential matches (excluding the searching user)
      const allUsers = await storage.findAllUsers();
      const potentialMatches = allUsers.filter(user => user.id !== userId);
      
      // Score and rank all potential matches
      const results = await Promise.all(
        potentialMatches.map(async (matchUser) => {
          // Get detailed profile for the potential match
          const matchProfile = await this.getUserProfileData(matchUser.id);
          
          // Calculate overall match score using multiple dimensions
          const overallScore = this.calculateOverallMatchScore(userProfile, matchProfile, validatedCriteria, context);
          
          // Create match result with explanation
          return {
            user: matchUser,
            score: overallScore.score,
            strengthAreas: overallScore.strengthAreas,
            compatibilityInsights: overallScore.compatibilityInsights,
            matchReasons: overallScore.matchReasons
          };
        })
      );
      
      // Sort by overall score (descending) and return top matches
      return results
        .filter(match => match.score > 0.4) // Only return reasonable matches
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("Error in finding matches:", error);
      throw new Error("Failed to process match request");
    }
  }

  /**
   * Gets comprehensive profile data for a user including
   * work experiences, education, skills, projects, and activity data
   */
  private async getUserProfileData(userId: number): Promise<UserProfileData> {
    const user = await storage.findUserById(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const workExperiences = await storage.findWorkExperiencesByUserId(userId);
    const educations = await storage.findEducationsByUserId(userId);
    const skills = await storage.findSkillsByUserId(userId);
    const projects = await storage.findProjectsByUserId(userId);
    
    // Get additional profile data like activity patterns, content engagement, etc.
    // This is valuable for more nuanced matching algorithms
    
    return {
      user,
      workExperiences,
      educations,
      skills,
      projects
    };
  }

  /**
   * Calculates the overall match score between two profiles
   * using multiple weighted dimensions and contextual factors
   */
  private calculateOverallMatchScore(
    userProfile: UserProfileData,
    matchProfile: UserProfileData,
    criteria: MatchCriteria,
    context: MatchingContext
  ) {
    // Get matching rules based on context and criteria
    const rules = getRecommendationRules(criteria, context);
    
    // Calculate individual dimension scores
    const skillScore = calculateSkillMatch(userProfile, matchProfile, rules.skillRules);
    const industryScore = calculateIndustryMatch(userProfile, matchProfile, rules.industryRules);
    const experienceScore = calculateExperienceMatch(userProfile, matchProfile, rules.experienceRules);
    const locationScore = calculateLocationProximity(userProfile.user, matchProfile.user);
    const profileScore = calculateProfileMatchScore(userProfile, matchProfile, rules.profileRules);
    
    // Calculate weighted overall score
    const overallScore = (
      (skillScore.score * rules.weights.skill) +
      (industryScore.score * rules.weights.industry) +
      (experienceScore.score * rules.weights.experience) +
      (locationScore.score * rules.weights.location) +
      (profileScore.score * rules.weights.profile)
    ) / (
      rules.weights.skill +
      rules.weights.industry +
      rules.weights.experience +
      rules.weights.location +
      rules.weights.profile
    );
    
    // Identify top strength areas
    const strengthAreas = this.identifyTopStrengthAreas({
      skill: { score: skillScore.score, weight: rules.weights.skill },
      industry: { score: industryScore.score, weight: rules.weights.industry },
      experience: { score: experienceScore.score, weight: rules.weights.experience },
      location: { score: locationScore.score, weight: rules.weights.location },
      profile: { score: profileScore.score, weight: rules.weights.profile }
    });
    
    // Generate human-readable compatibility insights
    const compatibilityInsights = this.generateCompatibilityInsights(
      userProfile,
      matchProfile,
      { skillScore, industryScore, experienceScore, locationScore, profileScore }
    );
    
    // Generate specific reasons for the match
    const matchReasons = this.generateMatchReasons(
      userProfile,
      matchProfile,
      { skillScore, industryScore, experienceScore, locationScore, profileScore }
    );
    
    return {
      score: overallScore,
      strengthAreas,
      compatibilityInsights,
      matchReasons
    };
  }

  /**
   * Identifies the top strength areas of a match based on weighted scores
   */
  private identifyTopStrengthAreas(dimensionScores: Record<string, { score: number, weight: number }>) {
    const weightedScores = Object.entries(dimensionScores)
      .map(([dimension, { score, weight }]) => ({
        dimension,
        weightedScore: score * weight
      }))
      .sort((a, b) => b.weightedScore - a.weightedScore);
    
    // Return top 3 strength areas
    return weightedScores.slice(0, 3).map(item => item.dimension);
  }

  /**
   * Generates human-readable compatibility insights between two profiles
   */
  private generateCompatibilityInsights(
    userProfile: UserProfileData,
    matchProfile: UserProfileData,
    scores: any
  ): string[] {
    const insights: string[] = [];
    
    // Based on skill overlap
    if (scores.skillScore.score > 0.7) {
      const sharedSkills = scores.skillScore.sharedSkills || [];
      if (sharedSkills.length > 0) {
        insights.push(`You share ${sharedSkills.length} key skills, including ${sharedSkills.slice(0, 3).join(', ')}`);
      }
    }
    
    // Based on industry alignment
    if (scores.industryScore.score > 0.8) {
      insights.push(`Both have strong experience in the ${matchProfile.user.industry} industry`);
    }
    
    // Based on experience level
    if (scores.experienceScore.score > 0.6) {
      insights.push(`Similar professional experience level and career trajectory`);
    }
    
    // Based on location proximity
    if (scores.locationScore.score > 0.9) {
      insights.push(`Located in the same area: ${matchProfile.user.location}`);
    }
    
    // Provide potential complementary insights
    if (scores.profileScore.complementaryAreas && scores.profileScore.complementaryAreas.length > 0) {
      insights.push(`Complementary expertise in ${scores.profileScore.complementaryAreas[0]}`);
    }
    
    return insights;
  }

  /**
   * Generates specific reasons why this match is recommended
   */
  private generateMatchReasons(
    userProfile: UserProfileData,
    matchProfile: UserProfileData,
    scores: any
  ): string[] {
    const reasons: string[] = [];
    
    // Check for complementary skills
    const userSkillNames = userProfile.skills.map(s => s.name.toLowerCase());
    const matchSkillNames = matchProfile.skills.map(s => s.name.toLowerCase());
    const complementarySkills = matchSkillNames.filter(skill => !userSkillNames.includes(skill));
    
    if (complementarySkills.length > 0) {
      reasons.push(`Has skills you might want to learn: ${complementarySkills.slice(0, 3).join(', ')}`);
    }
    
    // Check for industry insights
    if (userProfile.user.industry === matchProfile.user.industry) {
      const matchExperience = matchProfile.workExperiences.length > 0 ?
        matchProfile.workExperiences[0].company : 'their company';
      reasons.push(`Can share industry insights from ${matchExperience}`);
    }
    
    // Check for project collaboration potential
    if (matchProfile.projects.length > 0) {
      reasons.push(`Has worked on similar projects like "${matchProfile.projects[0].title}"`);
    }
    
    // Check for educational background
    if (matchProfile.educations.length > 0) {
      reasons.push(`Educational background in ${matchProfile.educations[0].institution}`);
    }
    
    return reasons;
  }

  /**
   * For the Smart Radar feature
   * Finds nearby professionals based on current location
   */
  async findNearbyProfessionals(userId: number, radius: number) {
    // Implement location-based matching algorithm
    // This would use geospatial queries with the current user's location
    // Return structured results with match scores and compatibilities
  }

  /**
   * For Musk AI recommendations
   * Generates personalized career recommendations based on user profile
   */
  async generateCareerRecommendations(userId: number) {
    // Implement AI-based career path analysis
    // This would use historical data patterns and industry trends
    // Return actionable career recommendations
  }
}

// Export a singleton instance
export const decisionEngine = new DecisionEngine();