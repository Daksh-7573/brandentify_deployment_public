import { Router, Request, Response } from "express";
import type { IStorage } from "./storage";
import { z } from "zod";

// Schema for updating user profile during onboarding
const updateUserSchema = z.object({
  title: z.string().optional(),
  industry: z.string().optional(),
  domain: z.string().optional(),
  profileCompleted: z.number().min(0).max(100).optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  aboutMe: z.string().optional(),
  tagline: z.string().optional(),
  lookingFor: z.string().optional(),
});

export function createUserUpdateRoutes(storage: IStorage) {
  const router = Router();

  // Update user profile
  router.patch("/users/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Validate request body
      const validatedData = updateUserSchema.parse(req.body);
      
      console.log(`[PATCH /api/users/:userId] Updating user ${userId} with:`, validatedData);

      // Get current user to ensure it exists
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user with validated data
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      console.log(`[PATCH /api/users/:userId] Successfully updated user ${userId}`);
      
      res.json(updatedUser);
    } catch (error: any) {
      console.error("[PATCH /api/users/:userId] Error updating user:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  return router;
}
