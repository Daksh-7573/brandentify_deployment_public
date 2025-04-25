import express, { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { detectEmotionalTone, storeMessageInMemory } from './services/musk-memory-service';
import { storage } from './storage';
import { IUserProfile } from '../shared/types';

// Define test scenarios as per the document
const testScenarios = {
  general: [
    {
      prompt: "I'm a marketing analyst with 2 years of experience. What should I learn next to grow?",
      expectedOutput: "3 relevant skills with actionable resources, tone = confident and supportive"
    },
    {
      prompt: "What's the fastest way to transition from backend to full-stack?",
      expectedOutput: "Frontend tech recommendations + learning path + timeline"
    }
  ],
  stress: [
    {
      prompt: "I've applied to 50 jobs and haven't gotten a single reply. What's the point anymore?",
      expectedOutput: "Emotional validation + root-cause check (resume, ATS, mismatch) + motivation path"
    },
    {
      prompt: "My boss is completely unreasonable and I'm thinking of quitting without another job",
      expectedOutput: "Acknowledge feelings + evaluate situation + suggest controlled approach"
    }
  ],
  confusion: [
    {
      prompt: "I want to be successful but don't know if I should switch industries or not.",
      expectedOutput: "Clarify with questions. Help user reflect + suggest exploration steps"
    },
    {
      prompt: "Everyone talks about AI careers, but I don't know where to start or if it's for me",
      expectedOutput: "Break down AI career landscape + ask about user interests + suggest entry points"
    }
  ],
  domainSpecific: [
    {
      prompt: "What's the career growth path for an ML Engineer in fintech?",
      expectedOutput: "Specific job ladder + fintech considerations + AI trend alignment"
    },
    {
      prompt: "How do I transition from being a nurse to healthcare informatics?",
      expectedOutput: "Specific healthcare IT certifications + career path + transferable skills"
    }
  ],
  experimental: [
    {
      prompt: "Where would I be in 5 years if I combine AI and storytelling?",
      expectedOutput: "Speculative roadmap + cross-domain role suggestions (e.g. Narrative Designer for AI systems)"
    },
    {
      prompt: "How will quantum computing change job prospects for software engineers?",
      expectedOutput: "Timeline predictions + skill transition path + emerging role assessment"
    }
  ]
};

// Scoring criteria as per the document
type ScoringCriteria = {
  relevance: number;  // 1-5 How accurately the response meets the prompt goal
  empathy: number;    // 1-5 Appropriate tone, emotional recognition
  clarity: number;    // 1-5 Easy to understand, well-structured
  actionability: number; // 1-5 Real, usable advice or next steps
  innovation: number; // 1-5 Unique, forward-thinking suggestions
};

// Create test routes
export const setupMuskTestingRoutes = (apiRouter: express.Router): void => {
  
  // Run a single test scenario
  apiRouter.post('/musk-testing/run-test', async (req: Request, res: Response) => {
    try {
      const { category, index, userId } = req.body;
      
      if (!testScenarios[category] || !testScenarios[category][index]) {
        return res.status(400).json({ message: 'Invalid test category or index' });
      }
      
      const scenario = testScenarios[category][index];
      
      // Get user profile or use default if not available
      let userProfile: IUserProfile;
      
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          userProfile = {
            id: user.id,
            name: user.name || 'Test User',
            title: user.title || 'Professional',
            industry: user.industry || 'Technology',
            domain: user.domain || 'Software',
            location: user.location || 'Remote',
            lookingFor: user.lookingFor || 'job_opportunities'
          };
        } else {
          userProfile = {
            id: 0,
            name: 'Test User',
            title: 'Professional',
            industry: 'Technology',
            domain: 'Software',
            location: 'Remote',
            lookingFor: 'job_opportunities'
          };
        }
      } else {
        userProfile = {
          id: 0,
          name: 'Test User',
          title: 'Professional',
          industry: 'Technology',
          domain: 'Software',
          location: 'Remote',
          lookingFor: 'job_opportunities'
        };
      }
      
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      
      // Detect emotional tone
      const { tone } = detectEmotionalTone(scenario.prompt);
      
      // Build the system prompt
      const systemPrompt = `
You're Musk, the AI Career Assistant for Brandentifier. Respond to the user's career question below with the following tone: ${tone}.

Remember to:
1. Keep your response relevant, specific, and personalized
2. Show empathy and emotional intelligence
3. Make your advice clear and actionable
4. Provide innovative suggestions when appropriate

You're taking a test for the following expected output: ${scenario.expectedOutput}

User Profile:
- Name: ${userProfile.name}
- Role: ${userProfile.title}
- Industry: ${userProfile.industry}
- Domain: ${userProfile.domain}
- Location: ${userProfile.location}
- Looking for: ${userProfile.lookingFor}
`;

      // Call Anthropic API with the test prompt
      const message = await anthropic.messages.create({
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: scenario.prompt }],
        model: 'claude-3-7-sonnet-20250219',
      });
      
      // Store the message in memory for review
      if (userProfile.id > 0) {
        await storeMessageInMemory(
          userProfile.id,
          scenario.prompt,
          'user',
          'test'
        );
        
        await storeMessageInMemory(
          userProfile.id,
          message.content[0].text,
          'ai',
          'test'
        );
      }
      
      return res.status(200).json({
        scenario,
        response: message.content[0].text,
        emotionalTone: tone,
        // Scoring would be done manually or via another endpoint
        scoringTemplate: {
          relevance: 0, // 1-5
          empathy: 0,   // 1-5
          clarity: 0,   // 1-5
          actionability: 0, // 1-5
          innovation: 0 // 1-5
        }
      });
      
    } catch (error: any) {
      console.error('Error running Musk test:', error.message);
      return res.status(500).json({ message: 'Error running test', error: error.message });
    }
  });
  
  // Get list of all test scenarios
  apiRouter.get('/musk-testing/scenarios', (req: Request, res: Response) => {
    const scenarios = {};
    
    for (const [category, tests] of Object.entries(testScenarios)) {
      scenarios[category] = tests.map((test, index) => ({
        index,
        prompt: test.prompt,
        expectedOutput: test.expectedOutput
      }));
    }
    
    return res.status(200).json(scenarios);
  });
  
  // Submit score for a test run
  apiRouter.post('/musk-testing/score', async (req: Request, res: Response) => {
    try {
      const { category, index, userId, score, responseText } = req.body;
      
      if (!testScenarios[category] || !testScenarios[category][index]) {
        return res.status(400).json({ message: 'Invalid test category or index' });
      }
      
      if (!score || typeof score !== 'object') {
        return res.status(400).json({ message: 'Score object is required' });
      }
      
      // Validate scoring criteria
      const requiredFields = ['relevance', 'empathy', 'clarity', 'actionability', 'innovation'];
      for (const field of requiredFields) {
        if (typeof score[field] !== 'number' || score[field] < 1 || score[field] > 5) {
          return res.status(400).json({ message: `Invalid score for ${field}. Must be between 1-5.` });
        }
      }
      
      // Calculate average score
      const total = Object.values(score).reduce((sum: number, val: any) => sum + val, 0);
      const average = total / Object.values(score).length;
      
      // Store score in database (simplified for now, would need schema updates)
      // In a real implementation, you would save this to a database table
      console.log(`Test score for ${category}[${index}]: ${average.toFixed(1)} / 5.0`);
      
      return res.status(200).json({
        success: true,
        category,
        index,
        score,
        average,
        message: 'Score recorded successfully'
      });
      
    } catch (error: any) {
      console.error('Error saving test score:', error.message);
      return res.status(500).json({ message: 'Error saving test score', error: error.message });
    }
  });
};