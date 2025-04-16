/**
 * Brandentifier Industry Pulse Algorithm Service
 * 
 * This service implements the personalized feed algorithm described in the
 * Industry Pulse Algorithm document. It provides personalized content to users
 * based on their profile, interests, and behavior.
 */

import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { 
  pulses, 
  users, 
  pulseReactions, 
  pulseHashtags, 
  hashtags, 
  userHashtagFollows
} from '../../shared/schema';

// Type for a pulse with related user data
interface PulseWithRelations {
  id: number;
  userId: number;
  type: string;
  industry: string | null;
  content: string | null;
  createdAt: Date;
  user: {
    domain: string | null;
  };
}

// Interface for hashtag relation data
interface HashtagRelation {
  hashtag: {
    id: number;
    tag: string;
  };
}

/**
 * Calculates a relevance score for a pulse in relation to a specific user based on multiple factors
 * as defined in the Industry Pulse Algorithm document.
 * 
 * Pulse Score = (I × 3) + (D × 2) + (H × 2) + (G × 1.5) + (E × 2) + (T × 1) + (Recency × 2)
 * 
 * Where:
 * I = Industry match (1 or 0)
 * D = Domain match (1 or 0)
 * H = Hashtag match (percentage of followed tags in Pulse)
 * G = Goal alignment (match with user's selected goals)
 * E = Engagement prediction (based on user's past behavior)
 * T = Type preference (Polls > Media > News etc.)
 * Recency = Time decay scoring (newer = higher)
 */
export async function calculatePulseScore(userId: number, pulseId: number): Promise<number> {
  // Get user profile
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!userProfile) return 0;

  // Get pulse data with relations
  const pulseData = await db.query.pulses.findFirst({
    where: eq(pulses.id, pulseId),
    with: {
      user: true,
    }
  }) as unknown as PulseWithRelations | null;

  if (!pulseData) return 0;

  // Get user's followed hashtags
  const followedHashtags = await db.query.userHashtagFollows.findMany({
    where: eq(userHashtagFollows.userId, userId),
    with: {
      hashtag: true,
    }
  }) as unknown as HashtagRelation[];

  // Get hashtags for this pulse
  const pulseHashtagData = await db.query.pulseHashtags.findMany({
    where: eq(pulseHashtags.pulseId, pulseId),
    with: {
      hashtag: true,
    }
  }) as unknown as HashtagRelation[];

  // Calculate different score components
  let score = 0;

  // I: Industry match (weight: 3)
  const industryMatch = userProfile.industry && 
                         pulseData.industry && 
                         userProfile.industry.toLowerCase() === pulseData.industry.toLowerCase() ? 1 : 0;
  score += industryMatch * 3;

  // D: Domain match (weight: 2)
  const domainMatch = userProfile.domain && 
                       pulseData.user.domain && 
                       userProfile.domain.toLowerCase() === pulseData.user.domain.toLowerCase() ? 1 : 0;
  score += domainMatch * 2;

  // H: Hashtag match (weight: 2)
  // Convert to arrays to avoid Set iteration issues
  const userTagArray = followedHashtags.map(ht => ht.hashtag.tag.toLowerCase());
  const pulseTagArray = pulseHashtagData.map(ht => ht.hashtag.tag.toLowerCase());
  
  let hashtagMatchScore = 0;
  if (userTagArray.length > 0 && pulseTagArray.length > 0) {
    // Calculate percentage of followed tags in the pulse
    let matchCount = 0;
    for (const tag of pulseTagArray) {
      if (userTagArray.includes(tag)) {
        matchCount++;
      }
    }
    
    hashtagMatchScore = matchCount > 0 ? (matchCount / pulseTagArray.length) : 0;
  }
  score += hashtagMatchScore * 2;

  // G: Goal alignment (weight: 1.5)
  // Note: This is simplified as we currently use lookingFor field
  // Can be enhanced when we implement a more detailed goal system
  const goalMatch = userProfile.lookingFor && 
                    pulseData.content && 
                    pulseData.content.toLowerCase().includes(userProfile.lookingFor.toLowerCase()) ? 1 : 0;
  score += goalMatch * 1.5;

  // E: Engagement prediction (weight: 2)
  // Check if user has reacted to similar content before
  const userReactions = await db.query.pulseReactions.findMany({
    where: eq(pulseReactions.userId, userId),
    with: {
      pulse: true,
    }
  }) as unknown as {pulse: PulseWithRelations}[];
  
  // Check if user tends to engage with this type of content
  const similarTypeEngagement = userReactions.filter(r => {
    return r.pulse.type === pulseData.type || 
           (r.pulse.industry && pulseData.industry && 
            r.pulse.industry === pulseData.industry);
  }).length;
  
  const engagementScore = similarTypeEngagement > 0 ? Math.min(similarTypeEngagement / 5, 1) : 0;
  score += engagementScore * 2;

  // T: Type preference (weight: 1)
  // This is a simplified version - can be enhanced with user preference tracking
  const typePreference: Record<string, number> = {
    'poll': 0.8,
    'media-pulse': 0.9,
    'project': 0.7,
    'news-pulse': 1.0
  };
  score += (typePreference[pulseData.type] || 0.5) * 1;

  // Recency score (weight: 2)
  const now = new Date();
  const pulseDate = pulseData.createdAt;
  const ageInDays = (now.getTime() - pulseDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Decay factor - more recent posts score higher
  // Posts less than a day old get full score, then linear decay
  const recencyScore = ageInDays < 1 ? 1 : Math.max(0, 1 - (ageInDays / 14)); // 2 week decay to zero
  score += recencyScore * 2;

  return score;
}

