import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { insertBrandOfTheDaySchema } from "@shared/schema";

export const router = Router();

/**
 * Get all Brands of the Day
 * GET /api/brands-of-the-day
 */
router.get("/api/brands-of-the-day", async (req: Request, res: Response) => {
  try {
    const brands = await storage.getBrandsOfTheDay();
    res.json(brands);
  } catch (error) {
    console.error("[GET /brands-of-the-day] Error:", error);
    res.status(500).json({ message: "Failed to get brands of the day" });
  }
});

/**
 * Get Brands of the Day by industry and domain for a specific date
 * GET /api/brands-of-the-day/:industry/:domain
 */
router.get("/api/brands-of-the-day/:industry/:domain", async (req: Request, res: Response) => {
  try {
    const { industry, domain } = req.params;
    const dateStr = req.query.date as string;
    
    // Default to today if no date provided
    const date = dateStr ? new Date(dateStr) : new Date();
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    
    // Try to get the brand from storage
    let brand = await storage.getBrandOfTheDayByIndustryAndDomain(industry, domain, date);
    
    // For development/demo purposes, return a sample brand if none found
    if (!brand) {
      // Check if we're in demo mode (for testing purposes)
      const isDemoMode = req.query.demo === 'true';
      
      if (isDemoMode || process.env.NODE_ENV === 'development') {
        console.log(`[GET /brands-of-the-day/:industry/:domain] No brand found, returning sample data for industry ${industry}, domain ${domain}`);
        
        // Get a demo user to associate with the brand
        const demoUser = await storage.getUser(1); // Demo user ID
        
        if (demoUser) {
          // Return a sample brand for demo/testing
          return res.json({
            id: 9999,
            userId: demoUser.id,
            industry: industry,
            domain: domain || "all",
            brandValueScore: 85,
            muskComment: "This professional demonstrates exceptional expertise in their field and consistently delivers high-quality content that benefits the community.",
            scoreBreakdown: { 
              profileStrength: 22,
              careerQuests: 13,
              pulseActivity: 14,
              portfolioProjects: 9,
              engagement: 9,
              muskUsage: 8,
              consistency: 9,
              badges: 4
            },
            featuredDate: new Date(),
            expiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            hasBeenShared: false,
            createdAt: new Date()
          });
        }
      }
      
      return res.status(404).json({ message: "No brand of the day found for this industry and domain" });
    }
    
    res.json(brand);
  } catch (error) {
    console.error("[GET /brands-of-the-day/:industry/:domain] Error:", error);
    res.status(500).json({ message: "Failed to get brand of the day" });
  }
});

/**
 * Get Brands of the Day by user ID
 * GET /api/users/:userId/brands-of-the-day
 */
router.get("/api/users/:userId/brands-of-the-day", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    // Validate userId
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const brands = await storage.getBrandsOfTheDayByUserId(userId);
    res.json(brands);
  } catch (error) {
    console.error("[GET /users/:userId/brands-of-the-day] Error:", error);
    res.status(500).json({ message: "Failed to get brands of the day for this user" });
  }
});

/**
 * Create a new Brand of the Day
 * POST /api/brands-of-the-day
 */
router.post("/api/brands-of-the-day", async (req: Request, res: Response) => {
  try {
    const validationResult = insertBrandOfTheDaySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid brand of the day data", 
        errors: validationResult.error.format() 
      });
    }
    
    const brandData = validationResult.data;
    
    // Check if the user exists
    const user = await storage.getUser(brandData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create the brand of the day
    const newBrand = await storage.createBrandOfTheDay(brandData);
    res.status(201).json(newBrand);
  } catch (error) {
    console.error("[POST /brands-of-the-day] Error:", error);
    res.status(500).json({ message: "Failed to create brand of the day" });
  }
});

/**
 * Mark a Brand of the Day as shared
 * PATCH /api/brands-of-the-day/:id/share
 */
router.patch("/api/brands-of-the-day/:id/share", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Validate id
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid brand of the day ID" });
    }
    
    // Special handling for demo data (ID 9999)
    if (id === 9999) {
      console.log("[PATCH /brands-of-the-day/:id/share] Handling share for demo brand of the day");
      
      // For demo/dev purposes, we return a mock updated brand
      return res.json({
        id: 9999,
        userId: 1, // Demo user
        industry: "Technology",
        domain: "all",
        brandValueScore: 85,
        muskComment: "This professional demonstrates exceptional expertise in their field and consistently delivers high-quality content that benefits the community.",
        scoreBreakdown: { 
          profileStrength: 22,
          careerQuests: 13,
          pulseActivity: 14,
          portfolioProjects: 9,
          engagement: 9,
          muskUsage: 8,
          consistency: 9,
          badges: 4
        },
        featuredDate: new Date(),
        expiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        hasBeenShared: true, // Now marked as shared
        createdAt: new Date()
      });
    }
    
    // For real data, handle normally
    const brand = await storage.getBrandOfTheDayById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand of the day not found" });
    }
    
    // Mark as shared
    const updatedBrand = await storage.markBrandOfTheDayAsShared(id);
    res.json(updatedBrand);
  } catch (error) {
    console.error("[PATCH /brands-of-the-day/:id/share] Error:", error);
    res.status(500).json({ message: "Failed to mark brand of the day as shared" });
  }
});

/**
 * Calculate a user's Brand Value Score
 * POST /api/users/:userId/calculate-brand-value-score
 */
router.post("/api/users/:userId/calculate-brand-value-score", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    // Validate userId
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Check if the user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Calculate the brand value score
    const scoreResult = await storage.calculateBrandValueScore(userId);
    res.json(scoreResult);
  } catch (error) {
    console.error("[POST /users/:userId/calculate-brand-value-score] Error:", error);
    res.status(500).json({ message: "Failed to calculate brand value score" });
  }
});

export default router;