// Musk Match Suggest - Intelligent profile matching service
import { UserData } from '@/types/user';

// Mirror matching map to find complementary profiles
export const MIRROR_MATCH_MAP: Record<string, string[]> = {
  // Career & Job Seeking category
  "mentors": ["mentees"],
  "mentees": ["mentors"],
  "job_opportunities": ["job_seekers"],
  "job_seekers": ["job_opportunities"],
  "internships": ["interns"],
  "interns": ["internships"],
  
  // Business & Investment category  
  "investors": ["startups"],
  "startups": ["investors", "co_founders"],
  "co_founders": ["co_founders", "startups"],
  "business_partners": ["business_partners"],
  "tech_partners": ["tech_partners"],
  
  // Learning & Upskilling category
  "skill_trainers": ["learners", "study_groups"],
  "learners": ["skill_trainers", "study_groups"],
  "study_groups": ["learners"],
  
  // Networking & Collaborations category
  "industry_experts": ["share_expertise"],
  "share_expertise": ["industry_experts"],
  
  // Freelance & Side Hustle category
  "freelance_gigs": ["hiring_freelancers"],
  "hiring_freelancers": ["freelance_gigs"]
};

// Match weights for profile similarity scoring
export const MATCH_WEIGHTS = {
  industry: 0.3,
  domain: 0.2,
  location: 0.1,
  skills: 0.2,
  title: 0.1,
  bonus: 0.1, // Projects match, recently active
};

// Minimum requirements for match suggestions
export const MATCH_REQUIREMENTS = {
  profileCompleted: 70, // Percentage
  emailVerified: true,
  minSkillsMatch: 3,
};

interface MatchCriteria {
  lookingFor: string;
  industry?: string;
  domain?: string;
  location?: string;
  skills?: string[];
  title?: string;
  userId?: number | string; // To exclude current user
}

interface MatchResult {
  user: UserData;
  score: number;
  matchReason: string;
}

/**
 * Calculate match score between a user and potential matches based on weighted criteria
 * @param userData Current user data
 * @param potentialMatches Array of potential matching users
 * @returns Array of matches with scores and reasons
 */
export function calculateMatchScores(
  userData: UserData,
  potentialMatches: UserData[]
): MatchResult[] {
  // Filter out users who don't meet minimum requirements
  const validMatches = potentialMatches.filter(
    (match) =>
      match.id !== userData.id &&
      (match.profileCompleted || 0) >= MATCH_REQUIREMENTS.profileCompleted &&
      match.emailVerified === MATCH_REQUIREMENTS.emailVerified
  );

  // Calculate score for each potential match
  return validMatches.map((match) => {
    let score = 0;
    let matchReasons = [];

    // Industry match (30%)
    if (match.industry && userData.industry && match.industry === userData.industry) {
      score += MATCH_WEIGHTS.industry;
      matchReasons.push(`Same industry: ${match.industry}`);
    }

    // Domain match (20%)
    // This would need to be implemented when domains are added to the profile schema

    // Location proximity (10%)
    if (match.location && userData.location) {
      // Simple match for now, in production would use geo proximity
      if (match.location === userData.location) {
        score += MATCH_WEIGHTS.location;
        matchReasons.push(`Same location: ${match.location}`);
      }
    }

    // Title similarity (10%)
    if (match.title && userData.title) {
      // Simple check if titles contain similar keywords
      const userTitleLower = userData.title.toLowerCase();
      const matchTitleLower = match.title.toLowerCase();
      const commonWords = [
        "developer", "engineer", "manager", "designer", "analyst", 
        "director", "specialist", "consultant", "lead", "senior"
      ];
      
      const hasCommonWord = commonWords.some(word => 
        userTitleLower.includes(word) && matchTitleLower.includes(word)
      );
      
      if (hasCommonWord) {
        score += MATCH_WEIGHTS.title;
        matchReasons.push(`Similar role: ${match.title}`);
      }
    }

    // Skills match would go here when implemented in the user profile

    // Generate match reason summary
    const matchReason = matchReasons.length > 0 
      ? matchReasons.slice(0, 2).join(', ') 
      : "Compatible looking for values";

    return {
      user: match,
      score: parseFloat(score.toFixed(2)),
      matchReason
    };
  })
  .sort((a, b) => b.score - a.score); // Sort by highest score first
}

/**
 * Get matching profiles for a user based on looking for value and profile similarity
 * @param userData Current user data
 * @param allUsers All available users to match from
 * @returns Top matching profiles
 */