/**
 * Generate personalized feed for a user based on the Industry Pulse Algorithm
 */
export async function generatePersonalizedFeed(userId: number, limit: number = 20) {
  // First get all available pulses - we'll score and sort them after
  const allPulses = await db.query.pulses.findMany({
    where: eq(pulses.isPublished, true),
    with: {
      user: true,
    },
    orderBy: [desc(pulses.createdAt)],
    limit: 100, // Get a larger set to filter and sort
  });
  
  // Calculate score for each pulse
  const scoredPulses = await Promise.all(
    allPulses.map(async (pulse) => {
      const score = await calculatePulseScore(userId, pulse.id);
      return { pulse, score };
    })
  );
  
  // Sort by score (highest first) and return top results
  return scoredPulses
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.pulse);
}

/**
 * Extract hashtags from a pulse content/description
 * This helper function can be used to auto-tag pulses when they're created
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  // Match hashtags in the text (word boundary followed by # and word characters)
  const hashtagRegex = /\B#([a-zA-Z0-9_]+)/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Remove the # symbol and return unique tags
  const uniqueTags = new Set<string>();
  for (const tag of matches) {
    uniqueTags.add(tag.substring(1).toLowerCase());
  }
  
  return Array.from(uniqueTags);
}

/**
 * Create hashtags from content and associate them with a pulse
 * This should be called when a pulse is created or updated
 */
export async function processAndAssignHashtags(pulseId: number, content: string) {
  if (!content || !pulseId) return;
  
  const extractedTags = extractHashtags(content);
  if (extractedTags.length === 0) return;
  
  // Create or get hashtags
  for (const tagText of extractedTags) {
    // Check if hashtag exists
    let hashtagRecord = await db.query.hashtags.findFirst({
      where: eq(hashtags.tag, tagText),
    });
    
    let hashtagId: number;
    
    if (hashtagRecord) {
      // Increment the count
      const currentCount = hashtagRecord.count || 0;
      await db.update(hashtags)
        .set({ count: currentCount + 1 })
        .where(eq(hashtags.id, hashtagRecord.id));
      
      hashtagId = hashtagRecord.id;
    } else {
      // Create a new hashtag
      const [newHashtag] = await db.insert(hashtags)
        .values({ tag: tagText, count: 1 })
        .returning();
      
      hashtagId = newHashtag.id;
    }
    
    // Check if the pulse-hashtag relationship already exists
    const existingRelation = await db.query.pulseHashtags.findFirst({
      where: and(
        eq(pulseHashtags.pulseId, pulseId),
        eq(pulseHashtags.hashtagId, hashtagId)
      ),
    });
    
    // If not, create the relationship
    if (!existingRelation) {
      await db.insert(pulseHashtags)
        .values({
          pulseId,
          hashtagId,
        });
    }
  }
}