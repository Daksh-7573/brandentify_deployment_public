import express, { Request, Response } from 'express';
import { storage } from './storage';
import { connectionStatusEnum } from '@shared/schema';
import { z } from 'zod';
import * as messageService from './services/message-service';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * Helper function to get the authenticated user ID from the JWT session cookie
 * This is the primary authentication method for Brandentifier
 */
function getAuthenticatedUserId(req: Request): number | null {
  // First, try to verify JWT from session cookie (primary auth method)
  const sessionToken = req.cookies?.brandentifier_session;
  
  if (sessionToken) {
    try {
      const decoded = jwt.verify(
        sessionToken, 
        process.env.JWT_SECRET || 'brandentifier-jwt-secret-key'
      ) as any;
      if (decoded.userId) {
        return decoded.userId;
      }
    } catch (jwtError) {
      console.warn(`[Connection Routes] Invalid session token`);
    }
  }
  
  // Check for session in headers if not in session object
  const headerUserId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'] as string) : null;
  const sessionUserId = (req as any).session?.userId;
  const userObjectId = (req as any).user?.id;
  const directUserId = (req as any).userId;

  const userId = directUserId || userObjectId || sessionUserId || headerUserId;
  
  if (!userId && req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      const extractedId = decoded.id || decoded.userId || decoded.sub;
      return extractedId ? parseInt(extractedId.toString()) : null;
    } catch (e) {
      console.warn('[Connection Routes] Failed to extract ID from auth header');
    }
  }

  if (!userId) {
    console.warn('[Connection Routes] No authenticated userId found. Debug info:', {
      directUserId,
      userObjectId,
      sessionUserId,
      headerUserId,
      hasAuthHeader: !!req.headers.authorization
    });
  }
  
  return userId;
}

// Get a connection request by ID
router.get('/connection-requests/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Verify user is authenticated using JWT session cookie
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'You must be logged in to view connection requests' });
    }

    const request = await storage.getConnectionRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify the current user is either the sender or receiver of the request
    if (request.senderId !== currentUserId && request.receiverId !== currentUserId) {
      return res.status(403).json({ message: 'You are not authorized to view this connection request' });
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching connection request:', error);
    return res.status(500).json({ message: 'Error fetching connection request' });
  }
});

// Get connection requests sent by user
router.get('/users/:userId/sent-connection-requests', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Verify the current user is requesting their own data using JWT session cookie
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId || currentUserId !== userId) {
      return res.status(403).json({ message: 'You can only view your own connection requests' });
    }

    const requests = await storage.getConnectionRequestsBySenderId(userId);
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching sent connection requests:', error);
    return res.status(500).json({ message: 'Error fetching sent connection requests' });
  }
});

// Get connection requests received by user
router.get('/users/:userId/received-connection-requests', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Verify the current user is requesting their own data using JWT session cookie
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId || currentUserId !== userId) {
      return res.status(403).json({ message: 'You can only view your own connection requests' });
    }

    const requests = await storage.getConnectionRequestsByReceiverId(userId);
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching received connection requests:', error);
    return res.status(500).json({ message: 'Error fetching received connection requests' });
  }
});

// Get count of pending connection requests for a user
router.get('/users/:userId/pending-connection-requests-count', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Verify the current user is requesting their own data using JWT session cookie
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId || currentUserId !== userId) {
      return res.status(403).json({ message: 'You can only view your own connection request count' });
    }

    const count = await storage.getPendingConnectionRequestsCount(userId);
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching pending connection requests count:', error);
    return res.status(500).json({ message: 'Error fetching pending connection requests count' });
  }
});

