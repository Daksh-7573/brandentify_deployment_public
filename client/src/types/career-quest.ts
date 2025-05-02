export type QuestType = 
  | 'profile_update'
  | 'pulse_creation'
  | 'networking'
  | 'learning'
  | 'portfolio'
  | 'resume'
  | 'visibility'
  | 'daily'
  | 'weekly'
  | 'monthly';

export type QuestStatus = 
  | 'active'
  | 'completed'
  | 'dismissed'
  | 'expired';

export type BadgeType = 
  | 'quest_initiate'
  | 'weekly_hustler'
  | 'musk_learner'
  | 'thought_leader'
  | 'portfolio_star'
  | 'visibility_boosted';

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
  dismissedReason?: string;
  xpEarned?: number;
  badgeEarned?: BadgeType;
  muskResponse?: string;
  
  // Different quest definition formats based on API source
  questDefinition?: QuestDefinition;  // Original format
  definition?: QuestDefinition;       // Direct DB query format
  
  // Additional fields for the new API format
  questTitle?: string;
  questDescription?: string;
  questType?: string;
  userName?: string;
  userPhotoURL?: string;
}

export interface UserXp {
  id: number;
  userId: number;
  balance: number;
  lifetimeEarned: number;
  currentMonthEarned: number;
  lastEarnedAt?: string;
  lastResetAt?: string;
  createdAt: string;
  updatedAt: string;
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
    visibility_boosted: 'Visibility Boosted'
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
    daily: '⏱️',
    weekly: '📅',
    monthly: '🗓️'
  };
  return icons[type] || '🎯';
};

export const getQuestStatusLabel = (status: QuestStatus): string => {
  const labels: Record<QuestStatus, string> = {
    active: 'In Progress',
    completed: 'Completed',
    dismissed: 'Dismissed',
    expired: 'Expired'
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
    visibility_boosted: 'Awarded for being featured 3 times'
  };
  return descriptions[badgeType] || 'A special achievement';
};