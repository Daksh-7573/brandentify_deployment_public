import express, { Router, Request, Response } from "express";
import type { IStorage } from "./storage";
import { insertBrandGoalSchema } from "@shared/schema";

export function createBrandGoalsRoutes(storage: IStorage) {
  const router = Router();

  // Get brand goals for a user
  router.get("/brand-goals/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const brandGoals = await storage.getBrandGoalsByUserId(userId);
      
      // Transform snake_case to camelCase for frontend
      if (brandGoals) {
        res.json({
          id: brandGoals.id,
          userId: brandGoals.userId,
          selectedGoals: brandGoals.selected_goals || [],
          updatedAt: brandGoals.updatedAt
        });
      } else {
        res.json({ selectedGoals: [] });
      }
    } catch (error) {
      console.error("Error fetching brand goals:", error);
      res.status(500).json({ error: "Failed to fetch brand goals" });
    }
  });

  // Save brand goals for a user  
  router.post("/brand-goals", express.json(), async (req: Request, res: Response) => {
    try {
      console.log('[POST /api/brand-goals] Headers:', req.headers);
      console.log('[POST /api/brand-goals] Content-Type:', req.get('content-type'));
      console.log('[POST /api/brand-goals] Request body:', JSON.stringify(req.body));
      console.log('[POST /api/brand-goals] Body keys:', Object.keys(req.body || {}));
      
      const validatedData = insertBrandGoalSchema.parse(req.body);
      
      const savedGoals = await storage.saveBrandGoals(
        validatedData.userId,
        validatedData.selectedGoals
      );
      
      // Transform snake_case to camelCase for frontend
      res.json({
        id: savedGoals.id,
        userId: savedGoals.userId,
        selectedGoals: savedGoals.selected_goals || [],
        updatedAt: savedGoals.updatedAt
      });
    } catch (error: any) {
      console.error("Error saving brand goals:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      
      res.status(500).json({ error: "Failed to save brand goals" });
    }
  });

  return router;
}
