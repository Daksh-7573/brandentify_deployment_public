/**
 * Industry Matcher
 * 
 * Calculates match scores between users based on industry experience,
 * domain expertise, and cross-industry value.
 */

import { UserProfileData, IndustryMatchRules, IndustryMatchResult } from "../types/index";

// Map of related industries for cross-industry matching
const RELATED_INDUSTRIES: Record<string, string[]> = {
  "technology": ["software", "it", "artificial intelligence", "data science", "fintech", "edtech", "healthtech"],
  "software": ["technology", "it", "artificial intelligence", "data science"],
  "finance": ["fintech", "banking", "accounting", "investment", "insurance"],
  "healthcare": ["healthtech", "biotech", "pharmaceutical", "medical devices"],
  "marketing": ["advertising", "digital marketing", "public relations", "media"],
  "education": ["edtech", "training", "e-learning"],
  "design": ["user experience", "graphic design", "product design", "architecture"],
  "consulting": ["management consulting", "strategy", "business services"],
  "manufacturing": ["automotive", "aerospace", "industrial", "consumer goods"],
  "retail": ["e-commerce", "consumer goods", "fashion"],
  "media": ["entertainment", "publishing", "news", "gaming"],
  "telecommunications": ["networking", "communications", "mobile"],
  "energy": ["oil & gas", "renewable energy", "utilities"],
  "real estate": ["property management", "construction", "architecture"],
  "transportation": ["logistics", "automotive", "aviation"]
};

/**
 * Calculate industry match score between two users
 */
export function calculateIndustryMatch(
  userProfile: UserProfileData,
  matchProfile: UserProfileData,
  rules: IndustryMatchRules
): IndustryMatchResult {
  // Extract industries
  const userIndustry = userProfile.user.industry?.toLowerCase() || "";
  const matchIndustry = matchProfile.user.industry?.toLowerCase() || "";
  
  if (!userIndustry || !matchIndustry) {
    return {
      score: 0.5, // Neutral score if industry information is missing
      industryAlignmentScore: 0.5,
      domainExpertiseScore: 0.5,
      crossIndustryInsights: [],
      contributingFactors: {}
    };
  }
  
  // Calculate direct industry match
  const directIndustryMatch = calculateDirectIndustryMatch(
    userIndustry, 
    matchIndustry, 
    rules.targetIndustries
  );
  
  // Calculate related industry value
  const relatedIndustryValue = calculateRelatedIndustryValue(
    userIndustry, 
    matchIndustry, 
    rules.relatedIndustriesWeight
  );
  
  // Calculate domain expertise match
  const domainExpertiseMatch = calculateDomainExpertiseMatch(
    userProfile, 
    matchProfile, 
    rules.domainSpecificityWeight
  );
  
  // Calculate cross-industry experience value
  const crossIndustryValue = calculateCrossIndustryValue(
    userProfile,
    matchProfile,
    rules.crossIndustryExperienceValue
  );
  
  // Find potential cross-industry insights
  const crossIndustryInsights = identifyCrossIndustryInsights(userProfile, matchProfile);
  
  // Calculate weighted overall score
  const weightSum = 3 + rules.relatedIndustriesWeight + 
                     rules.domainSpecificityWeight + rules.crossIndustryExperienceValue;
  
  const overallScore = (
    (directIndustryMatch * 3) +
    (relatedIndustryValue * rules.relatedIndustriesWeight) +
    (domainExpertiseMatch * rules.domainSpecificityWeight) +
    (crossIndustryValue * rules.crossIndustryExperienceValue)
  ) / weightSum;
  
  return {
    score: overallScore,
    industryAlignmentScore: (directIndustryMatch + relatedIndustryValue) / 2,
    domainExpertiseScore: domainExpertiseMatch,
    crossIndustryInsights,
    contributingFactors: {
      directIndustryMatch,
      relatedIndustryValue,
      domainExpertiseMatch,
      crossIndustryValue
    }
  };
}

/**
 * Calculate direct industry match score
 */
function calculateDirectIndustryMatch(
  userIndustry: string,
  matchIndustry: string,
  targetIndustries: string[]
): number {
  // If exact match, return perfect score
  if (userIndustry === matchIndustry) {
    return 1.0;
  }
  
  // If match industry is one of the target industries, give high score
  if (targetIndustries.length > 0) {
    const normalizedTargets = targetIndustries.map(ind => ind.toLowerCase());
    if (normalizedTargets.includes(matchIndustry)) {
      return 0.9;
    }
  }
  
  // Check for partial matches (e.g., "healthcare" would match "healthcare technology")
  if (userIndustry.includes(matchIndustry) || matchIndustry.includes(userIndustry)) {
    return 0.8;
  }
  
  // Default low match for unrelated industries
  return 0.3;
}

