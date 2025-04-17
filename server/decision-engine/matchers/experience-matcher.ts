/**
 * Experience Matcher
 * 
 * Calculates match scores between users based on work experience,
 * career trajectory, seniority level, and company background.
 */

import { UserProfileData, ExperienceMatchRules, ExperienceMatchResult } from "../types/index";

/**
 * Calculate experience match score between two users
 */
export function calculateExperienceMatch(
  userProfile: UserProfileData,
  matchProfile: UserProfileData,
  rules: ExperienceMatchRules
): ExperienceMatchResult {
  // Extract work experiences
  const userExperiences = userProfile.workExperiences;
  const matchExperiences = matchProfile.workExperiences;
  
  if (!userExperiences.length || !matchExperiences.length) {
    return {
      score: 0.5, // Neutral score if experience information is missing
      experienceLevelMatch: 0.5,
      careerTrajectoryAlignment: 0.5,
      roleResponsibilityOverlap: [],
      contributingFactors: {}
    };
  }
  
  // Calculate years of experience
  const userYears = calculateTotalYearsOfExperience(userExperiences);
  const matchYears = calculateTotalYearsOfExperience(matchExperiences);
  
  // Calculate experience level match
  const experienceLevelMatch = calculateExperienceLevelMatch(
    userYears, 
    matchYears,
    rules.minExperienceYears,
    rules.maxExperienceYears
  );
  
  // Calculate seniority match
  const seniorityMatch = calculateSeniorityMatch(
    userExperiences, 
    matchExperiences,
    rules.seniorityWeight
  );
  
  // Calculate career trajectory alignment
  const trajectoryAlignment = calculateTrajectoryAlignment(
    userExperiences, 
    matchExperiences,
    rules.careerTrajectoryWeight
  );
  
  // Calculate company reputation/tier match
  const companyMatch = calculateCompanyMatch(
    userExperiences, 
    matchExperiences,
    rules.companyReputationWeight
  );
  
  // Identify role/responsibility overlap
  const roleOverlap = identifyRoleOverlap(userExperiences, matchExperiences);
  
  // Calculate weighted overall score
  const weightSum = 2 + rules.seniorityWeight + 
                   rules.careerTrajectoryWeight + 
                   rules.companyReputationWeight;
  
  const overallScore = (
    (experienceLevelMatch * 2) +
    (seniorityMatch * rules.seniorityWeight) +
    (trajectoryAlignment * rules.careerTrajectoryWeight) +
    (companyMatch * rules.companyReputationWeight)
  ) / weightSum;
  
  return {
    score: overallScore,
    experienceLevelMatch,
    careerTrajectoryAlignment: trajectoryAlignment,
    roleResponsibilityOverlap: roleOverlap,
    contributingFactors: {
      userYears,
      matchYears,
      seniorityMatch,
      companyMatch
    }
  };
}

/**
 * Calculate total years of experience from work experience entries
 */
function calculateTotalYearsOfExperience(experiences: any[]): number {
  let totalYears = 0;
  
  for (const exp of experiences) {
    if (!exp.startDate) continue;
    
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    
    // Calculate difference in years
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    // Add to total, avoiding negative values
    totalYears += Math.max(0, diffYears);
  }
  
  return totalYears;
}

/**
 * Calculate experience level match
 */
function calculateExperienceLevelMatch(
  userYears: number,
  matchYears: number,
  minYears: number,
  maxYears: number
): number {
  // If looking for specific experience range
  if (minYears > 0 || maxYears < Infinity) {
    // Check if match falls within desired range
    if (matchYears >= minYears && matchYears <= maxYears) {
      return 1.0; // Perfect match
    } else if (matchYears < minYears) {
      // Below minimum
      const ratio = matchYears / minYears;
      return Math.max(0.3, ratio); // At least 0.3 score
    } else {
      // Above maximum
      const excess = matchYears - maxYears;
      return Math.max(0.5, 1 - (excess / 5)); // Penalty for being too experienced
    }
  }
  
  // If no specific range, score based on similarity
  const yearDifference = Math.abs(userYears - matchYears);
  
  if (yearDifference < 2) {
    return 1.0; // Very similar experience levels
  } else if (yearDifference < 5) {
    return 0.8; // Moderately similar
  } else if (yearDifference < 10) {
    return 0.6; // Somewhat similar
  }
  
  // Very different experience levels
  return 0.4;
}

