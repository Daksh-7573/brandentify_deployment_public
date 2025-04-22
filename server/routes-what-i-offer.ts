/**
 * Special routes handling the "What I Offer" field
 * Created to address persistence issues with this specific field
 * Enhanced with additional robustness mechanisms
 */

import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { pool } from "./db"; // Import pool for direct DB queries when needed
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

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
    
    const { whatIOffer, _recovery } = req.body;
    const isRecoveryRequest = _recovery === true;
    
    if (typeof whatIOffer !== 'string') {
      console.error(`[PUT /users/:id/what-i-offer] Missing or invalid whatIOffer field:`, req.body);
      return res.status(400).json({ error: 'whatIOffer field is required and must be a string' });
    }
    
    const prefix = isRecoveryRequest ? '[RECOVERY]' : '';
    console.log(`[PUT /users/:id/what-i-offer] ${prefix} Updating whatIOffer for user ID: ${id}`);
    console.log(`[PUT /users/:id/what-i-offer] ${prefix} New value: "${whatIOffer}"`);
    
    // First verify if the current value already matches what we're trying to set
    const currentUser = await storage.getUser(id);
    if (currentUser && currentUser.whatIOffer === whatIOffer) {
      console.log(`[PUT /users/:id/what-i-offer] ${prefix} Value already up-to-date, no update needed`);
      return res.json({ 
        userId: id,
        whatIOffer: currentUser.whatIOffer,
        success: true,
        timestamp: Date.now(),
        unchanged: true
      });
    }
    
    // Direct database update for this critical field
    const updatedUser = await storage.updateUser(id, { whatIOffer });
    
    if (!updatedUser) {
      console.error(`[PUT /users/:id/what-i-offer] ${prefix} User with ID ${id} not found for update`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify the field was correctly updated - if not, attempt multiple retries
    const MAX_RETRIES = 3;
    let currentRetry = 0;
    
    if (updatedUser.whatIOffer !== whatIOffer) {
      console.error(`[PUT /users/:id/what-i-offer] ${prefix} CRITICAL ERROR: whatIOffer field not updated correctly!`);
      console.error(`[PUT /users/:id/what-i-offer] ${prefix} Sent: "${whatIOffer}", Stored: "${updatedUser.whatIOffer}"`);
      
      // Try up to MAX_RETRIES times
      while (currentRetry < MAX_RETRIES) {
        currentRetry++;
        console.log(`[PUT /users/:id/what-i-offer] ${prefix} Retry #${currentRetry} of ${MAX_RETRIES}...`);
        
        // Add a short delay between retries
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Try again with a direct update
        const retryUpdate = await storage.updateUser(id, { 
          whatIOffer
          // Don't include _retry parameter, it's causing type errors
        });
        
        if (retryUpdate && retryUpdate.whatIOffer === whatIOffer) {
          console.log(`[PUT /users/:id/what-i-offer] ${prefix} Retry #${currentRetry} successful: "${retryUpdate.whatIOffer}"`);
          return res.json({
            userId: id,
            whatIOffer: retryUpdate.whatIOffer,
            success: true,
            timestamp: Date.now(),
            retriesNeeded: currentRetry
          });
        }
      }
      
      // If we get here, all retries failed
      console.error(`[PUT /users/:id/what-i-offer] ${prefix} All ${MAX_RETRIES} retries failed!`);
      
      // As a last resort, try other approaches - try multiple methods to update
      try {
        console.log(`[PUT /users/:id/what-i-offer] ${prefix} Final attempt: Using raw SQL update...`);
        const rawResult = await pool.query(
          'UPDATE users SET what_i_offer = $1 WHERE id = $2 RETURNING *',
          [whatIOffer, id]
        );
        
        if (rawResult && rawResult.rows && rawResult.rows.length > 0) {
          console.log(`[PUT /users/:id/what-i-offer] ${prefix} Raw SQL update successful!`);
          
          // Store value in a backup table to ensure persistence
          try {
            // Check if we have the entry already
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
            console.log(`[PUT /users/:id/what-i-offer] ${prefix} Backup storage successful`);
          } catch (backupError) {
            // Just log backup error, don't fail the main operation
            console.error(`[PUT /users/:id/what-i-offer] ${prefix} Backup storage error:`, backupError);
          }
          
          return res.json({
            userId: id,
            whatIOffer: whatIOffer,
            success: true,
            timestamp: Date.now(),
            rawSqlUsed: true
          });
        } else {
          // If direct update fails, try creating the backup table first then retry
          try {
            console.log(`[PUT /users/:id/what-i-offer] ${prefix} Creating backup table if not exists...`);
            
            // Create backup table if doesn't exist
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
            
            // Try raw update once more
            const retryResult = await pool.query(
              'UPDATE users SET what_i_offer = $1 WHERE id = $2 RETURNING *',
              [whatIOffer, id]
            );
            
            if (retryResult.rows && retryResult.rows.length > 0) {
              console.log(`[PUT /users/:id/what-i-offer] ${prefix} Second raw SQL attempt successful!`);
              return res.json({
                userId: id,
                whatIOffer: whatIOffer,
                success: true,
                timestamp: Date.now(),
                rawSqlUsed: true,
                secondAttempt: true
              });
            }
          } catch (tableError) {
            console.error(`[PUT /users/:id/what-i-offer] ${prefix} Error creating backup table:`, tableError);
          }
          
          // If even that fails, give up and return the error
          return res.status(500).json({ 
            error: 'Failed to update whatIOffer field correctly after all attempts',
            sent: whatIOffer,
            stored: updatedUser.whatIOffer
          });
        }
      } catch (sqlError) {
        console.error(`[PUT /users/:id/what-i-offer] ${prefix} Raw SQL update failed:`, sqlError);
        return res.status(500).json({ 
          error: 'Failed to update whatIOffer field correctly after all attempts',
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
  const MAX_RETRIES = 3;
  let currentRetry = 0;
  let lastError = null;
  
  while (currentRetry <= MAX_RETRIES) {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        console.error(`[GET /users/:id/what-i-offer] Invalid user ID: ${req.params.id}`);
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // If this is a retry, add a delay
      if (currentRetry > 0) {
        console.log(`[GET /users/:id/what-i-offer] Retry #${currentRetry} of ${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, 300 * currentRetry));
      }
      
      // First try regular storage method
      let user = null;
      try {
        user = await storage.getUser(id);
      } catch (storageError) {
        console.error(`[GET /users/:id/what-i-offer] Storage error:`, storageError);
        
        // On storage error, try direct SQL as fallback
        try {
          console.log(`[GET /users/:id/what-i-offer] Attempting direct SQL fallback...`);
          const results = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
          );
          
          if (results && results.rows && results.rows.length > 0) {
            user = results.rows[0];
            console.log(`[GET /users/:id/what-i-offer] Direct SQL success`);
          } else {
            console.error(`[GET /users/:id/what-i-offer] Direct SQL returned no results`);
          }
        } catch (sqlError) {
          console.error(`[GET /users/:id/what-i-offer] Direct SQL error:`, sqlError);
          // Continue to next attempt
        }
      }
      
      if (!user) {
        // Before giving up, try the backup table
        try {
          console.log(`[GET /users/:id/what-i-offer] User not found through regular means, checking backup table...`);
          
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
              console.log(`[GET /users/:id/what-i-offer] Retrieved value from backup table: "${backupValue}"`);
              
              return res.json({
                userId: id,
                whatIOffer: backupValue || '',
                success: true,
                timestamp: Date.now(),
                fromBackup: true
              });
            } else {
              console.log(`[GET /users/:id/what-i-offer] No backup value found in backup table`);
            }
          } else {
            console.log(`[GET /users/:id/what-i-offer] Backup table doesn't exist yet`);
          }
        } catch (backupError) {
          console.error(`[GET /users/:id/what-i-offer] Error checking backup table:`, backupError);
        }
        
        // If we've tried multiple times and still no user, return error
        if (currentRetry >= MAX_RETRIES) {
          console.error(`[GET /users/:id/what-i-offer] User with ID ${id} not found after ${MAX_RETRIES} retries`);
          return res.status(404).json({ error: 'User not found' });
        } else {
          // Try again
          currentRetry++;
          continue;
        }
      }
      
      // Success - return the data
      return res.json({ 
        userId: id,
        whatIOffer: user.whatIOffer || '',
        success: true,
        timestamp: Date.now(),
        retries: currentRetry
      });
    } catch (error) {
      lastError = error;
      console.error(`[GET /users/:id/what-i-offer] Error (attempt ${currentRetry+1}/${MAX_RETRIES+1}):`, error);
      
      if (currentRetry >= MAX_RETRIES) {
        break;
      }
      
      currentRetry++;
    }
  }
  
  // If we got here, all retries failed
  console.error(`[GET /users/:id/what-i-offer] All ${MAX_RETRIES+1} attempts failed`);
  
  // Return the best error response we can
  return res.status(500).json({ 
    error: 'Error getting whatIOffer after multiple attempts', 
    details: lastError ? (lastError.message || String(lastError)) : 'Unknown error',
    timestamp: Date.now()
  });
});

export default router;