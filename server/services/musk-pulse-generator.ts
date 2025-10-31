/**
 * Musk Pulse Generator Service
 * 
 * Automated content generation system that creates news-pulse entries
 * for the Musk AI assistant at scheduled times and based on events.
 * 
 * NOW USES FREE VPS OLLAMA - NO OPENAI COSTS!
 */

import { pool } from "../db";
import { InsertPulse } from "@shared/schema";
import { storage } from "../storage";
import { LocalAIService } from "./local-ai-service";

/**
 * Generate contextually relevant publication URLs based on pulse content
 * Only returns links when they are truly relevant to the content
 */
function generateContextualLinks(pulseContent: string, industry?: string): Array<{title: string, url: string, source: string}> {
  const content = pulseContent.toLowerCase();
  const industryLower = industry?.toLowerCase() || '';
  
  // Analyze content for key topics and generate appropriate URLs
  // Only add links when they are highly relevant to the pulse content
  const links: Array<{title: string, url: string, source: string}> = [];
  
  // Technology and AI topics - specific match required
  if ((content.includes('artificial intelligence') || content.includes(' ai ') || content.includes('machine learning')) && 
      (content.includes('trend') || content.includes('innovation') || content.includes('technology'))) {
    links.push({
      title: "Technology Trends and AI Innovation",
      url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-top-trends-in-tech",
      source: "McKinsey & Company"
    });
  }
  
  // Remote work and future of work - specific match required
  if ((content.includes('remote work') || content.includes('hybrid work') || content.includes('future of work')) &&
      (content.includes('trend') || content.includes('study') || content.includes('research'))) {
    links.push({
      title: "The Future of Work Research",
      url: "https://www.mckinsey.com/featured-insights/future-of-work",
      source: "McKinsey & Company"
    });
  }
  
  // Healthcare industry - specific match required
  if (industryLower.includes('healthcare') && 
      (content.includes('innovation') || content.includes('digital health') || content.includes('healthcare trend'))) {
    links.push({
      title: "Healthcare Innovation Insights",
      url: "https://www.mckinsey.com/industries/healthcare",
      source: "McKinsey & Company"
    });
  }
  
  // Finance industry - specific match required
  if (industryLower.includes('finance') && 
      (content.includes('fintech') || content.includes('banking') || content.includes('financial services'))) {
    links.push({
      title: "Financial Services Insights",
      url: "https://www.mckinsey.com/industries/financial-services",
      source: "McKinsey & Company"
    });
  }
  
  // Technology startups - specific match required
  if ((industryLower.includes('technology') || industryLower.includes('tech') || industryLower.includes('startup')) &&
      (content.includes('startup') || content.includes('venture') || content.includes('funding'))) {
    links.push({
      title: "Technology and Startup News",
      url: "https://techcrunch.com/category/startups/",
      source: "TechCrunch"
    });
  }
  
  // Manufacturing and Industry 4.0 - specific match required
  if ((industryLower.includes('manufacturing') || content.includes('manufacturing')) &&
      (content.includes('automation') || content.includes('industry 4.0') || content.includes('digital transformation'))) {
    links.push({
      title: "Manufacturing and Industry 4.0",
      url: "https://www.mckinsey.com/industries/advanced-electronics",
      source: "McKinsey & Company"
    });
  }
  
  // Marketing and digital marketing - specific match required
  if ((content.includes('digital marketing') || content.includes('marketing strategy') || content.includes('social media marketing')) &&
      (content.includes('trend') || content.includes('strategy') || content.includes('campaign'))) {
    links.push({
      title: "Digital Marketing Trends",
      url: "https://www.linkedin.com/business/marketing/blog",
      source: "LinkedIn Marketing"
    });
  }
  
  // Only return links if they are truly relevant - no fallback, no forced minimum
  return links.slice(0, 2); // Maximum 2 links when relevant
}

// Initialize FREE Local AI Service (uses VPS Ollama)
const localAI = new LocalAIService();

interface UserContext {
  id: number;
  industry?: string;
  domain?: string;
  location?: string;
  goals?: Array<{
    title: string;
    goalType: string;
    targetIndustry?: string;
    targetRole?: string;
    currentSkills: string[];
    requiredSkills: string[];
  }>;
  followedHashtags?: string[];
}

interface PulseGenerationOptions {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  eventDriven?: boolean;
  specificIndustry?: string;
  trendingTopics?: string[];
}

