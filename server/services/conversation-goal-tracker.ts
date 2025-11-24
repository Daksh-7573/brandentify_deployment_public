/**
 * Conversation Goal Tracker - Multi-Turn Planning & Progress Tracking
 * Tracks hidden conversation goals and adapts follow-ups based on progress
 */

import { pool } from '../db';
import crypto from 'crypto';

export interface ConversationGoal {
  id?: number;
  conversationId: string;
  primaryGoal: string;
  subGoals: Array<{ text: string; completed: boolean }>;
  stage: string;
  emotion: string;
  emotionConfidence: number;
  progress: number; // 0-100
}

export interface NextFollowUp {
  text: string;
  why: string;
  followUpDirection: string[];
  actionHint: string;
}

class ConversationGoalTrackerService {
  /**
   * Infer and create conversation goal from user intent and context
   */
  async createConversationGoal(
    userId: number,
    userMessage: string,
    intent: string,
    emotion: string
  ): Promise<ConversationGoal> {
    try {
      const conversationId = crypto.randomUUID();

      // Infer primary goal based on intent and message
      const primaryGoal = this.inferPrimaryGoal(userMessage, intent);

      // Generate sub-goals
      const subGoals = this.generateSubGoals(primaryGoal, intent);

      const result = await pool.query(
        `INSERT INTO conversation_goals 
         (user_id, conversation_id, primary_goal, sub_goals, stage, emotion, emotion_confidence)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          conversationId,
          primaryGoal,
          JSON.stringify(subGoals),
          this.inferStage(intent, emotion),
          emotion,
          70,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        conversationId,
        primaryGoal,
        subGoals,
        stage: row.stage,
        emotion,
        emotionConfidence: 70,
        progress: 0,
      };
    } catch (error) {
      console.error('Error creating conversation goal:', error);
      throw error;
    }
  }

  /**
   * Get current conversation goal
   */
  async getConversationGoal(userId: number, conversationId: string): Promise<ConversationGoal | null> {
    try {
      const result = await pool.query(
        `SELECT * FROM conversation_goals WHERE user_id = $1 AND conversation_id = $2`,
        [userId, conversationId]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      const subGoalsData = row.sub_goals || [];
      return {
        id: row.id,
        conversationId,
        primaryGoal: row.primary_goal,
        subGoals: subGoalsData,
        stage: row.stage,
        emotion: row.emotion,
        emotionConfidence: row.emotion_confidence,
        progress: this.calculateProgress(subGoalsData),
      };
    } catch (error) {
      console.error('Error getting conversation goal:', error);
      return null;
    }
  }

  /**
   * Mark sub-goal as completed and update progress
   */
  async completeSubGoal(goalId: number, subGoalText: string): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT sub_goals FROM conversation_goals WHERE id = $1`,
        [goalId]
      );

      if (result.rows.length === 0) return;

      const subGoals = (result.rows[0].sub_goals || []) as Array<{ text: string; completed: boolean }>;
      const updated = subGoals.map((sg) =>
        sg.text === subGoalText ? { ...sg, completed: true } : sg
      );

      await pool.query(
        `UPDATE conversation_goals SET sub_goals = $1, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(updated), goalId]
      );

      // Record checkpoint
      await pool.query(
        `INSERT INTO goal_checkpoints (goal_id, checkpoint) VALUES ($1, $2)`,
        [goalId, subGoalText]
      );
    } catch (error) {
      console.error('Error completing sub-goal:', error);
    }
  }

  /**
   * Generate next follow-up based on goal progress
   */
  generateNextFollowUp(goal: ConversationGoal, completedSubGoal?: string): NextFollowUp {
    const completedCount = goal.subGoals.filter(sg => sg.completed).length;
    const totalSubGoals = goal.subGoals.length;

    // If all sub-goals completed, suggest moving to next stage
    if (completedCount === totalSubGoals) {
      return {
        text: `Great! You have completed "${goal.primaryGoal}". Ready to move forward?`,
        why: "You have made excellent progress toward your goal.",
        followUpDirection: ["What is your next step?", "Want to tackle the next phase?"],
        actionHint: 'celebrate_progress',
      };
    }

    // Otherwise, suggest next logical step
    const nextIncompleteGoal = goal.subGoals.find(sg => !sg.completed);

    if (nextIncompleteGoal) {
      return {
        text: `Next step: ${nextIncompleteGoal.text}. Want help with this?`,
        why: "This is the natural next milestone in your journey.",
        followUpDirection: [
          `Show me how to ${nextIncompleteGoal.text}`,
          `I need resources for ${nextIncompleteGoal.text}`,
        ],
        actionHint: 'guide_next_step',
      };
    }

    return {
      text: `You are making great progress! What would you like to work on next?`,
      why: "Keeping momentum toward your goals.",
      followUpDirection: ["Next goal", "Refine current work"],
      actionHint: 'ask_next_goal',
    };
  }

  /**
   * Infer primary goal from user message
   */
  private inferPrimaryGoal(message: string, intent: string): string {
    const msg = message.toLowerCase();

    // Common patterns
    if (msg.includes('post') || msg.includes('content')) {
      return 'Create engaging social media content';
    }
    if (msg.includes('portfolio')) {
      return 'Build and showcase portfolio';
    }
    if (msg.includes('brand')) {
      return 'Establish professional brand identity';
    }
    if (msg.includes('network') || msg.includes('connect')) {
      return 'Expand professional network';
    }
    if (msg.includes('skill')) {
      return 'Develop new professional skills';
    }
    if (msg.includes('resume')) {
      return 'Improve and perfect resume';
    }

    // Fallback to intent-based goal
    if (intent === 'action') return 'Complete a key professional action';
    if (intent === 'probe') return 'Understand professional concepts deeply';
    if (intent === 'resource') return 'Gather resources and templates';

    return 'Advance your professional career';
  }

  /**
   * Generate sub-goals for the primary goal
   */
  private generateSubGoals(
    primaryGoal: string,
    intent: string
  ): Array<{ text: string; completed: boolean }> {
    const subGoals: Array<{ text: string; completed: boolean }> = [];

    if (primaryGoal.includes('content')) {
      subGoals.push(
        { text: 'Choose platform', completed: false },
        { text: 'Draft copy', completed: false },
        { text: 'Add visuals', completed: false },
        { text: 'Publish', completed: false }
      );
    } else if (primaryGoal.includes('portfolio')) {
      subGoals.push(
        { text: 'Select best projects', completed: false },
        { text: 'Write project descriptions', completed: false },
        { text: 'Add screenshots/links', completed: false },
        { text: 'Get feedback', completed: false }
      );
    } else if (primaryGoal.includes('brand')) {
      subGoals.push(
        { text: 'Define brand positioning', completed: false },
        { text: 'Create tagline', completed: false },
        { text: 'Design visual identity', completed: false },
        { text: 'Launch across channels', completed: false }
      );
    } else {
      subGoals.push(
        { text: 'Plan approach', completed: false },
        { text: 'Gather resources', completed: false },
        { text: 'Execute plan', completed: false },
        { text: 'Review and refine', completed: false }
      );
    }

    return subGoals;
  }

  /**
   * Infer journey stage
   */
  private inferStage(intent: string, emotion: string): string {
    if (intent === 'clarify' && emotion === 'curious') return 'onboarding';
    if (intent === 'action' && emotion === 'confident') return 'active';
    if (intent === 'resource' && emotion === 'exploring') return 'optimization';
    if (intent === 'action' && emotion === 'validating') return 'monetization';
    return 'active';
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(subGoals: Array<{ text: string; completed: boolean }> | any): number {
    if (!Array.isArray(subGoals) || subGoals.length === 0) return 0;
    const completed = subGoals.filter((sg: any) => sg.completed).length;
    return Math.round((completed / subGoals.length) * 100);
  }
}

export const conversationGoalTrackerService = new ConversationGoalTrackerService();