/**
 * Calculate related industry value
 */
function calculateRelatedIndustryValue(
  userIndustry: string,
  matchIndustry: string,
  relatedIndustriesWeight: number
): number {
  if (userIndustry === matchIndustry) {
    return 1.0; // Perfect match
  }
  
  // Check if they are related industries
  const relatedToUser = RELATED_INDUSTRIES[userIndustry] || [];
  const relatedToMatch = RELATED_INDUSTRIES[matchIndustry] || [];
  
  // If user's industry is related to match industry
  if (relatedToUser.includes(matchIndustry)) {
    return 0.8;
  }
  
  // If match's industry is related to user industry
  if (relatedToMatch.includes(userIndustry)) {
    return 0.8;
  }
  
  // Check for second-degree relationships (shared related industries)
  const sharedRelatedIndustries = relatedToUser.filter(ind => relatedToMatch.includes(ind));
  if (sharedRelatedIndustries.length > 0) {
    return 0.6;
  }
  
  // Check if either industry contains the other as a substring
  if (userIndustry.includes(matchIndustry) || matchIndustry.includes(userIndustry)) {
    return 0.7;
  }
  
  return 0.2; // Low relation
}

/**
 * Calculate domain expertise match
 */
function calculateDomainExpertiseMatch(
  userProfile: UserProfileData,
  matchProfile: UserProfileData,
  domainSpecificityWeight: number
): number {
  // Extract domains if available
  const userDomain = userProfile.user.domain?.toLowerCase() || "";
  const matchDomain = matchProfile.user.domain?.toLowerCase() || "";
  
  // If both have specified domains
  if (userDomain && matchDomain) {
    // Exact domain match
    if (userDomain === matchDomain) {
      return 1.0;
    }
    
    // Partial domain match
    if (userDomain.includes(matchDomain) || matchDomain.includes(userDomain)) {
      return 0.8;
    }
    
    // Different domains in same industry
    if (userProfile.user.industry?.toLowerCase() === matchProfile.user.industry?.toLowerCase()) {
      return 0.6; // Different but complementary domains
    }
    
    return 0.4; // Different domains in different industries
  }
  
  // If only one has domain, check if their skills align with the other's domain
  if (userDomain && !matchDomain) {
    return evaluateDomainAlignmentWithSkills(userDomain, matchProfile.skills) ? 0.7 : 0.4;
  }
  
  if (!userDomain && matchDomain) {
    return evaluateDomainAlignmentWithSkills(matchDomain, userProfile.skills) ? 0.7 : 0.4;
  }
  
  // Neither has domain specified, evaluate based on work experiences
  return evaluateDomainFromWorkExperience(userProfile, matchProfile);
}

/**
 * Evaluate if skills align with a domain
 */
