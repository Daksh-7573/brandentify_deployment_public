/**
 * Improved Services & "What I Offer" Sync Routes
 * This file provides endpoints that handle both services and the "What I Offer" field
 * to ensure data consistency between edit profile and profile view.
 */

import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { pool } from "./db";
import { eq } from "drizzle-orm";
import { users, InsertService, Service } from "@shared/schema";

export const router = Router();

/**
 * Combined endpoint to get both "What I Offer" and services data
 * GET /api/users/:id/profile-services
 */
router.get("/api/users/:id/profile-services", async (req: Request, res: Response) => {
  const MAX_RETRIES = 3;
  let currentRetry = 0;
  let lastError = null;
  
  while (currentRetry <= MAX_RETRIES) {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        console.error(`[GET /users/:id/profile-services] Invalid user ID: ${req.params.id}`);
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Add explicit cache busting parameter
      const timestamp = Date.now();
      
      // If this is a retry, add a delay
      if (currentRetry > 0) {
        console.log(`[GET /users/:id/profile-services] Retry #${currentRetry} of ${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, 300 * currentRetry));
      }
      
      // Get user data for the whatIOffer field
      let user = null;
      try {
        user = await storage.getUser(id);
      } catch (storageError) {
        console.error(`[GET /users/:id/profile-services] Storage error when fetching user:`, storageError);
        
        // Try direct SQL as fallback
        try {
          console.log(`[GET /users/:id/profile-services] Attempting direct SQL fallback for user...`);
          const results = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
          );
          
          if (results && results.rows && results.rows.length > 0) {
            user = results.rows[0];
            console.log(`[GET /users/:id/profile-services] Direct SQL success for user`);
          }
        } catch (sqlError) {
          console.error(`[GET /users/:id/profile-services] Direct SQL error for user:`, sqlError);
        }
      }
      
      // Get services data
      let services = [];
      try {
        console.log(`[GET /users/:id/profile-services] Fetching services for user ${id}`);
        services = await storage.getServicesByUserId(id);
        console.log(`[GET /users/:id/profile-services] Found ${services.length} services for user ${id}`);
      } catch (servicesError) {
        console.error(`[GET /users/:id/profile-services] Error fetching services:`, servicesError);
        
        // Try direct SQL as fallback for services
        try {
          console.log(`[GET /users/:id/profile-services] Attempting direct SQL fallback for services...`);
          const servicesResult = await pool.query(`
            SELECT 
              id, 
              user_id as "userId", 
              title, 
              description, 
              category, 
              price_inr as "priceInr", 
              price_usd as "priceUsd",
              is_hourly as "isHourly", 
              features, 
              image_url as "imageUrl",
              "order", 
              is_active as "isActive", 
              created_at as "createdAt", 
              updated_at as "updatedAt"
            FROM services
            WHERE user_id = $1
          `, [id]);
          
          if (servicesResult && servicesResult.rows) {
            services = servicesResult.rows;
            console.log(`[GET /users/:id/profile-services] Direct SQL success for services, found ${services.length} services`);
          }
        } catch (sqlServicesError) {
          console.error(`[GET /users/:id/profile-services] Direct SQL error for services:`, sqlServicesError);
        }
      }
      
      // Check if we got user data
      if (!user) {
        // Try the backup table for whatIOffer
        try {
          console.log(`[GET /users/:id/profile-services] User not found, checking backup table...`);
          
          // Check if backup table exists
          const tableCheck = await pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_name = 'user_field_backups'
            );
          `);
          
          const tableExists = tableCheck.rows[0].exists;
          
          if (tableExists) {
            // Try to get the whatIOffer value from backup table
            const backupResult = await pool.query(
              'SELECT field_value FROM user_field_backups WHERE user_id = $1 AND field_name = $2',
              [id, 'whatIOffer']
            );
            
            if (backupResult.rows && backupResult.rows.length > 0) {
              const backupValue = backupResult.rows[0].field_value;
              console.log(`[GET /users/:id/profile-services] Retrieved whatIOffer from backup table: "${backupValue}"`);
              
              // Return combined data with backup whatIOffer and services
              return res.json({
                userId: id,
                whatIOffer: backupValue || '',
                services: services || [],
                success: true,
                timestamp,
                fromBackup: true,
                retries: currentRetry
              });
            }
          }
        } catch (backupError) {
          console.error(`[GET /users/:id/profile-services] Error checking backup table:`, backupError);
        }
        
        // If we've tried multiple times and still no user, return error
        if (currentRetry >= MAX_RETRIES) {
          console.error(`[GET /users/:id/profile-services] User with ID ${id} not found after ${MAX_RETRIES} retries`);
          return res.status(404).json({ error: 'User not found' });
        } else {
          // Try again
          currentRetry++;
          continue;
        }
      }
      
      // Success - return the combined data
      return res.json({ 
        userId: id,
        whatIOffer: user.whatIOffer || '',
        services: services || [],
        success: true,
        timestamp,
        retries: currentRetry
      });
    } catch (error) {
      lastError = error;
      console.error(`[GET /users/:id/profile-services] Error (attempt ${currentRetry+1}/${MAX_RETRIES+1}):`, error);
      
      if (currentRetry >= MAX_RETRIES) {
        break;
      }
      
      currentRetry++;
    }
  }
  
  // If we got here, all retries failed
  console.error(`[GET /users/:id/profile-services] All ${MAX_RETRIES+1} attempts failed`);
  
  // Return the best error response we can
  return res.status(500).json({ 
    error: 'Error getting profile services data after multiple attempts', 
    details: lastError ? (lastError.message || String(lastError)) : 'Unknown error',
    timestamp: Date.now()
  });
});

