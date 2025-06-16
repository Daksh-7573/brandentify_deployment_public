/**
 * Learning Pattern Recognition - Phase 2
 * 
 * This service analyzes user preferences and conversation patterns to personalize
 * responses and improve the AI's understanding of individual user needs.
 */

import { getConversationMemory, ConversationMessage } from './conversation-memory';

export interface UserPattern {
  userId: string;
  preferences: {
    responseLength: 'brief' | 'detailed' | 'comprehensive';
    communicationStyle: 'formal' | 'casual' | 'technical';
    focusAreas: string[];
    preferredTimeframes: 'immediate' | 'short_term' | 'long_term';
  };
  behaviorPatterns: {
    questionTypes: Record<string, number>;
    topicFrequency: Record<string, number>;
    engagementLevel: number;
    responsePreferences: string[];
  };
  learningInsights: {
    careerStage: 'entry' | 'mid' | 'senior' | 'executive' | 'transition';
    primaryGoals: string[];
    communicationPatterns: string[];
    preferredGuidanceStyle: 'directive' | 'collaborative' | 'exploratory';
  };
  lastUpdated: Date;
  confidence: number;
}

// In-memory storage for user patterns
const userPatterns = new Map<string, UserPattern>();

/**
 * Analyze user conversation patterns and update their profile
 */
export function analyzeUserPatterns(userId: string): UserPattern {
  const conversationMemory = getConversationMemory(userId);
  let pattern = userPatterns.get(userId) || createDefaultPattern(userId);
  
  if (!conversationMemory || conversationMemory.messages.length === 0) {
    return pattern;
  }

  const messages = conversationMemory.messages;
  const userMessages = messages.filter(m => m.role === 'user');
  const muskMessages = messages.filter(m => m.role === 'musk');

  // Analyze response length preferences
  pattern.preferences.responseLength = analyzeResponseLengthPreference(userMessages, muskMessages);
  
  // Analyze communication style
  pattern.preferences.communicationStyle = analyzeCommunicationStyle(userMessages);
  
  // Extract focus areas from conversation topics
  pattern.preferences.focusAreas = extractFocusAreas(userMessages);
  
  // Analyze question types and patterns
  pattern.behaviorPatterns.questionTypes = analyzeQuestionTypes(userMessages);
  pattern.behaviorPatterns.topicFrequency = analyzeTopicFrequency(userMessages);
  
  // Calculate engagement level
  pattern.behaviorPatterns.engagementLevel = calculateEngagementLevel(messages);
  
  // Determine career stage and goals
  pattern.learningInsights = analyzeLearningInsights(userMessages);
  
  // Update metadata
  pattern.lastUpdated = new Date();
  pattern.confidence = calculateConfidence(messages.length, userMessages.length);
  
  // Store updated pattern
  userPatterns.set(userId, pattern);
  
  console.log(`[Learning Patterns] Updated pattern for user ${userId} with confidence ${pattern.confidence}`);
  
  return pattern;
}

/**
 * Create default pattern for new users
 */
function createDefaultPattern(userId: string): UserPattern {
  return {
    userId,
    preferences: {
      responseLength: 'detailed',
      communicationStyle: 'formal',
      focusAreas: [],
      preferredTimeframes: 'short_term'
    },
    behaviorPatterns: {
      questionTypes: {},
      topicFrequency: {},
      engagementLevel: 0.5,
      responsePreferences: []
    },
    learningInsights: {
      careerStage: 'mid',
      primaryGoals: [],
      communicationPatterns: [],
      preferredGuidanceStyle: 'collaborative'
    },
    lastUpdated: new Date(),
    confidence: 0.1
  };
}

/**
 * Analyze user's preferred response length based on their follow-ups
 */
function analyzeResponseLengthPreference(
  userMessages: ConversationMessage[], 
  muskMessages: ConversationMessage[]
): 'brief' | 'detailed' | 'comprehensive' {
  if (userMessages.length < 3) return 'detailed'; // Default
  
  let briefPreference = 0;
  let detailedPreference = 0;
  
  userMessages.forEach((msg, index) => {
    if (index > 0) {
      const prevMuskResponse = muskMessages[index - 1];
      if (prevMuskResponse) {
        const responseLength = prevMuskResponse.message.length;
        const userFollowUp = msg.message.toLowerCase();
        
        if (responseLength > 1000 && userFollowUp.includes('shorter') || userFollowUp.includes('brief')) {
          briefPreference++;
        } else if (responseLength < 500 && userFollowUp.includes('more detail') || userFollowUp.includes('explain')) {
          detailedPreference++;
        }
      }
    }
  });
  
  if (briefPreference > detailedPreference) return 'brief';
  if (detailedPreference > briefPreference) return 'comprehensive';
  return 'detailed';
}

