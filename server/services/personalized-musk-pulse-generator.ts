/**
 * Personalized Musk Pulse Generator Service
 * 
 * Generates user-specific news pulses based on individual industry, domain, goals, and interests.
 * Each user receives their own personalized content tailored to their career needs.
 * 
 * Uses FREE local Ollama (Llama 3.2:3b) for $0.00 cost per pulse
 */

import { pool } from "../db";
import { InsertPulse } from "@shared/schema";
import { storage } from "../storage";
import { LocalAIService } from "./local-ai-service";

const localAI = LocalAIService.getInstance();

interface UserProfile {
  id: number;
  name: string;
  industry?: string;
  domain?: string;
  location?: string;
  title?: string;
  lookingFor?: string;
  goals?: Array<{
    title: string;
    goalType: string;
    targetIndustry?: string;
    targetRole?: string;
  }>;
  followedHashtags?: string[];
  skills?: Array<{
    name: string;
    level: string;
  }>;
}

interface PulseGenerationOptions {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  eventDriven?: boolean;
}

export class PersonalizedMuskPulseGenerator {
  private static readonly MUSK_USER_ID = 3;

  /**
   * Generate personalized pulses for specific users (timezone-based scheduling)
   */
  async generatePersonalizedPulsesForSpecificUsers(userIds: number[], timeOfDay: 'morning' | 'afternoon' | 'evening'): Promise<void> {
    console.log(`[PersonalizedMuskPulseGenerator] Starting ${timeOfDay} pulse generation for ${userIds.length} specific users`);
    
    try {
      // Get specific users
      const users = await this.getSpecificUsers(userIds);
      console.log(`[PersonalizedMuskPulseGenerator] Found ${users.length} users to personalize pulses for`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await this.generatePersonalizedPulseForUser(user, timeOfDay);
          successCount++;
          console.log(`[PersonalizedMuskPulseGenerator] ✅ Generated ${timeOfDay} pulse for ${user.name} (${user.id})`);
        } catch (error) {
          console.error(`[PersonalizedMuskPulseGenerator] ❌ Error for user ${user.id}:`, error);
          errorCount++;
        }
      }

      console.log(`[PersonalizedMuskPulseGenerator] ${timeOfDay} pulse generation complete: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      console.error(`[PersonalizedMuskPulseGenerator] Fatal error:`, error);
      throw error;
    }
  }

  /**
   * Generate personalized pulses for all users at a given time of day
   */
  async generatePersonalizedPulsesForAllUsers(timeOfDay: 'morning' | 'afternoon' | 'evening'): Promise<void> {
    console.log(`[PersonalizedMuskPulseGenerator] Starting ${timeOfDay} pulse generation for all users`);
    
    try {
      // Get all active users
      const users = await this.getAllActiveUsers();
      console.log(`[PersonalizedMuskPulseGenerator] Found ${users.length} users to personalize pulses for`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await this.generatePersonalizedPulseForUser(user, timeOfDay);
          successCount++;
          console.log(`[PersonalizedMuskPulseGenerator] ✅ Generated ${timeOfDay} pulse for ${user.name} (${user.id})`);
        } catch (error) {
          console.error(`[PersonalizedMuskPulseGenerator] ❌ Error for user ${user.id}:`, error);
          errorCount++;
        }
      }

      console.log(`[PersonalizedMuskPulseGenerator] ${timeOfDay} pulse generation complete: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      console.error(`[PersonalizedMuskPulseGenerator] Fatal error:`, error);
      throw error;
    }
  }

