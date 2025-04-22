import { Router, Request, Response } from "express";
import { storage } from "./storage";

export const router = Router();

/**
 * Get enhanced user data for Brand of the Day display
 * This endpoint is specifically for the Brand of the Day feature and provides
 * enhanced user data that doesn't interfere with regular user data
 * GET /api/enhanced-user/:userId
 */
router.get("/api/enhanced-user/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    // Validate userId
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Get the base user data directly from the database
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create enhanced user data specifically for the brand of the day feature
    // This doesn't affect the actual user data stored in the database
    const enhancedUser = {
      ...user,
      // Only provide default values if the user doesn't have them
      photoURL: user.photoURL || "/images/demo/profile-photo.jpg",
      title: user.title || "Senior Software Engineer",
      name: user.name || "Senior Professional", 
      industry: user.industry || "Technology",
      domain: user.domain || "Engineering",
    };
    
    console.log("[GET /enhanced-user/:userId] Returning enhanced user data:", enhancedUser.name);
    
    // Return the enhanced USER data directly, not a brand object
    return res.json(enhancedUser);
  } catch (error) {
    console.error("[GET /enhanced-user/:userId] Error:", error);
    res.status(500).json({ message: "Failed to get enhanced user data" });
  }
});

export default router;
