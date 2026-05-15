/**
 * Quest Uniqueness Validator
 * 
 * Prevents duplicate quest assignments within a defined time window.
 * 
 * Validation Rules:
 * - Prevents duplicate if ANY match within last 14 days:
 *   • same questDefinitionId
 *   • same targetAction
 *   • same quest title (case-insensitive)
 *   • same deliverableFormat
 * 
 * Time Window: 14 days (configurable)
 */

import { pool } from '../db';
import crypto from 'crypto';

export interface QuestUniquenessCheckResult {
  isUnique: boolean;
  isDuplicate: boolean;
  duplicateReason?: string;
  conflictingQuestId?: number;
  conflictingAssignedDate?: Date;
  daysSinceLastAssignment?: number;
}

export interface QuestIdentifiers {
  questDefinitionId: number;
  targetAction: string;
  title: string;
  deliverableFormat?: string;
}

export class QuestUniquenessValidator {
  
  /**
   * Default time window for uniqueness check (in days)
   */
  private static readonly DEFAULT_UNIQUENESS_WINDOW_DAYS = 14;

  /**
   * Check if a quest is unique for a user within the time window
   */
  static async isQuestUnique(
    userId: number,
    questIdentifiers: QuestIdentifiers,
    windowDays: number = this.DEFAULT_UNIQUENESS_WINDOW_DAYS
  ): Promise<QuestUniquenessCheckResult> {
    try {
      console.log(`[QuestUniqueness] Checking uniqueness for user ${userId}, quest definition ${questIdentifiers.questDefinitionId}`);

      // Query for duplicate quests within time window
      const result = await pool.query(
        `
          SELECT 
            uq.id,
            uq.assigned_date,
            CURRENT_DATE - uq.assigned_date AS days_since_assignment,
            qd.title,
            qd.target_action,
            qd.deliverable_format,
            qd.id as quest_definition_id
          FROM user_quests uq
          JOIN quest_definitions qd ON qd.id = uq.quest_definition_id
          WHERE uq.user_id = $1
            AND uq.assigned_date >= CURRENT_DATE - INTERVAL '${windowDays} days'
            AND (
              qd.id = $2
              OR LOWER(qd.target_action) = LOWER($3)
              OR LOWER(qd.title) = LOWER($4)
              OR (qd.deliverable_format IS NOT NULL AND LOWER(qd.deliverable_format) = LOWER($5))
            )
          ORDER BY uq.assigned_date DESC
          LIMIT 1
        `,
        [
          userId,
          questIdentifiers.questDefinitionId,
          questIdentifiers.targetAction,
          questIdentifiers.title,
          questIdentifiers.deliverableFormat || ''
        ]
      );

      if (result.rows.length > 0) {
        const duplicate = result.rows[0];
        const daysSince = Number(duplicate.days_since_assignment);

        let duplicateReason = '';
        if (duplicate.quest_definition_id === questIdentifiers.questDefinitionId) {
          duplicateReason = 'Same quest definition ID';
        } else if (duplicate.target_action.toLowerCase() === questIdentifiers.targetAction.toLowerCase()) {
          duplicateReason = 'Same target action';
        } else if (duplicate.title.toLowerCase() === questIdentifiers.title.toLowerCase()) {
          duplicateReason = 'Same quest title';
        } else if (duplicate.deliverable_format && questIdentifiers.deliverableFormat &&
                   duplicate.deliverable_format.toLowerCase() === questIdentifiers.deliverableFormat.toLowerCase()) {
          duplicateReason = 'Same deliverable format';
        }

        console.log(`[QuestUniqueness] ⚠️ Duplicate detected: ${duplicateReason} (${daysSince} days ago)`);

        return {
          isUnique: false,
          isDuplicate: true,
          duplicateReason,
          conflictingQuestId: Number(duplicate.id),
          conflictingAssignedDate: new Date(duplicate.assigned_date),
          daysSinceLastAssignment: daysSince
        };
      }

      console.log(`[QuestUniqueness] ✅ Quest is unique within ${windowDays}-day window`);

      return {
        isUnique: true,
        isDuplicate: false
      };

    } catch (error) {
      console.error('[QuestUniqueness] Error checking uniqueness:', error);
      // Fail open: allow quest if check fails
      return {
        isUnique: true,
        isDuplicate: false
      };
    }
  }

  /**
   * Generate content hash for quest (SHA256 of title + description + deliverableFormat)
   */
  static generateQuestContentHash(
    title: string,
    description: string,
    deliverableFormat?: string
  ): string {
    const content = `${title}|${description}|${deliverableFormat || ''}`;
    return crypto.createHash('sha256').update(content.toLowerCase()).digest('hex');
  }

