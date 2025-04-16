import { Request, Response } from "express";
import { storage } from "./storage";
import { InsertUser, User, Skill, WorkExperience } from "@shared/schema";
import { z } from 'zod';

const smartConnectSchema = z.object({
  lookingFor: z.string(),
  jobTitle: z.string().optional(),
  experienceLevel: z.string().optional(),
  industry: z.string().optional(),
  domain: z.string().optional(),
  location: z.string().optional(),
  userId: z.number().optional(),
});

// Define the match result type for strong typing
export interface MatchResult {
  id: number;
  name: string | null;
  photoURL: string | null;
  title: string | null;
  location: string | null;
  industry: string | null;
  lookingFor: string | null;
  skills: string[];
  matchPercentage: number;
  matchDetails: {
    complementaryMatch?: number;
    industryMatch: number;
    domainMatch: number;
    experienceMatch: number;
  };
}

// Define complementary relationship mapping for Smart Connect algorithm
// Each key maps to its complementary value(s) for cross-matching
const COMPLEMENTARY_RELATIONS: Record<string, string[]> = {
  // Career & Job Seeking category
  "job_opportunities": ["job_seekers"],
  "job_seekers": ["job_opportunities"],
  "internships": ["interns"],
  "interns": ["internships"],
  "mentors": ["mentees"],
  "mentees": ["mentors"],
  
  // Business & Investment category
  "investors": ["startups"],
  "startups": ["investors", "tech_partners", "advisors"],
  "co_founders": ["business_partners", "co_founders"],
  "business_partners": ["co_founders", "business_partners"],
  "advisors": ["startups"],
  "tech_partners": ["startups"],
  
  // Learning & Upskilling category
  "skill_trainers": ["learners"],
  "learners": ["skill_trainers", "study_groups"],
  "study_groups": ["learners", "study_groups"],
  
  // Networking & Collaborations category
  "industry_experts": ["share_expertise"],
  "share_expertise": ["industry_experts"],
  
  // Freelance & Side Hustle category
  "freelance_gigs": ["hiring_freelancers"],
  "hiring_freelancers": ["freelance_gigs"]
};

