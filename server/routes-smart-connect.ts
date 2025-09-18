import express from 'express';
import { IStorage } from './storage';

/**
 * Routes for the Smart Connect feature
 */
export function registerSmartConnectRoutes(app: express.Express, storage: IStorage) {
  // Submit a smart connect search request
  app.post('/api/smart-connect', async (req, res) => {
    try {
      const { 
        userId, 
        lookingFor, 
        targetJobTitle, 
        experienceLevel, 
        industry, 
        domain, 
        location, 
        skills,
        remotePreference
      } = req.body;
      
      // In a real implementation, this would use the decision engine to find matches
      // For now, we'll simulate some delay and return demo data
      
      // Log the request parameters for debugging
      console.log('[Smart Connect] Search request:', {
        userId,
        lookingFor,
        targetJobTitle,
        experienceLevel,
        industry,
        domain,
        location,
        skills,
        remotePreference
      });
      
      // Add a small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return demo matches based on criteria
      const matches = generateDemoMatches(industry || '', location || '', experienceLevel || '', skills || []);
      
      res.status(200).json({
        matches,
        matchCount: matches.length,
        matchingCriteria: req.body
      });
    } catch (error) {
      console.error('[Smart Connect] Error processing request:', error);
      res.status(500).json({ error: 'Failed to process Smart Connect request' });
    }
  });
  
  // Get smart connect results
  app.get('/api/smart-connect', async (req, res) => {
    try {
      // In a real implementation, this would fetch previously generated matches
      // For now, we'll return demo data
      
      const userId = req.query.userId || 1;
      
      console.log(`[Smart Connect] Fetching results for user ${userId}`);
      
      // Generate some example matches
      const matches = generateDemoMatches('Technology', 'San Francisco', 'senior', ['React', 'TypeScript']);
      
      res.status(200).json({
        matches,
        matchCount: matches.length,
        matchingCriteria: {
          industry: 'Technology',
          location: 'San Francisco',
          experienceLevel: 'senior',
          skills: ['React', 'TypeScript']
        }
      });
    } catch (error) {
      console.error('[Smart Connect] Error fetching results:', error);
      res.status(500).json({ error: 'Failed to fetch Smart Connect results' });
    }
  });
}

/**
 * Generate demo match results based on criteria
 */
function generateDemoMatches(
  industry: string,
  location: string,
  experienceLevel: string,
  skills: string[]
) {
  // Create base matches
  const baseMatches = [
    {
      user: {
        id: 101,
        name: "Alex Johnson",
        title: "Senior Software Engineer",
        photoURL: null,
        location: "San Francisco, CA",
        industry: "Technology"
      },
      score: 0.92,
      strengthAreas: ["Full Stack Development", "System Architecture", "Team Leadership"],
      compatibilityInsights: [
        "You both have expertise in React and TypeScript",
        "You're both in the Technology industry",
        "Alex has 8 years of experience that complements your background"
      ],
      matchReasons: [
        "Alex has mentored 5 junior developers in the past year",
        "Currently working on open-source projects seeking collaborators",
        "Strong technical expertise in your areas of interest"
      ]
    },
    {
      user: {
        id: 102,
        name: "Jamie Smith",
        title: "Product Manager",
        photoURL: null,
        location: "New York, NY",
        industry: "Technology"
      },
      score: 0.87,
      strengthAreas: ["Product Strategy", "Market Research", "User Experience"],
      compatibilityInsights: [
        "Your technical background complements Jamie's product focus",
        "You're in the same industry with different specializations",
        "Jamie has experience working with developers of your experience level"
      ],
      matchReasons: [
        "Could provide valuable product perspective to your technical projects",
        "Looking to connect with technical experts for mentorship",
        "Shares your interest in emerging technologies"
      ]
    },
    {
      user: {
        id: 103,
        name: "Taylor Wong",
        title: "CTO",
        photoURL: null,
        location: "Austin, TX",
        industry: "Technology"
      },
      score: 0.85,
      strengthAreas: ["Technology Leadership", "Innovation Strategy", "Engineering Management"],
      compatibilityInsights: [
        "Taylor has extensive experience in technology leadership",
        "You share interests in similar technology domains",
        "Taylor's startup background would be valuable to learn from"
      ],
      matchReasons: [
        "Building a team and looking for talented professionals",
        "Can provide career guidance and industry insights",
        "Extensive network in the technology sector"
      ]
    }
  ];
  
  // Adjust match scores and insights based on criteria
  return baseMatches.map(match => {
    let adjustedScore = match.score;
    let adjustedInsights = [...match.compatibilityInsights];
    let adjustedReasons = [...match.matchReasons];
    
    // Adjust for industry match
    if (industry && match.user.industry === industry) {
      adjustedScore += 0.03;
      adjustedInsights.push(`Both focused on the ${industry} industry`);
    } else if (industry) {
      adjustedScore -= 0.1;
    }
    
    // Adjust for location
    if (location && match.user.location.includes(location)) {
      adjustedScore += 0.05;
      adjustedInsights.push(`Both located in or near ${location}`);
      adjustedReasons.push("Geographic proximity enables in-person collaboration");
    }
    
    // Adjust for skills
    if (skills && skills.length > 0) {
      const skillText = skills.slice(0, 3).join(", ");
      if (match.user.id % 2 === 0) {
        adjustedScore += 0.02;
        adjustedInsights.push(`Shares expertise in ${skillText}`);
      }
    }
    
    // Normalize score to be between 0 and 1
    adjustedScore = Math.min(Math.max(adjustedScore, 0), 1);
    
    return {
      ...match,
      score: Number(adjustedScore.toFixed(2)),
      compatibilityInsights: adjustedInsights.slice(0, 4), // Limit to 4 insights
      matchReasons: adjustedReasons.slice(0, 4) // Limit to 4 reasons
    };
  });
}