import express, { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { insertServiceSchema } from "@shared/schema";

/**
 * Setup routes for managing user services
 * @param app Express application
 */
export function setupServicesRoutes(app: Express) {
  const router = express.Router();

  // Get all services for a user
  router.get("/users/:userId/services", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      let numericUserId: number;
      
      // Check if userId is a Firebase UID or a numeric ID
      if (userId.length > 20 && /[^0-9]/.test(userId)) {
        console.log(`[GET /users/:userId/services] ID appears to be a Firebase UID: ${userId}`);
        const user = await storage.getUserByUsername(userId);
        
        if (!user) {
          console.log(`[GET /users/:userId/services] No user found with Firebase UID: ${userId}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        numericUserId = user.id;
        console.log(`[GET /users/:userId/services] Found user with ID: ${numericUserId} for Firebase UID: ${userId}`);
      } else {
        numericUserId = parseInt(userId);
        
        if (isNaN(numericUserId)) {
          console.log(`[GET /users/:userId/services] ID is not a valid numeric ID: ${userId}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
      }
      
      let services = await storage.getServicesByUserId(numericUserId);
      
      // Filter out services with "other" category if requested
      const removeOther = req.query.removeOther === 'true';
      if (removeOther) {
        services = services.filter(service => service.category !== 'other');
        console.log(`[GET /users/:userId/services] Filtered out "other" category, returning ${services.length} services`);
      } else {
        console.log(`[GET /users/:userId/services] Found ${services.length} services for userId: ${numericUserId}`);
      }
      
      return res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new service
  router.post("/services", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /services] Creating new service:`, req.body);
      
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      
      console.log(`[POST /services] Created service with ID: ${service.id}`);
      return res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      
      console.error("Error creating service:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update a service
  router.put("/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID format" });
      }
      
      console.log(`[PUT /services/:id] Updating service with ID: ${id}`, req.body);
      
      // Get existing service to check if it exists
      const existingService = await storage.getServiceById(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const updatedService = await storage.updateService(id, req.body);
      console.log(`[PUT /services/:id] Updated service with ID: ${id}`);
      
      return res.json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Toggle service active state
  router.patch("/services/:id/toggle-active", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID format" });
      }
      
      console.log(`[PATCH /services/:id/toggle-active] Toggling active state for service with ID: ${id}`);
      
      // Get existing service to check if it exists and get current active state
      const existingService = await storage.getServiceById(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Toggle the active state
      const isActive = existingService.isActive === false;
      
      const updatedService = await storage.updateService(id, { isActive });
      console.log(`[PATCH /services/:id/toggle-active] Updated service with ID: ${id}, new active state: ${isActive}`);
      
      return res.json(updatedService);
    } catch (error) {
      console.error("Error toggling service active state:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a service
  router.delete("/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID format" });
      }
      
      console.log(`[DELETE /services/:id] Deleting service with ID: ${id}`);
      
      // Get existing service to check if it exists
      const existingService = await storage.getServiceById(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      await storage.deleteService(id);
      console.log(`[DELETE /services/:id] Deleted service with ID: ${id}`);
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Apply routes
  app.use("/api", router);
  console.log("Services routes loaded");
}