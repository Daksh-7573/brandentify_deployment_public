import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { MuskSuggestionService } from './services/musk-suggestion-service';
import { insertMuskBehaviorTrackingSchema } from '@shared/schema-musk-suggestions';

// Create a router instance
const router = Router();

// Create the Musk suggestion service
const muskSuggestionService = new MuskSuggestionService(storage);

/**
 * Get Musk suggestions for the current user
 */
router.get('/api/musk/suggestions', async (req: Request, res: Response) => {
  try {
    // Extract user ID from query parameter (for demo purposes)
    // In a real app, this would come from authentication/session
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
    
    // Get suggestions
    const suggestions = await muskSuggestionService.getSuggestionsForUser(userId);
    
    // Return suggestions
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting Musk suggestions:', error);
    res.status(500).json({ error: 'Failed to get Musk suggestions' });
  }
});

/**
 * Dismiss a Musk suggestion
 */
router.post('/api/musk/suggestions/:id/dismiss', async (req: Request, res: Response) => {
  try {
    // Extract suggestion ID
    const suggestionId = parseInt(req.params.id);
    
    // Dismiss suggestion
    await muskSuggestionService.dismissSuggestion(suggestionId);
    
    // Return success
    res.json({ success: true });
  } catch (error) {
    console.error('Error dismissing Musk suggestion:', error);
    res.status(500).json({ error: 'Failed to dismiss Musk suggestion' });
  }
});

/**
 * Mark a Musk suggestion as having action taken
 */
router.post('/api/musk/suggestions/:id/action-taken', async (req: Request, res: Response) => {
  try {
    // Extract suggestion ID
    const suggestionId = parseInt(req.params.id);
    
    // Mark action taken
    await muskSuggestionService.markSuggestionActionTaken(suggestionId);
    
    // Return success
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking Musk suggestion as actioned:', error);
    res.status(500).json({ error: 'Failed to mark Musk suggestion as actioned' });
  }
});

/**
 * Track user behavior for Musk AI
 */
router.post('/api/musk/track-behavior', async (req: Request, res: Response) => {
  try {
    // Extract user ID from request body (for demo purposes)
    // In a real app, this would come from authentication/session
    const userId = req.body.userId || 1;
    
    // Validate the tracking data
    const trackingData = {
      userId,
      eventType: req.body.eventType,
      eventData: req.body.eventData
    };
    
    // Parse with the schema
    const parsed = insertMuskBehaviorTrackingSchema.safeParse(trackingData);
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    
    // Track behavior
    await muskSuggestionService.trackUserBehavior(
      userId, 
      req.body.eventType, 
      req.body.eventData
    );
    
    // Return success
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking Musk behavior:', error);
    res.status(500).json({ error: 'Failed to track Musk behavior' });
  }
});

export default router;