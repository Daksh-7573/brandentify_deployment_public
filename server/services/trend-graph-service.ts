/**
 * Trend Graph Service
 * 
 * This service provides functions for skill trend analysis and career path recommendations
 * to help Musk AI deliver data-driven career guidance.
 */

import { db } from '../db';
import { skillTrends, careerPathNodes, careerTransitions } from '@shared/schema';
import { eq, and, like, desc, asc, gte, lte, sql, or } from 'drizzle-orm';
import type { 
  SkillTrend, 
  InsertSkillTrend, 
  CareerPathNode, 
  InsertCareerPathNode,
  CareerTransition,
  InsertCareerTransition 
} from '@shared/schema';

// Skills and trend-related functions

/**
 * Get trending skills for a specific industry and time frame
 * 
 * @param industry The industry to get trending skills for
 * @param timeFrame Optional time frame filter (e.g., "6_months", "1_year", "3_years")
 * @param limit Maximum number of results
 * @returns Array of trending skills with growth metrics
 */
export async function getTrendingSkills(industry: string, timeFrame?: string, limit = 10) {
  try {
    const query = timeFrame 
      ? db
          .select()
          .from(skillTrends)
          .where(and(eq(skillTrends.industry, industry), eq(skillTrends.timeFrame, timeFrame)))
          .orderBy(desc(skillTrends.growthRate))
          .limit(limit)
      : db
          .select()
          .from(skillTrends)
          .where(eq(skillTrends.industry, industry))
          .orderBy(desc(skillTrends.growthRate))
          .limit(limit);
    
    return await query;
  } catch (error) {
    console.error("Error retrieving trending skills:", error);
    return [];
  }
}

/**
 * Get related skills for a specific skill
 * 
 * @param skillName The skill to find related skills for
 * @returns Array of related skills with similarity metrics
 */
export async function getRelatedSkills(skillName: string) {
  try {
    const skill = await db
      .select()
      .from(skillTrends)
      .where(eq(skillTrends.skillName, skillName))
      .limit(1);
    
    if (skill.length === 0) {
      return [];
    }
    
    // Get the related skills array from the JSON column
    const relatedSkillsData = skill[0].relatedSkills as string[];
    
    // If no related skills, return empty array
    if (!relatedSkillsData || relatedSkillsData.length === 0) {
      return [];
    }
    
    // Return full skill details for each related skill
    const relatedSkills = await db
      .select()
      .from(skillTrends)
      .where(sql`${skillTrends.skillName} IN (${relatedSkillsData.join(',')})`);
    
    return relatedSkills;
  } catch (error) {
    console.error("Error retrieving related skills:", error);
    return [];
  }
}

/**
 * Search skills by name or category
 * 
 * @param query Search query string
 * @param limit Maximum number of results
 * @returns Array of matching skills
 */
export async function searchSkills(query: string, limit = 20) {
  try {
    return await db
      .select()
      .from(skillTrends)
      .where(or(
        like(skillTrends.skillName, `%${query}%`),
        like(skillTrends.category, `%${query}%`)
      ))
      .limit(limit);
  } catch (error) {
    console.error("Error searching skills:", error);
    return [];
  }
}

// Career path and transition functions

/**
 * Get job nodes matching a job title or industry
 * 
 * @param titleQuery Job title search term
 * @param industry Optional industry filter
 * @param limit Maximum number of results
 * @returns Array of matching job nodes
 */
export async function searchJobNodes(titleQuery: string, industry?: string, limit = 10) {
  try {
    const query = industry
      ? db
          .select()
          .from(careerPathNodes)
          .where(and(
            like(careerPathNodes.jobTitle, `%${titleQuery}%`),
            eq(careerPathNodes.industry, industry)
          ))
          .limit(limit)
      : db
          .select()
          .from(careerPathNodes)
          .where(like(careerPathNodes.jobTitle, `%${titleQuery}%`))
          .limit(limit);
    
    return await query;
  } catch (error) {
    console.error("Error searching job nodes:", error);
    return [];
  }
}

/**
 * Get career progression path options
 * 
 * @param currentJobNodeId ID of the current job node
 * @param difficulty Optional transition difficulty filter
 * @returns Array of possible career transitions
 */
