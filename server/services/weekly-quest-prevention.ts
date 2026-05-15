/**
 * Weekly Quest Duplicate Prevention System
 * Ensures users don't receive the same quest multiple times in a week
 */

import { db } from '../db';
import { userQuests, questDefinitions, users } from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import crypto from 'crypto';

export const STRICT_CONTENT_SIMILARITY_THRESHOLD = 0.65;

export interface WeeklyQuestCheck {
  hasQuestThisWeek: boolean;
  lastQuest?: {
    id: number;
    questDefinitionId: number;
    title: string;
    assignedAt: Date;
    status: string;
  };
  canGenerateNew: boolean;
  nextAvailableDate?: Date;
}

export interface QuestUniquenessDiagnostics {
  questHash: string;
  title: string;
  isDuplicateInRecent: boolean;
  matchedRecentQuestId?: number;
  maxContentSimilarity: number;
}

export interface RecentQuestContent {
  id: number;
  title: string;
  description: string;
  hash: string;
}

/**
 * Check if two dates are in the same week (ISO week standard)
 * Week starts on Monday, ends on Sunday
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const oneJan = new Date(date1.getFullYear(), 0, 1);
  const week1 = Math.ceil((((date1.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
  
  const oneJan2 = new Date(date2.getFullYear(), 0, 1);
  const week2 = Math.ceil((((date2.getTime() - oneJan2.getTime()) / 86400000) + oneJan2.getDay() + 1) / 7);

  return date1.getFullYear() === date2.getFullYear() && week1 === week2;
}

/**
 * Get ISO week number for a date (1-52/53)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get the start of the current week (Monday 00:00:00)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get the end of the current week (Sunday 23:59:59)
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

export function getDateStringUTC(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function calculateQuestHash(title: string, description: string): string {
  return crypto
    .createHash('md5')
    .update(`${title || ''}::${description || ''}`)
    .digest('hex');
}

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((token) => token.length > 2);
}

export function calculateContentSimilarity(textA: string, textB: string): number {
  const tokenListA = tokenize(textA);
  const tokenListB = tokenize(textB);

  const uniqueMapA: Record<string, boolean> = {};
  const uniqueMapB: Record<string, boolean> = {};

  tokenListA.forEach((token) => {
    uniqueMapA[token] = true;
  });
  tokenListB.forEach((token) => {
    uniqueMapB[token] = true;
  });

  const tokensA = Object.keys(uniqueMapA);
  const tokensB = Object.keys(uniqueMapB);

  if (!tokensA.length && !tokensB.length) {
    return 1;
  }
  if (!tokensA.length || !tokensB.length) {
    return 0;
  }

  let intersectionCount = 0;
  tokensA.forEach((token) => {
    if (uniqueMapB[token]) {
      intersectionCount++;
    }
  });

  const unionMap: Record<string, boolean> = {};
  tokensA.forEach((token) => {
    unionMap[token] = true;
  });
  tokensB.forEach((token) => {
    unionMap[token] = true;
  });
  const unionCount = Object.keys(unionMap).length;
  return unionCount > 0 ? intersectionCount / unionCount : 0;
}

export async function getRecentQuestContent(userId: number, limit: number = 4): Promise<RecentQuestContent[]> {
  const recentQuests = await db
    .select({
      id: userQuests.id,
      title: questDefinitions.title,
      description: questDefinitions.description
    })
    .from(userQuests)
    .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
    .where(eq(userQuests.userId, userId))
    .orderBy(desc(userQuests.assignedAt))
    .limit(limit);

  return recentQuests.map((quest) => ({
    id: quest.id,
    title: quest.title || 'Quest',
    description: quest.description || '',
    hash: calculateQuestHash(quest.title || '', quest.description || '')
  }));
}

export async function getRecentQuestHashes(userId: number, limit: number = 4): Promise<Array<{ id: number; hash: string; title: string }>> {
  const recentQuests = await db
    .select({
      id: userQuests.id,
      title: questDefinitions.title,
      description: questDefinitions.description
    })
    .from(userQuests)
    .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
    .where(eq(userQuests.userId, userId))
    .orderBy(desc(userQuests.assignedAt))
    .limit(limit);

  return recentQuests.map((quest) => ({
    id: quest.id,
    title: quest.title || 'Quest',
    hash: calculateQuestHash(quest.title || '', quest.description || '')
  }));
}

export async function diagnoseQuestUniqueness(
  userId: number,
  quest: { title?: string; description?: string }
): Promise<QuestUniquenessDiagnostics> {
  const title = quest.title || 'Untitled Quest';
  const hash = calculateQuestHash(quest.title || '', quest.description || '');
  const recentContent = await getRecentQuestContent(userId, 4);
  const matchedByHash = recentContent.find((item) => item.hash === hash);

  let maxContentSimilarity = 0;
  let matchedBySimilarityId: number | undefined;
  for (const item of recentContent) {
    const similarity = calculateContentSimilarity(quest.description || '', item.description || '');
    if (similarity > maxContentSimilarity) {
      maxContentSimilarity = similarity;
      matchedBySimilarityId = item.id;
    }
  }

  const matchedQuestId = matchedByHash?.id || matchedBySimilarityId;
  const isDuplicateInRecent = !!matchedByHash || maxContentSimilarity >= STRICT_CONTENT_SIMILARITY_THRESHOLD;

  return {
    questHash: hash,
    title,
    isDuplicateInRecent,
    matchedRecentQuestId: matchedQuestId,
    maxContentSimilarity: Number(maxContentSimilarity.toFixed(3))
  };
}

export function isContentTooSimilarToRecent(
  candidateDescription: string,
  recentDescriptions: string[],
  similarityThreshold: number = STRICT_CONTENT_SIMILARITY_THRESHOLD
): { tooSimilar: boolean; maxSimilarity: number } {
  let maxSimilarity = 0;
  for (const description of recentDescriptions) {
    const similarity = calculateContentSimilarity(candidateDescription || '', description || '');
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  }

  return {
    tooSimilar: maxSimilarity >= similarityThreshold,
    maxSimilarity: Number(maxSimilarity.toFixed(3))
  };
}

export async function checkQuestStatusWithWindow(
  userId: number,
  lockWindowMinutes?: number
): Promise<WeeklyQuestCheck> {
  if (!lockWindowMinutes || lockWindowMinutes <= 0) {
    return checkWeeklyQuestStatus(userId);
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - lockWindowMinutes * 60 * 1000);

  const windowQuests = await db
    .select({
      id: userQuests.id,
      questDefinitionId: userQuests.questDefinitionId,
      status: userQuests.status,
      assignedAt: userQuests.assignedAt,
      title: questDefinitions.title
    })
    .from(userQuests)
    .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
    .where(
      and(
        eq(userQuests.userId, userId),
        gte(userQuests.assignedAt, windowStart)
      )
    )
    .orderBy(desc(userQuests.assignedAt))
    .limit(1);

  if (!windowQuests.length) {
    return {
      hasQuestThisWeek: false,
      canGenerateNew: true
    };
  }

  const lastQuest = windowQuests[0];
  return {
    hasQuestThisWeek: true,
    canGenerateNew: false,
    lastQuest: {
      id: lastQuest.id,
      questDefinitionId: lastQuest.questDefinitionId,
      title: lastQuest.title || 'Quest',
      assignedAt: lastQuest.assignedAt || now,
      status: lastQuest.status
    },
    nextAvailableDate: new Date((lastQuest.assignedAt || now).getTime() + lockWindowMinutes * 60 * 1000)
  };
}

/**
 * Check if user already has a quest of this type this week
 */
