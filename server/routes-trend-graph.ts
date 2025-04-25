/**
 * API Routes for Trend Graph and Job Graph Features
 * 
 * These routes provide endpoints for Musk AI to access trend data, career paths,
 * and job transition information.
 */

import { Express, Request, Response } from "express";
import * as trendGraphService from "./services/trend-graph-service";
import { insertSkillTrendSchema, insertCareerPathNodeSchema, insertCareerTransitionSchema } from "@shared/schema";

export function registerTrendGraphRoutes(app: Express): void {
  const apiRouter = app._router;

  /**
   * GET /api/trend-graph/skills/trending
   * Get trending skills for a specific industry and time frame
   */
  apiRouter.get("/api/trend-graph/skills/trending", async (req: Request, res: Response) => {
    try {
      const { industry, timeFrame, limit } = req.query;
      
      if (!industry) {
        return res.status(400).json({
          status: "error",
          message: "Industry parameter is required"
        });
      }
      
      const trendingSkills = await trendGraphService.getTrendingSkills(
        industry as string,
        timeFrame as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );
      
      return res.status(200).json({
        status: "success",
        data: trendingSkills
      });
    } catch (error) {
      console.error("Error fetching trending skills:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch trending skills"
      });
    }
  });

  /**
   * GET /api/trend-graph/skills/related
   * Get related skills for a specific skill
   */
  apiRouter.get("/api/trend-graph/skills/related", async (req: Request, res: Response) => {
    try {
      const { skillName } = req.query;
      
      if (!skillName) {
        return res.status(400).json({
          status: "error",
          message: "Skill name parameter is required"
        });
      }
      
      const relatedSkills = await trendGraphService.getRelatedSkills(skillName as string);
      
      return res.status(200).json({
        status: "success",
        data: relatedSkills
      });
    } catch (error) {
      console.error("Error fetching related skills:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch related skills"
      });
    }
  });

  /**
   * GET /api/trend-graph/skills/search
   * Search skills by name or category
   */
  apiRouter.get("/api/trend-graph/skills/search", async (req: Request, res: Response) => {
    try {
      const { query, limit } = req.query;
      
      if (!query) {
        return res.status(400).json({
          status: "error",
          message: "Search query parameter is required"
        });
      }
      
      const searchResults = await trendGraphService.searchSkills(
        query as string,
        limit ? parseInt(limit as string) : undefined
      );
      
      return res.status(200).json({
        status: "success",
        data: searchResults
      });
    } catch (error) {
      console.error("Error searching skills:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to search skills"
      });
    }
  });

  /**
   * GET /api/trend-graph/career/jobs/search
   * Search for job nodes by title and industry
   */
  apiRouter.get("/api/trend-graph/career/jobs/search", async (req: Request, res: Response) => {
    try {
      const { title, industry, limit } = req.query;
      
      if (!title) {
        return res.status(400).json({
          status: "error",
          message: "Job title parameter is required"
        });
      }
      
      const jobNodes = await trendGraphService.searchJobNodes(
        title as string,
        industry as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );
      
      return res.status(200).json({
        status: "success",
        data: jobNodes
      });
    } catch (error) {
      console.error("Error searching job nodes:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to search job nodes"
      });
    }
  });

  /**
   * GET /api/trend-graph/career/progression
   * Get possible career progression options from a current role
   */
  apiRouter.get("/api/trend-graph/career/progression", async (req: Request, res: Response) => {
    try {
      const { jobNodeId, difficulty } = req.query;
      
      if (!jobNodeId) {
        return res.status(400).json({
          status: "error",
          message: "Job node ID parameter is required"
        });
      }
      
      const progressionOptions = await trendGraphService.getCareerProgressionOptions(
        parseInt(jobNodeId as string),
        difficulty as string | undefined
      );
      
      return res.status(200).json({
        status: "success",
        data: progressionOptions
      });
    } catch (error) {
      console.error("Error fetching career progression options:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch career progression options"
      });
    }
  });

  /**
   * GET /api/trend-graph/career/skill-gaps
   * Get skill gaps between current role and target role
   */
  apiRouter.get("/api/trend-graph/career/skill-gaps", async (req: Request, res: Response) => {
    try {
      const { currentNodeId, targetNodeId } = req.query;
      
      if (!currentNodeId || !targetNodeId) {
        return res.status(400).json({
          status: "error",
          message: "Both current and target node IDs are required"
        });
      }
      
      const skillGaps = await trendGraphService.getSkillGapsForTransition(
        parseInt(currentNodeId as string),
        parseInt(targetNodeId as string)
      );
      
      return res.status(200).json({
        status: "success",
        data: skillGaps
      });
    } catch (error) {
      console.error("Error fetching skill gaps:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch skill gaps"
      });
    }
  });

  /**
   * POST /api/trend-graph/career/path
   * Generate a career path from current to target role
   */
  apiRouter.post("/api/trend-graph/career/path", async (req: Request, res: Response) => {
    try {
      const { currentJobTitle, targetJobTitle, industry } = req.body;
      
      if (!currentJobTitle || !targetJobTitle || !industry) {
        return res.status(400).json({
          status: "error",
          message: "Current job title, target job title, and industry are all required"
        });
      }
      
      const careerPath = await trendGraphService.generateCareerPath(
        currentJobTitle,
        targetJobTitle,
        industry
      );
      
      return res.status(200).json({
        status: "success",
        ...careerPath
      });
    } catch (error) {
      console.error("Error generating career path:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to generate career path"
      });
    }
  });

  /**
   * POST /api/trend-graph/admin/skills
   * Add or update a skill trend record (admin only)
   */
  apiRouter.post("/api/trend-graph/admin/skills", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertSkillTrendSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          status: "error",
          message: "Invalid skill trend data",
          errors: validationResult.error.errors
        });
      }
      
      const skillTrend = await trendGraphService.upsertSkillTrend(validationResult.data);
      
      return res.status(200).json({
        status: "success",
        data: skillTrend
      });
    } catch (error) {
      console.error("Error adding/updating skill trend:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to add/update skill trend"
      });
    }
  });

  /**
   * POST /api/trend-graph/admin/jobs
   * Add or update a career path node (admin only)
   */
  apiRouter.post("/api/trend-graph/admin/jobs", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertCareerPathNodeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          status: "error",
          message: "Invalid career path node data",
          errors: validationResult.error.errors
        });
      }
      
      const careerPathNode = await trendGraphService.upsertCareerPathNode(validationResult.data);
      
      return res.status(200).json({
        status: "success",
        data: careerPathNode
      });
    } catch (error) {
      console.error("Error adding/updating career path node:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to add/update career path node"
      });
    }
  });

  /**
   * POST /api/trend-graph/admin/transitions
   * Add or update a career transition (admin only)
   */
  apiRouter.post("/api/trend-graph/admin/transitions", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertCareerTransitionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          status: "error",
          message: "Invalid career transition data",
          errors: validationResult.error.errors
        });
      }
      
      const careerTransition = await trendGraphService.upsertCareerTransition(validationResult.data);
      
      return res.status(200).json({
        status: "success",
        data: careerTransition
      });
    } catch (error) {
      console.error("Error adding/updating career transition:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to add/update career transition"
      });
    }
  });
}