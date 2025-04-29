import express, { Request, Response } from 'express';
import { storage } from './storage';
import { mentorshipStatusEnum } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Get a mentorship request by ID
router.get('/mentorship-requests/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const request = await storage.getMentorshipRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching mentorship request:', error);
    return res.status(500).json({ message: 'Error fetching mentorship request' });
  }
});

// Get mentorship requests by mentee ID
router.get('/users/:userId/mentee-requests', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const requests = await storage.getMentorshipRequestsByMenteeId(userId);
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching mentee requests:', error);
    return res.status(500).json({ message: 'Error fetching mentee requests' });
  }
});

// Get mentorship requests by mentor ID
router.get('/users/:userId/mentor-requests', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const requests = await storage.getMentorshipRequestsByMentorId(userId);
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching mentor requests:', error);
    return res.status(500).json({ message: 'Error fetching mentor requests' });
  }
});

// Get count of active mentorships for a user (as mentor or mentee)
router.get('/users/:userId/active-mentorships-count/:role', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const role = req.params.role as 'mentor' | 'mentee';
    if (role !== 'mentor' && role !== 'mentee') {
      return res.status(400).json({ message: 'Invalid role. Must be "mentor" or "mentee"' });
    }

    const count = await storage.getActiveMentorshipsCount(userId, role);
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching active mentorships count:', error);
    return res.status(500).json({ message: 'Error fetching active mentorships count' });
  }
});

// Get count of pending mentorship requests for a user (as mentor or mentee)
router.get('/users/:userId/pending-mentorship-requests-count/:role', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const role = req.params.role as 'mentor' | 'mentee';
    if (role !== 'mentor' && role !== 'mentee') {
      return res.status(400).json({ message: 'Invalid role. Must be "mentor" or "mentee"' });
    }

    const count = await storage.getPendingMentorshipRequestsCount(userId, role);
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching pending mentorship requests count:', error);
    return res.status(500).json({ message: 'Error fetching pending mentorship requests count' });
  }
});

// Create a new mentorship request
router.post('/mentorship-requests', async (req: Request, res: Response) => {
  try {
    const mentorshipRequestSchema = z.object({
      mentorId: z.number(),
      menteeId: z.number(),
      message: z.string().max(500)
    });
    
    const validationResult = mentorshipRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid request data',
        errors: validationResult.error.format() 
      });
    }
    
    const { mentorId, menteeId, message } = validationResult.data;
    
    // Check if mentee can request more mentorships
    const canRequest = await storage.canRequestMentorship(menteeId);
    if (!canRequest) {
      return res.status(400).json({ 
        message: 'You have reached the maximum number of active mentorships (5)' 
      });
    }
    
    const request = await storage.createMentorshipRequest({
      mentorId,
      menteeId,
      message
    });
    
    return res.status(201).json(request);
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    return res.status(500).json({ message: 'Error creating mentorship request' });
  }
});

// Update mentorship request status
router.patch('/mentorship-requests/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const updateSchema = z.object({
      status: z.enum(['accepted', 'declined', 'expired', 'completed']),
      reason: z.string().max(500).optional()
    });
    
    const validationResult = updateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid update data',
        errors: validationResult.error.format() 
      });
    }
    
    const { status, reason } = validationResult.data;
    
    const updatedRequest = await storage.updateMentorshipRequestStatus(id, status, reason);
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }
    
    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating mentorship request status:', error);
    return res.status(500).json({ message: 'Error updating mentorship request status' });
  }
});

// Get feedback for a mentorship
router.get('/mentorship-requests/:mentorshipId/feedback', async (req: Request, res: Response) => {
  try {
    const mentorshipId = parseInt(req.params.mentorshipId);
    if (isNaN(mentorshipId)) {
      return res.status(400).json({ message: 'Invalid mentorship ID format' });
    }
    
    const feedback = await storage.getMentorshipFeedbackByMentorshipId(mentorshipId);
    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching mentorship feedback:', error);
    return res.status(500).json({ message: 'Error fetching mentorship feedback' });
  }
});

// Create feedback for a mentorship
router.post('/mentorship-feedback', async (req: Request, res: Response) => {
  try {
    const feedbackSchema = z.object({
      mentorshipId: z.number(),
      userId: z.number(),
      rating: z.number().min(1).max(5),
      feedback: z.string().max(1000),
      isFromMentor: z.boolean()
    });
    
    const validationResult = feedbackSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid feedback data',
        errors: validationResult.error.format() 
      });
    }
    
    const feedback = await storage.createMentorshipFeedback(validationResult.data);
    return res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating mentorship feedback:', error);
    return res.status(500).json({ message: 'Error creating mentorship feedback' });
  }
});

export default router;