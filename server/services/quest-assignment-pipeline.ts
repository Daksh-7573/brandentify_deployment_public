/**
 * Quest Assignment Validation Pipeline
 * 
 * Orchestrates the complete validation workflow before quest assignment:
 * 
 * Flow:
 * 1. Quest Generator → generates candidate quests
 * 2. Uniqueness Validator → filters out duplicates
 * 3. Balance Validator → enforces social/normal mix
 * 4. Assignment Engine → saves validated quests
 * 
 * If validation fails at any step, regenerates replacement quests.
 */

import { QuestUniquenessValidator, QuestIdentifiers } from './quest-uniqueness-validator';
import { SmartQuestAllocator, QuestAllocationResult, SelectedQuest } from './smart-quest-allocator';
import { pool } from '../db';

export interface QuestAssignmentRequest {
  userId: number;
  requestedQuestCount?: number; // Optional override (1-4)
  forceBalance?: boolean; // Enforce strict balance rules
}

export interface ValidationResult {
  isValid: boolean;
  failureReason?: string;
  failedStage?: 'generation' | 'uniqueness' | 'balance' | 'assignment';
  validatedQuests: SelectedQuest[];
  rejectedQuests: Array<{ quest: SelectedQuest; reason: string }>;
}

export interface QuestAssignmentResult {
  success: boolean;
  assignedQuestIds: number[];
  assignedCount: number;
  validationResult: ValidationResult;
  allocationStrategy: string;
  errorMessage?: string;
}

export class QuestAssignmentPipeline {
  