  /**
   * Check if a quest with identical content hash already exists
   */
  static async findDuplicateByContentHash(
    contentHash: string
  ): Promise<{ exists: boolean; questDefinitionId?: number }> {
    try {
      const result = await pool.query(
        `
          SELECT id
          FROM quest_definitions
          WHERE quest_content_hash = $1
          LIMIT 1
        `,
        [contentHash]
      );

      if (result.rows.length > 0) {
        console.log(`[QuestUniqueness] Found existing quest definition with matching content hash: ${result.rows[0].id}`);
        return {
          exists: true,
          questDefinitionId: Number(result.rows[0].id)
        };
      }

      return { exists: false };

    } catch (error) {
      console.error('[QuestUniqueness] Error checking content hash:', error);
      return { exists: false };
    }
  }

  /**
   * Batch uniqueness check for multiple quests
   * Returns filtered list of unique quests
   */
  static async filterUniqueQuests(
    userId: number,
    questCandidates: QuestIdentifiers[],
    windowDays: number = this.DEFAULT_UNIQUENESS_WINDOW_DAYS
  ): Promise<QuestIdentifiers[]> {
    const uniqueQuests: QuestIdentifiers[] = [];

    for (const candidate of questCandidates) {
      const check = await this.isQuestUnique(userId, candidate, windowDays);
      if (check.isUnique) {
        uniqueQuests.push(candidate);
      } else {
        console.log(`[QuestUniqueness] Filtered out duplicate: ${candidate.title} (${check.duplicateReason})`);
      }
    }

    console.log(`[QuestUniqueness] Filtered ${questCandidates.length} candidates → ${uniqueQuests.length} unique quests`);
    return uniqueQuests;
  }

  /**
   * Get quest rotation history for a user (last N quests)
   */
  static async getQuestHistory(
    userId: number,
    limit: number = 10
  ): Promise<Array<{ questDefinitionId: number; targetAction: string; assignedDate: Date }>> {
    try {
      const result = await pool.query(
        `
          SELECT 
            uq.quest_definition_id,
            qd.target_action,
            uq.assigned_date
          FROM user_quests uq
          JOIN quest_definitions qd ON qd.id = uq.quest_definition_id
          WHERE uq.user_id = $1
          ORDER BY uq.assigned_date DESC
          LIMIT $2
        `,
        [userId, limit]
      );

      return result.rows.map(row => ({
        questDefinitionId: Number(row.quest_definition_id),
        targetAction: row.target_action,
        assignedDate: new Date(row.assigned_date)
      }));

    } catch (error) {
      console.error('[QuestUniqueness] Error fetching quest history:', error);
      return [];
    }
  }

  /**
   * Check if quest appears in user's recent rotation
   */
  static async isInRecentRotation(
    userId: number,
    questDefinitionId: number,
    rotationSize: number = 10
  ): Promise<boolean> {
    try {
      const history = await this.getQuestHistory(userId, rotationSize);
      const isInRotation = history.some(h => h.questDefinitionId === questDefinitionId);

      if (isInRotation) {
        console.log(`[QuestUniqueness] ⚠️ Quest ${questDefinitionId} appears in last ${rotationSize} quests`);
      }

      return isInRotation;

    } catch (error) {
      console.error('[QuestUniqueness] Error checking rotation:', error);
      return false;
    }
  }

  /**
   * Comprehensive uniqueness validation combining all checks
   */
  static async validateQuestAssignment(
    userId: number,
    questIdentifiers: QuestIdentifiers,
    options: {
      uniquenessWindowDays?: number;
      rotationSize?: number;
      enforceRotation?: boolean;
    } = {}
  ): Promise<{
    isValid: boolean;
    reason?: string;
    failedCheck?: string;
  }> {
    const {
      uniquenessWindowDays = this.DEFAULT_UNIQUENESS_WINDOW_DAYS,
      rotationSize = 10,
      enforceRotation = true
    } = options;

    // Check 1: Time-window uniqueness
    const uniquenessCheck = await this.isQuestUnique(userId, questIdentifiers, uniquenessWindowDays);
    if (!uniquenessCheck.isUnique) {
      return {
        isValid: false,
        reason: `Duplicate quest detected: ${uniquenessCheck.duplicateReason}`,
        failedCheck: 'uniqueness'
      };
    }

    // Check 2: Rotation check (optional)
    if (enforceRotation) {
      const inRotation = await this.isInRecentRotation(userId, questIdentifiers.questDefinitionId, rotationSize);
      if (inRotation) {
        return {
          isValid: false,
          reason: `Quest appears in last ${rotationSize} assignments`,
          failedCheck: 'rotation'
        };
      }
    }

    return { isValid: true };
  }
}