// Check if two users are connected
router.get('/users/:userId1/connected-with/:userId2', async (req: Request, res: Response) => {
  try {
    const userId1 = parseInt(req.params.userId1);
    const userId2 = parseInt(req.params.userId2);
    
    if (isNaN(userId1) || isNaN(userId2)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const isConnected = await storage.areUsersConnected(userId1, userId2);
    return res.status(200).json({ connected: isConnected });
  } catch (error) {
    console.error('Error checking connection status:', error);
    return res.status(500).json({ message: 'Error checking connection status' });
  }
});

// Create a new connection request
router.post('/connection-requests', async (req: Request, res: Response) => {
  try {
    // Get the current user from JWT session cookie (NEVER trust client-provided senderId)
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'You must be logged in to send connection requests' });
    }
    
    const connectionRequestSchema = z.object({
      receiverId: z.number(),
      reason: z.string().min(1),
      message: z.string().max(500).optional()
    });
    
    const validationResult = connectionRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid request data',
        errors: validationResult.error.format() 
      });
    }
    
    const { receiverId, reason, message } = validationResult.data;
    const senderId = currentUserId; // Use authenticated user ID
    
    // Prevent self-connection
    if (senderId === receiverId) {
      return res.status(400).json({ 
        message: 'You cannot send a connection request to yourself' 
      });
    }
    
    // Validate that receiver exists
    const receiver = await storage.getUser(receiverId);
    if (!receiver) {
      return res.status(400).json({ 
        message: 'Invalid recipient. Cannot send connection request to this user.' 
      });
    }
    
    // Check if users are already connected
    const alreadyConnected = await storage.areUsersConnected(senderId, receiverId);
    if (alreadyConnected) {
      return res.status(400).json({ 
        message: 'You are already connected with this user' 
      });
    }
    
    // Check for existing pending request
    const existingRequest = await storage.getExistingConnectionRequest(senderId, receiverId);
    if (existingRequest) {
      return res.status(400).json({ 
        message: 'A connection request already exists between these users' 
      });
    }
    
    // Create the connection request
    console.log(`[Connection Routes] Creating request: ${senderId} -> ${receiverId}`);
    const newRequest = await storage.createConnectionRequest({
      senderId,
      receiverId,
      status: 'pending',
      reason,
      message
    });
    
    // Create notification for receiver
    try {
      const sender = await storage.getUser(senderId);
      const { createConnectionRequestNotification } = await import('./services/notification-service');
      await createConnectionRequestNotification(receiverId, sender?.name || 'Someone');
    } catch (notificationError) {
      console.error('Error sending connection request notification:', notificationError);
    }
    
    return res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating connection request:', error);
    return res.status(500).json({ message: 'Error creating connection request' });
  }
});

// Accept a connection request
router.put('/connection-requests/:id/accept', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Get the current user from JWT session cookie
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'You must be logged in to accept connection requests' });
    }

    const request = await storage.getConnectionRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify that the current user is the receiver of the request
    if (request.receiverId !== currentUserId) {
      return res.status(403).json({ message: 'You are not authorized to accept this connection request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This connection request has already been processed' });
    }

    // Create a conversation between the two users
    const conversation = await messageService.getOrCreateDirectConversation(
      request.senderId,
      request.receiverId
    );

    // Update the connection request
    const updatedRequest = await storage.acceptConnectionRequest(id, conversation?.id || 0);
    
    // Create notification for sender
    try {
      const receiver = await storage.getUser(request.receiverId);
      const { createConnectionAcceptedNotification } = await import('./services/notification-service');
      await createConnectionAcceptedNotification(request.senderId, receiver?.name || 'Someone');
    } catch (notificationError) {
      console.error('Error sending connection accepted notification:', notificationError);
    }
    
    return res.status(200).json({
      request: updatedRequest,
      conversation
    });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return res.status(500).json({ message: 'Error accepting connection request' });
  }
});

// Decline a connection request
router.put('/connection-requests/:id/decline', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Get the current user from JWT session cookie
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'You must be logged in to decline connection requests' });
    }

    const request = await storage.getConnectionRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify that the current user is the receiver of the request
    if (request.receiverId !== currentUserId) {
      return res.status(403).json({ message: 'You are not authorized to decline this connection request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This connection request has already been processed' });
    }

    const updatedRequest = await storage.declineConnectionRequest(id);
    
    // Create notification for sender
    try {
      const receiver = await storage.getUser(request.receiverId);
      const { createNotification } = await import('./services/notification-service');
      await createNotification({
        userId: request.senderId,
        type: 'info' as const,
        category: 'connection_declined' as const,
        title: 'Connection Request Declined',
        message: `${receiver?.name || 'Someone'} declined your connection request`,
        actionUrl: `/connections`,
        isRead: false
      });
    } catch (notificationError) {
      console.error('Error sending connection declined notification:', notificationError);
    }
    
    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error declining connection request:', error);
    return res.status(500).json({ message: 'Error declining connection request' });
  }
});

// Cancel a connection request (by sender)
router.put('/connection-requests/:id/cancel', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Get the current user from JWT session cookie
    const currentUserId = getAuthenticatedUserId(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'You must be logged in to cancel connection requests' });
    }

    const request = await storage.getConnectionRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify that the current user is the sender of the request
    if (request.senderId !== currentUserId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this connection request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This connection request has already been processed' });
    }

    const updatedRequest = await storage.cancelConnectionRequest(id);
    
    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error cancelling connection request:', error);
    return res.status(500).json({ message: 'Error cancelling connection request' });
  }
});

export default router;
