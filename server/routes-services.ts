import express from 'express';
import { db } from './db';
import { services, insertServiceSchema } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export function setupServicesRoutes(app: express.Express) {
  console.log("Services routes loaded");
  
  // Get all services for a user
  app.get('/api/users/:userId/services', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        // Try to find user by Firebase UID if not a numeric ID
        const firebaseUid = req.params.userId;
        
        // Get the numeric userId from the username field which stores Firebase UID
        const [user] = await db.query.users.findMany({
          where: eq(users.username, firebaseUid),
          limit: 1
        });
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        const userServices = await db.query.services.findMany({
          where: eq(services.userId, user.id)
        });
        
        return res.json(userServices);
      }
      
      const userServices = await db.query.services.findMany({
        where: eq(services.userId, userId)
      });
      
      res.json(userServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching services" });
    }
  });
  
  // Get a specific service by ID
  app.get('/api/services/:id', async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const [service] = await db.query.services.findMany({
        where: eq(services.id, serviceId),
        limit: 1
      });
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Error fetching service" });
    }
  });
  
  // Create a new service
  app.post('/api/services', async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      
      const [createdService] = await db.insert(services).values(validatedData).returning();
      
      res.status(201).json(createdService);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: "Error creating service", error });
    }
  });
  
  // Update a service
  app.patch('/api/services/:id', async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Validate the update data
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        category: z.enum(["consulting", "development", "design", "marketing", "writing", "coaching", "teaching", "other"]).optional(),
        priceInr: z.union([z.number().nullable(), z.string().transform(val => val ? parseFloat(val) : null).nullable()]).optional(),
        priceUsd: z.union([z.number().nullable(), z.string().transform(val => val ? parseFloat(val) : null).nullable()]).optional(),
        isHourly: z.boolean().optional(),
        features: z.array(z.any()).optional(),
        imageUrl: z.string().optional().nullable(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const [updatedService] = await db
        .update(services)
        .set(validatedData)
        .where(eq(services.id, serviceId))
        .returning();
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(400).json({ message: "Error updating service", error });
    }
  });
  
  // Toggle service active status
  app.patch('/api/services/:id/toggle-active', async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Get the current service
      const [service] = await db.query.services.findMany({
        where: eq(services.id, serviceId),
        limit: 1
      });
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Toggle the isActive status
      const [updatedService] = await db
        .update(services)
        .set({ isActive: !service.isActive })
        .where(eq(services.id, serviceId))
        .returning();
      
      res.json(updatedService);
    } catch (error) {
      console.error("Error toggling service status:", error);
      res.status(500).json({ message: "Error toggling service status" });
    }
  });
  
  // Delete a service
  app.delete('/api/services/:id', async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      await db.delete(services).where(eq(services.id, serviceId));
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Error deleting service" });
    }
  });
}