  /**
   * Generate a personalized pulse for a single user
   */
  async generatePersonalizedPulseForUser(user: UserProfile, timeOfDay: 'morning' | 'afternoon' | 'evening'): Promise<void> {
    try {
      // Build personalized context
      const personalizedContext = this.buildPersonalizedContext(user);
      
      // Generate personalized content
      const content = await this.generatePersonalizedContent(user, timeOfDay, personalizedContext);
      
      // Create personalized pulse in database
      await this.createPersonalizedPulse(user.id, content);
      
    } catch (error) {
      console.error(`[PersonalizedMuskPulseGenerator] Error generating pulse for user ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Get all active users who should receive personalized pulses
   */
  private async getAllActiveUsers(): Promise<UserProfile[]> {
    try {
      const client = await pool.connect();
      try {
        // Get users who have logged in within the last 30 days and have industry data
        const userResult = await client.query(`
          SELECT DISTINCT 
            u.id, u.name, u.industry, u.domain, u.location, u.title, u.looking_for
          FROM users u
          WHERE u.industry IS NOT NULL 
            AND (u.last_login_at >= NOW() - INTERVAL '30 days' OR u.created_at >= NOW() - INTERVAL '7 days')
          ORDER BY u.id
        `);
        
        const users: UserProfile[] = [];
        
        for (const row of userResult.rows) {
          const userId = Number(row.id);
          
          // Get user goals
          const goalsResult = await client.query(`
            SELECT title, goal_type, target_industry, target_role
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

          // Get top skills
          const skillsResult = await client.query(`
            SELECT name, level
            FROM skills
            WHERE user_id = $1
            ORDER BY proficiency DESC
            LIMIT 5
          `, [userId]);
          
          users.push({
            id: userId,
            name: row.name as string,
            industry: row.industry as string,
            domain: row.domain as string,
            location: row.location as string,
            title: row.title as string,
            lookingFor: row.looking_for as string,
            goals: goalsResult.rows.map((goal: any) => ({
              title: goal.title,
              goalType: goal.goal_type,
              targetIndustry: goal.target_industry,
              targetRole: goal.target_role
            })),
            followedHashtags: hashtagsResult.rows.map((row: any) => row.tag),
            skills: skillsResult.rows.map((skill: any) => ({
              name: skill.name,
              level: skill.level
            }))
          });
        }
        
        return users;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[PersonalizedMuskPulseGenerator] Error fetching users:', error);
      return [];
    }
  }

