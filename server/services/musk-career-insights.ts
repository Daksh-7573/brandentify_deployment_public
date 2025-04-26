/**
 * Musk Career Insights Service
 * 
 * This service integrates the trend graph data with Musk AI to provide
 * data-backed career guidance and recommendations.
 */

import * as trendGraphService from './trend-graph-service';
import { getUserWorkExperiences } from './work-experience-service';
import { getUserEducations } from './education-service';
import { getUserSkills } from './skill-service';

/**
 * Get trending skills relevant to a user's profile
 * 
 * @param userId The user ID to analyze
 * @param timeFrame Optional time frame filter (e.g., "6_months", "1_year", "3_years")
 * @param limit Maximum number of results
 * @returns Array of trending skills with relevance to the user's profile
 */
export async function getUserRelevantTrendingSkills(userId: number, timeFrame?: string, limit = 10) {
  try {
    // Get user's industry from their work experiences
    const workExperiences = await getUserWorkExperiences(userId);
    
    if (!workExperiences || workExperiences.length === 0) {
      return {
        success: false,
        message: "No work experience data found to determine industry",
        data: []
      };
    }
    
    // Use the most recent work experience's industry
    // Sort by end date (null means current, so it should be first)
    const sortedExperiences = [...workExperiences].sort((a, b) => {
      if (!a.endDate) return -1;
      if (!b.endDate) return 1;
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });
    
    const latestIndustry = sortedExperiences[0].industry || "Software Development";
    
    // Get trending skills in this industry
    const trendingSkills = await trendGraphService.getTrendingSkills(
      latestIndustry,
      timeFrame,
      limit
    );
    
    // Get user's current skills
    const userSkills = await getUserSkills(userId);
    const userSkillNames = userSkills.map(s => s.skillName);
    
    // Mark which trending skills the user already has
    const enhancedTrendingSkills = trendingSkills.map(skill => ({
      ...skill,
      userHasSkill: userSkillNames.includes(skill.skillName)
    }));
    
    return {
      success: true,
      message: "Successfully retrieved trending skills relevant to user's profile",
      data: enhancedTrendingSkills,
      industry: latestIndustry
    };
  } catch (error) {
    console.error("Error retrieving user-relevant trending skills:", error);
    return {
      success: false,
      message: "Failed to retrieve trending skills",
      data: []
    };
  }
}

/**
 * Find potential career paths for a user based on their current profile
 * 
 * @param userId The user ID to analyze
 * @returns Object containing potential career progression options
 */
export async function getUserCareerPathOptions(userId: number) {
  try {
    // Get user's current job title and industry
    const workExperiences = await getUserWorkExperiences(userId);
    
    if (!workExperiences || workExperiences.length === 0) {
      return {
        success: false,
        message: "No work experience data found",
        currentRole: null,
        options: []
      };
    }
    
    // Sort by end date (null means current, so it should be first)
    const sortedExperiences = [...workExperiences].sort((a, b) => {
      if (!a.endDate) return -1;
      if (!b.endDate) return 1;
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });
    
    const currentExperience = sortedExperiences[0];
    const currentTitle = currentExperience.title;
    const currentIndustry = currentExperience.industry || "Software Development";
    
    // Get user's skills
    const userSkills = await getUserSkills(userId);
    const userSkillNames = userSkills.map(s => s.skillName);
    
    // Search for job nodes matching the current title
    const jobNodes = await trendGraphService.searchJobNodes(currentTitle, currentIndustry);
    
    if (jobNodes.length === 0) {
      return {
        success: false,
        message: "Could not find career data for your current role",
        currentRole: { title: currentTitle, industry: currentIndustry },
        options: []
      };
    }
    
    // For simplicity, use the first matching job node
    const currentNode = jobNodes[0];
    
    // Get career progression options
    const progressionOptions = await trendGraphService.getCareerProgressionOptions(currentNode.id);
    
    // If no direct progressions found, try to find progressions by title
    if (progressionOptions.length === 0) {
      return {
        success: true,
        message: "No direct progression paths found, but found similar roles",
        currentRole: { 
          title: currentTitle, 
          industry: currentIndustry,
          node: currentNode
        },
        options: [],
        similarRoles: await trendGraphService.searchJobNodes(
          currentTitle.includes("Senior") ? "Staff" : "Senior " + currentTitle, 
          currentIndustry
        )
      };
    }
    
    // Enhance progression options with skill gap analysis
    const enhancedOptions = progressionOptions.map(option => {
      const targetNode = option.toNode;
      const transition = option.transition;
      
      // Calculate which skills the user already has
      const requiredSkills = targetNode.requiredSkills as string[];
      const userHasSkills = requiredSkills.filter(skill => 
        userSkillNames.includes(skill)
      );
      
      // Calculate skill gaps
      const skillGaps = requiredSkills.filter(skill => 
        !userSkillNames.includes(skill)
      );
      
      const skillCompleteness = requiredSkills.length > 0 
        ? userHasSkills.length / requiredSkills.length 
        : 0;
      
      return {
        targetRole: targetNode,
        transition,
        skillAnalysis: {
          requiredSkills,
          userHasSkills,
          skillGaps,
          skillCompleteness: parseFloat((skillCompleteness * 100).toFixed(2))
        }
      };
    });
    
    return {
      success: true,
      message: "Successfully retrieved career path options",
      currentRole: { 
        title: currentTitle, 
        industry: currentIndustry,
        node: currentNode
      },
      options: enhancedOptions
    };
  } catch (error) {
    console.error("Error retrieving user career path options:", error);
    return {
      success: false,
      message: "Failed to retrieve career path options",
      currentRole: null,
      options: []
    };
  }
}

