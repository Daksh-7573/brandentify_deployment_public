/**
 * Special routes handling the "What I Offer" field
 * Created to address persistence issues with this specific field
 */

import { Router, Request, Response } from "express";
import { storage } from "./storage";

export const router = Router();

/**
 * Special endpoint to update the "What I Offer" field
 * PUT /api/users/:id/what-i-offer
 */
router.put("/api/users/:id/what-i-offer", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      console.error(`[PUT /users/:id/what-i-offer] Invalid user ID: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { whatIOffer } = req.body;
    
    if (typeof whatIOffer !== 'string') {
      console.error(`[PUT /users/:id/what-i-offer] Missing or invalid whatIOffer field:`, req.body);
      return res.status(400).json({ error: 'whatIOffer field is required and must be a string' });
    }
    
    console.log(`[PUT /users/:id/what-i-offer] Updating whatIOffer for user ID: ${id}`);
    console.log(`[PUT /users/:id/what-i-offer] New value: "${whatIOffer}"`);
    
    // Direct database update for this critical field
    const updatedUser = await storage.updateUser(id, { whatIOffer });
    
    if (!updatedUser) {
      console.error(`[PUT /users/:id/what-i-offer] User with ID ${id} not found for update`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify the field was correctly updated
    if (updatedUser.whatIOffer !== whatIOffer) {
      console.error(`[PUT /users/:id/what-i-offer] CRITICAL ERROR: whatIOffer field not updated correctly!`);
      console.error(`[PUT /users/:id/what-i-offer] Sent: "${whatIOffer}", Stored: "${updatedUser.whatIOffer}"`);
      
      // Try one more direct update
      const retryUpdate = await storage.updateUser(id, { whatIOffer, _retry: true });
      if (retryUpdate && retryUpdate.whatIOffer === whatIOffer) {
        console.log(`[PUT /users/:id/what-i-offer] Retry successful: "${retryUpdate.whatIOffer}"`);
        return res.json(retryUpdate);
      } else {
        return res.status(500).json({ 
          error: 'Failed to update whatIOffer field correctly',
          sent: whatIOffer,
          stored: updatedUser.whatIOffer
        });
      }
    }
    
    console.log(`[PUT /users/:id/what-i-offer] whatIOffer successfully updated to: "${updatedUser.whatIOffer}"`);
    return res.json(updatedUser);
  } catch (error) {
    console.error(`[PUT /users/:id/what-i-offer] Error updating whatIOffer:`, error);
    return res.status(500).json({ error: 'Error updating whatIOffer', details: error.message });
  }
});

/**
 * Special route for auto-saving the "What I Offer" content
 * POST /api/users/:id/auto-save/what-i-offer
 */
router.post("/api/users/:id/auto-save/what-i-offer", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      console.error(`[POST /users/:id/auto-save/what-i-offer] Invalid user ID: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { whatIOffer } = req.body;
    const timestamp = Date.now();
    
    if (typeof whatIOffer !== 'string') {
      console.error(`[POST /users/:id/auto-save/what-i-offer] Missing or invalid whatIOffer field:`, req.body);
      return res.status(400).json({ error: 'whatIOffer field is required and must be a string' });
    }
    
    console.log(`[POST /users/:id/auto-save/what-i-offer] Auto-saving whatIOffer for user ID: ${id}`);
    console.log(`[POST /users/:id/auto-save/what-i-offer] Value: "${whatIOffer}"`);
    
    // Direct database update for this critical field
    const updatedUser = await storage.updateUser(id, { whatIOffer });
    
    if (!updatedUser) {
      console.error(`[POST /users/:id/auto-save/what-i-offer] User with ID ${id} not found for auto-save`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`[POST /users/:id/auto-save/what-i-offer] whatIOffer auto-save successful: "${updatedUser.whatIOffer}"`);
    return res.json({ 
      success: true, 
      user: updatedUser,
      timestamp,
      autosaved: true,
      field: 'whatIOffer',
      value: updatedUser.whatIOffer
    });
  } catch (error) {
    console.error(`[POST /users/:id/auto-save/what-i-offer] Error during auto-save:`, error);
    return res.status(500).json({ error: 'Error during auto-save', details: error.message });
  }
});

/**
 * Get just the What I Offer field for a user
 * GET /api/users/:id/what-i-offer
 */
router.get("/api/users/:id/what-i-offer", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      console.error(`[GET /users/:id/what-i-offer] Invalid user ID: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(id);
    
    if (!user) {
      console.error(`[GET /users/:id/what-i-offer] User with ID ${id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ 
      userId: id,
      whatIOffer: user.whatIOffer || '',
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error(`[GET /users/:id/what-i-offer] Error getting whatIOffer:`, error);
    return res.status(500).json({ error: 'Error getting whatIOffer', details: error.message });
  }
});

export default router;