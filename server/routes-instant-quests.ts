/**
 * Instant Quest Routes
 * 
 * API endpoints for trend-based instant quest system:
 * - GET /api/instant-quests/pending - Get user's pending instant quests
 * - POST /api/instant-quests/:id/accept - Accept an instant quest
 * - POST /api/instant-quests/:id/dismiss - Dismiss an instant quest
 * - GET /api/instant-quests/stats - Get instant quest statistics
 */

import { Router } from "express";
import { db } from "./db";
import { instantQuests, questDefinitions } from "@shared/schema";
import { eq, and, gte } from "drizzle-orm";

export function setupInstantQuestsRoutes(apiRouter: Router) {
  
  /**
   * Get pending instant quests for a user (optionally filtered by quest_type)
   */
  apiRouter.get("/instant-quests/pending/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const questType = req.query.questType as string | undefined; // 'career' or 'social'
      const now = new Date();

      // Build where conditions
      const whereConditions = [
        eq(instantQuests.userId, userId),
        eq(instantQuests.status, "pending"),
        gte(instantQuests.expiresAt, now)
      ];

      // Add quest type filter if provided
      if (questType === 'career' || questType === 'social') {
        whereConditions.push(eq(instantQuests.questType, questType));
      }

      // Get pending instant quests that haven't expired
      const pendingQuests = await db
        .select()
        .from(instantQuests)
        .where(and(...whereConditions))
        .orderBy(instantQuests.createdAt);

      // Get quest definitions for each quest
      const questsWithDefinitions = await Promise.all(
        pendingQuests.map(async (quest) => {
          const questDef = quest.questDefinitionId
            ? await db
                .select()
                .from(questDefinitions)
                .where(eq(questDefinitions.id, quest.questDefinitionId))
                .limit(1)
            : [];

          return {
            ...quest,
            questDefinition: questDef[0] || null
          };
        })
      );

      res.json(questsWithDefinitions);
    } catch (error) {
      console.error("[GET /instant-quests/pending/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch pending instant quests" });
    }
  });

  /**
   * Accept an instant quest (converts it to a regular user quest)
   */
  apiRouter.post("/instant-quests/:id/accept", async (req, res) => {
    try {
      const questId = parseInt(req.params.id);
      if (isNaN(questId)) {
        return res.status(400).json({ message: "Invalid quest ID" });
      }

      // Update instant quest status to accepted
      const [updatedQuest] = await db
        .update(instantQuests)
        .set({
          status: "accepted",
          acceptedAt: new Date()
        })
        .where(eq(instantQuests.id, questId))
        .returning();

      if (!updatedQuest) {
        return res.status(404).json({ message: "Instant quest not found" });
      }

      // TODO: Create a regular user quest from this instant quest
      // This would involve:
      // 1. Getting the quest definition
      // 2. Creating a new user_quest record
      // 3. Customizing the narrative with the trending topic context

      res.json({ 
        message: "Instant quest accepted", 
        quest: updatedQuest
      });
    } catch (error) {
      console.error(`[POST /instant-quests/${req.params.id}/accept] Error:`, error);
      res.status(500).json({ message: "Failed to accept instant quest" });
    }
  });

  /**
   * Dismiss an instant quest
   */
  apiRouter.post("/instant-quests/:id/dismiss", async (req, res) => {
    try {
      const questId = parseInt(req.params.id);
      if (isNaN(questId)) {
        return res.status(400).json({ message: "Invalid quest ID" });
      }

      // Update instant quest status to dismissed
      const [updatedQuest] = await db
        .update(instantQuests)
        .set({
          status: "dismissed",
          dismissedAt: new Date()
        })
        .where(eq(instantQuests.id, questId))
        .returning();

      if (!updatedQuest) {
        return res.status(404).json({ message: "Instant quest not found" });
      }

      res.json({ message: "Instant quest dismissed", quest: updatedQuest });
    } catch (error) {
      console.error(`[POST /instant-quests/${req.params.id}/dismiss] Error:`, error);
      res.status(500).json({ message: "Failed to dismiss instant quest" });
    }
  });

  /**
   * Get instant quest statistics for a user
   */
  apiRouter.get("/instant-quests/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const allQuests = await db
        .select()
        .from(instantQuests)
        .where(eq(instantQuests.userId, userId));

      const stats = {
        total: allQuests.length,
        pending: allQuests.filter(q => q.status === "pending").length,
        accepted: allQuests.filter(q => q.status === "accepted").length,
        dismissed: allQuests.filter(q => q.status === "dismissed").length,
        expired: allQuests.filter(q => q.status === "expired").length
      };

      res.json(stats);
    } catch (error) {
      console.error(`[GET /instant-quests/stats/${req.params.userId}] Error:`, error);
      res.status(500).json({ message: "Failed to fetch instant quest stats" });
    }
  });
}
