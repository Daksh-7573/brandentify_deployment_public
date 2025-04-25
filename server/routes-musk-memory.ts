/**
 * Musk Memory Routes
 * 
 * Routes for handling Musk's conversational memory and emotional intelligence capabilities.
 */

import { Express, Request, Response } from 'express';
import { 
  createPromptWithMemory, 
  storeMessageInMemory, 
  detectEmotionalTone,
  detectProfileChanges,
  IUserProfile
} from './services/musk-memory-service';
import { generateCareerAdvice } from './services/anthropic-service';
import { storage } from './storage';

export const registerMuskMemoryRoutes = (app: Express) => {
  // Get memory-enhanced chat message
  app.post('/api/musk-memory/chat', async (req: Request, res: Response) => {
    try {
      const { userId, message, userProfile } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: 'User ID and message are required' });
      }
      
      // Get user profile if not provided
      let profile: IUserProfile;
      if (!userProfile) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Map user data to profile format
        profile = {
          name: user.name || '',
          title: user.title || '',
          industry: user.industry || '',
          domain: user.domain || '',
          location: user.location || '',
          lookingFor: user.lookingFor || '',
          skills: [] // We would fetch skills here, but skipping for brevity
        };
      } else {
        profile = userProfile;
      }
      
      // Store user message in memory
      await storeMessageInMemory(userId, message, 'user');
      
      // Create memory-enhanced prompt
      const enhancedPrompt = await createPromptWithMemory(userId, message, profile);
      
      // Generate AI response using Anthropic service
      const advice = await generateCareerAdvice({
        ...profile,
        adviceType: 'career_growth', // Default type
        // Add emotional context from memory service
        emotionalContext: detectEmotionalTone(message)
      });
      
      // Store AI response in memory
      await storeMessageInMemory(userId, advice.advice, 'ai');
      
      // Return the response
      res.json({ 
        response: advice.advice,
        nextSteps: advice.nextSteps,
        emotionalTone: detectEmotionalTone(message)
      });
    } catch (error: unknown) {
      console.error('Error in memory-enhanced chat endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage || 'Failed to generate response' });
    }
  });
  
  // Detect profile changes
  app.post('/api/musk-memory/detect-profile-changes', async (req: Request, res: Response) => {
    try {
      const { userId, oldProfile, newProfile } = req.body;
      
      if (!userId || !oldProfile || !newProfile) {
        return res.status(400).json({ error: 'User ID and both profiles are required' });
      }
      
      // Detect changes between profiles
      const changes = detectProfileChanges(oldProfile, newProfile);
      
      // If changes detected, create a personalized message about them
      let changeMessage = '';
      if (changes.length > 0) {
        changeMessage = "I noticed you've made some updates to your profile. ";
        
        changes.forEach(change => {
          changeMessage += `You changed your ${change.fieldChanged} from "${change.oldValue}" to "${change.newValue}". `;
        });
        
        changeMessage += "These updates help me provide more relevant career guidance for you.";
        
        // Store this observation as an AI message
        await storeMessageInMemory(
          userId, 
          changeMessage, 
          'ai', 
          'profile_change_observation'
        );
      }
      
      res.json({ 
        changes,
        changeMessage: changes.length > 0 ? changeMessage : null,
        changesDetected: changes.length > 0
      });
    } catch (error: unknown) {
      console.error('Error detecting profile changes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage || 'Failed to detect profile changes' });
    }
  });
  
  // Get conversation history
  app.get('/api/musk-memory/conversation-history/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Valid user ID is required' });
      }
      
      // Get chat messages for user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const messages = await storage.getChatMessagesByUserId(userId);
      
      // Group messages into sessions (simplified version)
      // In a real implementation, we would track actual session IDs
      const conversationHistory = messages.map(msg => ({
        id: msg.id,
        role: msg.sender,
        content: msg.content,
        timestamp: msg.createdAt,
        type: msg.messageType,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : {}
      }));
      
      res.json({ 
        userId,
        userName: user.name,
        conversationHistory
      });
    } catch (error: unknown) {
      console.error('Error fetching conversation history:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage || 'Failed to fetch conversation history' });
    }
  });
  
  // Demo endpoint for emotional tone detection
  app.post('/api/musk-memory/demo/detect-emotion', (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Detect emotional tone
      const emotionalData = detectEmotionalTone(message);
      
      res.json({ 
        message,
        emotionalTone: emotionalData.tone,
        confidence: emotionalData.confidence,
        analysis: `Message appears to express a ${emotionalData.tone} tone with ${Math.round(emotionalData.confidence * 100)}% confidence.`
      });
    } catch (error: unknown) {
      console.error('Error in emotion detection demo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage || 'Failed to detect emotion' });
    }
  });
  
  console.log('Musk Memory routes loaded');
};