/**
 * Calculate seniority match based on job titles
 */
function calculateSeniorityMatch(
  userExperiences: any[],
  matchExperiences: any[],
  seniorityWeight: number
): number {
  const userSeniority = calculateSeniorityLevel(userExperiences);
  const matchSeniority = calculateSeniorityLevel(matchExperiences);
  
  // Calculate seniority difference (0-4 scale)
  const seniorityDifference = Math.abs(userSeniority - matchSeniority);
  
  // Convert to similarity score (1 is perfect match)
  return Math.max(0, 1 - (seniorityDifference / 4));
}

/**
 * Estimate seniority level from work experiences
 * Returns a value from 0 (entry level) to 4 (executive)
 */
function calculateSeniorityLevel(experiences: any[]): number {
  if (!experiences.length) return 0;
  
  // Get most recent job title
  const latestExperience = experiences.sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate) : new Date();
    const dateB = b.endDate ? new Date(b.endDate) : new Date();
    return dateB.getTime() - dateA.getTime();
  })[0];
  
  const title = latestExperience.title.toLowerCase();
  
  // Check for executive titles
  if (title.includes('ceo') || 
      title.includes('cto') || 
      title.includes('cfo') || 
      title.includes('chief') || 
      title.includes('president') || 
      title.includes('founder') ||
      title.includes('partner')) {
    return 4; // Executive level
  }
  
  // Check for senior management titles
  if (title.includes('vp') || 
      title.includes('vice president') || 
      title.includes('director') || 
      title.includes('head of')) {
    return 3; // Senior management
  }
  
  // Check for management titles
  if (title.includes('manager') || 
      title.includes('lead') || 
      title.includes('principal')) {
    return 2; // Management level
  }
  
  // Check for senior individual contributor titles
  if (title.includes('senior') || 
      title.includes('sr.') || 
      title.includes('sr ') || 
      title.includes('staff') || 
      title.includes('expert')) {
    return 1.5; // Senior individual contributor
  }
  
  // Calculate total years of experience
  const totalYears = calculateTotalYearsOfExperience(experiences);
  
  // Estimate level based on years if no clear indicators in title
  if (totalYears > 10) return 2;  // Likely management level with 10+ years
  if (totalYears > 5) return 1.5; // Likely senior IC with 5+ years
  if (totalYears > 2) return 1;   // Early-career with 2+ years
  
  return 0.5; // Entry level
}

/**
 * Calculate career trajectory alignment
 */
function calculateTrajectoryAlignment(
  userExperiences: any[],
  matchExperiences: any[],
  trajectoryWeight: number
): number {
  if (userExperiences.length < 2 || matchExperiences.length < 2) {
    return 0.5; // Not enough data for trajectory
  }
  
  // Compare industry movement patterns
  const userIndustryChanges = countIndustryChanges(userExperiences);
  const matchIndustryChanges = countIndustryChanges(matchExperiences);
  
  // Compare job change frequency
  const userJobFrequency = calculateJobChangeFrequency(userExperiences);
  const matchJobFrequency = calculateJobChangeFrequency(matchExperiences);
  
  // Compare progression speed
  const userProgressionSpeed = calculateProgressionSpeed(userExperiences);
  const matchProgressionSpeed = calculateProgressionSpeed(matchExperiences);
  
  // Calculate similarity scores (1 is perfect match)
  const industryChangeSimilarity = 1 - (Math.abs(userIndustryChanges - matchIndustryChanges) / 3);
  const jobFrequencySimilarity = 1 - (Math.abs(userJobFrequency - matchJobFrequency) / 3);
  const progressionSimilarity = 1 - (Math.abs(userProgressionSpeed - matchProgressionSpeed) / 3);
  
  // Calculate weighted average
  return (industryChangeSimilarity + jobFrequencySimilarity + progressionSimilarity) / 3;
}

