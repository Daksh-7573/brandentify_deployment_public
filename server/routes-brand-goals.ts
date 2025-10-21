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
          customGoals: brandGoals.custom_goals || [],
          updatedAt: brandGoals.updatedAt
        });
      } else {
        res.json({ selectedGoals: [], customGoals: [] });
      }
    } catch (error) {
      console.error("Error fetching brand goals:", error);
      res.status(500).json({ error: "Failed to fetch brand goals" });
    }
  });

  // Save brand goals for a user  
  router.post("/brand-goals", express.json(), async (req: Request, res: Response) => {
    try {
      console.log('[POST /api/brand-goals] Request body:', JSON.stringify(req.body));
      
      const validatedData = insertBrandGoalSchema.parse(req.body);
      
      // Validate total goals (selectedGoals + customGoals) <= 3
      const selectedCount = validatedData.selectedGoals?.length || 0;
      const customCount = validatedData.customGoals?.length || 0;
      const totalGoals = selectedCount + customCount;
      
      if (totalGoals > 3) {
        return res.status(400).json({ 
          error: 'Maximum 3 total goals allowed (pre-defined + custom combined)' 
        });
      }
      
      // Validate custom goals
      if (validatedData.customGoals && validatedData.customGoals.length > 0) {
        for (const goal of validatedData.customGoals) {
          const trimmed = goal.trim();
          
          if (!trimmed) {
            return res.status(400).json({ error: 'Custom goals cannot be empty' });
          }
          
          if (trimmed.length > 200) {
            return res.status(400).json({ 
              error: 'Each custom goal must be under 200 characters' 
            });
          }
        }
      }
      
      const savedGoals = await storage.saveBrandGoals(
        validatedData.userId,
        validatedData.selectedGoals,
        validatedData.customGoals || []
      );
      
      // Transform snake_case to camelCase for frontend
      res.json({
        id: savedGoals.id,
        userId: savedGoals.userId,
        selectedGoals: savedGoals.selected_goals || [],
        customGoals: savedGoals.custom_goals || [],
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
