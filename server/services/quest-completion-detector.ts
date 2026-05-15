import { pool } from "../db";
import { completeQuest } from "./quest-progress-service";

export type QuestActionType =
  | "create_pulse"
  | "add_project"
  | "add_portfolio_project"
  | "update_profile_field"
  | "connect_with_user"
  | "publish_portfolio_project";

type CompletionMetadata = Record<string, unknown>;

class QuestCompletionDetectorService {
  private normalizeTargetActions(actionType: QuestActionType): string[] {
    if (actionType === "add_project" || actionType === "add_portfolio_project") {
      return ["add_project", "add_portfolio_project"];
    }

    return [actionType];
  }

  public async detectCompletion(
    userId: number,
    actionType: QuestActionType,
    metadata: CompletionMetadata = {}
  ): Promise<number> {
    try {
      const targetActions = this.normalizeTargetActions(actionType);

      const activeQuests = await pool.query(
        `
          SELECT
            uq.id,
            qd.id AS quest_definition_id,
            qd.title,
            qd.target_action,
            qd.xp_reward,
            COALESCE(qd.verification_method, 'manual') AS verification_method
          FROM user_quests uq
          JOIN quest_definitions qd ON qd.id = uq.quest_definition_id
          WHERE uq.user_id = $1
            AND uq.status = 'active'
            AND qd.target_action = ANY($2)
            AND (
              COALESCE(qd.verification_method, 'manual') = 'database_event'
              OR COALESCE(qd.verification_method, 'manual') = 'hybrid'
            )
        `,
        [userId, targetActions]
      );

      if (activeQuests.rows.length === 0) {
        return 0;
      }

      let completedCount = 0;

      for (const quest of activeQuests.rows) {
        const completionResult = await completeQuest(quest.id, userId);
        if (!completionResult) {
          continue;
        }

        completedCount += 1;
        console.log("[QuestEngine] Quest auto-completed");
        console.log(`User: ${userId}`);
        console.log(`Action: ${actionType}`);
        console.log(`QuestId: ${quest.id}`);
        console.log(`XP Awarded: ${completionResult.xpEarned ?? quest.xp_reward ?? 0}`);
        console.log(`Metadata: ${JSON.stringify(metadata)}`);
      }

      return completedCount;
    } catch (error) {
      console.error("[QuestEngine] Failed to detect quest completion:", {
        userId,
        actionType,
        metadata,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }
}

export const QuestCompletionDetector = new QuestCompletionDetectorService();
