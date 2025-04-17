import { Router } from 'express';
import { IStorage } from './storage';
import { z } from 'zod';
import { MuskSuggestionService } from './services/musk-suggestion-service';

/**
 * Routes for handling Musk AI suggestion features
 */
export function createMuskSuggestionRoutes(storage: IStorage) {
  const router = Router();
  const suggestionService = new MuskSuggestionService(storage);

  /**
   * Get active suggestions for the current user
   */
  router.get('/suggestions', async (req, res) => {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get suggestions
      const suggestions = await suggestionService.getSuggestionsForUser(Number(userId));
      
      return res.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return res.status(500).json({ message: 'Failed to fetch suggestions' });
    }
  });

  /**
   * Mark a suggestion as dismissed
   */
  router.post('/suggestions/dismiss', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const schema = z.object({
        suggestionId: z.number(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request', errors: result.error.format() });
      }

      // Mark as dismissed
      await suggestionService.dismissSuggestion(result.data.suggestionId);
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      return res.status(500).json({ message: 'Failed to dismiss suggestion' });
    }
  });

  /**
   * Record that a user has acted on a suggestion
   */
  router.post('/suggestions/action', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const schema = z.object({
        suggestionId: z.number(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request', errors: result.error.format() });
      }

      // Mark action taken
      await suggestionService.markSuggestionActionTaken(result.data.suggestionId);
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error recording suggestion action:', error);
      return res.status(500).json({ message: 'Failed to record suggestion action' });
    }
  });

  /**
   * Track user behavior (page views, interactions, etc.)
   */
  router.post('/behavior/track', async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const schema = z.object({
        eventType: z.string(),
        eventData: z.record(z.any())
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid request', errors: result.error.format() });
      }

      // Track behavior
      await suggestionService.trackUserBehavior(
        Number(userId), 
        result.data.eventType, 
        result.data.eventData
      );
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error tracking behavior:', error);
      return res.status(500).json({ message: 'Failed to track behavior' });
    }
  });

  return router;
}