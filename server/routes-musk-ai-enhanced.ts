/**
 * Enhanced Musk AI Routes
 * 
 * These routes enhance Musk AI with data-driven career insights from the trend graph
 * and user profile analysis.
 */

import { Express, Request, Response } from "express";
import fetch from 'node-fetch';
import { OpenAI } from "openai";
import * as muskCareerInsightsService from "./services/musk-career-insights";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate enhanced career guidance using Musk AI with trend graph data
 * 
 * @param userId The user ID to generate guidance for
 * @param query The user's specific career question or concern
 * @returns AI-generated guidance enhanced with trend data
 */
async function generateEnhancedCareerGuidance(userId: number, query: string) {
  try {
    // Get career insights from trend graph and user profile
    const careerInsights = await muskCareerInsightsService.generateUserCareerInsights(userId);
    
    if (!careerInsights.success) {
      return {
        success: false,
        message: "Failed to retrieve career insights data",
        guidance: "I apologize, but I'm having trouble accessing up-to-date career data at the moment. Please try again in a moment."
      };
    }
    
    // Format career insights into a structured prompt for the AI
    const aiContext = `
You are Musk, a career development AI assistant that leverages advanced intelligence on career knowledge.
You are trained on: O*NET Database, Levels.fyi compensation data, LinkedIn career path patterns, 
and an extensive corpus of resume libraries and career coaching transcripts.

You understand the difference between similar roles in different industries and can prioritize 
relevant skills based on goals, not just job listings. You can detect outdated language in resumes 
and provide targeted advice based on actual market trends.

Based on real data about this user's profile and current market trends, provide personalized career guidance.

USER PROFILE:
- Has ${careerInsights.userProfile.workExperienceCount} work experiences
- Has ${careerInsights.userProfile.skillCount} skills
- Has ${careerInsights.userProfile.educationCount} education entries
${careerInsights.careerPathInsights.currentRole ? 
  `- Current role: ${careerInsights.careerPathInsights.currentRole.title} in ${careerInsights.careerPathInsights.currentRole.industry}` : 
  '- Current role: Not specified'}

MARKET INSIGHTS:
- Industry: ${careerInsights.marketInsights.industry || "Not specified"}
- Trending skills in their industry: ${careerInsights.marketInsights.trendingSkills.length > 0 ? 
  careerInsights.marketInsights.trendingSkills.map(s => s.skillName).join(", ") : 
  "No trending skills data available"}
- Data source: Analysis of job postings across multiple career platforms

SKILL GAP ANALYSIS:
- Skill market fit: ${careerInsights.skillGapAnalysis.skillMarketFit}%
- In-demand skills they already have: ${careerInsights.skillGapAnalysis.inDemandSkills.length > 0 ? 
  careerInsights.skillGapAnalysis.inDemandSkills.map(s => s.skillName).join(", ") : 
  "None identified"}
- Skills they should acquire: ${careerInsights.skillGapAnalysis.skillsToAcquire.length > 0 ? 
  careerInsights.skillGapAnalysis.skillsToAcquire.map(s => s.skillName).join(", ") : 
  "None identified"}
- Priority: Focus on skills with highest demand scores first

CAREER PATH OPTIONS:
${careerInsights.careerPathInsights.progressionOptions.length > 0 ? 
  careerInsights.careerPathInsights.progressionOptions.map(option => 
    `- ${option.targetRole.jobTitle} (skill completeness: ${option.skillAnalysis.skillCompleteness}%)
     Required skills: ${option.targetRole.requiredSkills.join(", ")}
     Skills they need: ${option.skillAnalysis.skillGaps.join(", ")}
     Average transition time: ${option.transition?.avgTransitionTime || "Unknown"} months`
  ).join("\n") : 
  "No specific career path options identified"}

Based on this data, provide personalized career guidance addressing the following user query:
"${query}"

Follow these guidelines in your response:
1. Provide concrete, actionable advice based on the real data points above
2. Be encouraging but realistic about career transitions
3. Prioritize mentorship advice over generic growth tips
4. For skill recommendations, explain why each skill matters in their industry context
5. If suggesting a career path, include typical transition timelines
6. Format your response with clear sections and bullet points for readability

Remember to draw upon your specialized knowledge of career patterns across industries, 
not just generic advice.
`;

    // Get AI response using OpenAI
    let aiResponse;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: aiContext }],
      max_tokens: 1500
    });
    
    aiResponse = completion.choices[0].message.content;
    
    return {
      success: true,
      message: "Successfully generated enhanced career guidance",
      guidance: aiResponse,
      insightsUsed: {
        trendingSkillsCount: careerInsights.marketInsights.trendingSkills.length,
        careerPathOptionsCount: careerInsights.careerPathInsights.progressionOptions.length,
        skillMarketFit: careerInsights.skillGapAnalysis.skillMarketFit
      }
    };
  } catch (error) {
    console.error("Error generating enhanced career guidance:", error);
    return {
      success: false,
      message: "Failed to generate enhanced career guidance",
      guidance: "I apologize, but I'm having trouble providing guidance at the moment. Please try again in a moment."
    };
  }
}

/**
 * Register routes for enhanced Musk AI features
 */
export function registerMuskAIEnhancedRoutes(app: Express): void {
  const apiRouter = app._router;
  
  /**
   * POST /api/musk-enhanced/career-guidance
   * Generate enhanced career guidance using Musk AI with trend graph data
   */
  apiRouter.post("/api/musk-enhanced/career-guidance", async (req: Request, res: Response) => {
    try {
      const { userId, query } = req.body;
      
      if (!userId || !query) {
        return res.status(400).json({
          status: "error",
          message: "Missing required parameters: userId and query are required"
        });
      }
      
      const userIdNum = parseInt(userId);
      
      if (isNaN(userIdNum)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID format"
        });
      }
      
      const guidance = await generateEnhancedCareerGuidance(
        userIdNum,
        query
      );
      
      return res.status(200).json({
        status: "success",
        ...guidance
      });
    } catch (error) {
      console.error("Error generating enhanced career guidance:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to generate enhanced career guidance"
      });
    }
  });
}