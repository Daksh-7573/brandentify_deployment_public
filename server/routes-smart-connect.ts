import express from 'express';
import { IStorage } from './storage';
import { DecisionEngine } from './decision-engine/index';

const decisionEngine = new DecisionEngine();

/**
 * Routes for the Smart Connect feature with real decision engine integration
 */
export function registerSmartConnectRoutes(app: express.Express, storage: IStorage) {
  // Submit a smart connect search request
  app.post('/api/smart-connect', async (req, res) => {
    try {
      const { 
        userId, 
        lookingFor, 
        targetJobTitle, 
        industry, 
        domain, 
        location, 
        skills,
        remotePreference
      } = req.body;
      
      // Validate required fields
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      // Log the request parameters for debugging
      console.log('[Smart Connect] Search request:', {
        userId,
        lookingFor,
        targetJobTitle,
        industry,
        domain,
        location,
        skills,
        remotePreference
      });
      
      // Build criteria for decision engine
      const criteria = {
        lookingFor: lookingFor || 'mentor',
        targetJobTitle,
        industry,
        domain,
        location,
        skills: skills || [],
        remotePreference
      };
      
      // Use decision engine to find real matches
      const allMatches = await decisionEngine.findMatches(userId, criteria);
      
      // Limit to top 20 matches for performance
      const topMatches = allMatches.slice(0, 20);
      
      // Strip sensitive fields from user data
      const sanitizedMatches = topMatches.map(match => ({
        user: {
          id: match.user.id,
          name: match.user.name,
          title: match.user.title,
          photoURL: match.user.photoURL,
          location: match.user.location,
          industry: match.user.industry,
          domain: match.user.domain,
          lookingFor: match.user.lookingFor
        },
        score: match.score,
        strengthAreas: match.strengthAreas,
        compatibilityInsights: match.compatibilityInsights,
        matchReasons: match.matchReasons
      }));
      
      console.log(`[Smart Connect] Found ${sanitizedMatches.length} matches for user ${userId}`);
      
      res.status(200).json({
        matches: sanitizedMatches,
        matchCount: sanitizedMatches.length,
        totalMatchesFound: allMatches.length,
        matchingCriteria: criteria
      });
    } catch (error) {
      console.error('[Smart Connect] Error processing request:', error);
      res.status(500).json({ error: 'Failed to process Smart Connect request' });
    }
  });
  
  // Get smart connect results (for retrieving previous searches)
  app.get('/api/smart-connect', async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      console.log(`[Smart Connect] Fetching results for user ${userId}`);
      
      // Get user profile to use their preferences as default criteria
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Build default criteria from user profile
      const criteria = {
        lookingFor: user.lookingFor || 'mentor',
        industry: user.industry || undefined,
        domain: user.domain || undefined,
        location: user.location || undefined,
        skills: []
      };
      
      // Find matches using decision engine
      const allMatches = await decisionEngine.findMatches(userId, criteria);
      const topMatches = allMatches.slice(0, 20);
      
      // Sanitize matches
      const sanitizedMatches = topMatches.map(match => ({
        user: {
          id: match.user.id,
          name: match.user.name,
          title: match.user.title,
          photoURL: match.user.photoURL,
          location: match.user.location,
          industry: match.user.industry,
          domain: match.user.domain,
          lookingFor: match.user.lookingFor
        },
        score: match.score,
        strengthAreas: match.strengthAreas,
        compatibilityInsights: match.compatibilityInsights,
        matchReasons: match.matchReasons
      }));
      
      res.status(200).json({
        matches: sanitizedMatches,
        matchCount: sanitizedMatches.length,
        totalMatchesFound: allMatches.length,
        matchingCriteria: criteria
      });
    } catch (error) {
      console.error('[Smart Connect] Error fetching results:', error);
      res.status(500).json({ error: 'Failed to fetch Smart Connect results' });
    }
  });
}
