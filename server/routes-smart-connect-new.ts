/**
 * Smart Connect API Routes
 * 
 * This file implements the specific Smart Connect endpoints for:
 * 1. GET /api/smart-connect/recommendations - Get personalized connection recommendations
 * 2. POST /api/smart-connect/request - Send connection requests
 * 3. GET /api/smart-connect/requests - Manage connection requests
 */

import express, { Request, Response } from 'express';
import { IStorage } from './storage';
import { decisionEngine } from './decision-engine/index';
import { z } from 'zod';
import { insertConnectionRequestSchema, ConnectionRequest, ConnectionRecommendation, InsertConnectionRequest } from '@shared/schema';
import { 
  requireSmartConnectAuth, 
  requireResourceOwnership, 
  smartConnectRateLimit, 
  logSmartConnectAccess,
  AuthenticatedRequest 
} from './middleware/smart-connect-auth';

/**
 * Schema for validating connection request creation
 */
const createConnectionRequestSchema = z.object({
  recipientId: z.number(),
  message: z.string().optional(),
  requestReason: z.string().optional(),
});

/**
 * Schema for validating recommendation requests
 */
const recommendationRequestSchema = z.object({
  userId: z.number(),
  limit: z.number().min(1).max(50).optional().default(10),
  industry: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  lookingFor: z.string().optional(),
});

/**
 * Register Smart Connect routes
 */