/**
 * Create a new service with synchronization for "What I Offer"
 * POST /api/profile-services
 */
router.post("/api/profile-services", async (req: Request, res: Response) => {
  try {
    const { userId, ...serviceData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    console.log(`[POST /profile-services] Creating new service for user: ${userId}`);
    
    // Create the service
    const service = await storage.createService(req.body as InsertService);
    
    // Fetch current services to trigger a data refresh
    const services = await storage.getServicesByUserId(userId);
    
    // Get the current whatIOffer field
    const user = await storage.getUser(userId);
    
    console.log(`[POST /profile-services] Service created successfully:`, service);
    console.log(`[POST /profile-services] Total services now: ${services.length}`);
    
    res.status(201).json({
      service,
      services,
      whatIOffer: user?.whatIOffer || '',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[POST /profile-services] Error creating service:`, error);
    res.status(500).json({ message: "Error creating service", error: error.message });
  }
});

/**
 * Update a service with synchronization for "What I Offer"
 * PUT /api/profile-services/:id
 */
router.put("/api/profile-services/:id", async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    console.log(`[PUT /profile-services/:id] Updating service with ID: ${serviceId}`);
    
    // Extract userId from the request body
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Update the service
    const service = await storage.updateService(serviceId, req.body);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    // Fetch current services to trigger a data refresh
    const services = await storage.getServicesByUserId(userId);
    
    // Get the current whatIOffer field
    const user = await storage.getUser(userId);
    
    console.log(`[PUT /profile-services/:id] Service updated successfully`);
    
    res.json({
      service,
      services,
      whatIOffer: user?.whatIOffer || '',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[PUT /profile-services/:id] Error updating service:`, error);
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
});

/**
 * Delete a service with synchronization for "What I Offer"
 * DELETE /api/profile-services/:id
 */
router.delete("/api/profile-services/:id", async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    const userId = parseInt(req.query.userId as string, 10);
    
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "User ID is required as a query parameter" });
    }
    
    console.log(`[DELETE /profile-services/:id] Deleting service with ID: ${serviceId} for user: ${userId}`);
    
    // Delete the service
    const success = await storage.deleteService(serviceId);
    
    if (!success) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    // Fetch current services to trigger a data refresh
    const services = await storage.getServicesByUserId(userId);
    
    // Get the current whatIOffer field
    const user = await storage.getUser(userId);
    
    console.log(`[DELETE /profile-services/:id] Service deleted successfully`);
    
    res.json({
      deleted: true,
      serviceId,
      services,
      whatIOffer: user?.whatIOffer || '',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[DELETE /profile-services/:id] Error deleting service:`, error);
    res.status(500).json({ message: "Error deleting service", error: error.message });
  }
});

/**
 * Sync endpoint to ensure "What I Offer" and services are updated together
 * POST /api/users/:id/sync-profile-services
 */
router.post("/api/users/:id/sync-profile-services", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { whatIOffer } = req.body;
    
    if (typeof whatIOffer !== 'string') {
      return res.status(400).json({ error: 'whatIOffer field is required and must be a string' });
    }
    
    console.log(`[POST /users/:id/sync-profile-services] Syncing whatIOffer for user ${id}: "${whatIOffer}"`);
    
    // Update the whatIOffer field
    const updatedUser = await storage.updateUser(id, { whatIOffer });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get the current services
    const services = await storage.getServicesByUserId(id);
    
    // Create backup in the user_field_backups table
    try {
      // Check if table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_field_backups'
        );
      `);
      
      const tableExists = tableCheck.rows[0].exists;
      
      if (!tableExists) {
        // Create backup table if it doesn't exist
        await pool.query(`
          CREATE TABLE IF NOT EXISTS user_field_backups (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            field_name TEXT NOT NULL,
            field_value TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, field_name)
          )
        `);
      }
      
      // Check if entry exists
      const checkResult = await pool.query(
        'SELECT * FROM user_field_backups WHERE user_id = $1 AND field_name = $2',
        [id, 'whatIOffer']
      );
      
      if (checkResult.rows && checkResult.rows.length > 0) {
        // Update existing record
        await pool.query(
          'UPDATE user_field_backups SET field_value = $1, updated_at = NOW() WHERE user_id = $2 AND field_name = $3',
          [whatIOffer, id, 'whatIOffer']
        );
      } else {
        // Insert new record
        await pool.query(
          'INSERT INTO user_field_backups(user_id, field_name, field_value, created_at, updated_at) VALUES($1, $2, $3, NOW(), NOW())',
          [id, 'whatIOffer', whatIOffer]
        );
      }
      console.log(`[POST /users/:id/sync-profile-services] Backup saved successfully`);
    } catch (backupError) {
      console.error(`[POST /users/:id/sync-profile-services] Error saving to backup table:`, backupError);
      // Continue execution even if backup fails
    }
    
    // Return the combined data
    return res.json({
      userId: id,
      whatIOffer: updatedUser.whatIOffer,
      services,
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[POST /users/:id/sync-profile-services] Error:`, error);
    return res.status(500).json({ 
      error: 'Error updating and syncing profile services', 
      details: error.message || String(error)
    });
  }
});

export default router;