import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { IStorage } from './storage';
import { insertNowboardItemSchema, nowboardCategoryEnum, insertNowboardInspiredBySchema } from '@shared/schema';
import { pool } from './db';

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
    console.log('[POST /nowboard-items] Route handler called');
    console.log('[POST /nowboard-items] Request body:', req.body);
    console.log('[POST /nowboard-items] Content-Type:', req.headers['content-type']);
    
    try {
      // Simple validation first
      if (!req.body || typeof req.body !== 'object') {
        console.error('[POST /nowboard-items] Invalid request body format');
        return res.status(400).json({ message: 'Invalid request body' });
      }

      const { userId, content, category, visibility } = req.body;
      
      if (!userId || !content || !category) {
        console.error('[POST /nowboard-items] Missing required fields:', { userId, content, category });
        return res.status(400).json({ message: 'Missing required fields: userId, content, category' });
      }

      // Create the item with basic validation
      const itemData = {
        userId: parseInt(userId),
        content: content.toString(),
        category: category.toString(),
        visibility: visibility || 'public'
      };

      console.log('[POST /nowboard-items] Creating item with data:', itemData);
      
      // Direct database call to bypass any binding issues
      const result = await pool.query(`
        INSERT INTO nowboard_items (
          user_id, content, category, visibility, 
          related_skills, related_project, image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id,
          user_id as "userId",
          content,
          category,
          visibility,
          inspired_count as "inspiredCount",
          related_skills as "relatedSkills",
          related_project as "relatedProject",
          image_url as "imageUrl",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `, [
        itemData.userId,
        itemData.content,
        itemData.category,
        itemData.visibility,
        null, // relatedSkills
        null, // relatedProject
        null  // imageUrl
      ]);
      
      const newItem = result.rows[0];
      console.log('[POST /nowboard-items] Item created successfully:', newItem);
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error('[POST /nowboard-items] Error:', error);
      res.status(500).json({ message: 'Error creating Nowboard item', error: error.message });
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
      
      // Check if the user has already marked this item (direct database query)
      const existingCheck = await pool.query(
        'SELECT id FROM nowboard_inspired_by WHERE user_id = $1 AND nowboard_item_id = $2',
        [validatedData.userId, itemId]
      );
      
      if (existingCheck.rows.length > 0) {
        return res.status(200).json({ 
          message: 'Already inspired',
          isConflict: true,
          success: true
        });
      }
      
      // Insert the inspired record
      const inspired = await pool.query(
        'INSERT INTO nowboard_inspired_by (user_id, nowboard_item_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        [validatedData.userId, itemId]
      );
      
      // Update the inspired count on the nowboard item
      await pool.query(
        'UPDATE nowboard_items SET inspired_count = inspired_count + 1 WHERE id = $1',
        [itemId]
      );
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

  // Check if user has inspired a specific item
  router.get('/nowboard-items/:id/inspired-by/:userId', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(itemId) || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid item or user ID' });
      }
      
      const result = await pool.query(
        'SELECT id FROM nowboard_inspired_by WHERE user_id = $1 AND nowboard_item_id = $2',
        [userId, itemId]
      );
      
      res.json({ isInspired: result.rows.length > 0 });
    } catch (error) {
      console.error(`[GET /nowboard-items/${req.params.id}/inspired-by/${req.params.userId}]`, error);
      res.status(500).json({ message: 'Error checking inspired status' });
    }
  });

  // Remove inspired-by mark from a Nowboard item
  router.delete('/nowboard-items/:id/inspired-by', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid Nowboard item ID' });
      }
      
      // Validate request body to ensure it has a userId
      const validatedData = z.object({
        userId: z.number()
      }).parse(req.body);
      
      // Check if the user has marked this item (direct database query)
      const existingCheck = await pool.query(
        'SELECT id FROM nowboard_inspired_by WHERE user_id = $1 AND nowboard_item_id = $2',
        [validatedData.userId, itemId]
      );
      
      if (existingCheck.rows.length === 0) {
        return res.status(404).json({ message: 'User has not marked this item as inspired' });
      }
      
      // Remove the inspired record
      await pool.query(
        'DELETE FROM nowboard_inspired_by WHERE user_id = $1 AND nowboard_item_id = $2',
        [validatedData.userId, itemId]
      );
      
      // Update the inspired count on the nowboard item
      await pool.query(
        'UPDATE nowboard_items SET inspired_count = GREATEST(inspired_count - 1, 0) WHERE id = $1',
        [itemId]
      );
      
      res.json({ message: 'Inspired-by mark removed successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[DELETE /nowboard-items/${req.params.id}/inspired-by] Validation error`, error.errors);
        return res.status(400).json({ 
          message: 'Invalid data', 
          errors: error.errors 
        });
      }
      
      console.error(`[DELETE /nowboard-items/${req.params.id}/inspired-by]`, error);
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
  
  // Get the inspired-by record for a specific user and item
  router.get('/nowboard-items/:id/inspired-by/user/:userId', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(itemId) || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid IDs provided' });
      }
      
      const inspiredRecord = await storage.getInspiredByForUserAndItem(userId, itemId);
      
      if (!inspiredRecord) {
        return res.status(404).json({ message: 'Inspired record not found' });
      }
      
      res.json(inspiredRecord);
    } catch (error) {
      console.error(`[GET /nowboard-items/${req.params.id}/inspired-by/user/${req.params.userId}]`, error);
      res.status(500).json({ message: 'Error fetching inspired record' });
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

  // Flag a Nowboard item as inappropriate
  router.post('/nowboard-items/:id/flag', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid Nowboard item ID' });
      }

      // Check if the item exists
      const existingItem = await storage.getNowboardItemById(itemId);
      if (!existingItem) {
        return res.status(404).json({ message: 'Nowboard item not found' });
      }

      // For now, we'll just log the flag action
      // In a real application, you might want to store flags in a separate table
      console.log(`[FLAG] Nowboard item ${itemId} has been flagged for review`);
      
      res.json({ message: 'Nowboard item flagged successfully for review' });
    } catch (error) {
      console.error(`[POST /nowboard-items/${req.params.id}/flag]`, error);
      res.status(500).json({ message: 'Error flagging Nowboard item' });
    }
  });

  console.log('Nowboard routes loaded');
  return router;
}