  /**
   * Main pipeline entry point - validates and assigns quests
   */
  static async validateAndAssignQuests(
    request: QuestAssignmentRequest
  ): Promise<QuestAssignmentResult> {
    const { userId, requestedQuestCount, forceBalance = true } = request;

    console.log(`[QuestPipeline] Starting validation pipeline for user ${userId}`);
    console.log(`[QuestPipeline] Force balance: ${forceBalance}, Requested count: ${requestedQuestCount || 'auto'}`);

    try {
      // STAGE 1: Quest Generation (via Smart Allocator)
      console.log('[QuestPipeline] STAGE 1: Quest Generation');
      const allocation = await this.generateQuestCandidates(userId, requestedQuestCount);
      
      if (allocation.selectedQuests.length === 0) {
        return {
          success: false,
          assignedQuestIds: [],
          assignedCount: 0,
          validationResult: {
            isValid: false,
            failureReason: 'No quests available for allocation',
            failedStage: 'generation',
            validatedQuests: [],
            rejectedQuests: []
          },
          allocationStrategy: allocation.allocationStrategy,
          errorMessage: 'No quests available'
        };
      }

      console.log(`[QuestPipeline] Generated ${allocation.selectedQuests.length} candidate quests`);

      // STAGE 2: Uniqueness Validation
      console.log('[QuestPipeline] STAGE 2: Uniqueness Validation');
      const uniquenessResult = await this.validateUniqueness(userId, allocation.selectedQuests);
      
      if (!uniquenessResult.isValid) {
        console.log(`[QuestPipeline] ⚠️ Uniqueness validation failed: ${uniquenessResult.failureReason}`);
        console.log(`[QuestPipeline] Rejected ${uniquenessResult.rejectedQuests.length} duplicate quests`);
        
        // If too many rejections, regenerate
        if (uniquenessResult.validatedQuests.length < 1) {
          return {
            success: false,
            assignedQuestIds: [],
            assignedCount: 0,
            validationResult: uniquenessResult,
            allocationStrategy: allocation.allocationStrategy,
            errorMessage: 'All candidate quests were duplicates'
          };
        }
      }

      // STAGE 3: Balance Validation (if enforced)
      console.log('[QuestPipeline] STAGE 3: Balance Validation');
      let finalQuests = uniquenessResult.validatedQuests;
      
      if (forceBalance) {
        const balanceResult = this.validateBalance(finalQuests, requestedQuestCount);
        
        if (!balanceResult.isValid) {
          console.log(`[QuestPipeline] ⚠️ Balance validation failed: ${balanceResult.reason}`);
          // Use fallback balanced selection
          finalQuests = balanceResult.adjustedQuests || finalQuests;
        } else {
          console.log(`[QuestPipeline] ✅ Balance validated: ${balanceResult.summary}`);
        }
      }

      // STAGE 4: Assignment to Database
      console.log('[QuestPipeline] STAGE 4: Database Assignment');
      const assignmentResult = await this.assignQuestsToUser(userId, finalQuests);

      if (!assignmentResult.success) {
        return {
          success: false,
          assignedQuestIds: [],
          assignedCount: 0,
          validationResult: {
            isValid: false,
            failureReason: assignmentResult.error,
            failedStage: 'assignment',
            validatedQuests: finalQuests,
            rejectedQuests: []
          },
          allocationStrategy: allocation.allocationStrategy,
          errorMessage: assignmentResult.error
        };
      }

      console.log(`[QuestPipeline] ✅ Successfully assigned ${assignmentResult.assignedQuestIds.length} quests`);

      return {
        success: true,
        assignedQuestIds: assignmentResult.assignedQuestIds,
        assignedCount: assignmentResult.assignedQuestIds.length,
        validationResult: {
          isValid: true,
          validatedQuests: finalQuests,
          rejectedQuests: uniquenessResult.rejectedQuests
        },
        allocationStrategy: allocation.allocationStrategy
      };

    } catch (error) {
      console.error('[QuestPipeline] Pipeline failed:', error);
      return {
        success: false,
        assignedQuestIds: [],
        assignedCount: 0,
        validationResult: {
          isValid: false,
          failureReason: error instanceof Error ? error.message : 'Unknown error',
          failedStage: 'generation',
          validatedQuests: [],
          rejectedQuests: []
        },
        allocationStrategy: 'Failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * STAGE 1: Generate quest candidates using Smart Allocator
   */
  private static async generateQuestCandidates(
    userId: number,
    requestedCount?: number
  ): Promise<QuestAllocationResult> {
    const allocator = new SmartQuestAllocator();
    return await allocator.allocateDailyQuests(userId);
  }

  /**
   * STAGE 2: Validate uniqueness for all candidate quests
   */
  private static async validateUniqueness(
    userId: number,
    candidates: SelectedQuest[]
  ): Promise<ValidationResult> {
    const validatedQuests: SelectedQuest[] = [];
    const rejectedQuests: Array<{ quest: SelectedQuest; reason: string }> = [];

    for (const quest of candidates) {
      // Convert SelectedQuest to QuestIdentifiers
      const identifiers: QuestIdentifiers = {
        questDefinitionId: quest.questDefinitionId,
        targetAction: quest.questType,
        title: quest.title,
        deliverableFormat: undefined // Will be fetched from DB if needed
      };

      // Check uniqueness
      const uniquenessCheck = await QuestUniquenessValidator.validateQuestAssignment(
        userId,
        identifiers,
        {
          uniquenessWindowDays: 14,
          rotationSize: 10,
          enforceRotation: true
        }
      );

      if (uniquenessCheck.isValid) {
        validatedQuests.push(quest);
      } else {
        rejectedQuests.push({
          quest,
          reason: uniquenessCheck.reason || 'Uniqueness check failed'
        });
      }
    }

    return {
      isValid: validatedQuests.length > 0,
      failureReason: validatedQuests.length === 0 ? 'All quests failed uniqueness validation' : undefined,
      validatedQuests,
      rejectedQuests
    };
  }

  /**
   * STAGE 3: Validate balance (social vs normal quest mix)
   */
  private static validateBalance(
    quests: SelectedQuest[],
    requestedCount?: number
  ): {
    isValid: boolean;
    reason?: string;
    summary?: string;
    adjustedQuests?: SelectedQuest[];
  } {
    const normalQuests = quests.filter(q => ['career', 'profile', 'portfolio'].includes(q.category));
    const socialQuests = quests.filter(q => ['social', 'networking'].includes(q.category));

    const totalCount = quests.length;
    const normalCount = normalQuests.length;
    const socialCount = socialQuests.length;

    // Balance Rules:
    // 1 quest: any (highest impact)
    // 2 quests: 1 normal + 1 social
    // 3 quests: 2 normal + 1 social
    // 4 quests: 2 normal + 2 social

    if (totalCount === 1) {
      return {
        isValid: true,
        summary: '1 quest (any category)'
      };
    }

    if (totalCount === 2) {
      if (normalCount === 1 && socialCount === 1) {
        return {
          isValid: true,
          summary: '2 quests: 1 normal + 1 social'
        };
      }
      
      // Try to fix balance
      const adjusted = this.adjustBalance(normalQuests, socialQuests, 1, 1);
      return {
        isValid: false,
        reason: `Expected 1 normal + 1 social, got ${normalCount} normal + ${socialCount} social`,
        adjustedQuests: adjusted
      };
    }

    if (totalCount === 3) {
      if (normalCount === 2 && socialCount === 1) {
        return {
          isValid: true,
          summary: '3 quests: 2 normal + 1 social'
        };
      }
      
      const adjusted = this.adjustBalance(normalQuests, socialQuests, 2, 1);
      return {
        isValid: false,
        reason: `Expected 2 normal + 1 social, got ${normalCount} normal + ${socialCount} social`,
        adjustedQuests: adjusted
      };
    }

    if (totalCount === 4) {
      if (normalCount === 2 && socialCount === 2) {
        return {
          isValid: true,
          summary: '4 quests: 2 normal + 2 social'
        };
      }
      
      const adjusted = this.adjustBalance(normalQuests, socialQuests, 2, 2);
      return {
        isValid: false,
        reason: `Expected 2 normal + 2 social, got ${normalCount} normal + ${socialCount} social`,
        adjustedQuests: adjusted
      };
    }

    return {
      isValid: true,
      summary: `${totalCount} quests (no strict balance rule)`
    };
  }

  /**
   * Adjust quest balance to match required mix
   */
  private static adjustBalance(
    normalQuests: SelectedQuest[],
    socialQuests: SelectedQuest[],
    requiredNormal: number,
    requiredSocial: number
  ): SelectedQuest[] {
    const adjusted: SelectedQuest[] = [];
    
    // Add required normal quests
    adjusted.push(...normalQuests.slice(0, requiredNormal));
    
    // Add required social quests
    adjusted.push(...socialQuests.slice(0, requiredSocial));
    
    return adjusted;
  }

  /**
   * STAGE 4: Assign validated quests to user in database
   */
  private static async assignQuestsToUser(
    userId: number,
    quests: SelectedQuest[]
  ): Promise<{ success: boolean; assignedQuestIds: number[]; error?: string }> {
    const assignedQuestIds: number[] = [];

    try {
      const now = new Date();
      const year = now.getUTCFullYear();
      const weekNumber = Math.ceil(
        ((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 
          Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7
      );

      for (const quest of quests) {
        const result = await pool.query(
          `
            INSERT INTO user_quests (
              user_id,
              quest_definition_id,
              status,
              progress,
              assigned_date,
              week_number,
              year,
              assigned_at
            )
            VALUES ($1, $2, 'active', 0, CURRENT_DATE, $3, $4, NOW())
            RETURNING id
          `,
          [userId, quest.questDefinitionId, weekNumber, year]
        );

        if (result.rows.length > 0) {
          const assignedId = Number(result.rows[0].id);
          assignedQuestIds.push(assignedId);

          // Add to quest history for rotation tracking
          await pool.query(
            `
              INSERT INTO user_quest_history (user_id, quest_definition_id, assigned_at)
              VALUES ($1, $2, NOW())
            `,
            [userId, quest.questDefinitionId]
          );

          console.log(`[QuestPipeline] Assigned quest ${quest.questDefinitionId} → user_quest ID: ${assignedId}`);
        }
      }

      return {
        success: true,
        assignedQuestIds
      };

    } catch (error) {
      console.error('[QuestPipeline] Assignment error:', error);
      return {
        success: false,
        assignedQuestIds,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Utility: Get quest assignment summary
   */
  static async getAssignmentSummary(userId: number): Promise<{
    todayQuestCount: number;
    weekQuestCount: number;
    lastAssignmentDate: Date | null;
    historySize: number;
  }> {
    try {
      const todayResult = await pool.query(
        `
          SELECT COUNT(*)::int AS count
          FROM user_quests
          WHERE user_id = $1
            AND assigned_date = CURRENT_DATE
        `,
        [userId]
      );

      const weekResult = await pool.query(
        `
          SELECT COUNT(*)::int AS count
          FROM user_quests
          WHERE user_id = $1
            AND assigned_date >= CURRENT_DATE - INTERVAL '7 days'
        `,
        [userId]
      );

      const lastAssignmentResult = await pool.query(
        `
          SELECT MAX(assigned_at) AS last_assignment
          FROM user_quests
          WHERE user_id = $1
        `,
        [userId]
      );

      const historyResult = await pool.query(
        `
          SELECT COUNT(*)::int AS count
          FROM user_quest_history
          WHERE user_id = $1
        `,
        [userId]
      );

      return {
        todayQuestCount: Number(todayResult.rows[0]?.count || 0),
        weekQuestCount: Number(weekResult.rows[0]?.count || 0),
        lastAssignmentDate: lastAssignmentResult.rows[0]?.last_assignment || null,
        historySize: Number(historyResult.rows[0]?.count || 0)
      };

    } catch (error) {
      console.error('[QuestPipeline] Error fetching assignment summary:', error);
      return {
        todayQuestCount: 0,
        weekQuestCount: 0,
        lastAssignmentDate: null,
        historySize: 0
      };
    }
  }
}
