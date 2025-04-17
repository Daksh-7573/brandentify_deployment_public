import express from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { insertMuskMatchSchema } from '../shared/schema';

const router = express.Router();

/**
 * Get Musk Matches for a user
 * GET /api/musk-matches/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const matches = await storage.getMuskMatchesByUserId(userId);
    res.json(matches);
  } catch (error) {
    console.error('[GET /musk-matches/user/:userId]', error);
    res.status(500).json({ message: 'Failed to fetch Musk matches' });
  }
});

/**
 * Get a specific Musk Match
 * GET /api/musk-matches/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    const match = await storage.getMuskMatchById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    console.error('[GET /musk-matches/:id]', error);
    res.status(500).json({ message: 'Failed to fetch Musk match' });
  }
});

/**
 * Create a new Musk Match
 * POST /api/musk-matches
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = insertMuskMatchSchema.parse(req.body);
    const match = await storage.createMuskMatch(validatedData);
    res.status(201).json(match);
  } catch (error) {
    console.error('[POST /musk-matches]', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid match data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create Musk match' });
  }
});

/**
 * Update a Musk Match
 * PATCH /api/musk-matches/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    const match = await storage.getMuskMatchById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const updatedMatch = await storage.updateMuskMatch(id, req.body);
    res.json(updatedMatch);
  } catch (error) {
    console.error('[PATCH /musk-matches/:id]', error);
    res.status(500).json({ message: 'Failed to update Musk match' });
  }
});

/**
 * Delete a Musk Match
 * DELETE /api/musk-matches/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    const match = await storage.getMuskMatchById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const success = await storage.deleteMuskMatch(id);
    if (success) {
      res.json({ message: 'Match deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete match' });
    }
  } catch (error) {
    console.error('[DELETE /musk-matches/:id]', error);
    res.status(500).json({ message: 'Failed to delete Musk match' });
  }
});

/**
 * Mark a Musk Match as read
 * PATCH /api/musk-matches/:id/read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    const updatedMatch = await storage.markMuskMatchAsRead(id);
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('[PATCH /musk-matches/:id/read]', error);
    res.status(500).json({ message: 'Failed to mark match as read' });
  }
});

/**
 * Mark a Musk Match as dismissed
 * PATCH /api/musk-matches/:id/dismiss
 */
router.patch('/:id/dismiss', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    const updatedMatch = await storage.markMuskMatchAsDismissed(id);
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('[PATCH /musk-matches/:id/dismiss]', error);
    res.status(500).json({ message: 'Failed to dismiss match' });
  }
});

/**
 * Mark a Musk Match as connected
 * PATCH /api/musk-matches/:id/connect
 */
router.patch('/:id/connect', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    const updatedMatch = await storage.markMuskMatchAsConnected(id);
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('[PATCH /musk-matches/:id/connect]', error);
    res.status(500).json({ message: 'Failed to mark match as connected' });
  }
});

/**
 * Get pending Musk Matches for a user
 * GET /api/musk-matches/user/:userId/pending
 */
router.get('/user/:userId/pending', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const matches = await storage.getPendingMuskMatches(userId);
    res.json(matches);
  } catch (error) {
    console.error('[GET /musk-matches/user/:userId/pending]', error);
    res.status(500).json({ message: 'Failed to fetch pending Musk matches' });
  }
});

/**
 * Generate compatible Musk Matches for a user
 * POST /api/musk-matches/user/:userId/generate
 */
router.post('/user/:userId/generate', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const limit = req.body.limit ? parseInt(req.body.limit) : 5;
    
    const matches = await storage.getCompatibleMuskMatches(userId, limit);
    res.json(matches);
  } catch (error) {
    console.error('[POST /musk-matches/user/:userId/generate]', error);
    res.status(500).json({ message: 'Failed to generate compatible Musk matches' });
  }
});

/**
 * Generate demo Musk Matches
 * POST /api/musk-matches/generate-demo
 */
router.post('/generate-demo', async (req, res) => {
  try {
    // Import here to avoid circular dependencies
    const { createDemoProfiles } = await import('./demo-profiles');
    
    // Create demo profiles and matches
    const profiles = await createDemoProfiles(storage);
    
    // Return created profiles
    res.status(201).json({
      message: 'Demo Musk Match suggestions created successfully',
      profiles: Object.keys(profiles).map(key => ({
        id: profiles[key].id,
        name: profiles[key].name,
        title: profiles[key].title
      }))
    });
  } catch (error) {
    console.error('[POST /musk-matches/generate-demo]', error);
    res.status(500).json({ message: 'Failed to create demo Musk match suggestions' });
  }
});

export default router;