export class MuskPulseGenerator {
  private static readonly MUSK_USER_ID = 3;

  /**
   * Generate a scheduled pulse based on time of day
   */
  async generateScheduledPulse(options: PulseGenerationOptions): Promise<void> {
    console.log(`[MuskPulseGenerator] Generating ${options.timeOfDay} pulse`);
    
    try {
      // Get active user context for personalization
      const userContext = await this.getActiveUserContext();
      
      // Generate content based on time and user interests
      const content = await this.generatePulseContent(options, userContext);
      
      // Create the pulse
      await this.createMuskPulse(content);
      
      console.log(`[MuskPulseGenerator] Successfully created ${options.timeOfDay} pulse`);
    } catch (error) {
      console.error(`[MuskPulseGenerator] Error generating ${options.timeOfDay} pulse:`, error);
      throw error;
    }
  }

  /**
   * Generate event-driven pulse for specific industry news
   */
  async generateEventDrivenPulse(industry: string, eventDescription: string): Promise<void> {
    console.log(`[MuskPulseGenerator] Generating event-driven pulse for ${industry}`);
    
    try {
      const userContext = await this.getUsersByIndustry(industry);
      
      const options: PulseGenerationOptions = {
        timeOfDay: 'afternoon',
        eventDriven: true,
        specificIndustry: industry
      };
      
      const content = await this.generateEventBasedContent(eventDescription, industry, userContext);
      
      await this.createMuskPulse(content);
      
      console.log(`[MuskPulseGenerator] Successfully created event-driven pulse for ${industry}`);
    } catch (error) {
      console.error(`[MuskPulseGenerator] Error generating event-driven pulse:`, error);
      throw error;
    }
  }

