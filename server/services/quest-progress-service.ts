/**
 * Quest Progress Service
 * 
 * This service handles updating quest progress and manages
 * the logic for determining when quests are completed.
 * 
 * OPTIMIZED VERSION:
 * - Combined database queries where possible
 * - Simplified XP tracking logic
 * - Improved error handling and logging
 */

import { pool } from '../db';

/**
 * Update quest progress for a specific quest and user
 * Returns the updated quest data if successful, null otherwise
 * Simplified for engagement quests only - updated to removed dismissed quest functionality
 */
export async function updateQuestProgress(questId: number, userId: number, progress: number): Promise<any | null> {
  try {
    console.log(`[updateQuestProgress] Updating progress for quest ${questId}, user ${userId} to ${progress}`);
    
    // Get the quest and definition in a single query to reduce database calls
    const combinedResult = await pool.query(`
      SELECT 
        uq.*,
        qd.title as quest_title,
        qd.target_count,
        qd.xp_reward,
        qd.badge_reward,
        qd.musk_tip
      FROM user_quests uq
      JOIN quest_definitions qd ON uq.quest_definition_id = qd.id
      WHERE uq.id = $1 AND uq.user_id = $2 AND uq.status = 'active'
    `, [questId, userId]);
    
    if (combinedResult.rows.length === 0) {
      console.log(`[updateQuestProgress] Quest ${questId} not found or not active for user ${userId}`);
      return null;
    }
    
    const questData = combinedResult.rows[0];
    const targetCount = questData.target_count;
    
    // Calculate new status and completed_at
    let newStatus = 'active'; // Default to active
    let completedAt = null;
    let xpEarned = 0;
    let badgeEarned = null;
    
    // If progress meets or exceeds target count, mark as completed
    if (progress >= targetCount) {
      console.log(`[updateQuestProgress] Quest ${questId} completed by user ${userId}`);
      newStatus = 'completed';
      completedAt = new Date();
      xpEarned = questData.xp_reward || 0;
      badgeEarned = questData.badge_reward;
      
      // If quest has XP reward, update user XP balance
      if (xpEarned > 0) {
        try {
          await updateUserXp(userId, xpEarned, questData.quest_title || 'Quest completion');
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
 * Simplified to focus on essential functionality
 * Updated to use the simplified user_xp schema (no monthly tracking)
 */
async function updateUserXp(userId: number, xpAmount: number, source: string): Promise<void> {
  try {
    console.log(`[updateUserXp] Updating XP for user ${userId}, amount: ${xpAmount}, source: ${source}`);
    const now = new Date();
    
    // Use a transaction to ensure data consistency
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get or create user XP record with a single query (simplified schema)
      await client.query(`
        INSERT INTO user_xp (user_id, balance, lifetime_earned, last_earned_at, updated_at)
        VALUES ($1, $2, $3, $4, $4)
        ON CONFLICT (user_id) DO UPDATE
        SET 
          balance = user_xp.balance + $2,
          lifetime_earned = user_xp.lifetime_earned + $3,
          last_earned_at = $4,
          updated_at = $4
      `, [userId, xpAmount, xpAmount, now]);
      
      // Record XP transaction
      await client.query(`
        INSERT INTO xp_transactions (user_id, amount, source, description, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, xpAmount, 'quest_completion', source, now]);
      
      await client.query('COMMIT');
      console.log(`[updateUserXp] Successfully updated XP and recorded transaction for user ${userId}`);
    } catch (txError) {
      await client.query('ROLLBACK');
      console.error('[updateUserXp] Transaction error:', txError);
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[updateUserXp] Error in XP update process:', error);
    throw error;
  }
}