/**
 * Skill Matcher
 * 
 * Calculates match scores between users based on skill similarity,
 * complementary skills, and skill requirements.
 */

import { UserProfileData, SkillMatchRules, SkillMatchResult } from "../types/index";

/**
 * Calculate skill match score between two users
 */
export function calculateSkillMatch(
  userProfile: UserProfileData,
  matchProfile: UserProfileData,
  rules: SkillMatchRules
): SkillMatchResult {
  const userSkills = userProfile.skills;
  const matchSkills = matchProfile.skills;
  
  // Convert skill names to lowercase for comparison
  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  const matchSkillNames = matchSkills.map(s => s.name.toLowerCase());
  
  // Calculate shared skills
  const sharedSkills = matchSkillNames.filter(skill => userSkillNames.includes(skill));
  
  // Calculate complementary skills (skills that match has but user doesn't)
  const complementarySkills = matchSkillNames.filter(skill => !userSkillNames.includes(skill));
  
  // Check required skills coverage
  const requiredSkillsCoverage = calculateRequiredSkillsCoverage(matchSkillNames, rules.requiredSkills);
  
  // Check preferred skills coverage
  const preferredSkillsCoverage = calculatePreferredSkillsCoverage(matchSkillNames, rules.preferredSkills);
  
  // Calculate skill level match if levels are available
  const skillLevelMatch = calculateSkillLevelMatch(userSkills, matchSkills);
  
  // Calculate missing critical skills
  const missingCriticalSkills = rules.requiredSkills
    .filter(s => !matchSkillNames.includes(s.toLowerCase()));
  
  // Calculate overall skill match score
  let skillMatchScore = 0;
  let weightSum = 0;
  
  // Required skills are a high priority
  if (rules.requiredSkills.length > 0) {
    skillMatchScore += requiredSkillsCoverage * 3;
    weightSum += 3;
  }
  
  // Preferred skills are medium priority
  if (rules.preferredSkills.length > 0) {
    skillMatchScore += preferredSkillsCoverage * 2;
    weightSum += 2;
  }
  
  // Shared skills contribute to similarity
  const sharedSkillsRatio = sharedSkills.length / 
    Math.max(userSkillNames.length, matchSkillNames.length, 1);
  skillMatchScore += sharedSkillsRatio * 1;
  weightSum += 1;
  
  // Complementary skills are valuable
  const complementaryValue = rules.complementarySkillsWeight * 
    Math.min(complementarySkills.length / 5, 1); // Cap at 5 complementary skills
  skillMatchScore += complementaryValue;
  weightSum += rules.complementarySkillsWeight;
  
  // Skill level match if available
  if (skillLevelMatch.available) {
    skillMatchScore += skillLevelMatch.score * rules.skillLevelImportance;
    weightSum += rules.skillLevelImportance;
  }
  
  // Calculate final normalized score
  const normalizedScore = weightSum > 0 ? skillMatchScore / weightSum : 0.5;
  
  // Apply minimum match threshold
  const finalScore = normalizedScore < rules.minimumSkillMatch ? 
    normalizedScore * 0.7 : normalizedScore;
  
  return {
    score: finalScore,
    sharedSkills: sharedSkills.map(skill => capitalizeFirstLetter(skill)),
    complementarySkills: complementarySkills.map(skill => capitalizeFirstLetter(skill)),
    missingCriticalSkills: missingCriticalSkills,
    contributingFactors: {
      requiredSkillsCoverage,
      preferredSkillsCoverage,
      sharedSkillsRatio,
      complementaryValue,
      skillLevelMatch
    }
  };
}

/**
 * Calculate how well the match covers required skills
 */
function calculateRequiredSkillsCoverage(matchSkillNames: string[], requiredSkills: string[]): number {
  if (!requiredSkills.length) return 1;
  
  const lowercaseRequiredSkills = requiredSkills.map(s => s.toLowerCase());
  const matchedRequiredSkills = lowercaseRequiredSkills.filter(skill => 
    matchSkillNames.includes(skill)
  );
  
  return matchedRequiredSkills.length / lowercaseRequiredSkills.length;
}

/**
 * Calculate how well the match covers preferred skills
 */
function calculatePreferredSkillsCoverage(matchSkillNames: string[], preferredSkills: string[]): number {
  if (!preferredSkills.length) return 1;
  
  const lowercasePreferredSkills = preferredSkills.map(s => s.toLowerCase());
  const matchedPreferredSkills = lowercasePreferredSkills.filter(skill => 
    matchSkillNames.includes(skill)
  );
  
  return matchedPreferredSkills.length / lowercasePreferredSkills.length;
}

/**
 * Calculate skill level match if levels are available
 */
function calculateSkillLevelMatch(userSkills: any[], matchSkills: any[]): { available: boolean, score: number } {
  // Check if skill levels are available
  const userSkillsWithLevels = userSkills.filter(s => s.level);
  const matchSkillsWithLevels = matchSkills.filter(s => s.level);
  
  if (userSkillsWithLevels.length === 0 || matchSkillsWithLevels.length === 0) {
    return { available: false, score: 0 };
  }
  
  // Create maps of skill name to level
  const userSkillLevels = new Map(
    userSkillsWithLevels.map(s => [s.name.toLowerCase(), normalizeLevelToNumber(s.level)])
  );
  
  const matchSkillLevels = new Map(
    matchSkillsWithLevels.map(s => [s.name.toLowerCase(), normalizeLevelToNumber(s.level)])
  );
  
  // Find shared skills with levels
  const sharedSkillNames = [...userSkillLevels.keys()].filter(skill => matchSkillLevels.has(skill));
  
  if (sharedSkillNames.length === 0) {
    return { available: true, score: 0.5 }; // Neutral score if no shared skills with levels
  }
  
  // Calculate level match for shared skills
  let totalLevelDifference = 0;
  
  for (const skill of sharedSkillNames) {
    const userLevel = userSkillLevels.get(skill) || 0;
    const matchLevel = matchSkillLevels.get(skill) || 0;
    const levelDifference = Math.abs(userLevel - matchLevel);
    totalLevelDifference += levelDifference;
  }
  
  // Normalize difference - lower is better
  const averageDifference = totalLevelDifference / sharedSkillNames.length;
  // Convert to score (0-1 where 1 is perfect match)
  const score = 1 - (averageDifference / 4); // 4 is the max possible difference
  
  return { available: true, score: Math.max(0, Math.min(1, score)) };
}

/**
 * Convert skill level strings to numerical values for comparison
 */
function normalizeLevelToNumber(level: string): number {
  const normalizedLevel = level.toLowerCase();
  
  if (normalizedLevel.includes('beginner') || normalizedLevel.includes('basic')) {
    return 1;
  } else if (normalizedLevel.includes('intermediate')) {
    return 2;
  } else if (normalizedLevel.includes('advanced') || normalizedLevel.includes('proficient')) {
    return 3;
  } else if (normalizedLevel.includes('expert') || normalizedLevel.includes('master')) {
    return 4;
  } else {
    // Try to extract numeric proficiency if available
    const proficiencyMatch = normalizedLevel.match(/(\d+)/);
    if (proficiencyMatch && proficiencyMatch[1]) {
      const value = parseInt(proficiencyMatch[1], 10);
      // Normalize to 1-4 scale assuming a 1-10 input scale
      return Math.max(1, Math.min(4, Math.ceil(value / 2.5)));
    }
    return 2; // Default to intermediate
  }
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}