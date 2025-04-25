/**
 * Musk Feedback Routes
 * 
 * API endpoints for handling feedback on Musk AI responses
 */

import express from 'express';
import { z } from 'zod';
import { registerFeedback, getUserFeedbackHistory, getAnalyticsForCategory, getTopPerformingCategories } from './services/musk-feedback-service';

const router = express.Router();

// Schema for feedback submission
const feedbackSchema = z.object({
  userId: z.number(),
  conversationId: z.string(),
  messageId: z.string(),
  feedbackType: z.enum(["helpful", "rating", "text", "save"]),
  rating: z.number().optional(),
  helpful: z.boolean().optional(),
  textFeedback: z.string().optional(),
  savedToPlan: z.boolean().optional(),
  context: z.string().optional(),
  promptCategory: z.string().optional(),
  promptDetails: z.record(z.any()).optional(),
  responseDetails: z.record(z.any()).optional(),
});

/**
 * Submit feedback for a Musk response
 * POST /api/musk-feedback/submit
 */
router.post('/submit', async (req, res) => {
  try {
    // Validate request body
    const validatedData = feedbackSchema.parse(req.body);

    // Process the feedback
    const result = await registerFeedback(validatedData);

    res.json(result);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    // Send appropriate error message
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Invalid feedback data', errors: error.errors });
    } else {
      res.status(500).json({ status: 'error', message: 'Failed to process feedback' });
    }
  }
});

/**
 * Get feedback history for a user
 * GET /api/musk-feedback/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const history = await getUserFeedbackHistory(userId, limit);
    
    res.json({
      status: 'success',
      data: history
    });
  } catch (error) {
    console.error('Error getting feedback history:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve feedback history' });
  }
});

/**
 * Get analytics for a specific prompt category
 * GET /api/musk-feedback/analytics/category/:category
 */
router.get('/analytics/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const analytics = await getAnalyticsForCategory(category);
    
    res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    console.error('Error getting category analytics:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve category analytics' });
  }
});

/**
 * Get top performing prompt categories
 * GET /api/musk-feedback/analytics/top
 */
router.get('/analytics/top', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const topCategories = await getTopPerformingCategories(limit);
    
    res.json({
      status: 'success',
      data: topCategories
    });
  } catch (error) {
    console.error('Error getting top performing categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve top categories' });
  }
});

export default router;