export async function checkWeeklyQuestStatus(
  userId: number,
  questType?: string
): Promise<WeeklyQuestCheck> {
  console.log(`[WeeklyQuest] Checking weekly quest status for user ${userId}`);
  
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  try {
    // Query for quests assigned this week
    const weeklyQuests = await db
      .select({
        id: userQuests.id,
        questDefinitionId: userQuests.questDefinitionId,
        status: userQuests.status,
        assignedAt: userQuests.assignedAt,
        weekNumber: userQuests.weekNumber,
        year: userQuests.year,
        title: questDefinitions.title,
        type: questDefinitions.type
      })
      .from(userQuests)
      .leftJoin(questDefinitions, eq(userQuests.questDefinitionId, questDefinitions.id))
      .where(
        and(
          eq(userQuests.userId, userId),
          eq(userQuests.weekNumber, weekNumber),
          eq(userQuests.year, year)
        )
      )
      .orderBy(sql`${userQuests.assignedAt} DESC`);

    if (weeklyQuests.length === 0) {
      console.log(`[WeeklyQuest] No quests found for user ${userId} this week`);
      return {
        hasQuestThisWeek: false,
        canGenerateNew: true
      };
    }

    // If questType specified, check for that specific type
    if (questType) {
      const typeMatch = weeklyQuests.find(q => q.type === questType);
      if (typeMatch) {
        console.log(`[WeeklyQuest] User ${userId} already has ${questType} quest this week`);
        return {
          hasQuestThisWeek: true,
          lastQuest: {
            id: typeMatch.id,
            questDefinitionId: typeMatch.questDefinitionId,
            title: typeMatch.title || 'Quest',
            assignedAt: typeMatch.assignedAt || startOfWeek,
            status: typeMatch.status
          },
          canGenerateNew: false,
          nextAvailableDate: getEndOfWeek(now)
        };
      }
    }

    // Return most recent quest
    const lastQuest = weeklyQuests[0];
    console.log(`[WeeklyQuest] User ${userId} has ${weeklyQuests.length} quests this week`);

    return {
      hasQuestThisWeek: true,
      lastQuest: {
        id: lastQuest.id,
        questDefinitionId: lastQuest.questDefinitionId,
        title: lastQuest.title || 'Quest',
        assignedAt: lastQuest.assignedAt || startOfWeek,
        status: lastQuest.status
      },
      canGenerateNew: false,
      nextAvailableDate: getEndOfWeek(now)
    };

  } catch (error) {
    console.error('[WeeklyQuest] Error checking weekly quest status:', error);
    return {
      hasQuestThisWeek: false,
      canGenerateNew: true
    };
  }
}

