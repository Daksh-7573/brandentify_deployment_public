export type QuestType = 
  | 'profile_update'
  | 'pulse_creation'
  | 'networking'
  | 'learning'
  | 'portfolio'
  | 'resume'
  | 'visibility'
  | 'social_post'
  | 'social_quest'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'exploration'
  | 'nowboard';

export type QuestStatus = 
  | 'active'
  | 'completed'
  | 'expired';

export type BadgeType = 
  | 'quest_initiate'
  | 'weekly_hustler'
  | 'musk_learner'
  | 'thought_leader'
  | 'portfolio_star'
  | 'visibility_boosted'
  | 'explorer'
  | 'opportunist'
  | 'video_creator'
  | 'social_strategist'
  | 'visual_storyteller'
  | 'community_builder';

export interface QuestDefinition {
  id: number;
  title: string;
  description: string;
  type: QuestType;
  targetCount: number;
  targetAction: string;
  xpReward: number;
  badgeReward?: BadgeType;
  requiredProfileCompletion?: number;
  requiredCareerStage?: string;
  requiredIndustry?: string;
  muskTip?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Social quest fields
  platform?: string;        // Social media platform (instagram, linkedin, twitter, etc.)
  contentType?: string;     // Type of content (linkedin_post, instagram_carousel, etc.)
  estimatedTimeMinutes?: number; // Time to complete the quest
  difficultyLevel?: string; // beginner, intermediate, advanced
  
  // Additional fields for hashtag suggestions
  industry?: string;  // Suggested industry context
  domain?: string;    // Suggested domain context
}

export interface UserQuest {
  id: number;
  userId: number;
  questDefinitionId: number;
  status: QuestStatus;
  progress: number;
  assignedAt: string;
  completedAt?: string;
  weekNumber: number;
  year: number;
  xpEarned?: number;
  badgeEarned?: BadgeType;
  muskResponse?: string;
  muskTip?: string;       // Explicitly added to support direct muskTip property
  
  // Different quest definition formats based on API source
  questDefinition?: QuestDefinition;  // Original format
  definition?: QuestDefinition;       // Direct DB query format
  
  // Additional fields for the new API format
  questTitle?: string;
  questDescription?: string;
  questType?: string;
  questMuskTip?: string;  // Added for simplified weekly quests
  userName?: string;
  userPhotoURL?: string;
  
  // Fields needed for hashtag suggestions
  industry?: string;      // User's industry
  domain?: string;        // User's domain/specialty
  targetAction?: string;  // Action required to complete quest
}

export interface UserXp {
  id?: number;
  userId?: number;
  balance?: number;
  lifetimeEarned?: number;
  currentMonthEarned?: number;
  lastEarnedAt?: string;
  lastResetAt?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Fields used by the UI display logic
  total: number;
  level: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progressToNextLevel: number;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeType: BadgeType;
  earnedAt: string;
  questId?: number;
}

export interface XpTransaction {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  questId?: number;
  createdAt: string;
}

export interface UserQuestWithDefinition extends UserQuest {
  questDefinition: QuestDefinition;
}

export const getBadgeLabel = (badgeType: BadgeType): string => {
  const labels: Record<BadgeType, string> = {
    quest_initiate: 'Quest Initiate',
    weekly_hustler: 'Weekly Hustler',
    musk_learner: 'Musk Learner',
    thought_leader: 'Thought Leader',
    portfolio_star: 'Portfolio Star',
    visibility_boosted: 'Visibility Boosted',
    explorer: 'Opportunity Explorer',
    opportunist: 'Career Opportunist',
    video_creator: 'Video Creator',
    social_strategist: 'Social Strategist',
    visual_storyteller: 'Visual Storyteller',
    community_builder: 'Community Builder'
  };
  return labels[badgeType] || badgeType;
};

export const getQuestTypeIcon = (type: QuestType): string => {
  const icons: Record<Partial<QuestType>, string> = {
    profile_update: '👤',
    pulse_creation: '📝',
    networking: '🔗',
    learning: '📚',
    portfolio: '💼',
    resume: '📄',
    visibility: '👁️',
    social_post: '📱',
    social_quest: '🎯',
    daily: '⏱️',
    weekly: '📅',
    monthly: '🗓️',
    exploration: '🔍',
    nowboard: '🚀'
  };
  return icons[type] || '🎯';
};

export const getQuestStatusLabel = (status: QuestStatus): string => {
  const labels: Record<QuestStatus, string> = {
    active: 'In Progress',
    completed: 'Completed',
    expired: 'Missed'
  };
  return labels[status] || status;
};

export const getBadgeDescription = (badgeType: BadgeType): string => {
  const descriptions: Record<BadgeType, string> = {
    quest_initiate: 'Awarded for completing your first quest',
    weekly_hustler: 'Awarded for completing all quests in a week',
    musk_learner: 'Awarded for implementing 10 AI suggestions',
    thought_leader: 'Awarded for receiving 25 reactions on your pulses',
    portfolio_star: 'Awarded for showcasing 5 projects in your portfolio',
    visibility_boosted: 'Awarded for being featured 3 times',
    explorer: 'Awarded for exploring career opportunities on Nowboard',
    opportunist: 'Awarded for saving and engaging with multiple career opportunities',
    video_creator: 'Awarded for creating engaging video content',
    social_strategist: 'Awarded for developing multi-platform content strategies',
    visual_storyteller: 'Awarded for creating compelling visual content',
    community_builder: 'Awarded for building and engaging professional communities'
  };
  return descriptions[badgeType] || 'A special achievement';
};