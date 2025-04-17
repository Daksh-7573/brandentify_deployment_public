/**
 * Profile Matcher
 * 
 * Calculates match scores between user profiles based on overall
 * profile attributes, education, projects, and more.
 */

import { UserProfileData, ProfileMatchRules, ProfileMatchResult } from "../types/index";

/**
 * Calculate profile match score between two users
 */
export function calculateProfileMatchScore(
  userProfile: UserProfileData,
  matchProfile: UserProfileData,
  rules: ProfileMatchRules
): ProfileMatchResult {
  // Calculate education similarity
  const educationScore = calculateEducationMatch(userProfile, matchProfile) * rules.educationWeight;

  // Calculate project similarity
  const projectScore = calculateProjectsMatch(userProfile, matchProfile) * rules.projectsWeight;

  // Calculate activity level similarity
  const activityScore = compareActivityLevels(userProfile, matchProfile) * rules.activityLevelWeight;

  // Calculate profile completeness impact
  const completenessScore = compareProfileCompleteness(userProfile, matchProfile) * rules.profileCompletenessWeight;

  // Calculate collaboration history value
  const collaborationScore = evaluateCollaborationPotential(userProfile, matchProfile) * rules.collaborationHistoryWeight;

  // Calculate total profile score
  const totalWeight = rules.educationWeight + rules.projectsWeight + 
                     rules.activityLevelWeight + rules.profileCompletenessWeight + 
                     rules.collaborationHistoryWeight;
  
  const overallScore = (educationScore + projectScore + activityScore + completenessScore + collaborationScore) / totalWeight;

  // Identify complementary areas between profiles
  const complementaryAreas = identifyComplementaryAreas(userProfile, matchProfile);

  // Identify potential synergies
  const potentialSynergies = identifyPotentialSynergies(userProfile, matchProfile);

  // Identify collaboration opportunities
  const collaborationOpportunities = identifyCollaborationOpportunities(userProfile, matchProfile);

  return {
    score: overallScore,
    complementaryAreas,
    potentialSynergies,
    collaborationOpportunities,
    contributingFactors: {
      educationScore,
      projectScore,
      activityScore,
      completenessScore,
      collaborationScore
    }
  };
}

/**
 * Calculate match based on educational background
 */
function calculateEducationMatch(userProfile: UserProfileData, matchProfile: UserProfileData): number {
  if (!userProfile.educations.length || !matchProfile.educations.length) {
    return 0.5; // Neutral score if education info missing
  }

  let matchScore = 0;
  let totalComparisons = 0;

  // Compare institutions
  const userInstitutions = userProfile.educations.map(edu => edu.institution.toLowerCase());
  const matchInstitutions = matchProfile.educations.map(edu => edu.institution.toLowerCase());
  
  const sharedInstitutions = userInstitutions.filter(inst => matchInstitutions.includes(inst));
  if (sharedInstitutions.length > 0) {
    matchScore += 1;
  }
  totalComparisons++;

  // Compare degrees
  const userDegrees = userProfile.educations.map(edu => edu.degree.toLowerCase());
  const matchDegrees = matchProfile.educations.map(edu => edu.degree.toLowerCase());
  
  // Calculate degree similarity
  let degreeMatch = 0;
  for (const userDegree of userDegrees) {
    for (const matchDegree of matchDegrees) {
      // Simple string similarity for demo purposes
      // In production, use taxonomy-based matching or ML-based similarity
      if (userDegree === matchDegree) {
        degreeMatch = 1;
      } else if (userDegree.includes(matchDegree) || matchDegree.includes(userDegree)) {
        degreeMatch = 0.7;
      }
    }
  }
  matchScore += degreeMatch;
  totalComparisons++;

  return matchScore / totalComparisons;
}

/**
 * Calculate match based on project similarities
 */
function calculateProjectsMatch(userProfile: UserProfileData, matchProfile: UserProfileData): number {
  if (!userProfile.projects.length || !matchProfile.projects.length) {
    return 0.5; // Neutral score if project info missing
  }

  let projectSimilarityScore = 0;
  let projectComparisons = 0;

  // Compare project categories
  const userCategories = userProfile.projects
    .map(p => p.category?.toLowerCase())
    .filter(Boolean) as string[];
  
  const matchCategories = matchProfile.projects
    .map(p => p.category?.toLowerCase())
    .filter(Boolean) as string[];
  
  if (userCategories.length && matchCategories.length) {
    // Find overlap
    const sharedCategories = userCategories.filter(cat => matchCategories.includes(cat));
    projectSimilarityScore += sharedCategories.length / Math.max(userCategories.length, matchCategories.length);
    projectComparisons++;
  }

  // Compare project titles and descriptions for similarity
  // In a real implementation, you would use NLP techniques here
  const titleSimilarity = calculateTextSimilarity(
    userProfile.projects.map(p => p.title).join(' '),
    matchProfile.projects.map(p => p.title).join(' ')
  );
  projectSimilarityScore += titleSimilarity;
  projectComparisons++;

  // Compare project descriptions if available
  const userDescriptions = userProfile.projects
    .map(p => p.description)
    .filter(Boolean) as string[];
  
  const matchDescriptions = matchProfile.projects
    .map(p => p.description)
    .filter(Boolean) as string[];
  
  if (userDescriptions.length && matchDescriptions.length) {
    const descriptionSimilarity = calculateTextSimilarity(
      userDescriptions.join(' '),
      matchDescriptions.join(' ')
    );
    projectSimilarityScore += descriptionSimilarity;
    projectComparisons++;
  }

  return projectComparisons > 0 ? projectSimilarityScore / projectComparisons : 0.5;
}

