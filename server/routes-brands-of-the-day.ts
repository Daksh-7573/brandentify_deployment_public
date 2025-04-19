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
    
    const brand = await storage.getBrandOfTheDayByIndustryAndDomain(industry, domain, date);
    
    if (!brand) {
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
    
    // Check if the brand exists
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