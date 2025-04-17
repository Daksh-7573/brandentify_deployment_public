/**
 * Decision Engine Routes
 * 
 * API routes for the decision engine features including Smart Connect
 * and recommendation services.
 */

import { Request, Response } from 'express';
import { decisionEngine } from './decision-engine/index';
import { z } from 'zod';

/**
 * Schema for validating Smart Connect match criteria
 */
const matchCriteriaSchema = z.object({
  userId: z.number(),
  lookingFor: z.string().optional(),
  targetJobTitle: z.string().optional(),
  experienceLevel: z.string().optional(),
  industry: z.string().optional(),
  domain: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  personalityTraits: z.array(z.string()).optional(),
  availabilityPreference: z.string().optional(),
  communicationStyle: z.string().optional(),
  remotePreference: z.boolean().optional()
});

/**
 * Handle Smart Connect match request
 */
export async function handleSmartConnect(req: Request, res: Response) {
  try {
    const validationResult = matchCriteriaSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('[Smart Connect] Validation error:', validationResult.error);
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.format()
      });
    }
    
    const { userId, ...criteria } = validationResult.data;
    
    console.log(`[Smart Connect] Processing match request for user ${userId}`);
    
    // Use the decision engine to find matches
    const matches = await decisionEngine.findMatches(userId, criteria);
    
    console.log(`[Smart Connect] Found ${matches.length} matches for user ${userId}`);
    
    // Return matches with explanatory data
    return res.status(200).json({
      matches,
      matchCount: matches.length,
      matchingCriteria: criteria
    });
  } catch (error) {
    console.error('[Smart Connect] Error processing request:', error);
    return res.status(500).json({
      error: 'Failed to process Smart Connect request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle career recommendations
 */
export async function handleCareerRecommendations(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId, 10);
    
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log(`[Career Recommendations] Generating for user ${userId}`);
    
    // Use decision engine to generate career recommendations
    const recommendations = await decisionEngine.generateCareerRecommendations(userIdNum);
    
    return res.status(200).json({
      recommendations,
      userId: userIdNum,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Career Recommendations] Error generating recommendations:', error);
    return res.status(500).json({
      error: 'Failed to generate career recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle nearby professionals (Smart Radar)
 */
export async function handleNearbyProfessionals(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { radius = 50, latitude, longitude } = req.query;
    
    const userIdNum = parseInt(userId, 10);
    const radiusNum = parseInt(radius as string, 10);
    
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (isNaN(radiusNum) || radiusNum <= 0) {
      return res.status(400).json({ error: 'Invalid radius' });
    }
    
    console.log(`[Smart Radar] Finding professionals near user ${userId} within ${radius}km`);
    
    // Use decision engine to find nearby professionals
    const nearbyProfessionals = await decisionEngine.findNearbyProfessionals(userIdNum, radiusNum);
    
    return res.status(200).json({
      nearbyProfessionals,
      userId: userIdNum,
      searchRadius: radiusNum,
      searchLocation: { latitude, longitude }
    });
  } catch (error) {
    console.error('[Smart Radar] Error finding nearby professionals:', error);
    return res.status(500).json({
      error: 'Failed to find nearby professionals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}