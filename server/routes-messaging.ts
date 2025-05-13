/**
 * Messaging API Routes
 */
import { Router } from "express";
import { z } from "zod";
import { insertMessageSchema } from "@shared/message-schema";
import * as messageService from "./services/message-service";

const router = Router();

/**
 * Get all conversations for the current user
 */
router.get("/conversations", async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
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
      creatorId: z.number(),
      isGroup: z.boolean().default(false),
      participantIds: z.array(z.number()).min(1)
    });
    
    const { name, creatorId, isGroup, participantIds } = schema.parse(req.body);
    
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
      user1Id: z.number(),
      user2Id: z.number()
    });
    
    const { user1Id, user2Id } = schema.parse(req.body);
    
    if (user1Id === user2Id) {
      return res.status(400).json({ error: "Cannot create a conversation with yourself" });
    }
    
    const conversation = await messageService.getOrCreateDirectConversation(user1Id, user2Id);
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
      userIds: z.array(z.number()).min(1),
      addedByUserId: z.number()
    });
    
    const { userIds, addedByUserId } = schema.parse(req.body);
    
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
    const userId = Number(req.query.userId);
    
    if (isNaN(conversationId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }
    
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
    const userId = Number(req.query.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
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
    const userIdParam = req.query.userId as string;
    
    // First check if this is a Firebase UID (string) or a numeric ID
    const isFirebaseUid = /^[A-Za-z0-9]{20,}$/.test(userIdParam);
    let userId: number;
    
    if (isFirebaseUid) {
      // If this is a Firebase UID, try to find the user in the database
      console.log(`[GET /messaging/unread/count] Looking up user with Firebase UID: ${userIdParam}`);
      
      try {
        // Look up the user by the Firebase UID which is stored as the username
        const storage = (await import('./storage')).storage;
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /messaging/unread/count] No user found with Firebase UID: ${userIdParam}`);
          // Return 0 count rather than error for better UX
          return res.json({ count: 0 });
        }
        
        // Use the numeric user ID from the database
        userId = user.id;
        console.log(`[GET /messaging/unread/count] Found user with ID: ${userId} for Firebase UID: ${userIdParam}`);
      } catch (lookupError) {
        console.error('Error looking up user by Firebase UID:', lookupError);
        // Return 0 count rather than error for better UX
        return res.json({ count: 0 });
      }
    } else {
      // If this is a numeric ID, parse it
      userId = Number(userIdParam);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
    }
    
    const result = await messageService.getTotalUnreadMessageCount(userId);
    res.json(result);
  } catch (error) {
    console.error("Error getting unread message count:", error);
    res.status(500).json({ error: "Failed to get unread message count" });
  }
});

export default router;