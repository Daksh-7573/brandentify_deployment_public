import express from 'express';
import { z } from 'zod';
import { NowboardRecommendationService } from './services/nowboard-recommendation-service';

const router = express.Router();

// Get personalized nowboard recommendations
router.get('/api/nowboard-recommendations', async (req, res) => {
  try {
    // Get user ID from session or query param for demo
    const userId = req.session?.userId || parseInt(req.query.userId as string, 10) || 2; // Default demo user ID
    const questType = req.query.questType as string | undefined;

    const recommendations = await NowboardRecommendationService.getPersonalizedRecommendations(userId, questType);
    
    return res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Error getting nowboard recommendations:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get nowboard recommendations', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Track quest progress from nowboard action
router.post('/api/nowboard-recommendations/track-progress', async (req, res) => {
  try {
    const schema = z.object({
      userId: z.number(),
      questId: z.number(),
      actionType: z.string()
    });

    const { userId, questId, actionType } = schema.parse(req.body);

    const success = await NowboardRecommendationService.trackQuestProgress(userId, questId, actionType);
    
    return res.json({ success });
  } catch (error) {
    console.error('Error tracking nowboard quest progress:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to track quest progress', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Demo endpoint for testing
router.get('/api/nowboard-recommendations/demo', (req, res) => {
  try {
    const questType = req.query.questType as string | undefined;
    
    // Get fallback recommendations
    const recommendations = [
      {
        id: 101,
        type: 'pulse',
        title: 'Create a pulse about your recent project',
        description: 'Share your recent work to make progress on your "Content Creator" quest',
        actionText: 'Create Pulse',
        xpValue: 25,
        relatedQuestId: 1
      },
      {
        id: 102,
        type: 'comment',
        title: 'Comment on trending industry discussions',
        description: 'Professionals in Healthcare are discussing new research. Join the conversation!',
        actionText: 'View Conversations',
        xpValue: 15,
        relatedQuestId: 2
      },
      {
        id: 103,
        type: 'reaction',
        title: 'React to content from your industry',
        description: 'Show appreciation for quality content from your peers',
        actionText: 'Find Content',
        xpValue: 10,
        relatedQuestId: 3
      }
    ];
    
    // Filter by quest type if specified
    const filteredRecommendations = questType 
      ? recommendations.filter(r => {
          if (questType === 'pulse_creation' && r.type === 'pulse') return true;
          if (questType === 'engagement' && (r.type === 'comment' || r.type === 'reaction')) return true;
          return false;
        })
      : recommendations;
      
    return res.json({ success: true, recommendations: filteredRecommendations });
  } catch (error) {
    console.error('Error getting demo nowboard recommendations:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get demo nowboard recommendations', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;