/**
 * Calculate similarity between text strings
 * This is a simple implementation. In production, use more sophisticated NLP techniques.
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Simple word overlap similarity for demonstration
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(Boolean));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(Boolean));
  
  // Count shared words
  let sharedCount = 0;
  for (const word of words1) {
    if (words2.has(word)) sharedCount++;
  }
  
  // Jaccard similarity
  const unionSize = words1.size + words2.size - sharedCount;
  return unionSize > 0 ? sharedCount / unionSize : 0;
}

/**
 * Compare activity levels between users
 */
function compareActivityLevels(userProfile: UserProfileData, matchProfile: UserProfileData): number {
  // In a real implementation, this would include:
  // - Engagement rate on platform
  // - Frequency of posts/pulses
  // - Consistency of profile updates
  // - Community participation
  
  // For now, we'll use a placeholder implementation
  return 0.7; // Default moderate activity match
}

/**
 * Compare profile completeness levels
 */
function compareProfileCompleteness(userProfile: UserProfileData, matchProfile: UserProfileData): number {
  // Calculate completeness for both profiles
  const userCompleteness = calculateProfileCompleteness(userProfile);
  const matchCompleteness = calculateProfileCompleteness(matchProfile);
  
  // We want to favor more complete profiles
  if (matchCompleteness > 0.8) {
    return 0.9; // High quality profile bonus
  } else if (matchCompleteness > 0.5) {
    return 0.7; // Moderate quality
  } else {
    return 0.4; // Low quality profile penalty
  }
}

/**
 * Calculate how complete a user's profile is
 */
function calculateProfileCompleteness(profile: UserProfileData): number {
  let completenessScore = 0;
  let totalFactors = 0;
  
  // User basic info
  if (profile.user.name) completenessScore++;
  if (profile.user.title) completenessScore++;
  if (profile.user.location) completenessScore++;
  if (profile.user.industry) completenessScore++;
  if (profile.user.aboutMe) completenessScore++;
  totalFactors += 5;
  
  // Has photo
  if (profile.user.photoURL) {
    completenessScore++;
    totalFactors++;
  }
  
  // Has work experience
  if (profile.workExperiences.length > 0) {
    completenessScore++;
    totalFactors++;
  }
  
  // Has education
  if (profile.educations.length > 0) {
    completenessScore++;
    totalFactors++;
  }
  
  // Has skills
  if (profile.skills.length > 0) {
    completenessScore++;
    totalFactors++;
  }
  
  // Has projects
  if (profile.projects.length > 0) {
    completenessScore++;
    totalFactors++;
  }
  
  return totalFactors > 0 ? completenessScore / totalFactors : 0;
}

/**
 * Evaluate potential for collaboration
 */
function evaluateCollaborationPotential(userProfile: UserProfileData, matchProfile: UserProfileData): number {
  // In a real implementation, this would analyze:
  // - Past collaboration patterns
  // - Shared connections
  // - Communication styles
  // - Complementary skills
  
  // For now, just check for some basic complementary factors
  const userSkills = new Set(userProfile.skills.map(s => s.name.toLowerCase()));
  const matchSkills = new Set(matchProfile.skills.map(s => s.name.toLowerCase()));
  
  // Count non-overlapping skills (complementary)
  let complementarySkillCount = 0;
  for (const skill of matchSkills) {
    if (!userSkills.has(skill)) complementarySkillCount++;
  }
  
  const complementaryRatio = complementarySkillCount / (matchSkills.size || 1);
  
  // We want some overlap but also some complementary skills
  // The ideal is a mix of both (around 50% overlap)
  const overlapRatio = 1 - complementaryRatio;
  const balanceScore = 1 - Math.abs(0.5 - overlapRatio);
  
  return balanceScore;
}

/**
 * Identify complementary areas between profiles
 */