// Calculate match score between users based on various factors
function calculateMatchScore(
  criteria: z.infer<typeof smartConnectSchema>, 
  user: User,
  userSkills: Skill[],
  userExperiences: WorkExperience[]
): MatchResult {
  // Default values for match details
  const matchDetails = {
    complementaryMatch: 0,
    industryMatch: 0,
    domainMatch: 0,
    experienceMatch: 0
  };
  
  // 1. Calculate complementary relationship match (0-100)
  if (criteria.lookingFor && user.lookingFor) {
    const complementaryValues = COMPLEMENTARY_RELATIONS[criteria.lookingFor] || [];
    if (complementaryValues.includes(user.lookingFor)) {
      matchDetails.complementaryMatch = 100;
    } else if (criteria.lookingFor === user.lookingFor) {
      // Same lookingFor also provides some match value
      matchDetails.complementaryMatch = 40; 
    }
  }
  
  // 2. Calculate industry match (0-100)
  if (criteria.industry && user.industry) {
    if (criteria.industry.toLowerCase() === user.industry.toLowerCase()) {
      matchDetails.industryMatch = 100;
    } else {
      // Partial matching by checking if one contains the other
      const criteriaLower = criteria.industry.toLowerCase();
      const userLower = user.industry.toLowerCase();
      if (criteriaLower.includes(userLower) || userLower.includes(criteriaLower)) {
        matchDetails.industryMatch = 70;
      }
    }
  }
  
  // 3. Calculate domain match (0-100)
  if (criteria.domain && user.domain) {
    if (criteria.domain.toLowerCase() === user.domain.toLowerCase()) {
      matchDetails.domainMatch = 100;
    } else {
      // Partial matching
      const criteriaLower = criteria.domain.toLowerCase();
      const userLower = user.domain.toLowerCase();
      if (criteriaLower.includes(userLower) || userLower.includes(criteriaLower)) {
        matchDetails.domainMatch = 70;
      }
    }
  }
  
  // 4. Calculate experience level match (0-100)
  if (criteria.experienceLevel && user.title) {
    const experienceTitle = user.title.toLowerCase();
    const targetExperience = criteria.experienceLevel.toLowerCase();
    
    if (experienceTitle.includes(targetExperience)) {
      matchDetails.experienceMatch = 100;
    } else {
      // Experience level hierarchy for matching (e.g., senior > mid-level > junior)
      const experienceLevels = ["fresher", "student", "junior", "mid-level", "senior", "director", "executive"];
      const criteriaIndex = experienceLevels.findIndex(level => targetExperience.includes(level));
      const userIndex = experienceLevels.findIndex(level => experienceTitle.includes(level));
      
      if (criteriaIndex >= 0 && userIndex >= 0) {
        // The closer the levels, the higher the match
        const levelDifference = Math.abs(criteriaIndex - userIndex);
        matchDetails.experienceMatch = Math.max(0, 100 - (levelDifference * 20));
      }
    }
  }
  
  // 5. Check for job title match as bonus factor
  let jobTitleMatch = 0;
  if (criteria.jobTitle && user.title) {
    const jobWordsMatch = criteria.jobTitle.toLowerCase().split(/\s+/).some(word => 
      user.title?.toLowerCase().includes(word) && word.length > 3 // Only consider significant words
    );
    
    if (jobWordsMatch) {
      jobTitleMatch = 30;
    }
  }
  
  // 6. Check for location match as bonus factor
  let locationMatch = 0;
  if (criteria.location && user.location) {
    const locationWordsMatch = criteria.location.toLowerCase().split(/[\s,]+/).some(word => 
      user.location?.toLowerCase().includes(word) && word.length > 3 // Only consider significant words
    );
    
    if (locationWordsMatch) {
      locationMatch = 20;
    }
  }
  
  // 7. Extract skills from user's title and experiences if no explicit skills
  const extractedSkills: string[] = [];
  if (user.title) {
    const titleWords = user.title.split(/\s+/).filter(word => word.length > 3);
    extractedSkills.push(...titleWords);
  }
  
  // Add actual skills from user skills table
  const skillNames = userSkills.map(skill => skill.name);
  
  // Calculate final match percentage (weighted average of all factors)
  const weights = {
    complementary: 0.35,
    industry: 0.20,
    domain: 0.15,
    experience: 0.15,
    jobTitle: 0.1,
    location: 0.05
  };
  
  const weightedScore = 
    (matchDetails.complementaryMatch * weights.complementary) +
    (matchDetails.industryMatch * weights.industry) +
    (matchDetails.domainMatch * weights.domain) +
    (matchDetails.experienceMatch * weights.experience) +
    (jobTitleMatch * weights.jobTitle) +
    (locationMatch * weights.location);
    
  const matchPercentage = Math.round(weightedScore);
  
  return {
    id: user.id,
    name: user.name,
    photoURL: user.photoURL,
    title: user.title,
    location: user.location,
    industry: user.industry,
    lookingFor: user.lookingFor,
    skills: skillNames.length > 0 ? skillNames : extractedSkills,
    matchPercentage,
    matchDetails
  };
}

// API handler for Smart Connect matching
export async function findMatches(req: Request, res: Response) {
  try {
    const parseResult = smartConnectSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid input", 
        errors: parseResult.error.format() 
      });
    }
    
    const criteria = parseResult.data;
    
    // Get the requesting user to exclude from results
    const requestingUserId = criteria.userId || 0;
    
    // Get all users from storage
    const allUsers = await storage.getAllUsers();
    
    // Array to store match results
    const matches: MatchResult[] = [];
    
    // Process each user for potential matches
    for (const user of allUsers) {
      // Skip the requesting user
      if (user.id === requestingUserId) {
        continue;
      }
      
      // Get user's skills
      const userSkills = await storage.getSkillsByUserId(user.id);
      
      // Get user's work experiences
      const userExperiences = await storage.getWorkExperiencesByUserId(user.id);
      
      // Calculate match score
      const matchResult = calculateMatchScore(criteria, user, userSkills, userExperiences);
      
      // Only include users with meaningful match percentage (above 30%)
      if (matchResult.matchPercentage > 30) {
        matches.push(matchResult);
      }
    }
    
    // Sort matches by match percentage (highest first)
    const sortedMatches = matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Return top matches (limit to 20)
    return res.status(200).json(sortedMatches.slice(0, 20));
    
  } catch (error) {
    console.error("Error in Smart Connect matching:", error);
    return res.status(500).json({ message: "Error finding matches" });
  }
}