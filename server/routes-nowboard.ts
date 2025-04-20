import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { IStorage } from './storage';
import { insertNowboardItemSchema, nowboardCategoryEnum, insertNowboardInspiredBySchema } from '@shared/schema';

// Setup Nowboard routes
export function setupNowboardRoutes(router: Router, storage: IStorage) {
  // Get all Nowboard items
  router.get('/nowboard-items', async (req: Request, res: Response) => {
    try {
      const items = await storage.getNowboardItems();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      console.log('[GET /nowboard-items]', 'Retrieved total items count:', items.length);
      console.log('[GET /nowboard-items]', 'Items:', JSON.stringify(items.slice(0, 3))); // Log first 3 items
      
      // If limit is specified and valid, return only that many items
      const resultItems = limit && !isNaN(limit) && limit > 0 
        ? items.slice(0, limit) 
        : items;
      
      console.log('[GET /nowboard-items]', 'Returning items count:', resultItems.length);
      res.json(resultItems);
    } catch (error) {
      console.error('[GET /nowboard-items]', error);
      res.status(500).json({ message: 'Error fetching Nowboard items' });
    }
  });

  // Get Nowboard items for a specific user
  router.get('/users/:userId/nowboard-items', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const items = await storage.getNowboardItemsByUserId(userId);
      res.json(items);
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/nowboard-items]`, error);
      res.status(500).json({ message: 'Error fetching Nowboard items for user' });
    }
  });

  // Get a specific Nowboard item by ID
  router.get('/nowboard-items/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid Nowboard item ID' });
      }
      
      const item = await storage.getNowboardItemById(id);
      if (!item) {
        return res.status(404).json({ message: 'Nowboard item not found' });
      }
      
      res.json(item);
    } catch (error) {
      console.error(`[GET /nowboard-items/${req.params.id}]`, error);
      res.status(500).json({ message: 'Error fetching Nowboard item' });
    }
  });

  // Get Nowboard items by category
  router.get('/nowboard-items/category/:category', async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      
      // Validate that the category is one of the allowed values
      if (!nowboardCategoryEnum.enumValues.includes(category as any)) {
        return res.status(400).json({ 
          message: 'Invalid category', 
          allowedCategories: nowboardCategoryEnum.enumValues 
        });
      }
      
      const items = await storage.getNowboardItemsByCategory(category as any);
      res.json(items);
    } catch (error) {
      console.error(`[GET /nowboard-items/category/${req.params.category}]`, error);
      res.status(500).json({ message: 'Error fetching Nowboard items by category' });
    }
  });

  // Create a new Nowboard item
  router.post('/nowboard-items', async (req: Request, res: Response) => {
    try {
      // Validate request body against the Zod schema
      const validatedData = insertNowboardItemSchema.parse(req.body);
      
      const newItem = await storage.createNowboardItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[POST /nowboard-items] Validation error', error.errors);
        return res.status(400).json({ 
          message: 'Invalid Nowboard item data', 
          errors: error.errors 
        });
      }
      
      console.error('[POST /nowboard-items]', error);
      res.status(500).json({ message: 'Error creating Nowboard item' });
    }
  });

  // Update a Nowboard item
  router.put('/nowboard-items/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid Nowboard item ID' });
      }
      
      // Get the existing item first to check if it exists
      const existingItem = await storage.getNowboardItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Nowboard item not found' });
      }
      
      // Validate the request body
      const validatedData = insertNowboardItemSchema.partial().parse(req.body);
      
      const updatedItem = await storage.updateNowboardItem(id, validatedData);
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[PUT /nowboard-items/${req.params.id}] Validation error`, error.errors);
        return res.status(400).json({ 
          message: 'Invalid Nowboard item data', 
          errors: error.errors 
        });
      }
      
      console.error(`[PUT /nowboard-items/${req.params.id}]`, error);
      res.status(500).json({ message: 'Error updating Nowboard item' });
    }
  });

  // Delete a Nowboard item
  router.delete('/nowboard-items/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid Nowboard item ID' });
      }
      
      // Check if the item exists first
      const existingItem = await storage.getNowboardItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Nowboard item not found' });
      }
      
      const success = await storage.deleteNowboardItem(id);
      if (success) {
        res.json({ message: 'Nowboard item deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete Nowboard item' });
      }
    } catch (error) {
      console.error(`[DELETE /nowboard-items/${req.params.id}]`, error);
      res.status(500).json({ message: 'Error deleting Nowboard item' });
    }
  });

  // Get inspired-by records for a Nowboard item
  router.get('/nowboard-items/:id/inspired-by', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid Nowboard item ID' });
      }
      
      const inspiredByList = await storage.getInspiredByForNowboardItem(itemId);
      res.json(inspiredByList);
    } catch (error) {
      console.error(`[GET /nowboard-items/${req.params.id}/inspired-by]`, error);
      res.status(500).json({ message: 'Error fetching inspired-by records' });
    }
  });

  // Mark a Nowboard item as inspired
  router.post('/nowboard-items/:id/inspired-by', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid Nowboard item ID' });
      }
      
      // Validate request body to ensure it has a userId
      const validatedData = z.object({
        userId: z.number()
      }).parse(req.body);
      
      // Check if the user has already marked this item
      const alreadyInspired = await storage.isNowboardItemInspiredByUser(validatedData.userId, itemId);
      
      if (alreadyInspired) {
        // Instead of just returning an error, return the existing inspired record
        // This allows the client to handle conflicts gracefully
        const existingInspired = await storage.getInspiredByForUserAndItem(validatedData.userId, itemId);
        return res.status(200).json({ 
          message: 'Already inspired',
          isConflict: true,
          data: existingInspired,
          success: true
        });
      }
      
      const inspired = await storage.markInspiredByNowboardItem(validatedData.userId, itemId);
      res.status(201).json(inspired);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /nowboard-items/${req.params.id}/inspired-by] Validation error`, error.errors);
        return res.status(400).json({ 
          message: 'Invalid data', 
          errors: error.errors 
        });
      }
      
      console.error(`[POST /nowboard-items/${req.params.id}/inspired-by]`, error);
      res.status(500).json({ message: 'Error marking item as inspired' });
    }
  });

  // Remove inspired-by mark from a Nowboard item
  router.delete('/nowboard-items/:id/inspired-by/:userId', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(itemId) || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid IDs provided' });
      }
      
      // Check if the user has marked this item
      const isInspired = await storage.isNowboardItemInspiredByUser(userId, itemId);
      
      if (!isInspired) {
        return res.status(404).json({ message: 'User has not marked this item as inspired' });
      }
      
      const success = await storage.unmarkInspiredByNowboardItem(userId, itemId);
      
      if (success) {
        res.json({ message: 'Inspired-by mark removed successfully' });
      } else {
        res.status(500).json({ message: 'Failed to remove inspired-by mark' });
      }
    } catch (error) {
      console.error(`[DELETE /nowboard-items/${req.params.id}/inspired-by/${req.params.userId}]`, error);
      res.status(500).json({ message: 'Error removing inspired-by mark' });
    }
  });

  // Check if a user has marked a Nowboard item as inspired
  router.get('/nowboard-items/:id/inspired-by/:userId', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(itemId) || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid IDs provided' });
      }
      
      const isInspired = await storage.isNowboardItemInspiredByUser(userId, itemId);
      res.json({ isInspired });
    } catch (error) {
      console.error(`[GET /nowboard-items/${req.params.id}/inspired-by/${req.params.userId}]`, error);
      res.status(500).json({ message: 'Error checking inspired status' });
    }
  });
  
  // Get total inspired count for a user
  router.get('/users/:userId/inspired-count', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const count = await storage.getUserInspiredCount(userId);
      
      res.json({ count });
    } catch (error) {
      console.error(`[GET /users/${req.params.userId}/inspired-count]`, error);
      res.status(500).json({ message: 'Error getting user inspired count' });
    }
  });

  console.log('Nowboard routes loaded');
  return router;
}