  /**
   * Get specific users by IDs (for timezone-based scheduling)
   */
  private async getSpecificUsers(userIds: number[]): Promise<UserProfile[]> {
    try {
      if (userIds.length === 0) return [];

      const client = await pool.connect();
      try {
        // Get users by specific IDs
        const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
        const userResult = await client.query(`
          SELECT DISTINCT 
            u.id, u.name, u.industry, u.domain, u.location, u.title, u.looking_for
          FROM users u
          WHERE u.id IN (${placeholders}) AND u.industry IS NOT NULL
          ORDER BY u.id
        `, userIds);
        
        const users: UserProfile[] = [];
        
        for (const row of userResult.rows) {
          const userId = Number(row.id);
          
          // Get user goals
          const goalsResult = await client.query(`
            SELECT title, goal_type, target_industry, target_role
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

          // Get top skills
          const skillsResult = await client.query(`
            SELECT name, level
            FROM skills
            WHERE user_id = $1
            ORDER BY proficiency DESC
            LIMIT 5
          `, [userId]);
          
          users.push({
            id: userId,
            name: row.name as string,
            industry: row.industry as string,
            domain: row.domain as string,
            location: row.location as string,
            title: row.title as string,
            lookingFor: row.looking_for as string,
            goals: goalsResult.rows.map((goal: any) => ({
              title: goal.title,
              goalType: goal.goal_type,
              targetIndustry: goal.target_industry,
              targetRole: goal.target_role
            })),
            followedHashtags: hashtagsResult.rows.map((row: any) => row.tag),
            skills: skillsResult.rows.map((skill: any) => ({
              name: skill.name,
              level: skill.level
            }))
          });
        }
        
        return users;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[PersonalizedMuskPulseGenerator] Error fetching specific users:', error);
      return [];
    }
  }

  /**
   * Build personalized context string for AI generation
   */
  private buildPersonalizedContext(user: UserProfile): string {
    const parts: string[] = [];
    
    if (user.industry) parts.push(`Industry: ${user.industry}`);
    if (user.domain) parts.push(`Specialty: ${user.domain}`);
    if (user.title) parts.push(`Role: ${user.title}`);
    if (user.location) parts.push(`Location: ${user.location}`);
    if (user.lookingFor) parts.push(`Looking for: ${user.lookingFor}`);
    
    if (user.goals && user.goals.length > 0) {
      const goalTitles = user.goals.map(g => g.title).join(', ');
      parts.push(`Career Goals: ${goalTitles}`);
    }
    
    if (user.skills && user.skills.length > 0) {
      const skillNames = user.skills.map(s => s.name).join(', ');
      parts.push(`Top Skills: ${skillNames}`);
    }
    
    if (user.followedHashtags && user.followedHashtags.length > 0) {
      const hashtags = user.followedHashtags.slice(0, 5).map(tag => `#${tag}`).join(', ');
      parts.push(`Interests: ${hashtags}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Generate personalized content using FREE local Ollama
   */
  private async generatePersonalizedContent(
    user: UserProfile,
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    context: string
  ): Promise<{ title: string; content: string; hashtags: string[] }> {
    
    const timePrompts = {
      morning: "Generate a personalized morning industry update",
      afternoon: "Create a personalized midday professional insight", 
      evening: "Provide a personalized evening industry trend analysis"
    };

    const prompt = `
You are Musk, ${user.name}'s personal AI career assistant on Brandentify.

Generate a ${timeOfDay} personalized news pulse for ${user.name} based on their professional profile:

${context}

Requirements:
- Create a brief, personalized update (2-3 sentences max)
- Focus on industry news and trends relevant to ${user.industry || 'their industry'}
- Reference their career goals or specialty when relevant
- Be direct, personal, and actionable
- Include 2-3 relevant hashtags from their interests
- Encourage specific actions they can take on Brandentify (update portfolio, connect with peers, etc.)

${timePrompts[timeOfDay]}

IMPORTANT: Make this feel like a personal message to ${user.name}, not generic news.

Respond ONLY with valid JSON format (no markdown, no extra text):
{
  "title": "Personalized title addressing ${user.name} (max 80 chars)",
  "content": "Personalized brief update (2-3 sentences max)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}
    `;

    try {
      // Use FREE local Ollama instead of paid OpenAI
      const response = await localAI.generateNewsContent(prompt);
      
      // Parse JSON from response (handle potential markdown code blocks)
      let jsonStr = response.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      const generated = JSON.parse(jsonStr);
      
      return {
        title: generated.title || `${user.name}'s ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Update`,
        content: generated.content || `${user.name}, here's your personalized career update.`,
        hashtags: generated.hashtags || []
      };
    } catch (error) {
      console.error('[PersonalizedMuskPulseGenerator] Error generating personalized content:', error);
      
      // Fallback personalized content
      return {
        title: `${user.name}'s ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Update`,
        content: `${user.name}, stay updated with the latest in ${user.industry || 'your industry'}. Check out new connections and opportunities on Brandentify.`,
        hashtags: user.followedHashtags?.slice(0, 3) || ['#CareerGrowth']
      };
    }
  }

  /**
   * Create personalized pulse in the database
   */
  private async createPersonalizedPulse(
    targetUserId: number,
    content: { title: string; content: string; hashtags: string[] }
  ): Promise<void> {
    
    const pulseData: InsertPulse = {
      userId: PersonalizedMuskPulseGenerator.MUSK_USER_ID,
      targetUserId: targetUserId, // THIS IS THE KEY - targeting specific user
      type: "news-pulse",
      title: content.title,
      content: content.content,
      insightfulCount: 0,
      misinformedCount: 0,
      shareCount: 0,
      isPublished: true,
      expiresAt: null
    };

    try {
      const pulse = await storage.createPulse(pulseData);
      console.log(`[PersonalizedMuskPulseGenerator] Created personalized pulse ${pulse.id} for user ${targetUserId}`);
      
      // Add hashtags if any
      if (content.hashtags.length > 0) {
        await this.addHashtagsToPulse(pulse.id, content.hashtags);
      }
      
    } catch (error) {
      console.error('[PersonalizedMuskPulseGenerator] Error creating pulse:', error);
      throw error;
    }
  }

  /**
   * Add hashtags to the created pulse
   */
  private async addHashtagsToPulse(pulseId: number, hashtags: string[]): Promise<void> {
    try {
      for (const hashtag of hashtags) {
        const cleanHashtag = hashtag.replace('#', '');
        await storage.extractAndSaveHashtags(`#${cleanHashtag}`, pulseId);
      }
    } catch (error) {
      console.error('[PersonalizedMuskPulseGenerator] Error adding hashtags:', error);
    }
  }
}

export const personalizedMuskPulseGenerator = new PersonalizedMuskPulseGenerator();

