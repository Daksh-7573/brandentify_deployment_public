/**
 * Proactive Suggestion Engine - Phase 2
 * 
 * This service generates contextual recommendations and proactive insights
 * based on user profile analysis, conversation patterns, and career intelligence.
 */

import { getRecentMessagesSync, ConversationMessage } from './conversation-memory';
import { analyzePersonaNeed } from './dynamic-persona-engine';

export interface ProactiveSuggestion {
  id: string;
  type: 'brandentifier_feature' | 'career_action' | 'skill_development' | 'networking' | 'content_creation';
  title: string;
  description: string;
  actionText: string;
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  context: string;
  timeframe: 'immediate' | 'this_week' | 'this_month' | 'long_term';
}

export interface ProactiveInsight {
  insight: string;
  reasoning: string;
  suggestions: ProactiveSuggestion[];
  confidence: number;
}

/**
 * Generate proactive suggestions based on user profile and conversation context
 */
export function generateProactiveSuggestions(
  userId: string,
  userProfile: any,
  currentMessage?: string
): ProactiveInsight {
  const recentMessages = getRecentMessagesSync(userId, 5);
  const suggestions: ProactiveSuggestion[] = [];
  
  // Analyze user profile completeness
  const profileSuggestions = analyzeProfileCompleteness(userProfile);
  suggestions.push(...profileSuggestions);
  
  // Analyze conversation patterns for opportunities
  const conversationSuggestions = analyzeConversationOpportunities(userId, recentMessages, currentMessage);
  suggestions.push(...conversationSuggestions);
  
  // Generate career-specific suggestions
  const careerSuggestions = generateCareerSpecificSuggestions(userProfile);
  suggestions.push(...careerSuggestions);
  
  // Sort by relevance and priority
  suggestions.sort((a, b) => {
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.relevanceScore - a.relevanceScore;
  });

  // Take top 3-5 suggestions
  const topSuggestions = suggestions.slice(0, 5);
  
  const insight = generateInsightFromSuggestions(topSuggestions, userProfile);
  
  return {
    insight,
    reasoning: `Generated ${suggestions.length} suggestions based on profile analysis and conversation context`,
    suggestions: topSuggestions,
    confidence: calculateConfidence(topSuggestions, userProfile)
  };
}

/**
 * Analyze profile completeness for improvement suggestions
 */
function analyzeProfileCompleteness(userProfile: any): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [];
  
  if (!userProfile) return suggestions;
  
  // Check for missing profile elements
  if (!userProfile.aboutMe || userProfile.aboutMe.length < 100) {
    suggestions.push({
      id: 'complete_about_section',
      type: 'brandentifier_feature',
      title: 'Enhance Your About Section',
      description: 'A compelling about section increases profile views by 40% and makes you more discoverable to potential connections.',
      actionText: 'Complete your about section',
      priority: 'high',
      relevanceScore: 0.9,
      context: 'Profile optimization',
      timeframe: 'immediate'
    });
  }
  
  if (!userProfile.industry || userProfile.industry === 'your field') {
    suggestions.push({
      id: 'set_industry',
      type: 'brandentifier_feature',
      title: 'Specify Your Industry',
      description: 'Setting your industry helps Musk provide more targeted career advice and connects you with relevant opportunities.',
      actionText: 'Update industry information',
      priority: 'medium',
      relevanceScore: 0.8,
      context: 'Profile targeting',
      timeframe: 'immediate'
    });
  }
  
  return suggestions;
}

/**
 * Analyze conversation patterns for proactive opportunities
 */
function analyzeConversationOpportunities(
  userId: string,
  recentMessages: ConversationMessage[],
  currentMessage?: string
): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [];
  
  if (recentMessages.length === 0) return suggestions;
  
  const allMessages = recentMessages.map(m => m.message.toLowerCase()).join(' ');
  if (currentMessage) {
    allMessages + ' ' + currentMessage.toLowerCase();
  }
  
  // Detect networking opportunities
  if (/\b(network|connect|linkedin|colleagues|professional)\b/i.test(allMessages)) {
    suggestions.push({
      id: 'brandentifier_networking',
      type: 'networking',
      title: 'Build Your Professional Network on Brandentifier',
      description: 'Since you\'re discussing networking, Brandentifier offers advanced networking tools that go beyond traditional platforms.',
      actionText: 'Explore Brandentifier networking features',
      priority: 'high',
      relevanceScore: 0.95,
      context: 'Conversation topic: networking',
      timeframe: 'immediate'
    });
  }
  
  // Detect skill development mentions
  if (/\b(skill|learn|develop|improve|training|course)\b/i.test(allMessages)) {
    suggestions.push({
      id: 'skill_showcase',
      type: 'skill_development',
      title: 'Showcase Your Learning Journey',
      description: 'Document your skill development progress on Brandentifier to demonstrate continuous learning to potential employers.',
      actionText: 'Add skills and learning goals',
      priority: 'medium',
      relevanceScore: 0.85,
      context: 'Conversation topic: skill development',
      timeframe: 'this_week'
    });
  }
  
  // Detect career change discussions
  if (/\b(switch|change|transition|move|pivot|career)\b/i.test(allMessages)) {
    suggestions.push({
      id: 'career_transition_plan',
      type: 'career_action',
      title: 'Create a Career Transition Plan',
      description: 'Use Brandentifier\'s career planning tools to map out your transition strategy with milestone tracking.',
      actionText: 'Start career transition planning',
      priority: 'high',
      relevanceScore: 0.9,
      context: 'Conversation topic: career change',
      timeframe: 'this_week'
    });
  }
  
  return suggestions;
}