/**
 * Get or create weekly quest for user
 * If quest already exists this week, return it
 * Otherwise, generate a new one
 */
export async function getOrCreateWeeklyQuest(
  userId: number,
  generateNewQuestFn: () => Promise<any>
): Promise<any> {
  console.log(`[WeeklyQuest] Get or create weekly quest for user ${userId}`);

  const weeklyCheck = await checkWeeklyQuestStatus(userId);

  // If quest exists this week, return it
  if (weeklyCheck.hasQuestThisWeek && weeklyCheck.lastQuest) {
    console.log(`[WeeklyQuest] Returning existing quest ${weeklyCheck.lastQuest.id} for user ${userId}`);
    
    // Fetch full quest details
    const existingQuest = await db
      .select()
      .from(userQuests)
      .where(eq(userQuests.id, weeklyCheck.lastQuest.id))
      .limit(1);

    return existingQuest[0];
  }

  // No quest this week, generate new one
  console.log(`[WeeklyQuest] No quest found this week, generating new quest for user ${userId}`);
  
  const newQuest = await generateNewQuestFn();
  
  console.log(`[WeeklyQuest] New quest generated for user ${userId}`);
  return newQuest;
}

/**
 * Generate fallback quest for incomplete profiles
 * This quest is always the same and encourages profile completion
 */