export function registerSmartConnectNewRoutes(app: express.Express, storage: IStorage) {
  
  // Create API router for our endpoints
  const apiRouter = express.Router();
  
  /**
   * GET /api/smart-connect/recommendations
   * Returns personalized connection recommendations based on user profile
   */
  apiRouter.get('/smart-connect/recommendations', 
    requireSmartConnectAuth, 
    requireResourceOwnership('userId'), 
    smartConnectRateLimit, 
    logSmartConnectAccess,
    async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('[Smart Connect] Recommendations request received:', req.query);
      
      const userId = parseInt(req.query.userId as string);
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (isNaN(userId)) {
        return res.status(400).json({ 
          error: 'Invalid userId parameter',
          message: 'userId must be a valid number'
        });
      }

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: `User with ID ${userId} does not exist`
        });
      }

      console.log(`[Smart Connect] Generating recommendations for user ${userId}`);

      // Get existing recommendations from storage
      let existingRecommendations = await storage.getConnectionRecommendationsForUser(userId, limit);
      
      // If we don't have fresh recommendations, generate new ones
      if (existingRecommendations.length < limit) {
        console.log('[Smart Connect] Generating new recommendations using decision engine');
        
        // Build matching criteria from user profile and query parameters
        const criteria = {
          industry: (req.query.industry as string) || user.industry,
          skills: req.query.skills ? (req.query.skills as string).split(',') : [],
          location: (req.query.location as string) || user.location,
          lookingFor: (req.query.lookingFor as string) || user.lookingFor,
        };

        // Use decision engine to find matches
        const matches = await decisionEngine.findMatches(userId, criteria);
        
        // Convert matches to recommendation format and store them
        const newRecommendations = await Promise.all(
          matches.slice(0, limit).map(async (match) => {
            const recommendation = {
              userId: userId,
              recommendedUserId: match.user.id,
              recommendationType: 'smart_connect',
              matchScore: parseFloat(match.score.toFixed(2)),
              matchReasons: match.matchReasons || [],
              strengthAreas: match.strengthAreas || [],
              compatibilityInsights: match.compatibilityInsights || [],
              recommendationMetadata: {
                generatedAt: new Date().toISOString(),
                criteria: criteria,
                algorithmVersion: '1.0'
              },
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            };
            
            return await storage.createConnectionRecommendation(recommendation);
          })
        );
        
        existingRecommendations = newRecommendations;
      }

      // Mark recommendations as viewed
      await Promise.all(
        existingRecommendations.map(rec => storage.markRecommendationViewed(rec.id))
      );

      // Get PUBLIC user details for recommended users (PII-safe response)
      const recommendationsWithUsers = await Promise.all(
        existingRecommendations.map(async (rec) => {
          const recommendedUser = await storage.getUser(rec.recommendedUserId);
          return {
            id: rec.id,
            recommendedUser: {
              id: recommendedUser?.id,
              name: recommendedUser?.name, // Public field
              title: recommendedUser?.title, // Public field
              photoURL: recommendedUser?.photoURL, // Public field
              location: recommendedUser?.location, // Public field
              industry: recommendedUser?.industry, // Public field
              // Only first 200 chars of aboutMe for privacy
              aboutMe: recommendedUser?.aboutMe ? 
                (recommendedUser.aboutMe.length > 200 ? 
                  recommendedUser.aboutMe.substring(0, 200) + '...' : 
                  recommendedUser.aboutMe
                ) : null,
              // DO NOT include: email, phone, private notes, full profile data
            },
            matchScore: rec.matchScore,
            matchReasons: rec.matchReasons,
            strengthAreas: rec.strengthAreas,
            compatibilityInsights: rec.compatibilityInsights,
            recommendationType: rec.recommendationType,
            generatedAt: rec.generatedAt
            // DO NOT include: recommendation metadata, internal scoring details
          };
        })
      );

      console.log(`[Smart Connect] Returning ${recommendationsWithUsers.length} recommendations`);

      return res.status(200).json({
        success: true,
        recommendations: recommendationsWithUsers,
        count: recommendationsWithUsers.length,
        userId: userId,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('[Smart Connect] Error getting recommendations:', error);
      return res.status(500).json({ 
        error: 'Failed to get recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/smart-connect/request
   * Send a connection request to another user
   */
  apiRouter.post('/smart-connect/request', 
    requireSmartConnectAuth, 
    smartConnectRateLimit, 
    logSmartConnectAccess,
    async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('[Smart Connect] Connection request received:', req.body);
      
      const validation = createConnectionRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validation.error.format()
        });
      }

      const { recipientId, message, requestReason } = validation.data;
      // Get requesterId from authenticated user (security: prevent user impersonation)
      const requesterId = req.user!.id;

      // RequesterId is always from authenticated user - no need to check

      if (requesterId === recipientId) {
        return res.status(400).json({ 
          error: 'Invalid request',
          message: 'Cannot send connection request to yourself'
        });
      }

      // Check if both users exist
      const [requester, recipient] = await Promise.all([
        storage.getUser(requesterId),
        storage.getUser(recipientId)
      ]);

      if (!requester) {
        return res.status(404).json({ 
          error: 'Requester not found',
          message: `User with ID ${requesterId} does not exist`
        });
      }

      if (!recipient) {
        return res.status(404).json({ 
          error: 'Recipient not found',
          message: `User with ID ${recipientId} does not exist`
        });
      }

      // Check if users are already connected
      const existingConnection = await storage.areUsersConnected(requesterId, recipientId);
      if (existingConnection) {
        return res.status(400).json({ 
          error: 'Already connected',
          message: 'You are already connected to this user'
        });
      }

      // Check if there's already a pending request
      const existingRequest = await storage.getConnectionRequestByUsers(requesterId, recipientId);
      if (existingRequest) {
        return res.status(400).json({ 
          error: 'Request already exists',
          message: 'A connection request already exists between these users',
          existingRequest: {
            id: existingRequest.id,
            status: existingRequest.status,
            requestedAt: existingRequest.requestedAt
          }
        });
      }

      // Calculate mutual connections
      const mutualConnections = await storage.getMutualConnections(requesterId, recipientId);
      
      // Get match score if there's a recommendation
      const recommendations = await storage.getConnectionRecommendationsForUser(requesterId);
      const matchingRec = recommendations.find(rec => rec.recommendedUserId === recipientId);
      const matchScore = matchingRec?.matchScore || null;

      // Create the connection request
      const connectionRequest: InsertConnectionRequest = {
        requesterId,
        recipientId,
        message: message || null,
        requestReason: requestReason || null,
        matchScore: matchScore,
        sharedInterests: [], // TODO: Calculate shared interests
        mutualConnections: mutualConnections.length,
        metadataJson: {
          createdVia: 'smart_connect',
          hasRecommendation: !!matchingRec,
          timestamp: new Date().toISOString()
        }
      };

      const createdRequest = await storage.createConnectionRequest(connectionRequest);

      // Update recommendation if it exists
      if (matchingRec) {
        await storage.markRecommendationRequested(matchingRec.id);
      }

      console.log(`[Smart Connect] Connection request created: ${createdRequest.id}`);

      return res.status(201).json({
        success: true,
        connectionRequest: {
          id: createdRequest.id,
          recipientId: createdRequest.recipientId,
          message: createdRequest.message,
          status: createdRequest.status,
          matchScore: createdRequest.matchScore,
          mutualConnections: createdRequest.mutualConnections,
          requestedAt: createdRequest.requestedAt
          // DO NOT include: internal metadata, PII, system details
        },
        message: 'Connection request sent successfully'
      });

    } catch (error) {
      console.error('[Smart Connect] Error creating connection request:', error);
      return res.status(500).json({ 
        error: 'Failed to send connection request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/smart-connect/requests
   * Get connection requests for a user (both sent and received)
   */
  apiRouter.get('/smart-connect/requests', 
    requireSmartConnectAuth, 
    requireResourceOwnership('userId'), 
    smartConnectRateLimit, 
    logSmartConnectAccess,
    async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('[Smart Connect] Requests list request received:', req.query);
      
      const userId = parseInt(req.query.userId as string);
      const type = req.query.type as string; // 'sent', 'received', or 'all'
      
      if (isNaN(userId)) {
        return res.status(400).json({ 
          error: 'Invalid userId parameter',
          message: 'userId must be a valid number'
        });
      }

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: `User with ID ${userId} does not exist`
        });
      }

      console.log(`[Smart Connect] Getting ${type || 'all'} requests for user ${userId}`);

      // Get requests based on type
      let sentRequests: ConnectionRequest[] = [];
      let receivedRequests: ConnectionRequest[] = [];

      if (type === 'sent' || type === 'all' || !type) {
        sentRequests = await storage.getConnectionRequestsByRequester(userId);
      }

      if (type === 'received' || type === 'all' || !type) {
        receivedRequests = await storage.getConnectionRequestsByRecipient(userId);
      }

      // Get PUBLIC user details for all requests (PII-safe response)
      const enrichedSentRequests = await Promise.all(
        sentRequests.map(async (request) => {
          const recipientUser = await storage.getUser(request.recipientId);
          return {
            id: request.id,
            type: 'sent' as const,
            recipientUser: {
              id: recipientUser?.id,
              name: recipientUser?.name, // Public field
              title: recipientUser?.title, // Public field
              photoURL: recipientUser?.photoURL, // Public field
              location: recipientUser?.location, // Public field
              industry: recipientUser?.industry, // Public field
              // DO NOT include: email, phone, aboutMe, private profile data
            },
            // Include only necessary request details
            message: request.message, // User's own message
            status: request.status,
            matchScore: request.matchScore,
            mutualConnections: request.mutualConnections,
            requestedAt: request.requestedAt,
            respondedAt: request.respondedAt,
            responseMessage: request.responseMessage
            // DO NOT include: internal metadata, full request details
          };
        })
      );

      const enrichedReceivedRequests = await Promise.all(
        receivedRequests.map(async (request) => {
          const requesterUser = await storage.getUser(request.requesterId);
          return {
            id: request.id,
            type: 'received' as const,
            requesterUser: {
              id: requesterUser?.id,
              name: requesterUser?.name, // Public field
              title: requesterUser?.title, // Public field
              photoURL: requesterUser?.photoURL, // Public field
              location: requesterUser?.location, // Public field
              industry: requesterUser?.industry, // Public field
              // DO NOT include: email, phone, aboutMe, private profile data
            },
            // Include only necessary request details
            message: request.message,
            status: request.status,
            matchScore: request.matchScore,
            mutualConnections: request.mutualConnections,
            requestedAt: request.requestedAt,
            respondedAt: request.respondedAt,
            responseMessage: request.responseMessage
            // DO NOT include: internal metadata, full request details
          };
        })
      );

      const allRequests = [...enrichedSentRequests, ...enrichedReceivedRequests]
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

      // Calculate summary statistics
      const summary = {
        total: allRequests.length,
        sent: enrichedSentRequests.length,
        received: enrichedReceivedRequests.length,
        pending: allRequests.filter(req => req.status === 'pending').length,
        accepted: allRequests.filter(req => req.status === 'accepted').length,
        declined: allRequests.filter(req => req.status === 'declined').length,
      };

      console.log(`[Smart Connect] Returning ${allRequests.length} requests`);

      return res.status(200).json({
        success: true,
        requests: allRequests,
        summary,
        userId: userId,
        requestType: type || 'all',
        retrievedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('[Smart Connect] Error getting requests:', error);
      return res.status(500).json({ 
        error: 'Failed to get connection requests',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * PUT /api/smart-connect/requests/:id/respond
   * Respond to a connection request (accept/decline)
   */
  apiRouter.put('/smart-connect/requests/:id/respond', 
    requireSmartConnectAuth, 
    smartConnectRateLimit, 
    logSmartConnectAccess,
    async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { action, responseMessage } = req.body; // action: 'accept' or 'decline'
      
      if (isNaN(requestId)) {
        return res.status(400).json({ 
          error: 'Invalid request ID',
          message: 'Request ID must be a valid number'
        });
      }

      if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ 
          error: 'Invalid action',
          message: 'Action must be either "accept" or "decline"'
        });
      }

      console.log(`[Smart Connect] ${action} request ${requestId}`);

      if (action === 'accept') {
        const result = await storage.acceptConnectionRequest(requestId, responseMessage);
        return res.status(200).json({
          success: true,
          connectionRequest: result.connectionRequest,
          userConnection: result.userConnection,
          message: 'Connection request accepted successfully'
        });
      } else {
        const result = await storage.declineConnectionRequest(requestId, responseMessage);
        return res.status(200).json({
          success: true,
          connectionRequest: result,
          message: 'Connection request declined'
        });
      }

    } catch (error) {
      console.error('[Smart Connect] Error responding to request:', error);
      return res.status(500).json({ 
        error: 'Failed to respond to connection request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Mount the router on the app
  app.use('/api', apiRouter);
}