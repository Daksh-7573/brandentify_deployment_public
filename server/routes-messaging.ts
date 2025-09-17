/**
 * Messaging API Routes
 */
import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { insertMessageSchema } from "@shared/message-schema";
import * as messageService from "./services/message-service";
import { requireAuth, type AuthenticatedRequest } from "./middleware/jwt-auth-middleware";
import { validateCSRFMiddleware, provideCSRFToken } from "./middleware/csrf-middleware";

const router = Router();

// Apply authentication to all routes
router.use(requireAuth as any);
// Provide CSRF tokens for authenticated users
router.use(provideCSRFToken as any);
// Apply CSRF validation (middleware automatically exempts GET requests)
router.use(validateCSRFMiddleware as any);

/**
 * Get all conversations for the current user
 */
router.get("/conversations", async (req, res) => {
  try {
    // SECURITY: Use authenticated user ID only, never client-supplied ID
    const userId = (req as AuthenticatedRequest).user.id;
    
    const conversations = await messageService.getConversationsForUser(userId);
    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

/**
 * Get a single conversation
 */
router.get("/conversations/:id", async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }
    
    const conversation = await messageService.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

/**
 * Create a new conversation
 */
router.post("/conversations", async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      isGroup: z.boolean().default(false),
      participantIds: z.array(z.number()).min(1)
    });
    
    const { name, isGroup, participantIds } = schema.parse(req.body);
    
    // SECURITY: Use authenticated user as creator, never trust client-supplied ID
    const creatorId = (req as AuthenticatedRequest).user.id;
    
    // Ensure creator is in participants
    if (!participantIds.includes(creatorId)) {
      participantIds.push(creatorId);
    }
    
    // Ensure at least 2 participants for a conversation
    if (participantIds.length < 2) {
      return res.status(400).json({ error: "Conversation must have at least 2 participants" });
    }
    
    const result = await messageService.createConversation(
      {
        name,
        creatorId,
        isGroup,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      participantIds
    );
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating conversation:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

/**
 * Get or create a direct conversation between two users
 */
router.post("/conversations/direct", async (req, res) => {
  try {
    const schema = z.object({
      otherUserId: z.number()
    });
    
    const { otherUserId } = schema.parse(req.body);
    
    // SECURITY: Use authenticated user as one participant, client only provides the other user
    const currentUserId = (req as AuthenticatedRequest).user.id;
    
    if (currentUserId === otherUserId) {
      return res.status(400).json({ error: "Cannot create a conversation with yourself" });
    }
    
    const conversation = await messageService.getOrCreateDirectConversation(currentUserId, otherUserId);
    res.json(conversation);
  } catch (error) {
    console.error("Error with direct conversation:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Get messages for a conversation
 */
router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const limit = Number(req.query.limit) || 20;
    const before = req.query.before as string;
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }
    
    const messages = await messageService.getMessages(conversationId, limit, before);
    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

/**
 * Send a message in a conversation
 */
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }
    
    const schema = insertMessageSchema.extend({
      // Additional validation on fields as needed
      content: z.string().min(1)
    });
    
    const messageData = schema.parse({
      ...req.body,
      conversationId
    });
    
    const message = await messageService.sendMessage(messageData);
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Mark all messages in a conversation as read
 */
router.patch("/conversations/:id/read", async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const userId = Number(req.body.userId);
    
    if (isNaN(conversationId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }
    
    const result = await messageService.markConversationAsRead(conversationId, userId);
    res.json(result);
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ error: "Failed to mark conversation as read" });
  }
});

/**
 * Add users to a group conversation
 */
router.post("/conversations/:id/participants", async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }
    
    const schema = z.object({
      userIds: z.array(z.number()).min(1)
    });
    
    const { userIds } = schema.parse(req.body);
    
    // SECURITY: Use authenticated user as the one adding participants
    const addedByUserId = (req as AuthenticatedRequest).user.id;
    
    const result = await messageService.addUsersToConversation(
      conversationId,
      userIds,
      addedByUserId
    );
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding participants:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Leave a conversation
 */
router.delete("/conversations/:id/participants", async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }
    
    // SECURITY: User can only leave conversations themselves, not specify another user
    const userId = (req as AuthenticatedRequest).user.id;
    
    const result = await messageService.leaveConversation(conversationId, userId);
    res.json(result);
  } catch (error) {
    console.error("Error leaving conversation:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Delete a message (soft delete)
 */
router.delete("/messages/:id", async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // SECURITY: User can only delete their own messages
    const userId = (req as AuthenticatedRequest).user.id;
    
    const result = await messageService.deleteMessage(messageId, userId);
    res.json(result);
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Get unread message count for a user
 */
router.get("/unread/count", async (req, res) => {
  try {
    // SECURITY: Use authenticated user ID only, never client-supplied ID
    const userId = (req as AuthenticatedRequest).user.id;
    
    console.log(`[GET /messaging/unread/count] Getting unread count for authenticated user: ${userId}`);
    
    const result = await messageService.getTotalUnreadMessageCount(userId);
    res.json(result);
  } catch (error) {
    console.error("Error getting unread message count:", error);
    res.status(500).json({ error: "Failed to get unread message count" });
  }
});

export default router;