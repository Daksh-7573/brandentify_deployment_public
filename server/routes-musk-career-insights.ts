/**
 * API Routes for Musk Career Insights
 * 
 * These routes provide data-driven career guidance and insights based on
 * trend graph data and user's profile.
 */

import { Express, Request, Response } from "express";
import * as muskCareerInsightsService from "./services/musk-career-insights";

export function registerMuskCareerInsightsRoutes(app: Express): void {
  const apiRouter = app._router;

  /**
   * GET /api/musk-insights/trending-skills/:userId
   * Get trending skills relevant to a user's profile
   */
  apiRouter.get("/api/musk-insights/trending-skills/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { timeFrame, limit } = req.query;
      
      if (isNaN(userId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID"
        });
      }
      
      const trendingSkills = await muskCareerInsightsService.getUserRelevantTrendingSkills(
        userId,
        timeFrame as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );
      
      return res.status(200).json({
        status: "success",
        ...trendingSkills
      });
    } catch (error) {
      console.error("Error fetching user-relevant trending skills:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch trending skills"
      });
    }
  });

  /**
   * GET /api/musk-insights/career-paths/:userId
   * Get career path options for a specific user
   */
  apiRouter.get("/api/musk-insights/career-paths/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID"
        });
      }
      
      const careerPaths = await muskCareerInsightsService.getUserCareerPathOptions(userId);
      
      return res.status(200).json({
        status: "success",
        ...careerPaths
      });
    } catch (error) {
      console.error("Error fetching user career path options:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch career path options"
      });
    }
  });

  /**
   * GET /api/musk-insights/career-report/:userId
   * Get comprehensive career insights for a user
   */
  apiRouter.get("/api/musk-insights/career-report/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID"
        });
      }
      
      const careerInsights = await muskCareerInsightsService.generateUserCareerInsights(userId);
      
      return res.status(200).json({
        status: "success",
        ...careerInsights
      });
    } catch (error) {
      console.error("Error generating user career insights:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to generate career insights"
      });
    }
  });
}