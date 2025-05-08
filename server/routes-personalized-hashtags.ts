import express from 'express';
import { storage } from './storage';
import { 
  generatePersonalizedHashtags, 
  generateDemoHashtags 
} from './services/personalized-hashtag-service';

/**
 * Setup personalized hashtag routes
 * @param app Express application
 */
export function setupPersonalizedHashtagRoutes(app: express.Express) {
  // Create router
  const router = express.Router();
  
  /**
   * Generate personalized hashtag suggestions based on user profile and provided context
   * POST /api/personalized-hashtags
   */
  router.post('/personalized-hashtags', async (req, res) => {
    try {
      const userId = req.session?.userId || req.body.userId;
      const {
        industry,
        domain,
        questType,
        targetAction,
        contentContext,
        count = 5
      } = req.body;
      
      // Get user profile if userId is available
      let user = null;
      if (userId) {
        try {
          user = await storage.getUser(userId);
        } catch (error) {
          console.error(`Error fetching user ${userId} for hashtag suggestions:`, error);
          // Continue without user data if there's an error
        }
      }
      
      // Generate personalized hashtags
      const result = await generatePersonalizedHashtags({
        industry,
        domain,
        questType,
        targetAction,
        contentContext,
        count
      }, user);
      
      // Return the generated hashtags
      return res.json(result);
    } catch (error) {
      console.error('Error generating personalized hashtags:', error);
      return res.status(500).json({ 
        error: 'Failed to generate hashtag suggestions',
        hashtags: [],
        sources: []
      });
    }
  });

  /**
   * Demo endpoint for personalized hashtag suggestions (no authentication required)
   * POST /api/personalized-hashtags/demo
   */
  router.post('/personalized-hashtags/demo', async (req, res) => {
    try {
      const {
        industry,
        domain,
        questType,
        targetAction,
        contentContext,
        count = 5
      } = req.body;
      
      // Generate demo hashtags
      const result = await generateDemoHashtags({
        industry,
        domain,
        questType,
        targetAction,
        contentContext,
        count
      });
      
      // Return the generated hashtags
      return res.json(result);
    } catch (error) {
      console.error('Error generating demo hashtags:', error);
      return res.status(500).json({ 
        error: 'Failed to generate demo hashtag suggestions',
        hashtags: [],
        sources: []
      });
    }
  });

  /**
   * Utility endpoint to get static hashtag suggestions for a specific quest type
   * GET /api/personalized-hashtags/static/:questType
   */
  router.get('/personalized-hashtags/static/:questType', (req, res) => {
    const { questType } = req.params;
    const count = parseInt(req.query.count as string) || 5;
    
    // Map of static hashtags by quest type
    const staticHashtags: Record<string, string[]> = {
      pulse_creation: [
        'careerjourney', 'professionalgrowth', 'jobsearch', 'careeradvice', 
        'careertips', 'networking', 'leadership', 'skillbuilding',
        'remotework', 'worklifebalance', 'productivitytips'
      ],
      networking: [
        'networking', 'careerconnections', 'professionalnetwork', 'careergrowth',
        'industryinsights', 'mentorship', 'collaboration', 'thoughtleadership'
      ],
      // Add more quest types as needed
    };
    
    // Get hashtags for the specified quest type, or use pulse_creation as default
    const relevantHashtags = staticHashtags[questType] || staticHashtags.pulse_creation;
    
    // Randomly select a subset of hashtags based on count
    const shuffled = [...relevantHashtags].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    
    // Return the selected hashtags
    return res.json({
      hashtags: selected,
      sources: ['Static hashtag database']
    });
  });
  
  // Use the router
  app.use('/api', router);
  
  console.log('Personalized hashtag routes loaded');
}