/**
 * Analyze communication style from user messages
 */
function analyzeCommunicationStyle(userMessages: ConversationMessage[]): 'formal' | 'casual' | 'technical' {
  const allText = userMessages.map(m => m.message).join(' ').toLowerCase();
  
  const formalIndicators = ['please', 'would you', 'could you', 'thank you', 'appreciate'];
  const casualIndicators = ['hey', 'thanks', 'cool', 'awesome', 'yeah', 'ok'];
  const technicalIndicators = ['implement', 'architecture', 'framework', 'methodology', 'strategic'];
  
  const formalScore = formalIndicators.filter(indicator => allText.includes(indicator)).length;
  const casualScore = casualIndicators.filter(indicator => allText.includes(indicator)).length;
  const technicalScore = technicalIndicators.filter(indicator => allText.includes(indicator)).length;
  
  if (technicalScore > Math.max(formalScore, casualScore)) return 'technical';
  if (casualScore > formalScore) return 'casual';
  return 'formal';
}

/**
 * Extract focus areas from conversation content
 */
function extractFocusAreas(userMessages: ConversationMessage[]): string[] {
  const allText = userMessages.map(m => m.message).join(' ').toLowerCase();
  const focusAreas: string[] = [];
  
  const topicKeywords = {
    'networking': ['network', 'connect', 'linkedin', 'professional', 'colleagues'],
    'career_change': ['switch', 'change', 'transition', 'pivot', 'move'],
    'skill_development': ['skill', 'learn', 'develop', 'training', 'course', 'improve'],
    'leadership': ['lead', 'manage', 'team', 'director', 'executive'],
    'job_search': ['job', 'position', 'interview', 'resume', 'hiring'],
    'entrepreneurship': ['startup', 'business', 'entrepreneur', 'founder', 'venture'],
    'work_life_balance': ['balance', 'stress', 'time', 'family', 'personal']
  };
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    const mentions = keywords.filter(keyword => allText.includes(keyword)).length;
    if (mentions >= 2) {
      focusAreas.push(topic);
    }
  });
  
  return focusAreas;
}

/**
 * Analyze types of questions user typically asks
 */
function analyzeQuestionTypes(userMessages: ConversationMessage[]): Record<string, number> {
  const questionTypes: Record<string, number> = {};
  
  userMessages.forEach(msg => {
    const text = msg.message.toLowerCase();
    
    if (text.includes('how')) questionTypes['how_to'] = (questionTypes['how_to'] || 0) + 1;
    if (text.includes('what')) questionTypes['what_is'] = (questionTypes['what_is'] || 0) + 1;
    if (text.includes('why')) questionTypes['why'] = (questionTypes['why'] || 0) + 1;
    if (text.includes('when')) questionTypes['when'] = (questionTypes['when'] || 0) + 1;
    if (text.includes('should i')) questionTypes['advice_seeking'] = (questionTypes['advice_seeking'] || 0) + 1;
    if (text.includes('help me')) questionTypes['assistance'] = (questionTypes['assistance'] || 0) + 1;
  });
  
  return questionTypes;
}

/**
 * Analyze topic frequency in conversations
 */
function analyzeTopicFrequency(userMessages: ConversationMessage[]): Record<string, number> {
  const topics: Record<string, number> = {};
  
  userMessages.forEach(msg => {
    const text = msg.message.toLowerCase();
    
    if (/\b(network|connect|linkedin)\b/.test(text)) {
      topics['networking'] = (topics['networking'] || 0) + 1;
    }
    if (/\b(career|job|position)\b/.test(text)) {
      topics['career'] = (topics['career'] || 0) + 1;
    }
    if (/\b(skill|learn|develop)\b/.test(text)) {
      topics['skills'] = (topics['skills'] || 0) + 1;
    }
    if (/\b(lead|manage|team)\b/.test(text)) {
      topics['leadership'] = (topics['leadership'] || 0) + 1;
    }
  });
  
  return topics;
}

/**
 * Calculate user engagement level based on conversation patterns
 */
