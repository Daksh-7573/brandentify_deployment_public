import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { brandsOfTheDay, users, insertBrandOfTheDaySchema } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "./db";
import { add } from "date-fns";

const router = Router();

// Get today's featured brands for all industries
router.get("/api/brands-of-the-day", async (req: Request, res: Response) => {
  try {
    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at 00:00:00
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all brands featured today
    const featuredBrands = await db
      .select({
        id: brandsOfTheDay.id,
        userId: brandsOfTheDay.userId,
        industry: brandsOfTheDay.industry,
        domain: brandsOfTheDay.domain,
        brandValueScore: brandsOfTheDay.brandValueScore,
        muskComment: brandsOfTheDay.muskComment,
        scoreBreakdown: brandsOfTheDay.scoreBreakdown,
        featuredDate: brandsOfTheDay.featuredDate,
        expiresDate: brandsOfTheDay.expiresDate,
        hasBeenShared: brandsOfTheDay.hasBeenShared,
        user: {
          id: users.id,
          name: users.name,
          photoURL: users.photoURL,
          title: users.title,
          industry: users.industry,
          domain: users.domain,
          company: users.company
        }
      })
      .from(brandsOfTheDay)
      .leftJoin(users, eq(brandsOfTheDay.userId, users.id))
      .where(
        and(
          gte(brandsOfTheDay.featuredDate, today),
          lte(brandsOfTheDay.featuredDate, tomorrow)
        )
      )
      .orderBy(desc(brandsOfTheDay.brandValueScore));

    res.json(featuredBrands);
  } catch (error) {
    console.error("[GET /brands-of-the-day] Error:", error);
    res.status(500).json({ message: "Failed to fetch featured brands" });
  }
});

// Get featured brands for a specific industry and domain
router.get("/api/brands-of-the-day/:industry/:domain", async (req: Request, res: Response) => {
  try {
    const { industry, domain } = req.params;
    
    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at 00:00:00
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get brand featured today for the specific industry and domain
    const [featuredBrand] = await db
      .select({
        id: brandsOfTheDay.id,
        userId: brandsOfTheDay.userId,
        industry: brandsOfTheDay.industry,
        domain: brandsOfTheDay.domain,
        brandValueScore: brandsOfTheDay.brandValueScore,
        muskComment: brandsOfTheDay.muskComment,
        scoreBreakdown: brandsOfTheDay.scoreBreakdown,
        featuredDate: brandsOfTheDay.featuredDate,
        expiresDate: brandsOfTheDay.expiresDate,
        hasBeenShared: brandsOfTheDay.hasBeenShared,
        user: {
          id: users.id,
          name: users.name,
          photoURL: users.photoURL,
          title: users.title,
          industry: users.industry,
          domain: users.domain,
          company: users.company
        }
      })
      .from(brandsOfTheDay)
      .leftJoin(users, eq(brandsOfTheDay.userId, users.id))
      .where(
        and(
          gte(brandsOfTheDay.featuredDate, today),
          lte(brandsOfTheDay.featuredDate, tomorrow),
          eq(brandsOfTheDay.industry, industry),
          eq(brandsOfTheDay.domain, domain)
        )
      );
    
    if (!featuredBrand) {
      return res.status(404).json({ message: "No featured brand found for this industry and domain today" });
    }
    
    res.json(featuredBrand);
  } catch (error) {
    console.error("[GET /brands-of-the-day/:industry/:domain] Error:", error);
    res.status(500).json({ message: "Failed to fetch featured brand" });
  }
});

// Get history of featured brands for a specific user
router.get("/api/users/:userId/brands-of-the-day", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get all instances of this user being featured
    const featuredHistory = await db
      .select()
      .from(brandsOfTheDay)
      .where(eq(brandsOfTheDay.userId, userId))
      .orderBy(desc(brandsOfTheDay.featuredDate));
    
    res.json(featuredHistory);
  } catch (error) {
    console.error("[GET /users/:userId/brands-of-the-day] Error:", error);
    res.status(500).json({ message: "Failed to fetch featured history" });
  }
});

// Create a new Brand of the Day (admin/system route)
router.post("/api/brands-of-the-day", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = insertBrandOfTheDaySchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    
    const brandData = validation.data;
    
    // Set expiration date to 24 hours from now
    const expiresDate = add(new Date(), { hours: 24 });
    
    // Insert new Brand of the Day
    const [createdBrand] = await db
      .insert(brandsOfTheDay)
      .values({
        ...brandData,
        expiresDate
      })
      .returning();
    
    res.status(201).json(createdBrand);
  } catch (error) {
    console.error("[POST /brands-of-the-day] Error:", error);
    res.status(500).json({ message: "Failed to create featured brand" });
  }
});

// Mark a Brand of the Day as shared by the user
router.patch("/api/brands-of-the-day/:id/share", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Update the record to mark as shared
    const [updatedBrand] = await db
      .update(brandsOfTheDay)
      .set({ hasBeenShared: true })
      .where(eq(brandsOfTheDay.id, id))
      .returning();
    
    if (!updatedBrand) {
      return res.status(404).json({ message: "Featured brand not found" });
    }
    
    res.json(updatedBrand);
  } catch (error) {
    console.error("[PATCH /brands-of-the-day/:id/share] Error:", error);
    res.status(500).json({ message: "Failed to update featured brand" });
  }
});

// Calculate Brand Value Score for a user (for Musk AI)
router.post("/api/users/:userId/calculate-brand-value-score", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // This would be a complex calculation in a real implementation
    // For now, we'll implement a simple scoring system
    
    // 1. Check profile completion (25 points max)
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const profileScore = Math.min(user.profileCompleted || 0, 25);
    
    // 2. This is just a sample - in a real implementation, you'd calculate:
    // Career Quests (15 pts), Pulse Activity (15 pts), Portfolio/Projects (10 pts),
    // Engagement (10 pts), Musk Usage (10 pts), Consistency (10 pts), Badges (5 pts)
    
    // For this demo, we'll generate a random score for the remaining categories
    // In a real implementation, this would be calculated based on actual user data
    const remainingCategories = {
      careerQuests: Math.floor(Math.random() * 15),
      pulseActivity: Math.floor(Math.random() * 15),
      portfolioProjects: Math.floor(Math.random() * 10),
      engagement: Math.floor(Math.random() * 10),
      muskUsage: Math.floor(Math.random() * 10),
      consistency: Math.floor(Math.random() * 10),
      badges: Math.floor(Math.random() * 5)
    };
    
    // Calculate total score
    const totalScore = profileScore + 
      remainingCategories.careerQuests +
      remainingCategories.pulseActivity +
      remainingCategories.portfolioProjects +
      remainingCategories.engagement +
      remainingCategories.muskUsage +
      remainingCategories.consistency +
      remainingCategories.badges;
    
    // Prepare score breakdown
    const scoreBreakdown = {
      profileStrength: profileScore,
      ...remainingCategories
    };
    
    res.json({
      userId,
      brandValueScore: totalScore,
      scoreBreakdown
    });
  } catch (error) {
    console.error("[POST /users/:userId/calculate-brand-value-score] Error:", error);
    res.status(500).json({ message: "Failed to calculate brand value score" });
  }
});

export default router;