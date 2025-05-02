/**
 * Quest Progress Tracker Service
 * 
 * This service automatically updates quest progress when users perform actions
 * related to engagement quests (create pulses, comments, reactions, etc.)
 */

import { IStorage } from "../storage";
import { QuestDefinition, UserQuest } from "../../shared/schema";

type ActionType = 
  | 'create_pulse'
  | 'add_hashtag'
  | 'add_comment'
  | 'add_reaction_insightful'
  | 'add_reaction_misinformed'
  | 'share_pulse'
  | 'add_media';

/**
 * Update quest progress when user performs an action
 * @param storage The storage interface
 * @param userId User ID
 * @param actionType Type of action performed
 * @param count Optional count to increment by (default: 1)
 */
export async function trackUserAction(
  storage: IStorage,
  userId: number,
  actionType: ActionType,
  count: number = 1
): Promise<void> {
  try {
    // 1. Get user's active quests for the current week
    const currentWeekQuests = await storage.getCurrentWeekQuests(userId);
    if (!currentWeekQuests || currentWeekQuests.length === 0) {
      console.log(`[trackUserAction] No active quests found for user ${userId}`);
      return;
    }

    // 2. Get all quest definitions to match actions to target_action
    const questDefinitions = await storage.getQuestDefinitions();
    if (!questDefinitions || questDefinitions.length === 0) {
      console.log(`[trackUserAction] No quest definitions found`);
      return;
    }

    // 3. Map the user action to quest target_action values
    const targetActionMapping: Record<ActionType, string> = {
      'create_pulse': 'create_pulse',
      'add_hashtag': 'add_hashtag',
      'add_comment': 'add_comment',
      'add_reaction_insightful': 'add_reaction',
      'add_reaction_misinformed': 'add_reaction',
      'share_pulse': 'share_pulse',
      'add_media': 'add_media'
    };

    const targetAction = targetActionMapping[actionType];
    
    // 4. Find matching quests that track this type of action
    const matchingQuests = currentWeekQuests.filter(quest => {
      // Get the definition for this quest
      const definition = questDefinitions.find(
        def => def.id === quest.questDefinitionId
      );
      
      // Only return quests that are active and match the target action
      return (
        quest.status === 'active' && 
        definition?.targetAction === targetAction
      );
    });

    if (matchingQuests.length === 0) {
      console.log(`[trackUserAction] No matching quests found for action ${actionType}`);
      return;
    }

    // 5. Update progress for each matching quest
    for (const quest of matchingQuests) {
      console.log(`[trackUserAction] Updating progress for quest ${quest.id}, action ${actionType}`);
      
      // Get current progress and definition
      const currentProgress = quest.progress || 0;
      const definition = questDefinitions.find(def => def.id === quest.questDefinitionId);
      if (!definition) continue;

      // Calculate new progress
      const newProgress = currentProgress + count;
      
      // If new progress meets or exceeds target, complete the quest
      if (newProgress >= definition.targetCount) {
        console.log(`[trackUserAction] Quest ${quest.id} completed! New progress: ${newProgress}, Target: ${definition.targetCount}`);
        await storage.completeUserQuest(quest.id, definition.xpReward);
      } else {
        // Otherwise just update the progress
        console.log(`[trackUserAction] Updating quest ${quest.id} progress to ${newProgress}`);
        await storage.updateUserQuest(quest.id, { progress: newProgress });
      }
    }

    console.log(`[trackUserAction] Successfully processed action ${actionType} for user ${userId}`);
  } catch (error) {
    console.error(`[trackUserAction] Error tracking user action:`, error);
  }
}