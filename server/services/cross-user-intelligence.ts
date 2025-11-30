/**
 * Cross-User Intelligence - Phase 2.3
 * 
 * This service learns from aggregated user patterns to improve recommendations
 * for similar professionals while maintaining privacy and data security.
 * 
 * Now uses database-backed storage via cohortIntelligenceService
 */

import { cohortIntelligenceService, UserCohort } from './cohort-intelligence-service';

export type { UserCohort } from './cohort-intelligence-service';

export interface CrossUserRecommendation {
  id: string;
  type: 'peer_insight' | 'success_pattern' | 'common_pitfall' | 'trend_alert';
  title: string;
  description: string;
  basedOnCohort: string;
  relevanceScore: number;
  evidenceStrength: number;
  actionableSteps: string[];
}

/**
 * Generate cross-user intelligence recommendations
 */
export async function generateCrossUserRecommendations(
  userId: string,
  userProfile: any,
  userPatterns: any
): Promise<CrossUserRecommendation[]> {
  console.log(`[Cross-User Intelligence] Generating recommendations for user ${userId}`);
  
  // Find relevant cohorts for this user
  const relevantCohorts = await cohortIntelligenceService.getUserCohorts(parseInt(userId));
  
  const recommendations: CrossUserRecommendation[] = [];
  
  // Generate peer insights
  relevantCohorts.forEach(cohort => {
    const peerInsights = generatePeerInsights(cohort, userProfile, userPatterns);
    recommendations.push(...peerInsights);
    
    // Generate success pattern recommendations
    const successPatterns = generateSuccessPatternRecommendations(cohort, userProfile);
    recommendations.push(...successPatterns);
    
    // Generate common pitfall warnings
    const pitfallWarnings = generatePitfallWarnings(cohort, userPatterns);
    recommendations.push(...pitfallWarnings);
  });
  
  // Generate trend alerts
  const trendAlerts = generateTrendAlerts(userProfile, relevantCohorts);
  recommendations.push(...trendAlerts);
  
  // Sort by relevance and evidence strength
  return recommendations
    .sort((a, b) => (b.relevanceScore * b.evidenceStrength) - (a.relevanceScore * a.evidenceStrength))
    .slice(0, 5); // Top 5 recommendations
}

/**
 * Update cohort data with new user patterns
 */
export async function updateCohortData(userId: string, userProfile: any, userPatterns: any): Promise<void> {
  if (!userProfile) return;
  
  const cohortIds = identifyUserCohorts(userProfile);
  
  for (const cohortId of cohortIds) {
    const cohort = await cohortIntelligenceService.getOrCreateCohort(cohortId, userProfile);
    
    // Update cohort patterns with new data
    updateCohortPatterns(cohort, userProfile, userPatterns);
    
    // Update cohort in database
    await cohortIntelligenceService.updateCohort(cohortId, cohort);
    
    // Add user to cohort membership
    await cohortIntelligenceService.addUserToCohort(parseInt(userId), cohortId);
  }
  
  console.log(`[Cross-User Intelligence] Updated cohort data for user ${userId}`);
}

/**
 * Identify which cohorts a user belongs to
 */
function identifyUserCohorts(userProfile: any): string[] {
  const cohortIds: string[] = [];
  
  if (!userProfile) return cohortIds;
  
  const industry = userProfile.industry || 'general';
  const title = userProfile.title || '';
  const location = userProfile.location || '';
  
  // Determine role level
  let roleLevel: 'entry' | 'mid' | 'senior' | 'executive' = 'mid';
  if (/director|vp|chief|ceo|cto|cfo/i.test(title)) roleLevel = 'executive';
  else if (/senior|lead|principal/i.test(title)) roleLevel = 'senior';
  else if (/junior|associate|coordinator/i.test(title)) roleLevel = 'entry';
  
  // Determine career stage
  let careerStage: 'early' | 'growth' | 'transition' | 'leadership' = 'growth';
  if (roleLevel === 'entry') careerStage = 'early';
  else if (roleLevel === 'executive') careerStage = 'leadership';
  else if (userProfile.lookingFor === 'career_change') careerStage = 'transition';
  
  // Generate cohort IDs
  cohortIds.push(`${industry}_${roleLevel}`);
  cohortIds.push(`${industry}_${careerStage}`);
  cohortIds.push(`${roleLevel}_${careerStage}`);
  
  if (location) {
    const region = extractRegion(location);
    if (region) {
      cohortIds.push(`${industry}_${region}`);
    }
  }
  
  return cohortIds;
}