function evaluateDomainAlignmentWithSkills(domain: string, skills: any[]): boolean {
  const skillNames = skills.map(s => s.name.toLowerCase());
  
  // Check if any skills contain the domain or vice versa
  for (const skill of skillNames) {
    if (skill.includes(domain) || domain.includes(skill)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Infer domain alignment from work experience
 */
function evaluateDomainFromWorkExperience(
  userProfile: UserProfileData,
  matchProfile: UserProfileData
): number {
  // If no work experiences, return neutral score
  if (!userProfile.workExperiences.length || !matchProfile.workExperiences.length) {
    return 0.5;
  }
  
  // Extract company names and titles for comparison
  const userCompanies = userProfile.workExperiences.map(exp => exp.company.toLowerCase());
  const matchCompanies = matchProfile.workExperiences.map(exp => exp.company.toLowerCase());
  
  const userTitles = userProfile.workExperiences.map(exp => exp.title.toLowerCase());
  const matchTitles = matchProfile.workExperiences.map(exp => exp.title.toLowerCase());
  
  // Check for company overlap
  const sharedCompanies = userCompanies.filter(company => matchCompanies.includes(company));
  if (sharedCompanies.length > 0) {
    return 0.9; // High alignment if worked at same companies
  }
  
  // Check for title similarity
  let titleSimilarity = 0;
  for (const userTitle of userTitles) {
    for (const matchTitle of matchTitles) {
      if (userTitle === matchTitle) {
        titleSimilarity = 0.8; // Exact title match
        break;
      } else if (userTitle.includes(matchTitle) || matchTitle.includes(userTitle)) {
        titleSimilarity = Math.max(titleSimilarity, 0.6); // Partial title match
      }
    }
  }
  
  if (titleSimilarity > 0) {
    return titleSimilarity;
  }
  
  // Default moderate alignment
  return 0.5;
}

/**
 * Calculate cross-industry experience value
 */
function calculateCrossIndustryValue(
  userProfile: UserProfileData,
  matchProfile: UserProfileData,
  crossIndustryExperienceValue: number
): number {
  // If same industry, no cross-industry value
  if (userProfile.user.industry?.toLowerCase() === matchProfile.user.industry?.toLowerCase()) {
    return 0.5; // Neutral score
  }
  
  // Extract all industries from work experiences
  const userIndustries = new Set<string>();
  userIndustries.add(userProfile.user.industry?.toLowerCase() || "");
  
  for (const exp of userProfile.workExperiences) {
    if (exp.industry) {
      userIndustries.add(exp.industry.toLowerCase());
    }
  }
  
  const matchIndustries = new Set<string>();
  matchIndustries.add(matchProfile.user.industry?.toLowerCase() || "");
  
  for (const exp of matchProfile.workExperiences) {
    if (exp.industry) {
      matchIndustries.add(exp.industry.toLowerCase());
    }
  }
  
  // Count how many unique industries the match has experience in
  let uniqueIndustriesCount = 0;
  for (const industry of matchIndustries) {
    if (industry && !userIndustries.has(industry)) {
      uniqueIndustriesCount++;
    }
  }
  
  // More unique industries = higher cross-industry value
  if (uniqueIndustriesCount >= 3) {
    return 1.0; // High cross-industry value
  } else if (uniqueIndustriesCount === 2) {
    return 0.8;
  } else if (uniqueIndustriesCount === 1) {
    return 0.6;
  }
  
  return 0.3; // Low cross-industry value
}

/**
 * Identify potential cross-industry insights
 */
function identifyCrossIndustryInsights(
  userProfile: UserProfileData,
  matchProfile: UserProfileData
): string[] {
  const insights: string[] = [];
  
  // If same industry, no cross-industry insights
  if (userProfile.user.industry?.toLowerCase() === matchProfile.user.industry?.toLowerCase()) {
    return insights;
  }
  
  const userIndustry = userProfile.user.industry?.toLowerCase() || "";
  const matchIndustry = matchProfile.user.industry?.toLowerCase() || "";
  
  if (!userIndustry || !matchIndustry) {
    return insights;
  }
  
  // Check if match industry is related to user industry
  const relatedToUser = RELATED_INDUSTRIES[userIndustry] || [];
  if (relatedToUser.includes(matchIndustry)) {
    insights.push(`Can provide insights from related ${matchIndustry} industry`);
  }
  
  // Check for complementary industry expertise
  if (isComplementaryIndustry(userIndustry, matchIndustry)) {
    insights.push(`Has complementary expertise in ${matchIndustry}`);
  }
  
  // Check for transferable skills across industries
  const transferableSkills = identifyTransferableSkills(userProfile, matchProfile);
  if (transferableSkills.length > 0) {
    insights.push(`Has transferable ${transferableSkills[0]} skills from ${matchIndustry}`);
  }
  
  return insights;
}

/**
 * Check if two industries are complementary
 */
function isComplementaryIndustry(industry1: string, industry2: string): boolean {
  // Predefined complementary industry pairs
  const COMPLEMENTARY_PAIRS = [
    ["technology", "finance"],
    ["technology", "healthcare"],
    ["technology", "education"],
    ["design", "marketing"],
    ["consulting", "technology"],
    ["finance", "consulting"],
    ["healthcare", "biotech"],
    ["marketing", "media"],
    ["education", "technology"]
  ];
  
  // Check if the pair exists (in either order)
  return COMPLEMENTARY_PAIRS.some(pair => 
    (pair[0] === industry1 && pair[1] === industry2) ||
    (pair[0] === industry2 && pair[1] === industry1)
  );
}

/**
 * Identify transferable skills between industries
 */
function identifyTransferableSkills(
  userProfile: UserProfileData,
  matchProfile: UserProfileData
): string[] {
  const transferableSkills: string[] = [];
  
  // Common transferable skill categories across industries
  const TRANSFERABLE_SKILL_CATEGORIES = [
    "leadership",
    "communication",
    "project management",
    "analysis",
    "research",
    "strategy",
    "design",
    "development",
    "data"
  ];
  
  // Check match's skills for transferable categories
  for (const skill of matchProfile.skills) {
    const skillName = skill.name.toLowerCase();
    
    for (const category of TRANSFERABLE_SKILL_CATEGORIES) {
      if (skillName.includes(category)) {
        transferableSkills.push(category);
        break;
      }
    }
  }
  
  return Array.from(new Set(transferableSkills)); // Remove duplicates
}