export async function getCareerProgressionOptions(currentJobNodeId: number, difficulty?: string) {
  try {
    // Get transitions from the current node
    const query = difficulty
      ? db
          .select({
            transition: careerTransitions,
            toNode: careerPathNodes
          })
          .from(careerTransitions)
          .innerJoin(careerPathNodes, eq(careerTransitions.toNodeId, careerPathNodes.id))
          .where(and(
            eq(careerTransitions.fromNodeId, currentJobNodeId),
            eq(careerTransitions.transitionDifficulty, difficulty)
          ))
      : db
          .select({
            transition: careerTransitions,
            toNode: careerPathNodes
          })
          .from(careerTransitions)
          .innerJoin(careerPathNodes, eq(careerTransitions.toNodeId, careerPathNodes.id))
          .where(eq(careerTransitions.fromNodeId, currentJobNodeId));
    
    return await query;
  } catch (error) {
    console.error("Error retrieving career progression options:", error);
    return [];
  }
}

/**
 * Get skill gaps between current role and target role
 * 
 * @param currentJobNodeId ID of the current job node
 * @param targetJobNodeId ID of the target job node
 * @returns Object containing skill gaps and recommendations
 */
export async function getSkillGapsForTransition(currentJobNodeId: number, targetJobNodeId: number) {
  try {
    // Get the transition between the two nodes
    const transitions = await db
      .select()
      .from(careerTransitions)
      .where(and(
        eq(careerTransitions.fromNodeId, currentJobNodeId),
        eq(careerTransitions.toNodeId, targetJobNodeId)
      ))
      .limit(1);
    
    if (transitions.length === 0) {
      // If no direct transition exists, calculate skill gaps manually
      const [currentNode, targetNode] = await Promise.all([
        db.select().from(careerPathNodes).where(eq(careerPathNodes.id, currentJobNodeId)).limit(1),
        db.select().from(careerPathNodes).where(eq(careerPathNodes.id, targetJobNodeId)).limit(1)
      ]);
      
      if (currentNode.length === 0 || targetNode.length === 0) {
        throw new Error("Job nodes not found");
      }
      
      // Extract required skills from both nodes
      const currentSkills = currentNode[0].requiredSkills as string[];
      const targetSkills = targetNode[0].requiredSkills as string[];
      
      // Calculate skills needed for the transition
      const skillGaps = targetSkills.filter(skill => !currentSkills.includes(skill));
      
      return {
        directTransition: false,
        skillGaps,
        transitionDifficulty: "unknown",
        recommendedSteps: [],
        avgTransitionTime: null,
        successRate: null
      };
    }
    
    // Return transition data including skill gaps
    const transition = transitions[0];
    return {
      directTransition: true,
      skillGaps: transition.skillGaps as string[],
      transitionDifficulty: transition.transitionDifficulty,
      recommendedSteps: transition.recommendedSteps as string[],
      avgTransitionTime: transition.avgTransitionTime,
      successRate: transition.successRate
    };
  } catch (error) {
    console.error("Error retrieving skill gaps for transition:", error);
    return {
      directTransition: false,
      skillGaps: [],
      transitionDifficulty: "error",
      recommendedSteps: [],
      avgTransitionTime: null,
      successRate: null
    };
  }
}

/**
 * Generate a multi-step career path from current to target role
 * 
 * @param currentJobTitle Current job title
 * @param targetJobTitle Target job title
 * @param industry Industry context
 * @returns Array of steps forming a career path
 */
export async function generateCareerPath(currentJobTitle: string, targetJobTitle: string, industry: string) {
  try {
    // Get nodes for current and target jobs
    const [currentNodes, targetNodes] = await Promise.all([
      db
        .select()
        .from(careerPathNodes)
        .where(and(
          like(careerPathNodes.jobTitle, `%${currentJobTitle}%`),
          eq(careerPathNodes.industry, industry)
        ))
        .limit(1),
      db
        .select()
        .from(careerPathNodes)
        .where(and(
          like(careerPathNodes.jobTitle, `%${targetJobTitle}%`),
          eq(careerPathNodes.industry, industry)
        ))
        .limit(1)
    ]);
    
    if (currentNodes.length === 0 || targetNodes.length === 0) {
      return {
        success: false,
        message: "Could not find matching job roles in our database",
        path: []
      };
    }
    
    const currentNodeId = currentNodes[0].id;
    const targetNodeId = targetNodes[0].id;
    
    // Check if direct transition exists
    const directTransition = await db
      .select()
      .from(careerTransitions)
      .where(and(
        eq(careerTransitions.fromNodeId, currentNodeId),
        eq(careerTransitions.toNodeId, targetNodeId)
      ))
      .limit(1);
    
    if (directTransition.length > 0) {
      // Return direct path
      return {
        success: true,
        message: "Direct transition path found",
        path: [
          {
            node: currentNodes[0],
            transition: null
          },
          {
            node: targetNodes[0],
            transition: directTransition[0]
          }
        ]
      };
    }
    
    // TODO: Implement multi-step path finding algorithm
    // This would involve breadth-first search through the transition graph
    // For now, return a simplified result
    
    return {
      success: false,
      message: "No direct path found. Multi-step path calculation will be implemented in future versions.",
      path: []
    };
  } catch (error) {
    console.error("Error generating career path:", error);
    return {
      success: false,
      message: "Error generating career path",
      path: []
    };
  }
}

