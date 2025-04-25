/**
 * Musk Feedback Service
 * 
 * Handles the collection, storage, and analysis of feedback for Musk AI responses.
 */

import { db } from "../db";
import { muskFeedbacks, feedbackAnalytics, InsertMuskFeedback, feedbackTypeEnum } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

interface FeedbackResponse {
  status: string;
  message: string;
  updatedResponse?: string;
}

interface CreateFeedbackParams {
  userId: number;
  conversationId: string;
  messageId: string;
  feedbackType: "helpful" | "rating" | "text" | "save";
  rating?: number;
  helpful?: boolean;
  textFeedback?: string;
  savedToPlan?: boolean;
  context?: string;
  promptCategory?: string;
  promptDetails?: Record<string, any>;
  responseDetails?: Record<string, any>;
}

/**
 * Register feedback from a user about a Musk response
 * 
 * @param params Feedback parameters
 * @returns Status and message about the feedback registration
 */
export async function registerFeedback(params: CreateFeedbackParams): Promise<FeedbackResponse> {
  try {
    // Convert params to the correct format for database insertion
    const feedbackData: InsertMuskFeedback = {
      userId: params.userId,
      conversationId: params.conversationId,
      messageId: params.messageId,
      feedbackType: params.feedbackType as any, // Cast to the enum type
      rating: params.rating,
      helpful: params.helpful,
      textFeedback: params.textFeedback,
      savedToPlan: params.savedToPlan || false,
      context: params.context,
      promptCategory: params.promptCategory,
      promptDetails: params.promptDetails || {},
      responseDetails: params.responseDetails || {},
    };

    // Store the feedback in the database
    const [feedback] = await db.insert(muskFeedbacks).values(feedbackData).returning();
    
    // Update analytics based on feedback type
    await updateAnalytics(params);

    let message = "Thank you for your feedback!";
    let updatedResponse: string | undefined = undefined;

    // Generate different responses based on feedback type
    if (params.feedbackType === "helpful" && params.helpful === false) {
      message = "I'm sorry this wasn't helpful. Would you like me to try a different approach?";
      // Could later add logic to generate an alternative response
    } else if (params.feedbackType === "rating" && params.rating && params.rating <= 2) {
      message = "I'll work on improving my responses. What specifically would you like me to address better?";
    } else if (params.feedbackType === "save") {
      message = "Saved to your career plan! I'll reference this in future recommendations.";
    }

    return {
      status: "success",
      message,
      updatedResponse
    };
  } catch (error) {
    console.error("Error registering feedback:", error);
    return {
      status: "error",
      message: "Failed to register feedback. Please try again."
    };
  }
}

/**
 * Update analytics data based on new feedback
 * 
 * @param params Feedback parameters
 */
async function updateAnalytics(params: CreateFeedbackParams): Promise<void> {
  try {
    if (!params.promptCategory) return;

    // Check if analytics entry exists for this prompt category and response type
    const responseType = params.context || "general";
    const [existingAnalytics] = await db
      .select()
      .from(feedbackAnalytics)
      .where(
        and(
          eq(feedbackAnalytics.promptCategory, params.promptCategory),
          eq(feedbackAnalytics.responseType, responseType)
        )
      );

    // Update counts based on feedback type
    let helpfulCount = existingAnalytics?.helpfulCount ?? 0;
    let unhelpfulCount = existingAnalytics?.unhelpfulCount ?? 0;
    let savedCount = existingAnalytics?.savedCount ?? 0;
    let totalRatings = 0;
    let sumRatings = 0;
    let averageRating = existingAnalytics?.averageRating ?? 0;

    if (params.feedbackType === "helpful") {
      if (params.helpful) {
        helpfulCount++;
      } else {
        unhelpfulCount++;
      }
    } else if (params.feedbackType === "save") {
      savedCount++;
    } else if (params.feedbackType === "rating" && params.rating) {
      // Calculate new average rating
      if (existingAnalytics) {
        // Approximate the previous sum of ratings
        // Convert to numbers to ensure proper calculation
        const previousTotalRatings = Number(helpfulCount) + Number(unhelpfulCount);
        totalRatings = previousTotalRatings + 1;
        const currentAvgRating = Number(averageRating) || 0;
        sumRatings = currentAvgRating * previousTotalRatings + Number(params.rating);
        averageRating = sumRatings / totalRatings;
      } else {
        averageRating = Number(params.rating);
      }
    }

    // Insert or update analytics data
    if (existingAnalytics) {
      await db
        .update(feedbackAnalytics)
        .set({
          helpfulCount: helpfulCount,
          unhelpfulCount: unhelpfulCount,
          savedCount: savedCount,
          averageRating: averageRating,
          updatedAt: new Date()
        })
        .where(eq(feedbackAnalytics.id, existingAnalytics.id));
    } else {
      await db.insert(feedbackAnalytics).values({
        promptCategory: params.promptCategory,
        responseType: responseType,
        helpfulCount: helpfulCount,
        unhelpfulCount: unhelpfulCount,
        savedCount: savedCount,
        averageRating: averageRating,
        careerStage: params.promptDetails?.careerStage,
        industry: params.promptDetails?.industry,
        mostCommonFeedback: []
      });
    }
  } catch (error) {
    console.error("Error updating feedback analytics:", error);
    // Continue execution - don't let analytics failures break the feedback flow
  }
}

/**
 * Get feedback history for a user
 * 
 * @param userId User ID
 * @param limit Maximum number of results
 * @returns Array of feedback entries
 */
export async function getUserFeedbackHistory(userId: number, limit = 50) {
  try {
    return await db
      .select()
      .from(muskFeedbacks)
      .where(eq(muskFeedbacks.userId, userId))
      .orderBy(sql`${muskFeedbacks.createdAt} DESC`)
      .limit(limit);
  } catch (error) {
    console.error("Error retrieving user feedback history:", error);
    return [];
  }
}

/**
 * Get analytics for a specific prompt category
 * 
 * @param promptCategory The category of prompts to get analytics for
 * @returns Analytics data for the prompt category
 */
export async function getAnalyticsForCategory(promptCategory: string) {
  try {
    return await db
      .select()
      .from(feedbackAnalytics)
      .where(eq(feedbackAnalytics.promptCategory, promptCategory));
  } catch (error) {
    console.error("Error retrieving analytics for category:", error);
    return [];
  }
}

/**
 * Get top performing prompt categories by helpfulness ratio
 * 
 * @param limit Maximum number of results
 * @returns Array of top performing categories
 */
export async function getTopPerformingCategories(limit = 10) {
  try {
    // This is a more complex query that calculates a helpfulness ratio
    const rawQuery = `
      SELECT 
        prompt_category, 
        response_type,
        helpful_count, 
        unhelpful_count,
        saved_count,
        average_rating,
        CASE 
          WHEN (helpful_count + unhelpful_count) > 0 
          THEN helpful_count::float / (helpful_count + unhelpful_count) 
          ELSE 0 
        END as helpfulness_ratio
      FROM feedback_analytics
      ORDER BY helpfulness_ratio DESC, helpful_count DESC
      LIMIT ${limit}
    `;
    
    const result = await db.execute(rawQuery);
    // Format the response to be more user-friendly
    return result.rows;
  } catch (error) {
    console.error("Error retrieving top performing categories:", error);
    return [];
  }
}