import { formatDistanceToNow } from "date-fns";

/**
 * Format a date for display in feed items
 */
export function formatFeedDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Calculate relevance score for feed items
 * Higher score = more relevant to the user
 */
export function calculateRelevanceScore(
  item: any, 
  userPreferences: {
    interests?: string[];
    industry?: string;
    recentSearches?: string[];
    followedUsers?: number[];
  }
): number {
  let score = 0;
  
  // Base score
  score += 50;
  
  // If from a user the current user follows
  if (userPreferences.followedUsers?.includes(item.userId)) {
    score += 30;
  }
  
  // If matches user's industry
  if (item.industry === userPreferences.industry) {
    score += 20;
  }
  
  // If contains user's interests
  if (item.content && userPreferences.interests) {
    userPreferences.interests.forEach(interest => {
      if (item.content.toLowerCase().includes(interest.toLowerCase())) {
        score += 10;
      }
    });
  }
  
  // If contains recent search terms
  if (item.content && userPreferences.recentSearches) {
    userPreferences.recentSearches.forEach(term => {
      if (item.content.toLowerCase().includes(term.toLowerCase())) {
        score += 15;
      }
    });
  }
  
  // Recency boost (items from the last 24 hours)
  const itemDate = new Date(item.createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceCreation < 24) {
    score += 25 * (1 - (hoursSinceCreation / 24)); // Linear decay over 24 hours
  }
  
  // Engagement boost
  const totalEngagement = (
    (item.likes || 0) + 
    (item.comments || 0) + 
    (item.shares || 0) + 
    (item.insightfulCount || 0) + 
    (item.inspiredCount || 0)
  );
  
  // Logarithmic scale for engagement (prevents viral content from dominating)
  if (totalEngagement > 0) {
    score += 10 * Math.log10(totalEngagement + 1);
  }
  
  return score;
}

/**
 * Sort feed items by relevance score
 */
export function sortByRelevance<T extends { relevanceScore?: number }>(items: T[], userPreferences: any): T[] {
  return [...items].sort((a, b) => {
    const scoreA = a.relevanceScore ?? calculateRelevanceScore(a, userPreferences);
    const scoreB = b.relevanceScore ?? calculateRelevanceScore(b, userPreferences);
    return scoreB - scoreA;
  });
}

/**
 * Get appropriate classes/styles for different engagement types
 */
export function getEngagementStyles(type: string, isActive: boolean = false): {
  icon: string;
  textColor: string;
  hoverBg: string;
  activeFill: string;
} {
  switch (type) {
    case "insightful":
      return {
        icon: "flame",
        textColor: isActive ? "text-amber-600" : "text-muted-foreground",
        hoverBg: "hover:bg-amber-50 hover:text-amber-700",
        activeFill: isActive ? "fill-amber-500 scale-110" : ""
      };
    case "misinformed":
      return {
        icon: "alert-triangle",
        textColor: isActive ? "text-red-600" : "text-muted-foreground",
        hoverBg: "hover:bg-red-50 hover:text-red-700", 
        activeFill: isActive ? "fill-red-300 scale-110" : ""
      };
    case "inspired":
      return {
        icon: "lightbulb",
        textColor: isActive ? "text-amber-500" : "text-muted-foreground",
        hoverBg: "hover:bg-amber-50 hover:text-amber-700",
        activeFill: isActive ? "scale-110" : ""
      };
    case "share":
      return {
        icon: "share",
        textColor: isActive ? "text-blue-600" : "text-muted-foreground",
        hoverBg: "hover:bg-blue-50 hover:text-blue-700",
        activeFill: isActive ? "scale-110" : ""
      };
    case "comment":
      return {
        icon: "message-square",
        textColor: isActive ? "text-green-600" : "text-muted-foreground", 
        hoverBg: "hover:bg-green-50 hover:text-green-700",
        activeFill: isActive ? "scale-110" : ""
      };
    default:
      return {
        icon: "activity",
        textColor: "text-muted-foreground",
        hoverBg: "hover:bg-gray-50 hover:text-gray-700",
        activeFill: ""
      };
  }
}