function identifyComplementaryAreas(userProfile: UserProfileData, matchProfile: UserProfileData): string[] {
  const complementaryAreas: string[] = [];
  
  // Check for complementary skills
  const userSkillNames = userProfile.skills.map(s => s.name.toLowerCase());
  const matchSkillNames = matchProfile.skills.map(s => s.name.toLowerCase());
  const uniqueMatchSkills = matchSkillNames.filter(skill => !userSkillNames.includes(skill));
  
  if (uniqueMatchSkills.length > 0) {
    complementaryAreas.push(`Skills: ${uniqueMatchSkills.slice(0, 3).join(', ')}`);
  }
  
  // Check for complementary industry experience
  if (userProfile.user.industry !== matchProfile.user.industry && matchProfile.user.industry) {
    complementaryAreas.push(`Industry: ${matchProfile.user.industry}`);
  }
  
  // Check for complementary education
  const userInstitutions = userProfile.educations.map(e => e.institution.toLowerCase());
  const matchInstitutions = matchProfile.educations.map(e => e.institution.toLowerCase());
  const uniqueMatchInstitutions = matchInstitutions.filter(inst => !userInstitutions.includes(inst));
  
  if (uniqueMatchInstitutions.length > 0) {
    complementaryAreas.push(`Education: ${uniqueMatchInstitutions[0]}`);
  }
  
  return complementaryAreas;
}

/**
 * Identify potential synergies between profiles
 */
function identifyPotentialSynergies(userProfile: UserProfileData, matchProfile: UserProfileData): string[] {
  const synergies: string[] = [];
  
  // Check for industry-skill combinations
  if (userProfile.user.industry === matchProfile.user.industry) {
    // Find skills that the match has that the user doesn't
    const userSkillNames = userProfile.skills.map(s => s.name.toLowerCase());
    const matchSkillNames = matchProfile.skills.map(s => s.name.toLowerCase());
    const uniqueMatchSkills = matchSkillNames.filter(skill => !userSkillNames.includes(skill));
    
    if (uniqueMatchSkills.length > 0) {
      synergies.push(`Industry-specific skills in ${userProfile.user.industry}`);
    }
  }
  
  // Check for project-topic synergies
  const userProjectCategories = userProfile.projects
    .map(p => p.category?.toLowerCase())
    .filter(Boolean) as string[];
  
  const matchProjectCategories = matchProfile.projects
    .map(p => p.category?.toLowerCase())
    .filter(Boolean) as string[];
  
  const sharedCategories = userProjectCategories.filter(cat => matchProjectCategories.includes(cat));
  if (sharedCategories.length > 0) {
    synergies.push(`Collaborative potential in ${sharedCategories[0]} projects`);
  }
  
  return synergies;
}

/**
 * Identify collaboration opportunities
 */
function identifyCollaborationOpportunities(userProfile: UserProfileData, matchProfile: UserProfileData): string[] {
  const opportunities: string[] = [];
  
  // Check for skill exchange opportunities
  const userSkills = userProfile.skills.map(s => ({ name: s.name, level: s.level }));
  const matchSkills = matchProfile.skills.map(s => ({ name: s.name, level: s.level }));
  
  // Find skills where match has high proficiency
  const matchExpertSkills = matchSkills
    .filter(s => s.level === 'Expert' || s.level === 'Advanced')
    .map(s => s.name.toLowerCase());
  
  // Find skills where user is a beginner
  const userBeginnerSkills = userSkills
    .filter(s => s.level === 'Beginner' || s.level === 'Intermediate')
    .map(s => s.name.toLowerCase());
  
  // Find learning opportunities
  const learningOpportunities = matchExpertSkills.filter(skill => 
    userBeginnerSkills.includes(skill) || !userSkills.map(s => s.name.toLowerCase()).includes(skill)
  );
  
  if (learningOpportunities.length > 0) {
    opportunities.push(`Skill development in ${learningOpportunities[0]}`);
  }
  
  // Check for industry mentorship opportunities
  if (userProfile.workExperiences.length && matchProfile.workExperiences.length) {
    const userExperience = calculateYearsOfExperience(userProfile.workExperiences);
    const matchExperience = calculateYearsOfExperience(matchProfile.workExperiences);
    
    if (matchExperience > userExperience + 3) {
      opportunities.push('Career mentorship');
    } else if (userExperience > matchExperience + 3) {
      opportunities.push('Mentorship opportunity');
    } else {
      opportunities.push('Peer collaboration');
    }
  }
  
  return opportunities;
}

/**
 * Calculate years of work experience from work experience entries
 */
function calculateYearsOfExperience(experiences: any[]): number {
  let totalYears = 0;
  
  for (const exp of experiences) {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    totalYears += years;
  }
  
  return totalYears;
}