/**
 * Update cohort patterns with new user data
 */
function updateCohortPatterns(cohort: UserCohort, userProfile: any, userPatterns: any): void {
  cohort.sampleSize++;
  
  // Update communication preferences
  if (userPatterns.preferences) {
    updateCommunicationPatterns(cohort, userPatterns.preferences);
  }
  
  // Update common challenges (from conversation topics)
  if (userPatterns.behaviorPatterns?.topicFrequency) {
    updateCommonChallenges(cohort, userPatterns.behaviorPatterns.topicFrequency);
  }
  
  // Update skill priorities
  if (userPatterns.preferences?.focusAreas) {
    updateSkillPriorities(cohort, userPatterns.preferences.focusAreas);
  }
  
  // Update confidence based on sample size
  cohort.confidence = Math.min(cohort.sampleSize / 10, 1);
}

/**
 * Generate peer insights recommendations
 */
function generatePeerInsights(
  cohort: UserCohort,
  userProfile: any,
  userPatterns: any
): CrossUserRecommendation[] {
  const recommendations: CrossUserRecommendation[] = [];
  
  if (cohort.patterns.commonChallenges.length > 0) {
    const topChallenge = cohort.patterns.commonChallenges[0];
    
    recommendations.push({
      id: `peer_insight_${cohort.id}_challenges`,
      type: 'peer_insight',
      title: `Common Challenge: ${topChallenge}`,
      description: `${cohort.sampleSize} professionals in your cohort frequently discuss ${topChallenge}. Here's how peers are addressing it.`,
      basedOnCohort: cohort.id,
      relevanceScore: 0.8,
      evidenceStrength: Math.min(cohort.sampleSize / 10, 1),
      actionableSteps: [
        'Connect with peers facing similar challenges',
        'Share experiences and solutions',
        'Learn from successful strategies in your cohort'
      ]
    });
  }
  
  if (cohort.patterns.successfulStrategies.length > 0) {
    const topStrategy = cohort.patterns.successfulStrategies[0];
    
    recommendations.push({
      id: `peer_insight_${cohort.id}_strategies`,
      type: 'peer_insight',
      title: `Peer Success Strategy: ${topStrategy}`,
      description: `High-performing professionals in your cohort consistently use this approach.`,
      basedOnCohort: cohort.id,
      relevanceScore: 0.9,
      evidenceStrength: Math.min(cohort.sampleSize / 10, 1),
      actionableSteps: [
        `Implement ${topStrategy} in your current role`,
        'Track results and iterate on the approach',
        'Share your experience with the community'
      ]
    });
  }
  
  return recommendations;
}

/**
 * Generate success pattern recommendations
 */
function generateSuccessPatternRecommendations(
  cohort: UserCohort,
  userProfile: any
): CrossUserRecommendation[] {
  const recommendations: CrossUserRecommendation[] = [];
  
  if (cohort.patterns.typicalCareerPath.length > 0) {
    const nextStep = cohort.patterns.typicalCareerPath[0];
    
    recommendations.push({
      id: `success_pattern_${cohort.id}_career`,
      type: 'success_pattern',
      title: `Career Progression Pattern: ${nextStep}`,
      description: `Successful professionals in your cohort typically advance to ${nextStep} roles.`,
      basedOnCohort: cohort.id,
      relevanceScore: 0.7,
      evidenceStrength: cohort.confidence,
      actionableSteps: [
        `Develop skills required for ${nextStep} positions`,
        'Network with professionals currently in these roles',
        'Seek stretch assignments aligned with this progression'
      ]
    });
  }
  
  return recommendations;
}

/**
 * Generate pitfall warning recommendations
 */
function generatePitfallWarnings(
  cohort: UserCohort,
  userPatterns: any
): CrossUserRecommendation[] {
  const recommendations: CrossUserRecommendation[] = [];
  
  // This would be based on negative patterns or common mistakes
  // For now, we'll generate general warnings based on cohort data
  
  if (cohort.insights.engagementPatterns.includes('overwork')) {
    recommendations.push({
      id: `pitfall_${cohort.id}_overwork`,
      type: 'common_pitfall',
      title: 'Avoid Overwork Patterns',
      description: 'Professionals in your cohort report burnout from overcommitment. Learn from their experience.',
      basedOnCohort: cohort.id,
      relevanceScore: 0.6,
      evidenceStrength: cohort.confidence,
      actionableSteps: [
        'Set clear boundaries and priorities',
        'Delegate effectively to build team capacity',
        'Maintain work-life balance strategies'
      ]
    });
  }
  
  return recommendations;
}

