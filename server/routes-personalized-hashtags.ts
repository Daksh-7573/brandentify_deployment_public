import express from 'express';
import { 
  generatePersonalizedHashtags, 
  getDemoFollowedHashtags, 
  getDemoSearchedHashtags, 
  getDemoEngagementHashtags
} from './services/personalized-hashtag-service';

export const setupPersonalizedHashtagRoutes = (app: express.Express) => {
  const router = express.Router();

  /**
   * GET /api/hashtags/suggest-personalized
   * 
   * Get personalized hashtag suggestions based on comprehensive user context
   * 
   * Query parameters:
   * - userId: User ID for personalization
   * - industry: User's industry
   * - domain: User's domain
   * - questType: Type of quest (pulse_creation, networking, visibility)
   * - targetAction: Specific action being taken
   * - contentContext: Content being created (optional)
   * - count: Number of hashtags to return (default: 5)
   * - demo: Whether to use demo data (default: false)
   */
  router.get('/suggest-personalized', async (req, res) => {
    try {
      const {
        userId,
        industry,
        domain,
        questType,
        targetAction,
        contentContext,
        count = 5,
        demo = false
      } = req.query;

      // Convert userId to number if provided
      const userIdNum = userId ? parseInt(userId as string) : undefined;
      
      // Demo mode uses synthetic data for demonstration
      if (demo === 'true') {
        // Get demo data based on provided context
        const followedHashtags = getDemoFollowedHashtags(
          industry as string | undefined,
          domain as string | undefined
        );
        
        const searchedHashtags = getDemoSearchedHashtags(
          industry as string | undefined
        );
        
        const engagementHashtags = getDemoEngagementHashtags(
          questType as string | undefined
        );

        // Generate personalized hashtags with demo data
        const result = await generatePersonalizedHashtags({
          userId: userIdNum,
          industry: industry as string | undefined,
          domain: domain as string | undefined,
          questType: questType as string | undefined,
          targetAction: targetAction as string | undefined,
          contentContext: contentContext as string | undefined,
          followedHashtags,
          searchedHashtags,
          engagementHashtags,
          count: count ? parseInt(count as string) : 5
        });

        // Add sources information for transparency
        return res.json({
          ...result,
          sources: {
            industry: industry || 'Not specified',
            domain: domain || 'Not specified',
            followedHashtags: followedHashtags.map(h => h.hashtag),
            searchedHashtags: searchedHashtags.map(h => h.hashtag),
            engagementHashtags: engagementHashtags.map(h => h.hashtag)
          }
        });
      }
      
      // In a real implementation, we would fetch user's followed hashtags,
      // search history, and engagement data from a database here
      
      // For now, fall back to demo mode if real data is requested
      const followedHashtags = getDemoFollowedHashtags(
        industry as string | undefined,
        domain as string | undefined
      );
      
      const searchedHashtags = getDemoSearchedHashtags(
        industry as string | undefined
      );
      
      const engagementHashtags = getDemoEngagementHashtags(
        questType as string | undefined
      );

      // Generate personalized hashtags
      const result = await generatePersonalizedHashtags({
        userId: userIdNum,
        industry: industry as string | undefined,
        domain: domain as string | undefined,
        questType: questType as string | undefined,
        targetAction: targetAction as string | undefined,
        contentContext: contentContext as string | undefined,
        followedHashtags,
        searchedHashtags,
        engagementHashtags,
        count: count ? parseInt(count as string) : 5
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error in personalized hashtag suggestions endpoint:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate personalized hashtag suggestions' 
      });
    }
  });

  // Register routes
  app.use('/api/hashtags', router);
  console.log('Personalized hashtag routes loaded');
};