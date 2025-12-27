import { Router, Request, Response } from "express";
import { db, pool } from "./db";
import { eq, inArray, and, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

const router = Router();

router.get("/api/feed/batch/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const pulseIdsParam = req.query.pulseIds as string;
    if (!pulseIdsParam) {
      return res.status(400).json({ error: "pulseIds query parameter required" });
    }

    const pulseIds = pulseIdsParam.split(",").map((id) => parseInt(id)).filter((id) => !isNaN(id));
    
    if (pulseIds.length === 0) {
      return res.json({ reactions: {}, pollVotes: {}, flagStatus: {}, userVotes: {} });
    }

    const [reactionsResult, pollVotesResult, flagsResult, userVotesResult, quotaResult] = await Promise.all([
      db.select().from(schema.pulseReactions).where(inArray(schema.pulseReactions.pulseId, pulseIds)),
      db.select().from(schema.pollVotes).where(inArray(schema.pollVotes.pulseId, pulseIds)),
      db.select().from(schema.pulseFlags).where(
        and(
          inArray(schema.pulseFlags.pulseId, pulseIds),
          eq(schema.pulseFlags.flaggedByUserId, userId)
        )
      ),
      db.select().from(schema.pollVotes).where(
        and(
          inArray(schema.pollVotes.pulseId, pulseIds),
          eq(schema.pollVotes.userId, userId)
        )
      ),
      getReactionQuota(userId),
    ]);

    const reactions: Record<number, typeof reactionsResult> = {};
    reactionsResult.forEach((r) => {
      if (!reactions[r.pulseId]) reactions[r.pulseId] = [];
      reactions[r.pulseId].push(r);
    });

    const pollVotes: Record<number, typeof pollVotesResult> = {};
    pollVotesResult.forEach((v) => {
      if (!pollVotes[v.pulseId]) pollVotes[v.pulseId] = [];
      pollVotes[v.pulseId].push(v);
    });

    const flagStatus: Record<number, boolean> = {};
    pulseIds.forEach((id) => {
      flagStatus[id] = flagsResult.some((f) => f.pulseId === id);
    });

    const userVotes: Record<number, number | null> = {};
    userVotesResult.forEach((v) => {
      userVotes[v.pulseId] = v.optionIndex;
    });

    res.json({
      reactions,
      pollVotes,
      flagStatus,
      userVotes,
      reactionQuota: quotaResult,
    });
  } catch (error) {
    console.error("[Feed Batch API] Error:", error);
    res.status(500).json({ error: "Failed to fetch batch data" });
  }
});

async function getReactionQuota(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysReactions = await db
    .select()
    .from(schema.pulseReactions)
    .where(
      and(
        eq(schema.pulseReactions.userId, userId),
        sql`${schema.pulseReactions.createdAt} >= ${today}`
      )
    );

  const insightfulCount = todaysReactions.filter((r) => r.reactionType === "insightful").length;
  const misinformedCount = todaysReactions.filter((r) => r.reactionType === "misinformed").length;

  const MAX_DAILY = 10;
  return {
    insightful: { used: insightfulCount, remaining: MAX_DAILY - insightfulCount, max: MAX_DAILY },
    misinformed: { used: misinformedCount, remaining: MAX_DAILY - misinformedCount, max: MAX_DAILY },
  };
}

export default router;