/**
 * Generate trend alerts
 */
function generateTrendAlerts(
  userProfile: any,
  cohorts: UserCohort[]
): CrossUserRecommendation[] {
  const recommendations: CrossUserRecommendation[] = [];
  
  // Generate alerts based on emerging patterns across cohorts
  cohorts.forEach(cohort => {
    if (cohort.patterns.skillDevelopmentPriorities.length > 0) {
      const trendingSkill = cohort.patterns.skillDevelopmentPriorities[0];
      
      recommendations.push({
        id: `trend_alert_${cohort.id}_skill`,
        type: 'trend_alert',
        title: `Trending Skill: ${trendingSkill}`,
        description: `${trendingSkill} is becoming increasingly important among ${cohort.criteria.industry} professionals.`,
        basedOnCohort: cohort.id,
        relevanceScore: 0.8,
        evidenceStrength: cohort.confidence,
        actionableSteps: [
          `Research ${trendingSkill} learning opportunities`,
          'Assess current skill level and gaps',
          'Create development plan for this emerging competency'
        ]
      });
    }
  });
  
  return recommendations;
}

/**
 * Helper functions
 */
function determineRoleLevel(title: string): 'entry' | 'mid' | 'senior' | 'executive' {
  if (!title) return 'mid';
  if (/director|vp|chief|ceo|cto|cfo/i.test(title)) return 'executive';
  if (/senior|lead|principal/i.test(title)) return 'senior';
  if (/junior|associate|coordinator/i.test(title)) return 'entry';
  return 'mid';
}

function determineCareerStage(userProfile: any): 'early' | 'growth' | 'transition' | 'leadership' {
  const roleLevel = determineRoleLevel(userProfile.title);
  if (roleLevel === 'entry') return 'early';
  if (roleLevel === 'executive') return 'leadership';
  if (userProfile.lookingFor === 'career_change') return 'transition';
  return 'growth';
}

function extractRegion(location: string): string | undefined {
  if (!location) return undefined;
  
  // Simple region extraction (would be more sophisticated in production)
  if (/india|mumbai|delhi|bangalore|gujarat/i.test(location)) return 'india';
  if (/usa|america|san francisco|new york|california/i.test(location)) return 'usa';
  if (/uk|london|britain/i.test(location)) return 'uk';
  
  return undefined;
}

function updateCommunicationPatterns(cohort: UserCohort, preferences: any): void {
  if (preferences.responseLength) {
    cohort.insights.averageResponseLength = preferences.responseLength;
  }
  if (preferences.preferredTimeframes) {
    cohort.insights.preferredTimeframes = preferences.preferredTimeframes;
  }
  if (preferences.communicationStyle) {
    cohort.patterns.preferredCommunicationStyle = preferences.communicationStyle;
  }
}

function updateCommonChallenges(cohort: UserCohort, topicFrequency: Record<string, number>): void {
  const topics = Object.keys(topicFrequency).sort((a, b) => topicFrequency[b] - topicFrequency[a]);
  
  topics.forEach(topic => {
    if (!cohort.patterns.commonChallenges.includes(topic)) {
      cohort.patterns.commonChallenges.push(topic);
    }
  });
  
  // Keep only top 5 challenges
  cohort.patterns.commonChallenges = cohort.patterns.commonChallenges.slice(0, 5);
}

function updateSkillPriorities(cohort: UserCohort, focusAreas: string[]): void {
  focusAreas.forEach(area => {
    if (!cohort.patterns.skillDevelopmentPriorities.includes(area)) {
      cohort.patterns.skillDevelopmentPriorities.push(area);
    }
  });
  
  // Keep only top 5 priorities
  cohort.patterns.skillDevelopmentPriorities = cohort.patterns.skillDevelopmentPriorities.slice(0, 5);
}

/**
 * Get cross-user intelligence statistics (placeholder - would query database)
 */
export function getCrossUserStats(): {
  totalCohorts: number;
  totalUsers: number;
  averageCohortSize: number;
  mostActiveCohort: string;
} {
  // TODO: Query database for stats when needed
  return {
    totalCohorts: 0,
    totalUsers: 0,
    averageCohortSize: 0,
    mostActiveCohort: 'none'
  };
}