function calculateEngagementLevel(messages: ConversationMessage[]): number {
  if (messages.length === 0) return 0;
  
  const userMessages = messages.filter(m => m.role === 'user');
  const avgMessageLength = userMessages.reduce((sum, m) => sum + m.message.length, 0) / userMessages.length;
  const questionRatio = userMessages.filter(m => m.message.includes('?')).length / userMessages.length;
  const conversationLength = messages.length;
  
  // Normalize and combine factors
  const lengthScore = Math.min(avgMessageLength / 100, 1); // Cap at 100 chars
  const questionScore = questionRatio;
  const volumeScore = Math.min(conversationLength / 20, 1); // Cap at 20 messages
  
  return (lengthScore + questionScore + volumeScore) / 3;
}

/**
 * Analyze deeper learning insights about user
 */
function analyzeLearningInsights(userMessages: ConversationMessage[]): UserPattern['learningInsights'] {
  const allText = userMessages.map(m => m.message).join(' ').toLowerCase();
  
  // Determine career stage
  let careerStage: 'entry' | 'mid' | 'senior' | 'executive' | 'transition' = 'mid';
  if (/\b(new|fresh|graduate|entry|first job)\b/.test(allText)) careerStage = 'entry';
  if (/\b(director|manager|lead|senior)\b/.test(allText)) careerStage = 'senior';
  if (/\b(executive|ceo|vp|chief)\b/.test(allText)) careerStage = 'executive';
  if (/\b(transition|change|switch|pivot)\b/.test(allText)) careerStage = 'transition';
  
  // Extract primary goals
  const primaryGoals: string[] = [];
  if (/\b(promotion|advance|grow)\b/.test(allText)) primaryGoals.push('career_advancement');
  if (/\b(skill|learn|develop)\b/.test(allText)) primaryGoals.push('skill_development');
  if (/\b(network|connect)\b/.test(allText)) primaryGoals.push('networking');
  if (/\b(balance|stress|time)\b/.test(allText)) primaryGoals.push('work_life_balance');
  
  // Analyze guidance style preference
  let preferredGuidanceStyle: 'directive' | 'collaborative' | 'exploratory' = 'collaborative';
  if (/\b(tell me|what should i|give me)\b/.test(allText)) preferredGuidanceStyle = 'directive';
  if (/\b(explore|consider|think about)\b/.test(allText)) preferredGuidanceStyle = 'exploratory';
  
  return {
    careerStage,
    primaryGoals,
    communicationPatterns: [],
    preferredGuidanceStyle
  };
}

/**
 * Calculate confidence score based on data quantity
 */
function calculateConfidence(totalMessages: number, userMessages: number): number {
  const messageScore = Math.min(totalMessages / 20, 1); // Max confidence at 20 messages
  const userMessageScore = Math.min(userMessages / 10, 1); // Max confidence at 10 user messages
  
  return (messageScore + userMessageScore) / 2;
}

/**
 * Get personalized response guidelines based on learned patterns
 */
export function getPersonalizedGuidelines(userId: string): {
  responseLength: string;
  tone: string;
  focus: string[];
  approachStyle: string;
} {
  const pattern = userPatterns.get(userId);
  
  if (!pattern || pattern.confidence < 0.3) {
    return {
      responseLength: 'detailed',
      tone: 'professional and supportive',
      focus: ['general career guidance'],
      approachStyle: 'collaborative'
    };
  }
  
  return {
    responseLength: pattern.preferences.responseLength,
    tone: `${pattern.preferences.communicationStyle} and supportive`,
    focus: pattern.preferences.focusAreas.length > 0 ? pattern.preferences.focusAreas : ['general career guidance'],
    approachStyle: pattern.learningInsights.preferredGuidanceStyle
  };
}

/**
 * Get user pattern statistics for monitoring
 */
export function getPatternStats(): {
  totalUsers: number;
  averageConfidence: number;
  commonFocusAreas: Record<string, number>;
} {
  const patterns = Array.from(userPatterns.values());
  
  const totalUsers = patterns.length;
  const averageConfidence = patterns.length > 0 
    ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
    : 0;
  
  const focusAreaCounts: Record<string, number> = {};
  patterns.forEach(pattern => {
    pattern.preferences.focusAreas.forEach(area => {
      focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
    });
  });
  
  return {
    totalUsers,
    averageConfidence,
    commonFocusAreas: focusAreaCounts
  };
}

/**
 * Clear learning patterns for a user (useful for testing or privacy)
 */
export function clearUserPatterns(userId: string): void {
  userPatterns.delete(userId);
  console.log(`[Learning Patterns] Cleared patterns for user ${userId}`);
}