  /**
   * Get active user context for content personalization including goals and hashtags
   */
  private async getUserContext(): Promise<UserContext[]> {
    try {
      const client = await pool.connect();
      try {
        // Get basic user info
        const userResult = await client.query(`
          SELECT DISTINCT 
            id, industry, domain, location
          FROM users 
          WHERE industry IS NOT NULL 
            AND created_at >= NOW() - INTERVAL '30 days'
          LIMIT 20
        `);
        
        const users: UserContext[] = [];
        
        for (const row of userResult.rows) {
          const userId = Number(row.id);
          
          // Get user goals
          const goalsResult = await client.query(`
            SELECT title, goal_type, target_industry, target_role, 
                   current_skills, required_skills
            FROM career_goals 
            WHERE user_id = $1 AND status != 'completed'
            LIMIT 3
          `, [userId]);
          
          // Get followed hashtags
          const hashtagsResult = await client.query(`
            SELECT h.tag
            FROM user_hashtag_follows uhf
            JOIN hashtags h ON uhf.hashtag_id = h.id
            WHERE uhf.user_id = $1
            ORDER BY h.count DESC
            LIMIT 10
          `, [userId]);
          
          users.push({
            id: userId,
            industry: row.industry as string,
            domain: row.domain as string,
            location: row.location as string,
            goals: goalsResult.rows.map((goal: any) => ({
              title: goal.title,
              goalType: goal.goal_type,
              targetIndustry: goal.target_industry,
              targetRole: goal.target_role,
              currentSkills: Array.isArray(goal.current_skills) ? goal.current_skills : [],
              requiredSkills: Array.isArray(goal.required_skills) ? goal.required_skills : []
            })),
            followedHashtags: hashtagsResult.rows.map((row: any) => row.tag)
          });
        }
        
        return users;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[MuskPulseGenerator] Error fetching enhanced user context:', error);
      return [];
    }
  }

  /**
   * Get simplified active user context for news and updates
   */
  private async getActiveUserContext(): Promise<{ 
    industries: string[]; 
    domains: string[]; 
    locations: string[]; 
    trendingHashtags: string[];
  }> {
    try {
      const users = await this.getUserContext();
      
      // Basic aggregation
      const industries = Array.from(new Set(users.map(u => u.industry).filter((val): val is string => Boolean(val))));
      const domains = Array.from(new Set(users.map(u => u.domain).filter((val): val is string => Boolean(val))));
      const locations = Array.from(new Set(users.map(u => u.location).filter((val): val is string => Boolean(val))));
      
      // Hashtag aggregation for trending topics
      const allHashtags = users.flatMap(u => u.followedHashtags || []);
      const hashtagFrequency = allHashtags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const trendingHashtags = Object.entries(hashtagFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([tag]) => tag);
      
      return {
        industries: industries.slice(0, 5),
        domains: domains.slice(0, 5),
        locations: locations.slice(0, 3),
        trendingHashtags
      };
    } catch (error) {
      console.error('[MuskPulseGenerator] Error getting active user context:', error);
      return { 
        industries: [], 
        domains: [], 
        locations: [], 
        trendingHashtags: []
      };
    }
  }

  /**
   * Get users by specific industry
   */
  private async getUsersByIndustry(industry: string): Promise<UserContext[]> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT id, industry, domain, location
          FROM users 
          WHERE LOWER(industry) = LOWER($1)
          LIMIT 10
        `, [industry]);
        
        return result.rows.map((row: any) => ({
          id: Number(row.id),
          industry: row.industry as string,
          domain: row.domain as string,
          location: row.location as string
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[MuskPulseGenerator] Error fetching users by industry:', error);
      return [];
    }
  }

  /**
   * Generate pulse content using OpenAI
   */
  private async generatePulseContent(
    options: PulseGenerationOptions, 
    userContext: { 
      industries: string[]; 
      domains: string[]; 
      locations: string[]; 
      trendingHashtags: string[];
    }
  ): Promise<{ title: string; content: string; industry?: string; hashtags: string[]; referenceLinks: Array<{title: string; url: string; source: string}> }> {
    
    const timePrompts = {
      morning: "Generate morning industry news and market updates",
      afternoon: "Create midday professional updates and industry insights", 
      evening: "Provide evening industry news and market trends"
    };

    const contextInfo = `
Platform user insights:
- Industries: ${userContext.industries.join(', ')}
- Specialties: ${userContext.domains.join(', ')}
- Locations: ${userContext.locations.join(', ')}
- Trending Hashtags: ${userContext.trendingHashtags.map(tag => `#${tag}`).join(', ')}
    `;

    const prompt = `
You are Musk, an expert AI career assistant for Brandentifier, a professional networking platform.

Generate a ${options.timeOfDay} news pulse focused on industry updates and professional news.

${contextInfo}

Requirements:
- Create brief news summaries (2-3 sentences max)
- Focus on industry updates, market trends, and professional news
- Address trending hashtags and topics mentioned above
- Be professional yet engaging with a personal touch
- Include 2-3 relevant hashtags from the trending list when applicable
- Encourage use of Brandentifier features for portfolio building and networking
- DO NOT include reference links in your response - they will be added automatically when relevant

${timePrompts[options.timeOfDay]}

FOCUS: Provide timely industry news and professional updates relevant to the platform users' industries and trending topics.

Respond with JSON format:
{
  "title": "Engaging news title (max 80 chars)",
  "content": "Brief news summary (2-3 sentences max) with key insights",
  "industry": "Primary industry focus (if applicable)", 
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}
    `;

    try {
      // Use FREE VPS Ollama instead of expensive OpenAI
      const response = await localAI.generateCompletion(prompt, 'musk-pulse-generation');
      
      // Parse JSON from response (Ollama doesn't have strict JSON mode, so extract it)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const generated = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      // Generate contextual links ONLY if truly relevant to the pulse content
      const pulseContent = generated.content || "Stay updated with the latest industry news.";
      const pulseIndustry = generated.industry || userContext.industries[0];
      const contextualLinks = generateContextualLinks(pulseContent, pulseIndustry);

      return {
        title: generated.title || `${options.timeOfDay.charAt(0).toUpperCase() + options.timeOfDay.slice(1)} Industry Update`,
        content: pulseContent,
        industry: generated.industry,
        hashtags: generated.hashtags || [],
        referenceLinks: contextualLinks // Will be empty array if no relevant links
      };
    } catch (error) {
      console.error('[MuskPulseGenerator] Error generating content:', error);
      
      // Fallback content without links
      const fallbackContent = `Stay updated with the latest industry news. Connect with professionals and share insights on Brandentifier.`;

      return {
        title: `${options.timeOfDay.charAt(0).toUpperCase() + options.timeOfDay.slice(1)} Professional Update`,
        content: fallbackContent,
        hashtags: ['#IndustryNews', '#ProfessionalNetworking'],
        referenceLinks: [] // No links for fallback
      };
    }
  }

  /**
   * Generate event-based content
   */
  private async generateEventBasedContent(
    eventDescription: string,
    industry: string,
    userContext: UserContext[]
  ): Promise<{ title: string; content: string; industry: string; hashtags: string[]; referenceLinks: Array<{title: string; url: string; source: string}> }> {
    
    const prompt = `
You are Musk, an expert AI career assistant for Brandentifier.

Generate a news pulse about this industry event:
Event: ${eventDescription}
Industry: ${industry}
Target audience: ${userContext.length} professionals in ${industry}

Requirements:
- Create brief summaries (2-3 sentences max) instead of long content
- Explains the career implications of this event
- Provides actionable advice for professionals in ${industry}
- Suggests relevant skills to develop
- Encourages use of Brandentifier features (portfolio updates, networking)
- Includes 2-3 relevant hashtags
- DO NOT include reference links in your response - they will be added automatically when relevant

Respond with JSON format:
{
  "title": "Engaging title about the event (max 80 chars)",
  "content": "Brief summary (2-3 sentences max) with key insights",
  "industry": "${industry}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}
    `;

    try {
      // Use FREE VPS Ollama instead of expensive OpenAI
      const response = await localAI.generateCompletion(prompt, 'musk-pulse-generation');
      
      // Parse JSON from response (Ollama doesn't have strict JSON mode, so extract it)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const generated = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      // Generate contextual links ONLY if truly relevant to the pulse content (same as scheduled pulses)
      const pulseContent = generated.content || `Important developments in ${industry}. Stay informed and adapt your career strategy accordingly.`;
      const contextualLinks = generateContextualLinks(pulseContent, industry);
      
      return {
        title: generated.title || `${industry} Industry Update`,
        content: pulseContent,
        industry: industry,
        hashtags: generated.hashtags || [`#${industry}`, '#IndustryNews'],
        referenceLinks: contextualLinks // Will be empty array if no relevant links
      };
    } catch (error) {
      console.error('[MuskPulseGenerator] Error generating event content:', error);
      
      return {
        title: `${industry} Industry Update`,
        content: `Important developments in ${industry}. Consider how these changes might impact your career path and what new skills might be valuable.`,
        industry: industry,
        hashtags: [`#${industry}`, '#CareerStrategy'],
        referenceLinks: [] // No links for fallback
      };
    }
  }

  /**
   * Create Musk pulse in the database
   */
  private async createMuskPulse(
    content: { title: string; content: string; industry?: string; hashtags: string[]; referenceLinks?: Array<{title: string; url: string; source: string}> }
  ): Promise<void> {
    
    // Only add reference links if they exist and are relevant
    const enhancedContent = content.referenceLinks && content.referenceLinks.length > 0 
      ? `${content.content}\n\n📚 Read More:\n${content.referenceLinks.map(link => `• ${link.title} - ${link.source}\n  ${link.url}`).join('\n')}`
      : content.content; // No links section if no relevant links

    const pulseData: InsertPulse = {
      userId: MuskPulseGenerator.MUSK_USER_ID,
      type: "news-pulse",
      title: content.title,
      content: enhancedContent,
      industry: content.industry || null,
      domain: null,
      category: null,
      mediaType: null,
      mediaUrls: [],
      mediaLocalStorageKeys: [],
      pollOptions: [],
      projectId: null,
      insightfulCount: 0,
      misinformedCount: 0,
      shareCount: 0,
      isPublished: true,
      expiresAt: null
    };

    try {
      const pulse = await storage.createPulse(pulseData);
      console.log(`[MuskPulseGenerator] Created pulse with ID: ${pulse.id}`);
      
      // Add hashtags if any
      if (content.hashtags.length > 0) {
        await this.addHashtagsToPulse(pulse.id, content.hashtags);
      }
      
    } catch (error) {
      console.error('[MuskPulseGenerator] Error creating pulse:', error);
      throw error;
    }
  }

  /**
   * Add hashtags to the created pulse
   */
  private async addHashtagsToPulse(pulseId: number, hashtags: string[]): Promise<void> {
    try {
      for (const hashtag of hashtags) {
        // Remove # if present and extract hashtags
        const cleanHashtag = hashtag.replace('#', '');
        await storage.extractAndSaveHashtags(`#${cleanHashtag}`, pulseId);
      }
    } catch (error) {
      console.error('[MuskPulseGenerator] Error adding hashtags:', error);
      // Don't throw - hashtags are not critical
    }
  }
}

// Export singleton instance
export const muskPulseGenerator = new MuskPulseGenerator();