export function getMuskMatchSuggestions(
  userData: UserData,
  allUsers: UserData[]
): MatchResult[] {
  // Early exit if user has no lookingFor value
  if (!userData.lookingFor) {
    return [];
  }

  // Get the "lookingFor" value code (e.g. "mentors", "job_seekers")
  const lookingForValue = typeof userData.lookingFor === 'string' 
    ? userData.lookingFor.replace(/^[^ ]+ /, '')
    : '';
    
  // Find mirror matches based on looking for value
  const mirrorValues = MIRROR_MATCH_MAP[lookingForValue] || [];
  
  if (mirrorValues.length === 0) {
    return [];
  }
  
  // Filter users by mirror looking for values
  const potentialMatches = allUsers.filter(user => 
    user.id !== userData.id && 
    mirrorValues.some(value => 
      user.lookingFor && 
      typeof user.lookingFor === 'string' && 
      user.lookingFor.toLowerCase().includes(value.toLowerCase())
    )
  );
  
  // Calculate match scores and return top matches
  const matches = calculateMatchScores(userData, potentialMatches);
  
  // Return top 3 matches, requiring at least 0.3 score (30% match)
  return matches
    .filter(match => match.score >= 0.3)
    .slice(0, 3);
}

/**
 * Generate a friendly message from Musk suggesting a match
 * @param userData User receiving the suggestion
 * @param matchData Match being suggested
 * @returns Personalized suggestion message
 */
export function generateMuskMatchMessage(
  userData: UserData,
  matchData: MatchResult
): string {
  // Get the user's lookingFor value without emoji prefix
  const userLookingFor = typeof userData.lookingFor === 'string' 
    ? userData.lookingFor.replace(/^[^ ]+ /, '')
    : 'connections';
    
  // Get the match's lookingFor value without emoji prefix
  const matchLookingFor = typeof matchData.user.lookingFor === 'string'
    ? matchData.user.lookingFor.replace(/^[^ ]+ /, '')
    : 'connections';
    
  // Template messages based on looking for combinations
  const messageTemplates: Record<string, string[]> = {
    "mentors": [
      `You're looking for a career mentor. ${matchData.user.name} has experience mentoring in ${matchData.user.industry || 'your field'}.`,
      `I found a potential mentor match! ${matchData.user.name} is available for mentoring and has a ${Math.round(matchData.score * 100)}% match with your profile.`
    ],
    "mentees": [
      `Looking to mentor others? ${matchData.user.name} is seeking guidance in ${matchData.user.industry || 'your industry'}.`,
      `I found someone who needs your mentorship! ${matchData.user.name} is looking for a mentor in ${matchData.matchReason}.`
    ],
    "job_opportunities": [
      `You're looking for job opportunities. ${matchData.user.name} is hiring for roles that match your profile.`,
      `Found a potential job connection! ${matchData.user.name} is looking for candidates with your background.`
    ],
    "job_seekers": [
      `Looking for talent? ${matchData.user.name} has skills that align with what companies like yours need.`,
      `I found a candidate that might interest you! ${matchData.user.name} is job seeking with relevant experience.`
    ],
    "co_founders": [
      `You're looking for a co-founder. ${matchData.user.name} is also seeking a founding partner with complementary skills.`,
      `Co-founder alert! ${matchData.user.name} might be the partner you're looking for with experience in ${matchData.matchReason}.`
    ],
    "investors": [
      `Looking for investment opportunities? ${matchData.user.name} has a startup seeking funding.`,
      `I found a startup that might interest you! ${matchData.user.name} is looking for investors like you.`
    ],
    "startups": [
      `You're building a startup. ${matchData.user.name} is an investor interested in your industry.`,
      `Funding opportunity? ${matchData.user.name} invests in startups like yours!`
    ],
    "default": [
      `Based on what you're looking for, I think you should connect with ${matchData.user.name}. You have a ${Math.round(matchData.score * 100)}% match!`,
      `I found someone you might want to meet! ${matchData.user.name} matches your profile with ${matchData.matchReason}.`
    ]
  };
  
  // Select the appropriate template set based on user's lookingFor
  const templates = messageTemplates[userLookingFor] || messageTemplates.default;
  
  // Choose a random template from the set
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template;
}

/**
 * Check if it's time to show a new match suggestion
 * @param lastShownTimestamp When the last match was shown
 * @returns Boolean indicating if a new match should be shown
 */
export function shouldShowMuskMatch(lastShownTimestamp?: Date | string | null): boolean {
  if (!lastShownTimestamp) {
    return true; // No previous suggestion, show one
  }
  
  const lastShown = typeof lastShownTimestamp === 'string' 
    ? new Date(lastShownTimestamp)
    : lastShownTimestamp;
    
  const now = new Date();
  const hoursSinceLastShown = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60);
  
  // Show new suggestion if it's been at least 24 hours
  return hoursSinceLastShown >= 24;
}