/**
 * Generate career-specific suggestions based on user profile
 */
function generateCareerSpecificSuggestions(userProfile: any): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [];
  
  if (!userProfile) return suggestions;
  
  const industry = userProfile.industry || '';
  const title = userProfile.title || '';
  const lookingFor = userProfile.lookingFor || '';
  
  // Industry-specific suggestions
  if (industry.toLowerCase().includes('tech') || title.toLowerCase().includes('engineer')) {
    suggestions.push({
      id: 'tech_portfolio',
      type: 'content_creation',
      title: 'Build a Technical Portfolio',
      description: 'Showcase your technical projects and coding skills to stand out in the competitive tech industry.',
      actionText: 'Create technical portfolio',
      priority: 'medium',
      relevanceScore: 0.8,
      context: `Industry: ${industry}`,
      timeframe: 'this_month'
    });
  }
  
  if (title.toLowerCase().includes('director') || title.toLowerCase().includes('manager')) {
    suggestions.push({
      id: 'leadership_content',
      type: 'content_creation',
      title: 'Share Leadership Insights',
      description: 'As a leader, sharing your management philosophy and team insights can establish thought leadership.',
      actionText: 'Create leadership content',
      priority: 'medium',
      relevanceScore: 0.75,
      context: `Role: ${title}`,
      timeframe: 'this_month'
    });
  }
  
  // Looking for specific suggestions
  if (lookingFor === 'job_opportunities') {
    suggestions.push({
      id: 'optimize_for_hiring',
      type: 'brandentifier_feature',
      title: 'Optimize Profile for Recruiters',
      description: 'Make your profile more discoverable by recruiters with strategic keyword optimization and visibility settings.',
      actionText: 'Optimize profile for job search',
      priority: 'high',
      relevanceScore: 0.95,
      context: 'Job seeking mode',
      timeframe: 'immediate'
    });
  }
  
  return suggestions;
}

/**
 * Generate insight summary from suggestions
 */
function generateInsightFromSuggestions(suggestions: ProactiveSuggestion[], userProfile: any): string {
  if (suggestions.length === 0) {
    return "Your profile looks great! Keep engaging with the platform to discover new opportunities.";
  }
  
  const highPriority = suggestions.filter(s => s.priority === 'high');
  const brandentifierFeatures = suggestions.filter(s => s.type === 'brandentifier_feature');
  
  if (highPriority.length > 0) {
    const topSuggestion = highPriority[0];
    return `I notice you could benefit from ${topSuggestion.title.toLowerCase()}. ${topSuggestion.description}`;
  }
  
  if (brandentifierFeatures.length > 0) {
    return `Based on our conversation, here are some Brandentifier features that could accelerate your career growth.`;
  }
  
  return `I've identified several opportunities to enhance your professional presence and career trajectory.`;
}

/**
 * Calculate confidence score for suggestions
 */
function calculateConfidence(suggestions: ProactiveSuggestion[], userProfile: any): number {
  if (suggestions.length === 0) return 0.3;
  
  const avgRelevanceScore = suggestions.reduce((sum, s) => sum + s.relevanceScore, 0) / suggestions.length;
  const profileCompleteness = userProfile ? 0.8 : 0.4; // Assume some completeness if profile exists
  
  return Math.min((avgRelevanceScore + profileCompleteness) / 2, 1);
}

/**
 * Generate time-sensitive suggestions based on patterns
 */
export function generateTimeSensitiveSuggestions(userId: string): ProactiveSuggestion[] {
  const recentMessages = getRecentMessagesSync(userId, 10);
  const suggestions: ProactiveSuggestion[] = [];
  
  // Check for extended conversation without action
  if (recentMessages.length >= 6) {
    const hasActionWords = recentMessages.some(m => 
      /\b(do|will|going to|plan to|start|begin)\b/i.test(m.message)
    );
    
    if (!hasActionWords) {
      suggestions.push({
        id: 'time_for_action',
        type: 'career_action',
        title: 'Time to Take Action',
        description: 'We\'ve discussed several opportunities. Pick one concrete step to move forward with your career goals.',
        actionText: 'Choose an action item',
        priority: 'high',
        relevanceScore: 0.8,
        context: 'Extended conversation without action',
        timeframe: 'immediate'
      });
    }
  }
  
  return suggestions;
}

/**
 * Filter suggestions based on user preferences and context
 */
export function filterSuggestionsByContext(
  suggestions: ProactiveSuggestion[],
  context: {
    userPreferences?: string[];
    currentPage?: string;
    timeConstraints?: string;
  }
): ProactiveSuggestion[] {
  let filtered = [...suggestions];
  
  // Filter by current page context
  if (context.currentPage === 'profile') {
    filtered = filtered.filter(s => 
      s.type === 'brandentifier_feature' || s.type === 'content_creation'
    );
  }
  
  // Filter by time constraints
  if (context.timeConstraints === 'quick') {
    filtered = filtered.filter(s => s.timeframe === 'immediate');
  }
  
  return filtered;
}