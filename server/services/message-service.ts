/**
 * Message Service - Handles chat functionality
 */
import { db } from "../db";
import { 
  conversations, 
  conversationParticipants, 
  messages, 
  readReceipts,
  type InsertMessage,
  type InsertConversation,
  type InsertConversationParticipant,
  type InsertReadReceipt
} from "@shared/message-schema";
import { eq, and, or, desc, sql, isNull } from "drizzle-orm";
import { storage } from "../storage";

/**
 * Create a new conversation
 * @param conversation Conversation data
 * @param participantIds User IDs to add to the conversation
 * @returns The created conversation with participants
 */
export async function createConversation(
  conversation: InsertConversation, 
  participantIds: number[]
) {
  // Insert the conversation
  const [createdConversation] = await db
    .insert(conversations)
    .values(conversation)
    .returning();
    
  // Add all participants
  const participantsToAdd: InsertConversationParticipant[] = participantIds.map(userId => ({
    conversationId: createdConversation.id,
    userId,
    isAdmin: userId === conversation.creatorId, // Creator is admin by default
    joinedAt: new Date()
  }));
  
  const addedParticipants = await db
    .insert(conversationParticipants)
    .values(participantsToAdd)
    .returning();
    
  return {
    conversation: createdConversation,
    participants: addedParticipants
  };
}

/**
 * Get conversations for a user
 * @param userId User ID
 * @returns List of conversations with last message and unread count
 */
export async function getConversationsForUser(userId: number) {
  // Get all conversation IDs this user is part of
  const userParticipations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.userId, userId),
        isNull(conversationParticipants.leftAt)
      )
    );
    
  const conversationIds = userParticipations.map(p => p.conversationId);
  
  if (conversationIds.length === 0) {
    return [];
  }
  
  // Get the conversations with additional data
  const conversationsWithData = [];
  
  for (const convId of conversationIds) {
    // Get the conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId));
      
    if (!conversation) continue;
    
    // Get the last message
    const [lastMessage] = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, convId),
          eq(messages.isDeleted, false)
        )
      )
      .orderBy(desc(messages.sentAt))
      .limit(1);
      
    // Get all participants
    const participants = await db
      .select({
        id: conversationParticipants.id,
        userId: conversationParticipants.userId,
        isAdmin: conversationParticipants.isAdmin,
        joinedAt: conversationParticipants.joinedAt
      })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, convId),
          isNull(conversationParticipants.leftAt)
        )
      );
      
    // Get participant user details
    const participantsWithDetails = [];
    for (const participant of participants) {
      const user = await storage.getUser(participant.userId);
      if (user) {
        participantsWithDetails.push({
          ...participant,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            photoURL: user.photoURL,
            title: user.title
          }
        });
      }
    }
    
    // Count unread messages
    const unreadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .leftJoin(
        readReceipts,
        and(
          eq(readReceipts.messageId, messages.id),
          eq(readReceipts.userId, userId)
        )
      )
      .where(
        and(
          eq(messages.conversationId, convId),
          eq(messages.isDeleted, false),
          isNull(readReceipts.id),
          sql`${messages.sender_id} != ${userId}`
        )
      );
    
    conversationsWithData.push({
      ...conversation,
      lastMessage,
      participants: participantsWithDetails,
      unreadCount: unreadCount[0]?.count || 0
    });
  }
  
  return conversationsWithData;
}

/**
 * Get messages for a conversation
 * @param conversationId Conversation ID
 * @param limit Number of messages to return
 * @param before Message ID to get messages before
 * @returns List of messages
 */
export async function getMessages(
  conversationId: number, 
  limit: number = 20, 
  before?: string
) {
  let query = db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      sentAt: messages.sentAt,
      readAt: messages.readAt,
      replyToId: messages.replyToId
    })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isDeleted, false)
      )
    )
    .orderBy(desc(messages.sentAt))
    .limit(limit);
    
  if (before) {
    // Get the message to find messages before it
    const [beforeMessage] = await db
      .select({ sentAt: messages.sentAt })
      .from(messages)
      .where(eq(messages.id, before));
      
    if (beforeMessage) {
      query = query.where(
        sql`${messages.sent_at} < ${beforeMessage.sentAt}`
      );
    }
  }
  
  const messagesResult = await query;
  
  // Enhance messages with sender info
  const enhancedMessages = [];
  for (const msg of messagesResult) {
    const sender = await storage.getUser(msg.senderId);
    
    enhancedMessages.push({
      ...msg,
      sender: sender ? {
        id: sender.id,
        name: sender.name,
        username: sender.username,
        photoURL: sender.photoURL,
        title: sender.title
      } : null
    });
  }
  
  return enhancedMessages;
}

/**
 * Send a message in a conversation
 * @param messageData Message data
 * @returns The sent message
 */
export async function sendMessage(messageData: InsertMessage) {
  // Check if user is in the conversation
  const [isParticipant] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, messageData.conversationId),
        eq(conversationParticipants.userId, messageData.senderId),
        isNull(conversationParticipants.leftAt)
      )
    );
    
  if (!isParticipant) {
    throw new Error("User is not a participant in this conversation");
  }
  
  // Insert the message
  const [createdMessage] = await db
    .insert(messages)
    .values(messageData)
    .returning();
    
  // Update conversation's updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, messageData.conversationId));
    
  return createdMessage;
}

/**
 * Mark messages as read for a user
 * @param conversationId Conversation ID
 * @param userId User ID
 * @returns Read receipt data
 */
