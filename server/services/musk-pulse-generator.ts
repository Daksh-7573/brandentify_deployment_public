/**
 * Musk Pulse Generator Service
 * 
 * Automated content generation system that creates news-pulse entries
 * for the Musk AI assistant at scheduled times and based on events.
 */

import OpenAI from "openai";
import { pool } from "../db";
import { InsertPulse } from "@shared/schema";
import { storage } from "../storage";

/**
 * Generate contextually relevant publication URLs based on pulse content
 */
function generateContextualLinks(pulseContent: string, industry?: string): Array<{title: string, url: string, source: string}> {
  const content = pulseContent.toLowerCase();
  const industryLower = industry?.toLowerCase() || '';
  
  // Analyze content for key topics and generate appropriate URLs
  const links: Array<{title: string, url: string, source: string}> = [];
  
  // Leadership and management topics
  if (content.includes('leadership') || content.includes('management') || content.includes('team') || content.includes('strategy')) {
    links.push({
      title: "Leadership Strategies for Modern Workplaces",
      url: "https://hbr.org/2024/03/the-future-of-leadership-development",
      source: "Harvard Business Review"
    });
  }
  
  // Technology and innovation topics
  if (content.includes('technology') || content.includes('ai') || content.includes('digital') || content.includes('innovation')) {
    links.push({
      title: "Digital Transformation in the Modern Era",
      url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-top-trends-in-tech",
      source: "McKinsey & Company"
    });
  }
  
  // Career development topics
  if (content.includes('career') || content.includes('skill') || content.includes('development') || content.includes('growth')) {
    links.push({
      title: "Career Development in the Digital Age",
      url: "https://hbr.org/2022/12/whats-holding-back-your-career-development",
      source: "Harvard Business Review"
    });
  }
  
  // Remote work and hybrid topics
  if (content.includes('remote') || content.includes('hybrid') || content.includes('work from home') || content.includes('flexible')) {
    links.push({
      title: "The Future of Remote and Hybrid Work",
      url: "https://www.mckinsey.com/featured-insights/future-of-work/the-future-of-work-in-america",
      source: "McKinsey & Company"
    });
  }
  
  // Marketing and branding topics
  if (content.includes('marketing') || content.includes('brand') || content.includes('social media') || content.includes('advertising')) {
    links.push({
      title: "Marketing Trends and Brand Strategy",
      url: "https://www.linkedin.com/business/marketing/blog/marketing-strategy/marketing-trends",
      source: "LinkedIn Marketing"
    });
  }
  
  // Healthcare industry specific
  if (industryLower.includes('healthcare') || industryLower.includes('medical') || content.includes('health')) {
    links.push({
      title: "Healthcare Innovation and Digital Health",
      url: "https://www.mckinsey.com/industries/healthcare/our-insights/healthcare-trends-to-watch-in-2024",
      source: "McKinsey & Company"
    });
  }
  
  // Finance industry specific
  if (industryLower.includes('finance') || industryLower.includes('banking') || content.includes('financial')) {
    links.push({
      title: "Financial Services Digital Transformation",
      url: "https://www.mckinsey.com/industries/financial-services/our-insights/banking-matters",
      source: "McKinsey & Company"
    });
  }
  
  // Technology industry specific
  if (industryLower.includes('technology') || industryLower.includes('software') || industryLower.includes('tech')) {
    links.push({
      title: "Technology Industry Trends and Insights",
      url: "https://techcrunch.com/category/startups/",
      source: "TechCrunch"
    });
  }
  
  // Manufacturing industry specific
  if (industryLower.includes('manufacturing') || industryLower.includes('industrial') || content.includes('production')) {
    links.push({
      title: "Manufacturing Innovation and Industry 4.0",
      url: "https://www.mckinsey.com/industries/advanced-electronics/our-insights/manufacturing-trends",
      source: "McKinsey & Company"
    });
  }
  
  // If no specific matches, use general business insights
  if (links.length === 0) {
    links.push({
      title: "Business Strategy and Market Insights",
      url: "https://hbr.org/2025/01/9-trends-that-will-shape-work-in-2025-and-beyond",
      source: "Harvard Business Review"
    });
  }
  
  // Always add a secondary relevant link
  if (links.length === 1) {
    links.push({
      title: "Professional Development Resources",
      url: "https://www.linkedin.com/business/talent/blog",
      source: "LinkedIn Talent Blog"
    });
  }
  
  return links.slice(0, 2); // Return maximum 2 links
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
   * Get simplified active user context with enhanced data
   */
  private async getActiveUserContext(): Promise<{ 
    industries: string[]; 
    domains: string[]; 
    locations: string[]; 
    popularGoals: string[];
    targetRoles: string[];
    trendingHashtags: string[];
    skillGaps: string[];
  }> {
    try {
      const users = await this.getUserContext();
      
      // Basic aggregation
      const industries = Array.from(new Set(users.map(u => u.industry).filter((val): val is string => Boolean(val))));
      const domains = Array.from(new Set(users.map(u => u.domain).filter((val): val is string => Boolean(val))));
      const locations = Array.from(new Set(users.map(u => u.location).filter((val): val is string => Boolean(val))));
      
      // Goal and hashtag aggregation
      const allGoals = users.flatMap(u => u.goals || []);
      const popularGoals = Array.from(new Set(allGoals.map(g => g.title))).slice(0, 5);
      const targetRoles = Array.from(new Set(allGoals.map(g => g.targetRole).filter((val): val is string => Boolean(val)))).slice(0, 5);
      
      const allHashtags = users.flatMap(u => u.followedHashtags || []);
      const hashtagFrequency = allHashtags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const trendingHashtags = Object.entries(hashtagFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([tag]) => tag);
      
      // Skill gap analysis
      const allRequiredSkills = allGoals.flatMap(g => g.requiredSkills || []);
      const allCurrentSkills = allGoals.flatMap(g => g.currentSkills || []);
      const skillGaps = allRequiredSkills.filter(skill => 
        !allCurrentSkills.includes(skill)
      ).slice(0, 5);
      
      return {
        industries: industries.slice(0, 5),
        domains: domains.slice(0, 5),
        locations: locations.slice(0, 3),
        popularGoals,
        targetRoles,
        trendingHashtags,
        skillGaps
      };
    } catch (error) {
      console.error('[MuskPulseGenerator] Error getting enhanced active user context:', error);
      return { 
        industries: [], 
        domains: [], 
        locations: [], 
        popularGoals: [],
        targetRoles: [],
        trendingHashtags: [],
        skillGaps: []
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
      popularGoals: string[];
      targetRoles: string[];
      trendingHashtags: string[];
      skillGaps: string[];
    }
  ): Promise<{ title: string; content: string; industry?: string; hashtags: string[]; referenceLinks: Array<{title: string; url: string; source: string}> }> {
    
    const timePrompts = {
      morning: "Generate morning career insights and industry updates",
      afternoon: "Create midday professional development and market analysis content", 
      evening: "Provide evening networking opportunities and skill development insights"
    };

    const contextInfo = `
Platform user insights:
- Industries: ${userContext.industries.join(', ')}
- Specialties: ${userContext.domains.join(', ')}
- Locations: ${userContext.locations.join(', ')}
- Popular Career Goals: ${userContext.popularGoals.join(', ')}
- Target Roles: ${userContext.targetRoles.join(', ')}
- Trending Hashtags: ${userContext.trendingHashtags.map(tag => `#${tag}`).join(', ')}
- Common Skill Gaps: ${userContext.skillGaps.join(', ')}
    `;

    const prompt = `
You are Musk, an expert AI career assistant for Brandentifier, a professional networking platform.

Generate a ${options.timeOfDay} news pulse that provides highly personalized career insights with reference links.

${contextInfo}

Requirements:
- Create brief summaries (2-3 sentences max) instead of long content
- MUST include 2-3 credible reference links for "Read More" functionality
- Focus on actionable career advice that addresses current user goals and skill gaps
- Address trending hashtags and popular career objectives mentioned above
- Target content towards the specified roles and industries users are pursuing
- Be professional yet engaging with a personal touch
- Include 2-3 relevant hashtags from the trending list when applicable
- Prioritize advice that helps users bridge their skill gaps and achieve their career goals
- Encourage use of Brandentifier features for portfolio building, networking, and skill development
- Use real, credible sources like Harvard Business Review, McKinsey, Forbes, TechCrunch, MIT Technology Review, etc.

${timePrompts[options.timeOfDay]}

PERSONALIZATION FOCUS: Tailor content to help users progress towards their target roles by addressing their skill gaps and leveraging trending topics they're following.

CRITICAL: NEVER generate fake URLs or made-up article links. Only use these verified working direct article URLs:
- https://hbr.org/2025/01/9-trends-that-will-shape-work-in-2025-and-beyond (Harvard Business Review - Work Trends 2025)
- https://hbr.org/2022/12/whats-holding-back-your-career-development (Harvard Business Review - Career Development)
- https://hbr.org/podcast/2025/04/navigating-the-hybrid-work-dilemma (Harvard Business Review - Hybrid Work)
- https://www.mckinsey.com/featured-insights/future-of-work (McKinsey Future of Work)
- https://www.forbes.com/sites/forbescoachescouncil/ (Forbes Coaches Council)
- https://techcrunch.com/category/startups/ (TechCrunch Startups)
- https://www.linkedin.com/business/talent/blog (LinkedIn Talent Blog)

DO NOT create URLs like "/article", "/articles/", "/story/" or any other fake paths. Use ONLY the URLs listed above.

Respond with JSON format:
{
  "title": "Engaging title (max 80 chars)",
  "content": "Brief summary (2-3 sentences max) with key insights",
  "industry": "Primary industry focus (if applicable)", 
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "referenceLinks": [
    {
      "title": "Relevant resource title that matches the content topic",
      "url": "https://example.com/relevant-article",
      "source": "Publication Name"
    }
  ]
}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const generated = JSON.parse(response.choices[0].message.content || '{}');
      
      // Generate contextual links based on the actual pulse content and industry
      const pulseContent = generated.content || "Stay focused on your professional growth journey.";
      const pulseIndustry = generated.industry || userContext.industries[0];
      const contextualLinks = generateContextualLinks(pulseContent, pulseIndustry);

      return {
        title: generated.title || `${options.timeOfDay.charAt(0).toUpperCase() + options.timeOfDay.slice(1)} Career Insights`,
        content: pulseContent,
        industry: generated.industry,
        hashtags: generated.hashtags || [],
        referenceLinks: contextualLinks
      };
    } catch (error) {
      console.error('[MuskPulseGenerator] Error generating content:', error);
      
      // Fallback content with contextual links
      const fallbackContent = `Today is a great day to focus on your career development. Consider updating your Brandentifier portfolio or connecting with professionals in your industry.`;
      const fallbackIndustry = userContext.industries[0] || 'General';
      const contextualFallbackLinks = generateContextualLinks(fallbackContent, fallbackIndustry);

      return {
        title: `${options.timeOfDay.charAt(0).toUpperCase() + options.timeOfDay.slice(1)} Professional Update`,
        content: fallbackContent,
        hashtags: ['#CareerGrowth', '#ProfessionalDevelopment'],
        referenceLinks: contextualFallbackLinks
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
- Include credible reference links for "Read More" functionality
- Explains the career implications of this event
- Provides actionable advice for professionals in ${industry}
- Suggests relevant skills to develop
- Encourages use of Brandentifier features (portfolio updates, networking)
- Includes 2-3 relevant hashtags
- Provide authentic source links to reputable publications

Respond with JSON format:
{
  "title": "Engaging title about the event (max 80 chars)",
  "content": "Brief summary (2-3 sentences max) with key insights",
  "industry": "${industry}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "referenceLinks": [
    {
      "title": "Source article title",
      "url": "https://credible-source.com/article",
      "source": "Publication name"
    }
  ]
}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const generated = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        title: generated.title || `${industry} Industry Update`,
        content: generated.content || `Important developments in ${industry}. Stay informed and adapt your career strategy accordingly.`,
        industry: industry,
        hashtags: generated.hashtags || [`#${industry}`, '#IndustryNews'],
        referenceLinks: generated.referenceLinks || []
      };
    } catch (error) {
      console.error('[MuskPulseGenerator] Error generating event content:', error);
      
      return {
        title: `${industry} Industry Update`,
        content: `Important developments in ${industry}. Consider how these changes might impact your career path and what new skills might be valuable.`,
        industry: industry,
        hashtags: [`#${industry}`, '#CareerStrategy'],
        referenceLinks: []
      };
    }
  }

  /**
   * Create Musk pulse in the database
   */
  private async createMuskPulse(
    content: { title: string; content: string; industry?: string; hashtags: string[]; referenceLinks?: Array<{title: string; url: string; source: string}> }
  ): Promise<void> {
    
    // Create enhanced content with reference links
    const enhancedContent = content.referenceLinks && content.referenceLinks.length > 0 
      ? `${content.content}\n\n📚 Read More:\n${content.referenceLinks.map(link => `• ${link.title} - ${link.source}\n  ${link.url}`).join('\n')}`
      : content.content;

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