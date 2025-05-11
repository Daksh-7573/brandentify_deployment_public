import express from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { authenticateJWT, authorize } from './middleware/auth-middleware';
import { API_ROUTES } from './config/api-routes';
import { securityMonitorService } from './services/security-monitoring-service';
import { insertPulseFlagSchema } from '../shared/schema';

// Create the router
const router = express.Router();

// Schema for creating a pulse flag
const createFlagSchema = insertPulseFlagSchema.extend({
  // Additional validation can be added here
});

// Schema for updating flag status
const updateFlagStatusSchema = z.object({
  status: z.string().refine(val => ['pending', 'reviewed', 'dismissed', 'actioned'].includes(val), {
    message: "Status must be one of: pending, reviewed, dismissed, actioned"
  }),
  reviewNotes: z.string().optional(),
});

/**
 * @route POST /api/flags/pulse
 * @desc Report/flag a pulse for moderation
 * @access Authenticated users only
 */
router.post('/api/flags/pulse', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const flagData = { ...req.body, flaggedByUserId: userId };
    
    // Validate the flag data
    const validationResult = createFlagSchema.safeParse(flagData);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid flag data',
        errors: validationResult.error.errors 
      });
    }
    
    // Create the flag
    const newFlag = await storage.createPulseFlag(validationResult.data);
    
    // Log security event
    await securityMonitorService.logSecurityEvent({
      type: 'content',
      subtype: 'flag_created',
      userId: userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      details: {
        pulseId: newFlag.pulseId,
        flagId: newFlag.id,
        reason: newFlag.reason
      }
    });
    
    return res.status(201).json({ 
      message: 'Content flagged successfully', 
      flag: newFlag 
    });
  } catch (error) {
    console.error('Error flagging content:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/flags/pulse/:pulseId
 * @desc Get flags for a specific pulse
 * @access Admins and moderators only
 */
router.get('/api/flags/pulse/:pulseId', authenticateJWT, authorize(['admin', 'moderator']), async (req, res) => {
  try {
    const pulseId = parseInt(req.params.pulseId);
    if (isNaN(pulseId)) {
      return res.status(400).json({ message: 'Invalid pulse ID' });
    }
    
    const flags = await storage.getPulseFlagsByPulseId(pulseId);
    return res.json({ flags });
  } catch (error) {
    console.error('Error getting pulse flags:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/flags/status/:status
 * @desc Get flags by status
 * @access Admins and moderators only
 */
router.get('/api/flags/status/:status', authenticateJWT, authorize(['admin', 'moderator']), async (req, res) => {
  try {
    const status = req.params.status;
    if (!['pending', 'reviewed', 'dismissed', 'actioned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const flags = await storage.getPulseFlagsByStatus(status);
    return res.json({ flags });
  } catch (error) {
    console.error('Error getting flags by status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/flags/count/pending
 * @desc Get count of pending flags
 * @access Admins and moderators only
 */
router.get('/api/flags/count/pending', authenticateJWT, authorize(['admin', 'moderator']), async (req, res) => {
  try {
    const count = await storage.getPendingFlagCount();
    return res.json({ count });
  } catch (error) {
    console.error('Error getting pending flag count:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route PATCH /api/flags/:id
 * @desc Update flag status (for moderation)
 * @access Admins and moderators only
 */
router.patch('/api/flags/:id', authenticateJWT, authorize(['admin', 'moderator']), async (req, res) => {
  try {
    const flagId = parseInt(req.params.id);
    if (isNaN(flagId)) {
      return res.status(400).json({ message: 'Invalid flag ID' });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate the update data
    const validationResult = updateFlagStatusSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid update data',
        errors: validationResult.error.errors 
      });
    }
    
    const { status, reviewNotes } = validationResult.data;
    
    // Update the flag status
    const updatedFlag = await storage.updatePulseFlagStatus(
      flagId, 
      status, 
      userId, 
      reviewNotes
    );
    
    if (!updatedFlag) {
      return res.status(404).json({ message: 'Flag not found' });
    }
    
    // Log security event
    await securityMonitorService.logSecurityEvent({
      type: 'content',
      subtype: 'flag_reviewed',
      userId: userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      details: {
        flagId: flagId,
        pulseId: updatedFlag.pulseId,
        newStatus: status
      }
    });
    
    return res.json({ 
      message: 'Flag status updated successfully', 
      flag: updatedFlag 
    });
  } catch (error) {
    console.error('Error updating flag status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;