export async function markConversationAsRead(conversationId: number, userId: number) {
  // Find all unread messages for this user in this conversation
  const unreadMessages = await db
    .select({ id: messages.id })
    .from(messages)
    .leftJoin(
      readReceipts,
      and(
        eq(readReceipts.messageId, messages.id),
        eq(readReceipts.userId, userId)
      )
    )
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isDeleted, false),
        sql`${messages.sender_id} != ${userId}`,
        isNull(readReceipts.id)
      )
    );
    
  if (unreadMessages.length === 0) {
    return { markedAsRead: 0 };
  }
  
  // Create read receipts for all unread messages
  const readReceiptsToAdd: InsertReadReceipt[] = unreadMessages.map(msg => ({
    messageId: msg.id,
    userId,
    readAt: new Date()
  }));
  
  const addedReadReceipts = await db
    .insert(readReceipts)
    .values(readReceiptsToAdd)
    .returning();
    
  return { 
    markedAsRead: addedReadReceipts.length 
  };
}

/**
 * Add users to a conversation
 * @param conversationId Conversation ID
 * @param userIds User IDs to add
 * @param addedByUserId User ID who is adding new participants
 * @returns Added participants
 */
export async function addUsersToConversation(
  conversationId: number, 
  userIds: number[], 
  addedByUserId: number
) {
  // Check if user adding others is an admin
  const [isAdmin] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, addedByUserId),
        eq(conversationParticipants.isAdmin, true),
        isNull(conversationParticipants.leftAt)
      )
    );
    
  if (!isAdmin) {
    throw new Error("Only admins can add users to a conversation");
  }
  
  // Get the conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));
    
  if (!conversation) {
    throw new Error("Conversation not found");
  }
  
  if (!conversation.isGroup) {
    throw new Error("Cannot add users to a direct message conversation");
  }
  
  // Add participants
  const participantsToAdd: InsertConversationParticipant[] = userIds.map(userId => ({
    conversationId,
    userId,
    isAdmin: false,
    joinedAt: new Date()
  }));
  
  const addedParticipants = await db
    .insert(conversationParticipants)
    .values(participantsToAdd)
    .returning();
    
  return addedParticipants;
}

/**
 * Get a single conversation by ID
 * @param conversationId Conversation ID
 * @returns Conversation with participants
 */
export async function getConversation(conversationId: number) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));
    
  if (!conversation) {
    return null;
  }
  
  // Get participants
  const participants = await db
    .select({
      id: conversationParticipants.id,
      userId: conversationParticipants.userId,
      isAdmin: conversationParticipants.isAdmin,
      joinedAt: conversationParticipants.joinedAt
    })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        isNull(conversationParticipants.leftAt)
      )
    );
    
  // Get participant user details
  const participantsWithDetails = [];
  for (const participant of participants) {
    const user = await storage.getUser(participant.userId);
    if (user) {
      participantsWithDetails.push({
        ...participant,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          photoURL: user.photoURL,
          title: user.title
        }
      });
    }
  }
  
  return {
    ...conversation,
    participants: participantsWithDetails
  };
}

/**
 * Leave a conversation
 * @param conversationId Conversation ID
 * @param userId User ID
 * @returns Result of operation
 */
export async function leaveConversation(conversationId: number, userId: number) {
  // Update participant record to indicate user has left
  const [updated] = await db
    .update(conversationParticipants)
    .set({ leftAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
        isNull(conversationParticipants.leftAt)
      )
    )
    .returning();
    
  if (!updated) {
    throw new Error("User is not a participant in this conversation");
  }
  
  return { success: true };
}

/**
 * Delete a message (soft delete)
 * @param messageId Message ID
 * @param userId User ID requesting deletion
 * @returns Result of operation
 */
export async function deleteMessage(messageId: string, userId: number) {
  // Check if user is the sender of the message
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId));
    
  if (!message) {
    throw new Error("Message not found");
  }
  
  if (message.senderId !== userId) {
    throw new Error("Only the sender can delete a message");
  }
  
  // Soft delete the message
  const [updated] = await db
    .update(messages)
    .set({ isDeleted: true })
    .where(eq(messages.id, messageId))
    .returning();
    
  return { success: !!updated };
}

/**
 * Get or create a direct message conversation between two users
 * @param user1Id First user ID
 * @param user2Id Second user ID
 * @returns Conversation data
 */
export async function getOrCreateDirectConversation(user1Id: number, user2Id: number) {
  // Check if these users already have a direct conversation
  // Find conversations where both users are participants
  const user1Conversations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.userId, user1Id),
        isNull(conversationParticipants.leftAt)
      )
    );
    
  const user2Conversations = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.userId, user2Id),
        isNull(conversationParticipants.leftAt)
      )
    );
    
  // Find common conversations
  const commonConversationIds = user1Conversations
    .map(c => c.conversationId)
    .filter(id => user2Conversations.some(c => c.conversationId === id));
    
  // Check each common conversation to see if it's a direct message (non-group) with just these two users
  for (const conversationId of commonConversationIds) {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.isGroup, false)
        )
      );
      
    if (conversation) {
      // Count current participants to ensure it's just these two users
      const participantCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            isNull(conversationParticipants.leftAt)
          )
        );
        
      if (participantCount[0]?.count === 2) {
        // This is a direct conversation between these two users
        return await getConversation(conversationId);
      }
    }
  }
  
  // No existing direct conversation found, create one
  const user1 = await storage.getUser(user1Id);
  const user2 = await storage.getUser(user2Id);
  
  if (!user1 || !user2) {
    throw new Error("One or both users not found");
  }
  
  // Create conversation name from both users
  const conversationName = `${user1.name || user1.username} and ${user2.name || user2.username}`;
  
  const result = await createConversation(
    {
      name: conversationName,
      isGroup: false,
      creatorId: user1Id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    [user1Id, user2Id]
  );
  
  return await getConversation(result.conversation.id);
}