/**
 * Count number of industry changes in career
 */
function countIndustryChanges(experiences: any[]): number {
  if (experiences.length < 2) return 0;
  
  let changes = 0;
  let currentIndustry = "";
  
  // Sort experiences by start date
  const sortedExperiences = experiences.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  for (const exp of sortedExperiences) {
    if (exp.industry && exp.industry !== currentIndustry) {
      if (currentIndustry !== "") {
        changes++;
      }
      currentIndustry = exp.industry;
    }
  }
  
  return changes;
}

/**
 * Calculate job change frequency (changes per year)
 */
function calculateJobChangeFrequency(experiences: any[]): number {
  if (experiences.length < 2) return 0;
  
  // Calculate total career span
  const sortedExperiences = experiences.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  const firstStart = new Date(sortedExperiences[0].startDate);
  const lastEnd = sortedExperiences[sortedExperiences.length - 1].endDate 
    ? new Date(sortedExperiences[sortedExperiences.length - 1].endDate)
    : new Date();
  
  const careerSpanYears = (lastEnd.getTime() - firstStart.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (careerSpanYears < 1) return experiences.length - 1; // Less than a year
  
  return (experiences.length - 1) / careerSpanYears;
}

/**
 * Calculate progression speed based on title changes
 */
function calculateProgressionSpeed(experiences: any[]): number {
  if (experiences.length < 2) return 0;
  
  // Sort experiences by start date
  const sortedExperiences = experiences.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Calculate initial and final seniority levels
  const initialLevel = getSeniorityLevelFromTitle(sortedExperiences[0].title);
  const finalLevel = getSeniorityLevelFromTitle(sortedExperiences[sortedExperiences.length - 1].title);
  
  // Calculate career span in years
  const firstStart = new Date(sortedExperiences[0].startDate);
  const lastEnd = sortedExperiences[sortedExperiences.length - 1].endDate 
    ? new Date(sortedExperiences[sortedExperiences.length - 1].endDate)
    : new Date();
  
  const careerSpanYears = (lastEnd.getTime() - firstStart.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (careerSpanYears < 1) return finalLevel - initialLevel; // Less than a year
  
  return (finalLevel - initialLevel) / careerSpanYears;
}

/**
 * Get seniority level from job title
 */
function getSeniorityLevelFromTitle(title: string): number {
  const lowerTitle = title.toLowerCase();
  
  // Executive level
  if (lowerTitle.includes('ceo') || 
      lowerTitle.includes('cto') || 
      lowerTitle.includes('cfo') || 
      lowerTitle.includes('chief') || 
      lowerTitle.includes('president') || 
      lowerTitle.includes('founder') ||
      lowerTitle.includes('partner')) {
    return 4;
  }
  
  // Senior management
  if (lowerTitle.includes('vp') || 
      lowerTitle.includes('vice president') || 
      lowerTitle.includes('director') || 
      lowerTitle.includes('head of')) {
    return 3;
  }
  
  // Management
  if (lowerTitle.includes('manager') || 
      lowerTitle.includes('lead') || 
      lowerTitle.includes('principal')) {
    return 2;
  }
  
  // Senior individual contributor
  if (lowerTitle.includes('senior') || 
      lowerTitle.includes('sr.') || 
      lowerTitle.includes('sr ') || 
      lowerTitle.includes('staff') || 
      lowerTitle.includes('expert')) {
    return 1.5;
  }
  
  // Regular individual contributor
  if (lowerTitle.includes('engineer') || 
      lowerTitle.includes('developer') || 
      lowerTitle.includes('designer') || 
      lowerTitle.includes('analyst') ||
      lowerTitle.includes('associate')) {
    return 1;
  }
  
  // Entry level / intern
  if (lowerTitle.includes('intern') || 
      lowerTitle.includes('trainee') || 
      lowerTitle.includes('assistant') || 
      lowerTitle.includes('junior')) {
    return 0.5;
  }
  
  return 1; // Default to regular individual contributor
}

/**
 * Calculate company reputation/tier match
 */
function calculateCompanyMatch(
  userExperiences: any[],
  matchExperiences: any[],
  companyWeight: number
): number {
  // Check for same companies
  const userCompanies = userExperiences.map(exp => exp.company.toLowerCase());
  const matchCompanies = matchExperiences.map(exp => exp.company.toLowerCase());
  
  // Check for direct overlap
  const sharedCompanies = userCompanies.filter(company => matchCompanies.includes(company));
  if (sharedCompanies.length > 0) {
    return 1.0; // Perfect match if worked at same companies
  }
  
  // In a real implementation, you would:
  // 1. Have a database of company tiers/reputations
  // 2. Look up companies to determine their tiers
  // 3. Compare tiers for similarity
  
  // For this prototype, we'll use a simple implementation
  return 0.7; // Default moderate match
}

/**
 * Identify role and responsibility overlap
 */
function identifyRoleOverlap(userExperiences: any[], matchExperiences: any[]): string[] {
  const overlap: string[] = [];
  
  // Get user's most recent role
  const latestUserExp = userExperiences.sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate) : new Date();
    const dateB = b.endDate ? new Date(b.endDate) : new Date();
    return dateB.getTime() - dateA.getTime();
  })[0];
  
  // Get match's most recent role
  const latestMatchExp = matchExperiences.sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate) : new Date();
    const dateB = b.endDate ? new Date(b.endDate) : new Date();
    return dateB.getTime() - dateA.getTime();
  })[0];
  
  // Compare titles
  if (latestUserExp.title.toLowerCase() === latestMatchExp.title.toLowerCase()) {
    overlap.push(`Same role: ${latestMatchExp.title}`);
  }
  
  // In a real implementation, you would also:
  // 1. Use NLP to analyze job descriptions for responsibility overlap
  // 2. Extract key responsibilities from titles
  // 3. Compare functional areas
  
  // For this prototype, we'll use title-based role categories
  const userRoleCategory = extractRoleCategory(latestUserExp.title);
  const matchRoleCategory = extractRoleCategory(latestMatchExp.title);
  
  if (userRoleCategory === matchRoleCategory && userRoleCategory) {
    overlap.push(`Similar ${userRoleCategory} responsibilities`);
  }
  
  return overlap;
}

/**
 * Extract role category from title
 */
function extractRoleCategory(title: string): string | null {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('engineer') || lowerTitle.includes('developer')) {
    return 'engineering';
  }
  
  if (lowerTitle.includes('design') || lowerTitle.includes('ux') || lowerTitle.includes('ui')) {
    return 'design';
  }
  
  if (lowerTitle.includes('product')) {
    return 'product';
  }
  
  if (lowerTitle.includes('marketing') || lowerTitle.includes('growth')) {
    return 'marketing';
  }
  
  if (lowerTitle.includes('sales') || lowerTitle.includes('business development')) {
    return 'sales';
  }
  
  if (lowerTitle.includes('hr') || lowerTitle.includes('human resources') || lowerTitle.includes('people')) {
    return 'human resources';
  }
  
  if (lowerTitle.includes('finance') || lowerTitle.includes('accounting')) {
    return 'finance';
  }
  
  if (lowerTitle.includes('operations') || lowerTitle.includes('ops')) {
    return 'operations';
  }
  
  if (lowerTitle.includes('research') || lowerTitle.includes('scientist')) {
    return 'research';
  }
  
  if (lowerTitle.includes('data') || lowerTitle.includes('analytics')) {
    return 'data';
  }
  
  return null;
}