/**
 * Quest Progress Service
 * 
 * This service handles updating quest progress and manages
 * the logic for determining when quests are completed.
 */

import { pool } from '../db';

/**
 * Update quest progress for a specific quest and user
 * Returns the updated quest data if successful, null otherwise
 */
export async function updateQuestProgress(questId: number, userId: number, progress: number): Promise<any | null> {
  try {
    console.log(`[updateQuestProgress] Updating progress for quest ${questId}, user ${userId} to ${progress}`);
    
    // Check if user quest exists
    const result = await pool.query(`
      SELECT * FROM user_quests WHERE id = $1 AND user_id = $2
    `, [questId, userId]);
    
    if (result.rows.length === 0) {
      console.log(`[updateQuestProgress] Quest ${questId} not found for user ${userId}`);
      return null;
    }
    
    const userQuest = result.rows[0];
    const questDefinitionId = userQuest.quest_definition_id;
    
    // Get quest definition for target count
    const defResult = await pool.query(`
      SELECT * FROM quest_definitions WHERE id = $1
    `, [questDefinitionId]);
    
    if (defResult.rows.length === 0) {
      console.log(`[updateQuestProgress] Quest definition ${questDefinitionId} not found`);
      return null;
    }
    
    const questDefinition = defResult.rows[0];
    const targetCount = questDefinition.target_count;
    
    // Calculate new status and completed_at
    let newStatus = userQuest.status;
    let completedAt = userQuest.completed_at;
    let xpEarned = userQuest.xp_earned || 0;
    let badgeEarned = userQuest.badge_earned;
    
    // If progress meets or exceeds target count, mark as completed
    if (progress >= targetCount && userQuest.status === 'active') {
      console.log(`[updateQuestProgress] Quest ${questId} completed by user ${userId}`);
      newStatus = 'completed';
      completedAt = new Date();
      xpEarned = questDefinition.xp_reward || 0;
      badgeEarned = questDefinition.badge_reward;
      
      // If quest has XP reward, update user XP balance
      if (xpEarned > 0) {
        try {
          await updateUserXp(userId, xpEarned, questDefinition.title || 'Quest completion');
          console.log(`[updateQuestProgress] Awarded ${xpEarned} XP to user ${userId}`);
        } catch (xpError) {
          console.error('[updateQuestProgress] Error awarding XP:', xpError);
          // Continue with quest completion even if XP update fails
        }
      }
    }
    
    // Update the quest with new progress
    try {
      const updateResult = await pool.query(`
        UPDATE user_quests
        SET progress = $1, 
            status = $2,
            completed_at = $3,
            xp_earned = $4,
            badge_earned = $5
        WHERE id = $6 AND user_id = $7
        RETURNING 
          id,
          user_id as "userId",
          quest_definition_id as "questDefinitionId",
          status,
          progress,
          assigned_at as "assignedAt",
          completed_at as "completedAt",
          dismissed_reason as "dismissedReason",
          xp_earned as "xpEarned",
          badge_earned as "badgeEarned",
          musk_response as "muskResponse",
          week_number as "weekNumber",
          year
      `, [progress, newStatus, completedAt, xpEarned, badgeEarned, questId, userId]);
      
      if (updateResult.rows.length === 0) {
        console.log(`[updateQuestProgress] Failed to update quest ${questId} for user ${userId}`);
        return null;
      }
      
      console.log(`[updateQuestProgress] Successfully updated quest ${questId} to progress: ${progress}, status: ${newStatus}`);
      return updateResult.rows[0];
    } catch (updateError) {
      console.error('[updateQuestProgress] Error updating quest progress:', updateError);
      return null;
    }
  } catch (error) {
    console.error('[updateQuestProgress] Error in update process:', error);
    return null;
  }
}

/**
 * Update user XP balance when a quest is completed
 */
async function updateUserXp(userId: number, xpAmount: number, source: string): Promise<void> {
  try {
    console.log(`[updateUserXp] Updating XP for user ${userId}, amount: ${xpAmount}, source: ${source}`);
    
    // First check if user has an XP record
    const checkResult = await pool.query(`
      SELECT * FROM user_xp WHERE user_id = $1
    `, [userId]);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (checkResult.rows.length === 0) {
      // Create a new XP record
      console.log(`[updateUserXp] Creating new XP record for user ${userId}`);
      
      try {
        await pool.query(`
          INSERT INTO user_xp (
            user_id, 
            balance, 
            lifetime_earned, 
            current_month_earned, 
            current_month, 
            current_year,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [userId, xpAmount, xpAmount, xpAmount, currentMonth, currentYear, now]);
      } catch (insertError) {
        console.error('[updateUserXp] Error creating XP record:', insertError);
        throw insertError;
      }
    } else {
      // Update existing XP record
      console.log(`[updateUserXp] Updating existing XP record for user ${userId}`);
      
      const userXp = checkResult.rows[0];
      let monthlyXp = userXp.current_month_earned || 0;
      
      // If month has changed, reset monthly XP
      if (userXp.current_month !== currentMonth || userXp.current_year !== currentYear) {
        monthlyXp = xpAmount;
      } else {
        monthlyXp += xpAmount;
      }
      
      try {
        await pool.query(`
          UPDATE user_xp
          SET 
            balance = balance + $1,
            lifetime_earned = lifetime_earned + $2,
            current_month_earned = $3,
            current_month = $4,
            current_year = $5,
            updated_at = $6
          WHERE user_id = $7
        `, [xpAmount, xpAmount, monthlyXp, currentMonth, currentYear, now, userId]);
      } catch (updateError) {
        console.error('[updateUserXp] Error updating XP balance:', updateError);
        throw updateError;
      }
    }
    
    // Record XP transaction
    try {
      await pool.query(`
        INSERT INTO xp_transactions (
          user_id,
          amount,
          source,
          transaction_date
        ) VALUES ($1, $2, $3, $4)
      `, [userId, xpAmount, source, now]);
      
      console.log(`[updateUserXp] Recorded XP transaction for user ${userId}`);
    } catch (transactionError) {
      console.error('[updateUserXp] Error recording XP transaction:', transactionError);
      // Don't throw here, as we've already updated the XP balance
    }
    
  } catch (error) {
    console.error('[updateUserXp] Error in XP update process:', error);
    throw error;
  }
}