/**
 * Generate career insights for a specific user
 * 
 * @param userId User ID to generate insights for
 * @returns Object containing various career insights
 */
export async function generateUserCareerInsights(userId: number) {
  try {
    // Get user's trending skills
    const trendingSkillsResponse = await getUserRelevantTrendingSkills(userId);
    
    // Get user's career path options
    const careerPathResponse = await getUserCareerPathOptions(userId);
    
    // Get user's skills
    const userSkills = await getUserSkills(userId);
    
    // Get user's education
    const educations = await getUserEducations(userId);
    
    // Get user's work experience
    const workExperiences = await getUserWorkExperiences(userId);
    
    // Compare current skill set to in-demand skills
    let skillGapAnalysis = {
      hasSkillData: userSkills.length > 0,
      inDemandSkills: [],
      skillsToAcquire: [],
      skillMarketFit: 0
    };
    
    if (trendingSkillsResponse.success && userSkills.length > 0) {
      const trendingSkills = trendingSkillsResponse.data;
      const userSkillNames = userSkills.map(s => s.skillName);
      
      const inDemandUserSkills = trendingSkills
        .filter(s => userSkillNames.includes(s.skillName))
        .sort((a, b) => b.demandScore - a.demandScore);
      
      const missingInDemandSkills = trendingSkills
        .filter(s => !userSkillNames.includes(s.skillName))
        .sort((a, b) => b.demandScore - a.demandScore);
      
      // Calculate skill market fit (what percentage of trending skills the user has)
      const skillMarketFit = trendingSkills.length > 0 
        ? (inDemandUserSkills.length / trendingSkills.length) * 100 
        : 0;
      
      skillGapAnalysis = {
        hasSkillData: true,
        inDemandSkills: inDemandUserSkills,
        skillsToAcquire: missingInDemandSkills,
        skillMarketFit: parseFloat(skillMarketFit.toFixed(2))
      };
    }
    
    // Compile comprehensive insights
    return {
      success: true,
      timestamp: new Date(),
      userProfile: {
        hasWorkExperience: workExperiences.length > 0,
        hasEducation: educations.length > 0,
        hasSkills: userSkills.length > 0,
        skillCount: userSkills.length,
        workExperienceCount: workExperiences.length,
        educationCount: educations.length
      },
      marketInsights: {
        trendingSkills: trendingSkillsResponse.success ? trendingSkillsResponse.data : [],
        industry: trendingSkillsResponse.success ? trendingSkillsResponse.industry : null
      },
      careerPathInsights: {
        currentRole: careerPathResponse.success ? careerPathResponse.currentRole : null,
        progressionOptions: careerPathResponse.success ? careerPathResponse.options : [],
        similarRoles: careerPathResponse.similarRoles || []
      },
      skillGapAnalysis
    };
  } catch (error) {
    console.error("Error generating user career insights:", error);
    return {
      success: false,
      message: "Failed to generate career insights",
      timestamp: new Date()
    };
  }
}