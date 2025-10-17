import { Router, Request, Response } from "express";
import type { IStorage } from "./storage";
import { z } from "zod";

export function createOnboardingRoutes(storage: IStorage) {
  const router = Router();

  // Update user onboarding status
  router.patch("/users/:userId/onboarding", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const schema = z.object({
        onboardingComplete: z.boolean().optional(),
        onboardingStep: z.enum(['welcome', 'profile', 'complete']).optional(),
      });

      const validatedData = schema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          onboardingComplete: updatedUser.onboardingComplete,
          onboardingStep: updatedUser.onboardingStep
        }
      });
    } catch (error: any) {
      console.error("Error updating onboarding status:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      
      res.status(500).json({ error: "Failed to update onboarding status" });
    }
  });

  // Get user onboarding status
  router.get("/users/:userId/onboarding", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        onboardingComplete: user.onboardingComplete ?? false,
        onboardingStep: user.onboardingStep ?? 'welcome',
        profileCompleted: user.profileCompleted ?? 0
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      res.status(500).json({ error: "Failed to fetch onboarding status" });
    }
  });

  return router;
}