// Data management functions for admin use

/**
 * Add or update a skill trend record
 * 
 * @param skillTrendData The skill trend data to insert or update
 * @returns The created or updated skill trend
 */
export async function upsertSkillTrend(skillTrendData: InsertSkillTrend) {
  try {
    // Check if the skill trend already exists
    const existingTrends = await db
      .select()
      .from(skillTrends)
      .where(and(
        eq(skillTrends.skillName, skillTrendData.skillName),
        eq(skillTrends.industry, skillTrendData.industry),
        eq(skillTrends.timeFrame, skillTrendData.timeFrame)
      ))
      .limit(1);
    
    if (existingTrends.length > 0) {
      // Update existing record
      const updatedTrend = await db
        .update(skillTrends)
        .set({
          ...skillTrendData,
          updatedAt: new Date()
        })
        .where(eq(skillTrends.id, existingTrends[0].id))
        .returning();
      
      return updatedTrend[0];
    } else {
      // Insert new record
      const newTrend = await db
        .insert(skillTrends)
        .values(skillTrendData)
        .returning();
      
      return newTrend[0];
    }
  } catch (error) {
    console.error("Error upserting skill trend:", error);
    throw error;
  }
}

/**
 * Add or update a career path node
 * 
 * @param nodeData The career path node data to insert or update
 * @returns The created or updated career path node
 */
export async function upsertCareerPathNode(nodeData: InsertCareerPathNode) {
  try {
    // Check if the node already exists
    const existingNodes = await db
      .select()
      .from(careerPathNodes)
      .where(and(
        eq(careerPathNodes.jobTitle, nodeData.jobTitle),
        eq(careerPathNodes.industry, nodeData.industry),
        eq(careerPathNodes.level, nodeData.level)
      ))
      .limit(1);
    
    if (existingNodes.length > 0) {
      // Update existing record
      const updatedNode = await db
        .update(careerPathNodes)
        .set({
          ...nodeData,
          updatedAt: new Date()
        })
        .where(eq(careerPathNodes.id, existingNodes[0].id))
        .returning();
      
      return updatedNode[0];
    } else {
      // Insert new record
      const newNode = await db
        .insert(careerPathNodes)
        .values(nodeData)
        .returning();
      
      return newNode[0];
    }
  } catch (error) {
    console.error("Error upserting career path node:", error);
    throw error;
  }
}

/**
 * Add or update a career transition
 * 
 * @param transitionData The career transition data to insert or update
 * @returns The created or updated career transition
 */
export async function upsertCareerTransition(transitionData: InsertCareerTransition) {
  try {
    // Check if the transition already exists
    const existingTransitions = await db
      .select()
      .from(careerTransitions)
      .where(and(
        eq(careerTransitions.fromNodeId, transitionData.fromNodeId),
        eq(careerTransitions.toNodeId, transitionData.toNodeId)
      ))
      .limit(1);
    
    if (existingTransitions.length > 0) {
      // Update existing record
      const updatedTransition = await db
        .update(careerTransitions)
        .set({
          ...transitionData,
          updatedAt: new Date()
        })
        .where(eq(careerTransitions.id, existingTransitions[0].id))
        .returning();
      
      return updatedTransition[0];
    } else {
      // Insert new record
      const newTransition = await db
        .insert(careerTransitions)
        .values(transitionData)
        .returning();
      
      return newTransition[0];
    }
  } catch (error) {
    console.error("Error upserting career transition:", error);
    throw error;
  }
}