export function generateProfileCompletionQuest(missingFields: string[] = []): any {
  const fieldsList = missingFields.length > 0 
    ? `(${missingFields.join(', ')})` 
    : '';

  return {
    type: 'profile_completion',
    title: 'Complete Your Profile',
    description: `Fill in all required profile fields ${fieldsList} to unlock personalized career quests and AI-powered recommendations.`,
    targetAction: 'update_profile',
    xpReward: 100,
    priority: 'high',
    difficulty: 'beginner',
    estimatedTimeMinutes: 10,
    isFallback: true
  };
}

/**
 * Determine if profile is complete enough for personalized quests
 */
export function isProfileCompleteForQuests(user: any): boolean {
  const requiredFields = [
    'name',
    'title',
    'industry',
    'location'
  ];

  return requiredFields.every(field => {
    const value = user?.[field];
    return value && value.toString().trim() !== '';
  });
}

/**
 * Main quest generation orchestrator with weekly duplicate prevention
 */
export async function generateWeeklyQuestWithPrevention(
  userId: number,
  user: any,
  generatePersonalizedQuestFn: (user: any) => Promise<any>,
  options?: {
    lockWindowMinutes?: number;
  }
): Promise<any> {
  console.log('---- QUEST GENERATION START ----');
  console.log('User ID:', userId);

  // Check profile completeness first
  const profileComplete = isProfileCompleteForQuests(user);

  if (!profileComplete) {
    console.log(`[WeeklyQuest] Profile incomplete for user ${userId}. Returning fallback quest.`);
    
    const missingFields = ['name', 'title', 'industry', 'location'].filter(field => {
      const value = user?.[field];
      return !value || value.toString().trim() === '';
    });

    const fallbackQuest = generateProfileCompletionQuest(missingFields);
    console.log('NEW QUEST GENERATED:', fallbackQuest.title);
    console.log('Generated At:', new Date().toISOString());
    console.log('---- QUEST GENERATION END ----');
    return fallbackQuest;
  }

  // Profile is complete, check weekly status
  const weeklyCheck = await checkQuestStatusWithWindow(userId, options?.lockWindowMinutes);
  console.log('Last Quest:', weeklyCheck.lastQuest?.title || null);
  console.log('Last Generated At:', weeklyCheck.lastQuest?.assignedAt || null);

  if (weeklyCheck.hasQuestThisWeek && weeklyCheck.lastQuest) {
    console.log(`[WeeklyQuest] Quest already generated this week for user ${userId}. Returning existing.`);
    console.log('---- QUEST GENERATION END ----');
    return weeklyCheck.lastQuest;
  }

  // Generate new personalized quest
  console.log(`[WeeklyQuest] Generating new personalized quest for user ${userId}`);
  const newQuest = await generatePersonalizedQuestFn(user);

  const diagnostics = await diagnoseQuestUniqueness(userId, {
    title: newQuest?.title,
    description: newQuest?.description
  });

  console.log('NEW QUEST GENERATED:', newQuest?.title || 'Untitled Quest');
  console.log('Generated At:', new Date().toISOString());
  console.log('Quest Hash:', diagnostics.questHash);
  if (diagnostics.isDuplicateInRecent) {
    console.log('[WeeklyQuest] Duplicate quest detected against recent history. Matched quest ID:', diagnostics.matchedRecentQuestId);
  }
  console.log('---- QUEST GENERATION END ----');

  return newQuest;
}

/**
 * Export service instance
 */
export const weeklyQuestPreventionService = {
  STRICT_CONTENT_SIMILARITY_THRESHOLD,
  checkWeeklyQuestStatus,
  checkQuestStatusWithWindow,
  getOrCreateWeeklyQuest,
  generateWeeklyQuestWithPrevention,
  generateProfileCompletionQuest,
  isProfileCompleteForQuests,
  calculateQuestHash,
  diagnoseQuestUniqueness,
  getRecentQuestContent,
  calculateContentSimilarity,
  isContentTooSimilarToRecent,
  getRecentQuestHashes,
  getDateStringUTC,
  isSameWeek,
  getWeekNumber,
  getStartOfWeek,
  getEndOfWeek
};
