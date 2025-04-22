/**
 * Improved Services & "What I Offer" Sync Routes
 * This file provides endpoints that handle both services and the "What I Offer" field
 * to ensure data consistency between edit profile and profile view.
 */

import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import { users, services, Service, insertServiceSchema } from "@shared/schema";

export const router = Router();

/**
 * Combined endpoint to get both "What I Offer" and services data
 * GET /api/users/:id/profile-services
 */
router.get("/api/users/:id/profile-services", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    console.log(`[GET /api/users/:id/profile-services] Getting combined data for user ${userId}`);

    // First attempt - use storage methods (Drizzle ORM)
    try {
      // Get user with whatIOffer field
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get services
      const userServices = await storage.getServicesByUserId(userId);

      console.log(`[GET /api/users/:id/profile-services] Retrieved data - WhatIOffer: "${user.whatIOffer?.substring(0, 30)}...", Services count: ${userServices.length}`);
      
      return res.json({
        whatIOffer: user.whatIOffer || '',
        services: userServices,
        success: true,
        timestamp: Date.now()
      });
    } catch (primaryError) {
      console.error(`[GET /api/users/:id/profile-services] Primary fetch method failed:`, primaryError);
      
      // Fallback - direct PostgreSQL queries
      try {
        console.log(`[GET /api/users/:id/profile-services] Trying direct SQL fallback for user ${userId}`);
        
        // Get user data
        const userResult = await pool.query(
          'SELECT what_i_offer FROM users WHERE id = $1',
          [userId]
        );
        
        // Get services data
        const servicesResult = await pool.query(
          'SELECT * FROM services WHERE user_id = $1 ORDER BY created_at DESC',
          [userId]
        );
        
        if (userResult.rows.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Transform service rows to match our expected format
        const transformedServices = servicesResult.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          description: row.description || null,
          category: row.category || null,
          price: row.price || null,
          currency: row.currency || 'USD',
          duration: row.duration || null,
          durationType: row.duration_type || null,
          isActive: row.is_active || false,
          createdAt: row.created_at || null,
          updatedAt: row.updated_at || null
        }));
        
        console.log(`[GET /api/users/:id/profile-services] SQL fallback retrieved whatIOffer: "${userResult.rows[0].what_i_offer?.substring(0, 30)}...", Services count: ${transformedServices.length}`);
        
        return res.json({
          whatIOffer: userResult.rows[0].what_i_offer || '',
          services: transformedServices,
          success: true,
          timestamp: Date.now()
        });
      } catch (fallbackError) {
        console.error(`[GET /api/users/:id/profile-services] Fallback method also failed:`, fallbackError);
        throw fallbackError; // Rethrow to be caught by outer catch block
      }
    }
  } catch (error) {
    console.error(`[GET /api/users/:id/profile-services] Error getting profile services:`, error);
    return res.status(500).json({ 
      message: "Error retrieving profile services data",
      success: false,
      error: error.message 
    });
  }
});

/**
 * Create a new service with synchronization for "What I Offer"
 * POST /api/profile-services
 */
router.post("/api/profile-services", async (req: Request, res: Response) => {
  try {
    const serviceData = insertServiceSchema.parse(req.body);
    const userId = serviceData.userId;
    
    console.log(`[POST /api/profile-services] Creating new service for user ${userId}`);
    
    // Create the service
    const newService = await storage.createService(serviceData);
    
    // Get all services for the user to ensure consistency
    const allServices = await storage.getServicesByUserId(userId);
    
    // Get the user's whatIOffer field to include in response
    const user = await storage.getUser(userId);
    
    console.log(`[POST /api/profile-services] Created service with ID ${newService.id}`);
    
    return res.status(201).json({
      service: newService,
      services: allServices,
      whatIOffer: user?.whatIOffer || "",
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[POST /api/profile-services] Error creating service:`, error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: "Invalid service data",
        errors: error.errors,
        success: false
      });
    }
    
    return res.status(500).json({
      message: "Error creating service",
      error: error.message,
      success: false
    });
  }
});

/**
 * Update a service with synchronization for "What I Offer"
 * PUT /api/profile-services/:id
 */
router.put("/api/profile-services/:id", async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    console.log(`[PUT /api/profile-services/:id] Updating service ${serviceId}`);
    
    // Get the existing service to check ownership
    const existingService = await storage.getServiceById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    const userId = existingService.userId;
    
    // Update the service
    const updatedService = await storage.updateService(serviceId, req.body);
    
    // Get all services for the user to ensure consistency
    const allServices = await storage.getServicesByUserId(userId);
    
    // Get the user's whatIOffer field to include in response
    const user = await storage.getUser(userId);
    
    console.log(`[PUT /api/profile-services/:id] Updated service ${serviceId}`);
    
    return res.json({
      service: updatedService,
      services: allServices,
      whatIOffer: user?.whatIOffer || "",
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[PUT /api/profile-services/:id] Error updating service:`, error);
    
    return res.status(500).json({
      message: "Error updating service",
      error: error.message,
      success: false
    });
  }
});

/**
 * Delete a service with synchronization for "What I Offer"
 * DELETE /api/profile-services/:id
 */
router.delete("/api/profile-services/:id", async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    // Get userId from query parameter (since we can't get it after deletion)
    const userIdParam = req.query.userId;
    if (!userIdParam) {
      return res.status(400).json({ message: "User ID is required in query parameters" });
    }
    
    const userId = parseInt(userIdParam as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID in query parameters" });
    }
    
    console.log(`[DELETE /api/profile-services/:id] Deleting service ${serviceId} for user ${userId}`);
    
    // Get the existing service to check ownership
    const existingService = await storage.getServiceById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    // Check if user owns the service
    if (existingService.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this service" });
    }
    
    // Delete the service
    await storage.deleteService(serviceId);
    
    // Get all services for the user to ensure consistency
    const allServices = await storage.getServicesByUserId(userId);
    
    // Get the user's whatIOffer field to include in response
    const user = await storage.getUser(userId);
    
    console.log(`[DELETE /api/profile-services/:id] Deleted service ${serviceId}`);
    
    return res.json({
      services: allServices,
      whatIOffer: user?.whatIOffer || "",
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[DELETE /api/profile-services/:id] Error deleting service:`, error);
    
    return res.status(500).json({
      message: "Error deleting service",
      error: error.message,
      success: false
    });
  }
});

/**
 * Sync endpoint to ensure "What I Offer" and services are updated together
 * POST /api/users/:id/sync-profile-services
 */
router.post("/api/users/:id/sync-profile-services", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Get whatIOffer from request body
    const { whatIOffer } = req.body;
    if (whatIOffer === undefined) {
      return res.status(400).json({ message: "whatIOffer field is required" });
    }
    
    console.log(`[POST /api/users/:id/sync-profile-services] Syncing whatIOffer for user ${userId}: "${whatIOffer.substring(0, 30)}..."`);
    
    // Update the user's whatIOffer field
    const user = await storage.updateUser(userId, { whatIOffer });
    
    // Get all services for the user
    const userServices = await storage.getServicesByUserId(userId);
    
    console.log(`[POST /api/users/:id/sync-profile-services] Synced whatIOffer and retrieved ${userServices.length} services`);
    
    return res.json({
      whatIOffer: user.whatIOffer || "",
      services: userServices,
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[POST /api/users/:id/sync-profile-services] Error syncing profile services:`, error);
    
    return res.status(500).json({
      message: "Error syncing profile services",
      error: error.message,
      success: false
    });
  }
});

// Export the router
export default router;